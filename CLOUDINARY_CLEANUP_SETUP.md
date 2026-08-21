# Cloudinary image cleanup

The storefront keeps uploading product images to Cloudinary exactly as before.

To enable permanent image deletion when a product is deleted or when an image is removed while editing a product, deploy the included Firebase Functions once.

## One-time deployment

> Production deployment of Firebase Cloud Functions requires the Firebase project to be on the Blaze plan. The storefront itself can stay on GitHub Pages and image uploads stay on Cloudinary.

1. Install Firebase CLI and sign in to the Firebase account that owns `joodkids-cc621`.
2. From this project folder run:

```bash
firebase functions:secrets:set CLOUDINARY_API_KEY
firebase functions:secrets:set CLOUDINARY_API_SECRET
firebase deploy --only functions,firestore:rules
```

Enter the API Key and API Secret from the Cloudinary account `dthtzvypx` when prompted.

The secrets are stored by Firebase Secret Manager and are never exposed in `app.js`, GitHub Pages, or the browser.

## What is deleted

- Deleting one product: its `joodkids/...` Cloudinary images are destroyed automatically.
- Bulk deleting products: every deleted product triggers the same cleanup.
- Editing a product and removing/replacing images: removed Cloudinary images are destroyed automatically.
- Product deletion does not depend on quantity, visibility, cart state, or stock status.

Only Cloudinary assets under the `joodkids/` folder and the configured cloud `dthtzvypx` are eligible for automatic cleanup.
