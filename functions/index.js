const { onDocumentDeleted, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { v2: cloudinary } = require('cloudinary');

initializeApp();
const adminDb = getFirestore();

const CLOUDINARY_CLOUD_NAME = 'dthtzvypx';
const CLOUDINARY_API_KEY = defineSecret('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = defineSecret('CLOUDINARY_API_SECRET');

function normalizeImageUrls(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (!value) return [];
  return String(value).split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function isTransformationSegment(segment) {
  return /^(?:a|ar|b|bo|c|co|dpr|e|f|fl|fn|g|h|if|ki|l|o|pg|q|r|so|sp|t|u|vc|vs|w|x|y|z)_[^/]+$/i.test(segment);
}

function getCloudinaryPublicId(rawUrl) {
  try {
    const url = new URL(String(rawUrl || '').trim());
    if (url.hostname !== 'res.cloudinary.com') return '';
    const prefix = `/${CLOUDINARY_CLOUD_NAME}/image/upload/`;
    const index = url.pathname.indexOf(prefix);
    if (index < 0) return '';

    let parts = decodeURIComponent(url.pathname.slice(index + prefix.length)).split('/').filter(Boolean);
    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
    if (versionIndex >= 0) parts = parts.slice(versionIndex + 1);
    else while (parts.length && isTransformationSegment(parts[0])) parts.shift();

    if (!parts.length) return '';
    parts[parts.length - 1] = parts[parts.length - 1].replace(/\.[a-z0-9]{2,8}$/i, '');
    const publicId = parts.join('/');

    // Only assets uploaded by this site are eligible for automatic deletion.
    return publicId.startsWith('joodkids/') ? publicId : '';
  } catch {
    return '';
  }
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY.value(),
    api_secret: CLOUDINARY_API_SECRET.value(),
    secure: true,
  });
}

async function isUrlStillUsedByAnotherProduct(url) {
  try {
    const snapshot = await adminDb.collection('products').where('imageUrls', 'array-contains', url).limit(1).get();
    return !snapshot.empty;
  } catch (error) {
    logger.warn('Could not verify shared product image reference', { url, message: error?.message || String(error) });
    return true; // fail safe: never destroy an image when ownership is uncertain
  }
}

async function deleteCloudinaryAssets(urls, context = {}) {
  const candidates = normalizeImageUrls(urls)
    .map((url) => ({ url, publicId: getCloudinaryPublicId(url) }))
    .filter((item) => item.publicId);
  if (!candidates.length) return { requested: 0, deleted: 0, skippedShared: 0 };

  const uniqueByPublicId = new Map();
  candidates.forEach((item) => { if (!uniqueByPublicId.has(item.publicId)) uniqueByPublicId.set(item.publicId, item); });
  configureCloudinary();
  let deleted = 0;
  let skippedShared = 0;

  for (const { url, publicId } of uniqueByPublicId.values()) {
    if (await isUrlStillUsedByAnotherProduct(url)) {
      skippedShared += 1;
      logger.info('Cloudinary cleanup skipped because another product still uses the image', { ...context, publicId });
      continue;
    }
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });
    if (['ok', 'not found'].includes(String(result?.result || '').toLowerCase())) deleted += 1;
    logger.info('Cloudinary product asset cleanup', { ...context, publicId, result: result?.result || 'unknown' });
  }
  return { requested: uniqueByPublicId.size, deleted, skippedShared };
}

exports.cleanupProductImagesOnDelete = onDocumentDeleted({
  document: 'products/{productId}',
  region: 'us-central1',
  secrets: [CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET],
  retry: true,
}, async (event) => {
  const data = event.data?.data() || {};
  const stats = await deleteCloudinaryAssets(data.imageUrls, {
    trigger: 'product-delete',
    productId: event.params.productId,
    model: data.model || '',
  });
  logger.info('Product images cleanup completed', { productId: event.params.productId, ...stats });
});

exports.cleanupRemovedProductImagesOnUpdate = onDocumentUpdated({
  document: 'products/{productId}',
  region: 'us-central1',
  secrets: [CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET],
  retry: true,
}, async (event) => {
  const before = event.data?.before?.data() || {};
  const after = event.data?.after?.data() || {};
  const afterUrls = new Set(normalizeImageUrls(after.imageUrls));
  const removedUrls = normalizeImageUrls(before.imageUrls).filter((url) => !afterUrls.has(url));
  if (!removedUrls.length) return;

  const stats = await deleteCloudinaryAssets(removedUrls, {
    trigger: 'product-update',
    productId: event.params.productId,
    model: before.model || after.model || '',
  });
  logger.info('Removed product images cleanup completed', { productId: event.params.productId, ...stats });
});
