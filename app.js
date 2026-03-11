import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, orderBy, onSnapshot, getDocs, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD33DgOX1pygN5YtnwDS6i2qL9Npo5nQGk',
  authDomain: 'joodkids-cc621.firebaseapp.com',
  projectId: 'joodkids-cc621',
  storageBucket: 'joodkids-cc621.firebasestorage.app',
  messagingSenderId: '912175230101',
  appId: '1:912175230101:web:b4f18fce627d430d4aff9c',
};

const ADMIN_UID = 'dZS7jUaB43aCL5Km3zr5V4LZuMr1';
const CLOUDINARY_CLOUD_NAME = 'dthtzvypx';

const DEFAULT_PAYMENT_POLICY = `طرق الدفع
1- نقدا من خلال أحد فروعنا
2- تحويلات بنكية
3- انستا بي
4- محافظ الكترونيه ( فودافون كاش او اتصالات كاش او أورنج كاش)
5- نعتذر من عملائنا الكرام البيع بالاجل لاي سبب كان`;

const DEFAULT_RETURN_POLICY = `يمكنك عمل طلب استرجاع او استبدال للمنتجات خلال 7 يوم .
و فى حالات عيوب الصناعة 10 يوم من وقت وصول الطلب.

عند إرجاع المنتج, تأكد من وجود جميع الملحقات الخاصة بالطلب بحالتها السليمة و ان المنتج فى عبوته الاصلية وبتغليفه الاصلي والملابس بحالتها كما وصلت للعميل غير مستعملة او ملبوسة او مغسولة.

الاستبدال والاسترجاع علي الملابس الخارجية فقط والتي بدون خصم.`;

const DEFAULT_SHIPPING_POLICY = `تنويه عند رجوع البضاعه بدون تبليغنا قبل الاسترجاع ب 3 ايام على الاقل سوف يتم خصم قيمه الشحن ذهاب و اياب من العربون المدفوع لدينا.

لديك 7 يوم من تاريخ إستلامك أي سلعة لتقدم طلب ارجاعها.`;

const DEFAULT_PAYMENT_METHODS = [
  { key: 'vodafone', label: 'فودافون كاش', icon: 'fa-solid fa-wallet' },
  { key: 'etisalat', label: 'اتصالات كاش', icon: 'fa-solid fa-wallet' },
  { key: 'orange', label: 'أورنج كاش', icon: 'fa-solid fa-wallet' },
  { key: 'instapay', label: 'انستا باي', icon: 'fa-solid fa-building-columns' },
  { key: 'cash', label: 'كاش', icon: 'fa-solid fa-money-bill-wave' },
  { key: 'shipping', label: 'بوليصة شحن', icon: 'fa-solid fa-file-lines' },
];

const DEFAULT_STOREFRONT = {
  companyName: 'Jood Kids',
  tagline: 'جملة الأطفال',
  heroTitle: 'تشكيلة الجملة الجديدة',
  heroSubtitle: 'منتجات مرتبة حسب الموديل والموسم مع طلب مباشر وسريع.',
  heroBadge: 'جملة فقط',
  heroImage: '',
  logoUrl: '',
  accentColor: '#6d28d9',
  accentColor2: '#0f172a',
  featuredLimit: 8,
  installEnabled: true,
  floatingWhatsappEnabled: true,
};

const DEFAULT_COMPANY = {
  companyName: 'Jood Kids',
  tagline: 'جملة الأطفال',
  phone1: '',
  phone2: '',
  whatsapp: '',
  address: '',
  instagram: '',
  facebook: '',
  telegram: '',
  factoryMap: '',
  shopMap: '',
  cloudinaryPreset: 'Joodkids',
  about: 'تشكيلة جملة مرتبة حسب الموديل والموسم مع طلب مباشر عبر واتساب.',
};

const DEFAULT_STORE_SETTINGS = {
  returnPolicy: DEFAULT_RETURN_POLICY,
  seasons: ['صيفي', 'شتوي', 'خريفي'],
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  products: [],
  orders: [],
  categories: [],
  company: { ...DEFAULT_COMPANY },
  storefront: { ...DEFAULT_STOREFRONT },
  storeSettings: { ...DEFAULT_STORE_SETTINGS },
  payments: { policyText: DEFAULT_PAYMENT_POLICY, methods: [...DEFAULT_PAYMENT_METHODS] },
  shipping: { policyText: DEFAULT_SHIPPING_POLICY },
  cart: loadLocalJSON('joodkids_cart', []),
  authUser: null,
  isAdmin: false,
  editingProductId: null,
  productImagesDraft: [],
  featuredOnlyAdmin: false,
  gallery: { urls: [], index: 0 },
  deferredInstallPrompt: null,
  assetTargetInputId: '',
};

const el = {
  overlay: id('overlay'),
  toast: id('toast'),
  brandTrigger: id('brandTrigger'),
  brandName: id('brandName'),
  brandTagline: id('brandTagline'),
  footerBrandName: id('footerBrandName'),
  brandLogoImage: id('brandLogoImage'),
  brandLogoMark: id('brandLogoMark'),
  installBtn: id('installBtn'),
  contactBtn: id('contactBtn'),
  cartToggle: id('cartToggle'),
  cartCount: id('cartCount'),
  heroKicker: id('heroKicker'),
  heroTitle: id('heroTitle'),
  heroSubtitle: id('heroSubtitle'),
  heroBadge: id('heroBadge'),
  heroImage: id('heroImage'),
  heroShopBtn: id('heroShopBtn'),
  heroWhatsappBtn: id('heroWhatsappBtn'),
  productsCounter: id('productsCounter'),
  categoriesCounter: id('categoriesCounter'),
  seasonsCounter: id('seasonsCounter'),
  featuredCounter: id('featuredCounter'),
  companyPhone: id('companyPhone'),
  companyAddress: id('companyAddress'),
  companyAbout: id('companyAbout'),
  factoryMapLink: id('factoryMapLink'),
  shopMapLink: id('shopMapLink'),
  searchInput: id('searchInput'),
  categoryFilter: id('categoryFilter'),
  seasonFilter: id('seasonFilter'),
  sortFilter: id('sortFilter'),
  seasonChips: id('seasonChips'),
  visibleCount: id('visibleCount'),
  scrollFeaturedBtn: id('scrollFeaturedBtn'),
  productsGrid: id('productsGrid'),
  emptyState: id('emptyState'),
  paymentIcons: id('paymentIcons'),
  paymentPolicyText: id('paymentPolicyText'),
  returnPolicyText: id('returnPolicyText'),
  shippingPolicyText: id('shippingPolicyText'),
  instagramLink: id('instagramLink'),
  facebookLink: id('facebookLink'),
  telegramLink: id('telegramLink'),
  whatsappLink: id('whatsappLink'),
  modalInstagramLink: id('modalInstagramLink'),
  modalFacebookLink: id('modalFacebookLink'),
  modalTelegramLink: id('modalTelegramLink'),
  modalWhatsappLink: id('modalWhatsappLink'),
  floatingWhatsApp: id('floatingWhatsApp'),
  cartDrawer: id('cartDrawer'),
  closeCart: id('closeCart'),
  cartItems: id('cartItems'),
  cartItemsCount: id('cartItemsCount'),
  cartTotal: id('cartTotal'),
  checkoutBtn: id('checkoutBtn'),
  adminDrawer: id('adminDrawer'),
  closeAdmin: id('closeAdmin'),
  adminLoginSection: id('adminLoginSection'),
  adminContent: id('adminContent'),
  adminEmail: id('adminEmail'),
  adminPassword: id('adminPassword'),
  adminLoginBtn: id('adminLoginBtn'),
  adminLogoutBtn: id('adminLogoutBtn'),
  authStatus: id('authStatus'),
  adminProductsCount: id('adminProductsCount'),
  adminOrdersCount: id('adminOrdersCount'),
  adminCategoriesCount: id('adminCategoriesCount'),
  adminOrdersTotal: id('adminOrdersTotal'),
  adminProductsList: id('adminProductsList'),
  adminOrdersList: id('adminOrdersList'),
  adminTabs: [...document.querySelectorAll('.tab-btn')],
  tabsPanels: [...document.querySelectorAll('.tab-panel')],
  saveAppearanceBtn: id('saveAppearanceBtn'),
  companyNameInput: id('companyNameInput'),
  companyTaglineInput: id('companyTaglineInput'),
  heroTitleInput: id('heroTitleInput'),
  heroSubtitleInput: id('heroSubtitleInput'),
  heroBadgeInput: id('heroBadgeInput'),
  heroImageInput: id('heroImageInput'),
  logoUrlInput: id('logoUrlInput'),
  accentColorInput: id('accentColorInput'),
  accentColor2Input: id('accentColor2Input'),
  featuredLimitInput: id('featuredLimitInput'),
  installEnabledInput: id('installEnabledInput'),
  floatingWhatsappInput: id('floatingWhatsappInput'),
  saveCompanyBtn: id('saveCompanyBtn'),
  companyPhoneInput: id('companyPhoneInput'),
  companyPhone2Input: id('companyPhone2Input'),
  companyWhatsappInput: id('companyWhatsappInput'),
  companyAddressInput: id('companyAddressInput'),
  companyInstagramInput: id('companyInstagramInput'),
  companyFacebookInput: id('companyFacebookInput'),
  companyTelegramInput: id('companyTelegramInput'),
  factoryMapInput: id('factoryMapInput'),
  shopMapInput: id('shopMapInput'),
  cloudinaryPresetInput: id('cloudinaryPresetInput'),
  companyAboutInput: id('companyAboutInput'),
  paymentPolicyInput: id('paymentPolicyInput'),
  returnPolicyInput: id('returnPolicyInput'),
  shippingPolicyInput: id('shippingPolicyInput'),
  savePoliciesBtn: id('savePoliciesBtn'),
  seasonsInput: id('seasonsInput'),
  saveSeasonsBtn: id('saveSeasonsBtn'),
  categoryManagerList: id('categoryManagerList'),
  productFormTitle: id('productFormTitle'),
  productNameInput: id('productNameInput'),
  productModelInput: id('productModelInput'),
  productPriceInput: id('productPriceInput'),
  productSeasonInput: id('productSeasonInput'),
  productStockInput: id('productStockInput'),
  productSizesInput: id('productSizesInput'),
  productMinQtyInput: id('productMinQtyInput'),
  productBadgeInput: id('productBadgeInput'),
  productPinnedInput: id('productPinnedInput'),
  productVisibleInput: id('productVisibleInput'),
  productDescriptionInput: id('productDescriptionInput'),
  productImageUrlsInput: id('productImageUrlsInput'),
  productImagesInput: id('productImagesInput'),
  saveProductBtn: id('saveProductBtn'),
  resetProductBtn: id('resetProductBtn'),
  uploadStatus: id('uploadStatus'),
  productImagesPreview: id('productImagesPreview'),
  togglePinnedFilterBtn: id('togglePinnedFilterBtn'),
  exportOrdersBtn: id('exportOrdersBtn'),
  exportProductsBtn: id('exportProductsBtn'),
  excelImportInput: id('excelImportInput'),
  deleteProductsBtn: id('deleteProductsBtn'),
  deleteOrdersBtn: id('deleteOrdersBtn'),
  deleteAllDataBtn: id('deleteAllDataBtn'),
  contactModal: id('contactModal'),
  imageModal: id('imageModal'),
  modalImage: id('modalImage'),
  galleryPrev: id('galleryPrev'),
  galleryNext: id('galleryNext'),
  galleryThumbs: id('galleryThumbs'),
  checkoutModal: id('checkoutModal'),
  customerNameInput: id('customerNameInput'),
  customerPhoneInput: id('customerPhoneInput'),
  customerCityInput: id('customerCityInput'),
  customerAddressInput: id('customerAddressInput'),
  paymentMethodInput: id('paymentMethodInput'),
  shippingMethodInput: id('shippingMethodInput'),
  customerNotesInput: id('customerNotesInput'),
  submitOrderBtn: id('submitOrderBtn'),
  singleAssetUploader: id('singleAssetUploader'),
  uploadTriggers: [...document.querySelectorAll('.upload-trigger')],
};

let appBooted = false;

function boot() {
  if (appBooted) return;
  appBooted = true;
  bindUI();
  initTabs();
  subscribeData();
  renderCart();
  applyTheme();
  renderStorefront();
  onAuthStateChanged(auth, handleAuthChange);
  setupInstallPrompt();
  registerServiceWorker();
}

function bindUI() {
  el.brandTrigger.addEventListener('click', () => openDrawer('admin'));
  el.cartToggle.addEventListener('click', () => openDrawer('cart'));
  el.closeCart.addEventListener('click', closeDrawers);
  el.closeAdmin.addEventListener('click', closeDrawers);
  el.overlay.addEventListener('click', closeDrawers);
  el.contactBtn.addEventListener('click', () => openModal('contactModal'));
  el.heroShopBtn.addEventListener('click', () => document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' }));
  el.heroWhatsappBtn.addEventListener('click', openWhatsAppDirect);
  el.floatingWhatsApp.addEventListener('click', openWhatsAppDirect);
  el.installBtn.addEventListener('click', installPwa);
  el.searchInput.addEventListener('input', applyFilters);
  el.categoryFilter.addEventListener('change', applyFilters);
  el.seasonFilter.addEventListener('change', applyFilters);
  el.sortFilter.addEventListener('change', applyFilters);
  el.scrollFeaturedBtn.addEventListener('click', scrollToFeatured);
  el.checkoutBtn.addEventListener('click', () => {
    if (!state.cart.length) return showToast('السلة فارغة');
    openModal('checkoutModal');
  });
  el.submitOrderBtn.addEventListener('click', submitOrder);
  el.adminLoginBtn.addEventListener('click', adminLogin);
  el.adminLogoutBtn.addEventListener('click', adminLogout);
  el.saveAppearanceBtn.addEventListener('click', saveAppearance);
  el.saveCompanyBtn.addEventListener('click', saveCompanyData);
  el.savePoliciesBtn.addEventListener('click', savePolicies);
  el.saveSeasonsBtn.addEventListener('click', saveSeasons);
  el.saveProductBtn.addEventListener('click', saveProduct);
  el.resetProductBtn.addEventListener('click', resetProductForm);
  el.productImageUrlsInput.addEventListener('input', syncDraftImagesFromTextarea);
  el.productImagesInput.addEventListener('change', handleProductFileUpload);
  el.exportProductsBtn.addEventListener('click', exportProductsExcel);
  el.exportOrdersBtn.addEventListener('click', exportOrdersExcel);
  el.excelImportInput.addEventListener('change', importProductsExcel);
  el.deleteProductsBtn.addEventListener('click', () => deleteCollectionDocs('products', 'اكتب حذف المنتجات'));
  el.deleteOrdersBtn.addEventListener('click', () => deleteCollectionDocs('orders', 'اكتب حذف الطلبات'));
  el.deleteAllDataBtn.addEventListener('click', deleteAllData);
  el.togglePinnedFilterBtn.addEventListener('click', togglePinnedAdminFilter);
  el.galleryPrev.addEventListener('click', () => changeGallery(-1));
  el.galleryNext.addEventListener('click', () => changeGallery(1));
  el.singleAssetUploader.addEventListener('change', handleSingleAssetUpload);
  el.uploadTriggers.forEach(btn => btn.addEventListener('click', () => {
    if (!guardAdmin()) return;
    state.assetTargetInputId = btn.dataset.targetInput;
    el.singleAssetUploader.click();
  }));

  document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', (e) => closeModal(e.currentTarget.dataset.close)));
  [el.contactModal, el.imageModal, el.checkoutModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });
  });
}

function initTabs() {
  el.adminTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      el.adminTabs.forEach(item => item.classList.toggle('active', item === btn));
      el.tabsPanels.forEach(panel => panel.classList.toggle('active', panel.id === btn.dataset.tab));
    });
  });
}

function subscribeData() {
  onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snap) => {
    state.products = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    rebuildCategoryFilter();
    rebuildSeasonOptions();
    applyFilters();
    renderAdminProducts();
    renderCategoryManager();
    renderDashboard();
    renderStorefront();
  }, handleSubError);

  onSnapshot(collection(db, 'categories'), (snap) => {
    state.categories = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    rebuildCategoryFilter();
    rebuildSeasonOptions();
    applyFilters();
    renderCategoryManager();
    renderDashboard();
  }, handleSubError);

  onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
    state.orders = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    renderAdminOrders();
    renderDashboard();
  }, handleSubError);

  onSnapshot(doc(db, 'company', 'main'), (snap) => {
    state.company = { ...DEFAULT_COMPANY, ...(snap.data() || {}) };
    populateAdminForms();
    renderStorefront();
  }, handleSubError);

  onSnapshot(doc(db, 'settings', 'storefront'), (snap) => {
    state.storefront = { ...DEFAULT_STOREFRONT, ...(snap.data() || {}) };
    populateAdminForms();
    applyTheme();
    renderStorefront();
  }, handleSubError);

  onSnapshot(doc(db, 'settings', 'store'), (snap) => {
    state.storeSettings = { ...DEFAULT_STORE_SETTINGS, ...(snap.data() || {}) };
    populateAdminForms();
    rebuildSeasonOptions();
    applyFilters();
    renderStorefront();
  }, handleSubError);

  onSnapshot(doc(db, 'payments', 'default'), (snap) => {
    const data = snap.data() || {};
    state.payments = { policyText: DEFAULT_PAYMENT_POLICY, methods: [...DEFAULT_PAYMENT_METHODS], ...data };
    populateAdminForms();
    renderStorefront();
  }, handleSubError);

  onSnapshot(doc(db, 'shipping', 'default'), (snap) => {
    state.shipping = { policyText: DEFAULT_SHIPPING_POLICY, ...(snap.data() || {}) };
    populateAdminForms();
    renderStorefront();
  }, handleSubError);
}

function handleSubError(error) {
  console.error(error);
}

function applyTheme() {
  const primary = state.storefront.accentColor || DEFAULT_STOREFRONT.accentColor;
  const secondary = state.storefront.accentColor2 || DEFAULT_STOREFRONT.accentColor2;
  document.documentElement.style.setProperty('--primary', primary);
  document.documentElement.style.setProperty('--primary-2', secondary);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', secondary);
}

function renderStorefront() {
  const companyName = state.company.companyName || state.storefront.companyName || DEFAULT_COMPANY.companyName;
  const tagline = state.company.tagline || state.storefront.tagline || DEFAULT_COMPANY.tagline;
  el.brandName.textContent = companyName;
  el.brandTagline.textContent = tagline;
  el.footerBrandName.textContent = companyName;
  el.heroKicker.textContent = companyName;
  el.heroTitle.textContent = state.storefront.heroTitle || DEFAULT_STOREFRONT.heroTitle;
  el.heroSubtitle.textContent = state.storefront.heroSubtitle || DEFAULT_STOREFRONT.heroSubtitle;
  el.heroBadge.textContent = state.storefront.heroBadge || DEFAULT_STOREFRONT.heroBadge;
  el.companyAbout.textContent = state.company.about || DEFAULT_COMPANY.about;
  el.companyPhone.textContent = [state.company.phone1, state.company.phone2].filter(Boolean).join(' / ') || '—';
  el.companyAddress.textContent = state.company.address || '—';
  const heroImage = state.storefront.heroImage || placeholderImage(companyName, 1400, 1100, true);
  el.heroImage.src = heroImage;
  el.heroImage.alt = companyName;
  const logoUrl = state.storefront.logoUrl || state.company.logoUrl || '';
  if (logoUrl) {
    el.brandLogoImage.src = logoUrl;
    el.brandLogoImage.classList.remove('hidden');
    el.brandLogoMark.classList.add('hidden');
  } else {
    el.brandLogoImage.classList.add('hidden');
    el.brandLogoMark.classList.remove('hidden');
    el.brandLogoMark.textContent = initials(companyName);
  }

  setLink(el.factoryMapLink, state.company.factoryMap);
  setLink(el.shopMapLink, state.company.shopMap);
  setLink(el.instagramLink, state.company.instagram);
  setLink(el.facebookLink, state.company.facebook);
  setLink(el.telegramLink, state.company.telegram);
  setLink(el.whatsappLink, buildWhatsAppLink());
  setLink(el.modalInstagramLink, state.company.instagram);
  setLink(el.modalFacebookLink, state.company.facebook);
  setLink(el.modalTelegramLink, state.company.telegram);
  setLink(el.modalWhatsappLink, buildWhatsAppLink());

  el.floatingWhatsApp.classList.toggle('hidden', !state.storefront.floatingWhatsappEnabled || !normalizeWhatsAppNumber(state.company.whatsapp || state.company.phone1));
  el.installBtn.classList.toggle('hidden', !state.storefront.installEnabled || !state.deferredInstallPrompt);
  el.paymentPolicyText.textContent = state.payments.policyText || DEFAULT_PAYMENT_POLICY;
  el.returnPolicyText.textContent = state.storeSettings.returnPolicy || DEFAULT_RETURN_POLICY;
  el.shippingPolicyText.textContent = state.shipping.policyText || DEFAULT_SHIPPING_POLICY;
  renderPaymentIcons();

  const visibleProducts = getVisibleProducts();
  const pinned = visibleProducts.filter((item) => item.pinned);
  el.productsCounter.textContent = visibleProducts.length.toLocaleString('en-US');
  el.featuredCounter.textContent = `${pinned.length.toLocaleString('en-US')} منتجات مثبتة`;
  el.categoriesCounter.textContent = getCodeCategoryKeys().length.toLocaleString('en-US');
  el.seasonsCounter.textContent = getSeasonOptions().length.toLocaleString('en-US');
}

function renderPaymentIcons() {
  const methods = Array.isArray(state.payments.methods) && state.payments.methods.length ? state.payments.methods : DEFAULT_PAYMENT_METHODS;
  el.paymentIcons.innerHTML = '';
  methods.forEach((method) => {
    const item = document.createElement('div');
    item.className = `pay-icon ${method.key}`;
    item.innerHTML = `<i class="${method.icon || 'fa-solid fa-wallet'}"></i><span>${escapeHTML(method.label || '')}</span>`;
    el.paymentIcons.appendChild(item);
  });
}

function rebuildCategoryFilter() {
  const current = el.categoryFilter.value || 'all';
  const categoryKeys = getCodeCategoryKeys();
  el.categoryFilter.innerHTML = '<option value="all">الكل</option>';
  categoryKeys.forEach((key) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = getCodeCategoryLabel(key);
    el.categoryFilter.appendChild(option);
  });
  el.categoryFilter.value = categoryKeys.includes(current) ? current : 'all';
}

function rebuildSeasonOptions() {
  const options = getSeasonOptions();
  const current = el.seasonFilter.value || 'all';
  el.seasonFilter.innerHTML = '<option value="all">الكل</option>';
  el.productSeasonInput.innerHTML = '';
  options.forEach((season) => {
    const filterOption = document.createElement('option');
    filterOption.value = season;
    filterOption.textContent = season;
    el.seasonFilter.appendChild(filterOption);
    const productOption = document.createElement('option');
    productOption.value = season;
    productOption.textContent = season;
    el.productSeasonInput.appendChild(productOption);
  });
  el.seasonFilter.value = options.includes(current) ? current : 'all';
  if (!options.includes(el.productSeasonInput.value)) {
    el.productSeasonInput.value = options[0] || 'صيفي';
  }
  renderSeasonChips(options);
}

function renderSeasonChips(options) {
  el.seasonChips.innerHTML = '';
  const selected = el.seasonFilter.value;
  const allChip = makeSeasonChip('الكل', 'all', selected === 'all');
  el.seasonChips.appendChild(allChip);
  options.forEach((season) => {
    el.seasonChips.appendChild(makeSeasonChip(season, season, selected === season));
  });
}

function makeSeasonChip(label, value, active) {
  const btn = document.createElement('button');
  btn.className = `season-chip ${active ? 'active' : ''}`;
  btn.textContent = label;
  btn.addEventListener('click', () => {
    el.seasonFilter.value = value;
    renderSeasonChips(getSeasonOptions());
    applyFilters();
  });
  return btn;
}

function applyFilters() {
  const search = el.searchInput.value.trim().toLowerCase();
  const category = el.categoryFilter.value;
  const season = el.seasonFilter.value;
  const sort = el.sortFilter.value;

  let items = getVisibleProducts().filter((product) => {
    const haystack = `${product.name || ''} ${product.model || ''} ${getCodeCategoryLabel(product.codeCategory)}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesCategory = category === 'all' || String(product.codeCategory) === category;
    const matchesSeason = season === 'all' || product.season === season;
    return matchesSearch && matchesCategory && matchesSeason;
  });

  items.sort((a, b) => {
    if (sort === 'priceAsc') return toNumber(a.priceWholesale) - toNumber(b.priceWholesale);
    if (sort === 'priceDesc') return toNumber(b.priceWholesale) - toNumber(a.priceWholesale);
    if (sort === 'modelAsc') return String(a.model || '').localeCompare(String(b.model || ''), 'en', { numeric: true });
    if (sort === 'newest') return toMillis(b.createdAt) - toMillis(a.createdAt);
    const pinnedDelta = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinnedDelta) return pinnedDelta;
    return toMillis(b.createdAt) - toMillis(a.createdAt);
  });

  const featuredLimit = Number(state.storefront.featuredLimit || 0);
  if (sort === 'featured' && featuredLimit > 0) {
    const pinned = items.filter((item) => item.pinned);
    const rest = items.filter((item) => !item.pinned);
    items = [...pinned.slice(0, featuredLimit), ...rest, ...pinned.slice(featuredLimit)];
  }

  renderSeasonChips(getSeasonOptions());
  renderProducts(items);
}

function renderProducts(items) {
  el.productsGrid.innerHTML = '';
  el.visibleCount.textContent = `${items.length.toLocaleString('en-US')} منتج`;
  el.emptyState.classList.toggle('hidden', items.length > 0);

  items.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    if (product.pinned) card.dataset.pinned = '1';
    const urls = normalizeImageUrls(product.imageUrls);
    card.innerHTML = `
      <div class="product-media">
        <img src="${escapeAttr(urls[0] || placeholderImage(product.name || product.model || 'Jood Kids'))}" alt="${escapeAttr(product.name || 'product')}" />
        ${product.pinned ? '<span class="pin-badge"><i class="fa-solid fa-thumbtack"></i> مثبت</span>' : ''}
        <span class="stock-badge">${escapeHTML(`المخزون ${String(product.stock ?? 0)}`)}</span>
        ${urls.length > 1 ? `<span class="gallery-count">${urls.length} صور</span>` : ''}
      </div>
      <div class="product-body">
        <div class="badges-row"></div>
        <h3 class="product-title"></h3>
        <div class="product-sub"></div>
        <p class="product-desc"></p>
        <div class="price-row"><span>سعر الجملة</span><strong>${formatCurrency(product.priceWholesale)}</strong></div>
        <div class="card-actions">
          <button class="ghost-btn zoom-btn"><i class="fa-solid fa-expand"></i><span>تكبير</span></button>
          <button class="primary-btn add-btn"><i class="fa-solid fa-cart-plus"></i><span>أضف للسلة</span></button>
        </div>
      </div>`;

    const media = card.querySelector('.product-media');
    const title = card.querySelector('.product-title');
    const sub = card.querySelector('.product-sub');
    const desc = card.querySelector('.product-desc');
    const badges = card.querySelector('.badges-row');
    title.textContent = product.name || 'بدون اسم';
    sub.innerHTML = `<span>موديل ${escapeHTML(product.model || '-')}</span><span>${escapeHTML(product.sizes || '-')}</span>`;
    desc.textContent = product.description || '—';

    [
      product.badgeText,
      getCodeCategoryLabel(product.codeCategory),
      product.season,
      product.minQty ? `حد أدنى ${product.minQty}` : '',
    ].filter(Boolean).forEach((text) => badges.appendChild(makeBadge(text)));

    media.addEventListener('click', () => openGallery(urls, 0));
    card.querySelector('.zoom-btn').addEventListener('click', () => openGallery(urls, 0));
    card.querySelector('.add-btn').addEventListener('click', () => addToCart(product.id));
    el.productsGrid.appendChild(card);
  });
}

function renderCart() {
  saveLocalJSON('joodkids_cart', state.cart);
  const itemsCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const total = state.cart.reduce((sum, item) => sum + toNumber(item.priceWholesale) * item.qty, 0);
  el.cartCount.textContent = String(itemsCount);
  el.cartItemsCount.textContent = `${itemsCount} قطعة`;
  el.cartTotal.textContent = formatCurrency(total);
  el.cartItems.innerHTML = '';

  if (!state.cart.length) {
    const empty = document.createElement('div');
    empty.className = 'cart-item';
    empty.innerHTML = '<div class="muted">السلة فارغة</div>';
    el.cartItems.appendChild(empty);
    return;
  }

  state.cart.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'cart-item';
    card.innerHTML = `
      <div class="cart-row">
        <img src="${escapeAttr(item.imageUrl || placeholderImage(item.name || 'Jood Kids'))}" alt="${escapeAttr(item.name || '')}" />
        <div>
          <strong>${escapeHTML(item.name || 'منتج')}</strong>
          <div class="meta-line"><span>موديل ${escapeHTML(item.model || '-')}</span><span>${formatCurrency(item.priceWholesale)}</span></div>
          <div class="btn-row">
            <div class="qty-box">
              <button data-action="inc">+</button>
              <span>${item.qty}</span>
              <button data-action="dec">-</button>
            </div>
            <button class="danger-btn" data-action="remove">حذف</button>
          </div>
        </div>
      </div>`;
    card.querySelector('[data-action="inc"]').addEventListener('click', () => changeCartQty(item.id, 1));
    card.querySelector('[data-action="dec"]').addEventListener('click', () => changeCartQty(item.id, -1));
    card.querySelector('[data-action="remove"]').addEventListener('click', () => removeFromCart(item.id));
    el.cartItems.appendChild(card);
  });
}

function renderAdminProducts() {
  el.adminProductsList.innerHTML = '';
  let items = [...state.products];
  if (state.featuredOnlyAdmin) items = items.filter((item) => item.pinned);
  if (!items.length) {
    el.adminProductsList.innerHTML = '<div class="admin-item"><div class="muted">لا توجد منتجات</div></div>';
    return;
  }

  items.forEach((product) => {
    const urls = normalizeImageUrls(product.imageUrls);
    const card = document.createElement('div');
    card.className = 'admin-item';
    card.innerHTML = `
      <div class="admin-item-main">
        <img class="admin-thumb" src="${escapeAttr(urls[0] || placeholderImage(product.name || product.model || 'Jood Kids'))}" alt="${escapeAttr(product.name || '')}" />
        <div class="admin-item-text">
          <div class="admin-item-title">${escapeHTML(product.name || 'بدون اسم')}</div>
          <div class="meta-line">
            <span>موديل ${escapeHTML(product.model || '-')}</span>
            <span>${formatCurrency(product.priceWholesale)}</span>
            <span>${escapeHTML(getCodeCategoryLabel(product.codeCategory))}</span>
            <span>${escapeHTML(product.season || '')}</span>
            <span>${product.visible === false ? 'مخفي' : 'ظاهر'}</span>
          </div>
        </div>
        <div class="btn-row wrap">
          <button class="ghost-btn" data-edit>تعديل</button>
          <button class="ghost-btn" data-toggle-pin>${product.pinned ? 'إلغاء التثبيت' : 'تثبيت'}</button>
          <button class="ghost-btn" data-toggle-vis>${product.visible === false ? 'إظهار' : 'إخفاء'}</button>
          <button class="danger-btn" data-delete>حذف</button>
        </div>
      </div>`;
    card.querySelector('[data-edit]').addEventListener('click', () => populateProductForm(product));
    card.querySelector('[data-toggle-pin]').addEventListener('click', () => quickUpdateProduct(product.id, { pinned: !product.pinned }));
    card.querySelector('[data-toggle-vis]').addEventListener('click', () => quickUpdateProduct(product.id, { visible: product.visible === false }));
    card.querySelector('[data-delete]').addEventListener('click', () => deleteSingleProduct(product.id));
    el.adminProductsList.appendChild(card);
  });
}

function renderAdminOrders() {
  el.adminOrdersList.innerHTML = '';
  if (!state.orders.length) {
    el.adminOrdersList.innerHTML = '<div class="order-item"><div class="muted">لا توجد طلبات</div></div>';
    return;
  }

  state.orders.forEach((order) => {
    const status = order.status || 'جديد';
    const classStatus = sanitizeClass(status);
    const card = document.createElement('div');
    card.className = 'order-item';
    card.innerHTML = `
      <div class="order-main">
        <div class="order-text full">
          <div class="order-title">${escapeHTML(order.customerName || 'عميل')}</div>
          <div class="meta-line">
            <span>${escapeHTML(order.customerPhone || '')}</span>
            <span>${escapeHTML(order.city || '')}</span>
            <span>${formatCurrency(order.total || 0)}</span>
            <span class="order-status ${classStatus}">${escapeHTML(status)}</span>
          </div>
        </div>
        <div class="btn-row wrap">
          <select data-status>
            ${['جديد', 'قيد المراجعة', 'تم التأكيد', 'تم الشحن', 'ملغي'].map((item) => `<option value="${item}" ${item === status ? 'selected' : ''}>${item}</option>`).join('')}
          </select>
          <button class="ghost-btn" data-copy>نسخ واتساب</button>
          <button class="danger-btn" data-delete>حذف</button>
        </div>
      </div>
      <div class="order-items-list">
        <div>العنوان: ${escapeHTML(order.address || '—')}</div>
        <div>الدفع: ${escapeHTML(order.paymentMethod || '—')}</div>
        <div>الشحن: ${escapeHTML(order.shippingMethod || '—')}</div>
        ${(order.items || []).map((item, idx) => `<div>${idx + 1}- ${escapeHTML(item.name || '')} | موديل ${escapeHTML(item.model || '')} | عدد ${escapeHTML(String(item.qty || 0))} | ${formatCurrency(item.priceWholesale || 0)}</div>`).join('')}
      </div>`;

    card.querySelector('[data-status]').addEventListener('change', (e) => updateOrderStatus(order.id, e.target.value));
    card.querySelector('[data-copy]').addEventListener('click', () => copyText(buildWhatsAppOrderMessage(order)));
    card.querySelector('[data-delete]').addEventListener('click', () => deleteOrder(order.id));
    el.adminOrdersList.appendChild(card);
  });
}

function renderCategoryManager() {
  el.categoryManagerList.innerHTML = '';
  const keys = getCodeCategoryKeys();
  if (!keys.length) {
    el.categoryManagerList.innerHTML = '<div class="category-item"><div class="muted">لا توجد تصنيفات بعد</div></div>';
    return;
  }
  keys.forEach((key) => {
    const categoryDoc = state.categories.find((item) => item.type === 'code' && String(item.code || item.label) === String(key));
    const wrapper = document.createElement('div');
    wrapper.className = 'category-item';
    const inputId = `cat-${key}`;
    wrapper.innerHTML = `
      <div class="category-code">${escapeHTML(key)}</div>
      <div class="field">
        <label for="${escapeAttr(inputId)}">الاسم الظاهر</label>
        <input id="${escapeAttr(inputId)}" type="text" value="${escapeAttr(categoryDoc?.label || '')}" placeholder="مثال: ملابس داخلية" />
      </div>
      <div class="btn-row wrap">
        <button class="primary-btn" data-save>حفظ</button>
        <button class="ghost-btn" data-clear>مسح</button>
      </div>`;
    const input = wrapper.querySelector('input');
    wrapper.querySelector('[data-save]').addEventListener('click', () => saveCodeCategoryLabel(key, input.value));
    wrapper.querySelector('[data-clear]').addEventListener('click', () => saveCodeCategoryLabel(key, ''));
    el.categoryManagerList.appendChild(wrapper);
  });
}

function renderDashboard() {
  const products = state.products.length;
  const orders = state.orders.length;
  const categories = getCodeCategoryKeys().length;
  const ordersTotal = state.orders.reduce((sum, item) => sum + toNumber(item.total), 0);
  el.adminProductsCount.textContent = products.toLocaleString('en-US');
  el.adminOrdersCount.textContent = orders.toLocaleString('en-US');
  el.adminCategoriesCount.textContent = categories.toLocaleString('en-US');
  el.adminOrdersTotal.textContent = formatCurrency(ordersTotal);
}

function populateAdminForms() {
  el.companyNameInput.value = state.company.companyName || state.storefront.companyName || '';
  el.companyTaglineInput.value = state.company.tagline || state.storefront.tagline || '';
  el.heroTitleInput.value = state.storefront.heroTitle || '';
  el.heroSubtitleInput.value = state.storefront.heroSubtitle || '';
  el.heroBadgeInput.value = state.storefront.heroBadge || '';
  el.heroImageInput.value = state.storefront.heroImage || '';
  el.logoUrlInput.value = state.storefront.logoUrl || '';
  el.accentColorInput.value = state.storefront.accentColor || DEFAULT_STOREFRONT.accentColor;
  el.accentColor2Input.value = state.storefront.accentColor2 || DEFAULT_STOREFRONT.accentColor2;
  el.featuredLimitInput.value = state.storefront.featuredLimit ?? DEFAULT_STOREFRONT.featuredLimit;
  el.installEnabledInput.value = String(Boolean(state.storefront.installEnabled));
  el.floatingWhatsappInput.value = String(Boolean(state.storefront.floatingWhatsappEnabled));

  el.companyPhoneInput.value = state.company.phone1 || '';
  el.companyPhone2Input.value = state.company.phone2 || '';
  el.companyWhatsappInput.value = state.company.whatsapp || '';
  el.companyAddressInput.value = state.company.address || '';
  el.companyInstagramInput.value = state.company.instagram || '';
  el.companyFacebookInput.value = state.company.facebook || '';
  el.companyTelegramInput.value = state.company.telegram || '';
  el.factoryMapInput.value = state.company.factoryMap || '';
  el.shopMapInput.value = state.company.shopMap || '';
  el.cloudinaryPresetInput.value = state.company.cloudinaryPreset || '';
  el.companyAboutInput.value = state.company.about || '';

  el.paymentPolicyInput.value = state.payments.policyText || DEFAULT_PAYMENT_POLICY;
  el.returnPolicyInput.value = state.storeSettings.returnPolicy || DEFAULT_RETURN_POLICY;
  el.shippingPolicyInput.value = state.shipping.policyText || DEFAULT_SHIPPING_POLICY;
  el.seasonsInput.value = getSeasonOptions().join(', ');
}

function getVisibleProducts() {
  return state.products.filter((item) => item.visible !== false);
}

function getSeasonOptions() {
  const merged = new Set([
    ...(state.storeSettings.seasons || []),
    ...state.products.map((item) => item.season).filter(Boolean),
  ]);
  return [...merged].map((item) => String(item).trim()).filter(Boolean);
}

function getCodeCategoryKeys() {
  const keys = new Set([
    ...state.products.map((item) => item.codeCategory).filter(Boolean).map(String),
    ...state.categories.filter((item) => item.type === 'code' && item.code).map((item) => String(item.code)),
  ]);
  return [...keys].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

function getCodeCategoryLabel(code) {
  const category = state.categories.find((item) => item.type === 'code' && String(item.code || item.label) === String(code));
  return category?.label ? `${code} • ${category.label}` : `تصنيف ${code}`;
}

async function adminLogin() {
  const email = el.adminEmail.value.trim();
  const password = el.adminPassword.value;
  if (!email || !password) return showToast('أدخل البريد وكلمة المرور');
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast('تم تسجيل الدخول');
  } catch (error) {
    console.error(error);
    showToast('تعذر تسجيل الدخول');
  }
}

async function adminLogout() {
  try {
    await signOut(auth);
    showToast('تم تسجيل الخروج');
  } catch (error) {
    console.error(error);
    showToast('تعذر تسجيل الخروج');
  }
}

function handleAuthChange(user) {
  state.authUser = user;
  state.isAdmin = Boolean(user && user.uid === ADMIN_UID);
  el.authStatus.textContent = user ? (user.email || user.uid) : 'غير مسجل';
  el.adminContent.classList.toggle('hidden', !state.isAdmin);
}

async function saveAppearance() {
  if (!guardAdmin()) return;
  try {
    await Promise.all([
      setDoc(doc(db, 'company', 'main'), {
        companyName: el.companyNameInput.value.trim(),
        tagline: el.companyTaglineInput.value.trim(),
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(doc(db, 'settings', 'storefront'), {
        companyName: el.companyNameInput.value.trim(),
        tagline: el.companyTaglineInput.value.trim(),
        heroTitle: el.heroTitleInput.value.trim(),
        heroSubtitle: el.heroSubtitleInput.value.trim(),
        heroBadge: el.heroBadgeInput.value.trim(),
        heroImage: el.heroImageInput.value.trim(),
        logoUrl: el.logoUrlInput.value.trim(),
        accentColor: el.accentColorInput.value,
        accentColor2: el.accentColor2Input.value,
        featuredLimit: toNumber(el.featuredLimitInput.value),
        installEnabled: el.installEnabledInput.value === 'true',
        floatingWhatsappEnabled: el.floatingWhatsappInput.value === 'true',
        updatedAt: serverTimestamp(),
      }, { merge: true }),
    ]);
    showToast('تم حفظ الواجهة');
  } catch (error) {
    console.error(error);
    showToast('تعذر حفظ الواجهة');
  }
}

async function saveCompanyData() {
  if (!guardAdmin()) return;
  try {
    await setDoc(doc(db, 'company', 'main'), {
      phone1: el.companyPhoneInput.value.trim(),
      phone2: el.companyPhone2Input.value.trim(),
      whatsapp: el.companyWhatsappInput.value.trim(),
      address: el.companyAddressInput.value.trim(),
      instagram: el.companyInstagramInput.value.trim(),
      facebook: el.companyFacebookInput.value.trim(),
      telegram: el.companyTelegramInput.value.trim(),
      factoryMap: el.factoryMapInput.value.trim(),
      shopMap: el.shopMapInput.value.trim(),
      cloudinaryPreset: el.cloudinaryPresetInput.value.trim(),
      about: el.companyAboutInput.value.trim(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    showToast('تم حفظ بيانات الشركة');
  } catch (error) {
    console.error(error);
    showToast('تعذر حفظ بيانات الشركة');
  }
}

async function savePolicies() {
  if (!guardAdmin()) return;
  try {
    await Promise.all([
      setDoc(doc(db, 'payments', 'default'), {
        policyText: el.paymentPolicyInput.value.trim(),
        methods: DEFAULT_PAYMENT_METHODS,
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(doc(db, 'settings', 'store'), {
        returnPolicy: el.returnPolicyInput.value.trim(),
        seasons: parseCommaList(el.seasonsInput.value),
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(doc(db, 'shipping', 'default'), {
        policyText: el.shippingPolicyInput.value.trim(),
        updatedAt: serverTimestamp(),
      }, { merge: true }),
    ]);
    showToast('تم حفظ السياسات');
  } catch (error) {
    console.error(error);
    showToast('تعذر حفظ السياسات');
  }
}

async function saveSeasons() {
  if (!guardAdmin()) return;
  const seasons = parseCommaList(el.seasonsInput.value);
  try {
    await setDoc(doc(db, 'settings', 'store'), { seasons, updatedAt: serverTimestamp() }, { merge: true });
    for (const season of seasons) {
      await setDoc(doc(db, 'categories', `season-${season}`), { type: 'season', season, label: season, updatedAt: serverTimestamp() }, { merge: true });
    }
    showToast('تم حفظ المواسم');
  } catch (error) {
    console.error(error);
    showToast('تعذر حفظ المواسم');
  }
}

async function saveCodeCategoryLabel(code, label) {
  if (!guardAdmin()) return;
  try {
    const cleanLabel = String(label || '').trim();
    if (!cleanLabel) {
      await deleteDoc(doc(db, 'categories', `code-${code}`));
      showToast('تم مسح اسم التصنيف');
      return;
    }
    await setDoc(doc(db, 'categories', `code-${code}`), {
      type: 'code',
      code: String(code),
      label: cleanLabel,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    showToast('تم حفظ التصنيف');
  } catch (error) {
    console.error(error);
    showToast('تعذر حفظ التصنيف');
  }
}

function syncDraftImagesFromTextarea() {
  state.productImagesDraft = textareaLines(el.productImageUrlsInput.value);
  renderProductPreview();
}

async function handleProductFileUpload(event) {
  if (!guardAdmin()) return;
  const files = [...(event.target.files || [])];
  if (!files.length) return;
  try {
    const folder = sanitizePathSegment(el.productModelInput.value || 'products');
    const urls = await uploadFilesToCloudinary(files, folder);
    state.productImagesDraft = [...state.productImagesDraft, ...urls];
    el.productImageUrlsInput.value = state.productImagesDraft.join('\n');
    renderProductPreview();
    showToast('تم رفع الصور');
  } catch (error) {
    console.error(error);
    showToast(getFriendlyUploadError(error));
  } finally {
    el.productImagesInput.value = '';
    el.uploadStatus.textContent = '';
  }
}

async function handleSingleAssetUpload(event) {
  if (!guardAdmin()) return;
  const file = event.target.files?.[0];
  if (!file || !state.assetTargetInputId) return;
  try {
    const [url] = await uploadFilesToCloudinary([file], 'branding');
    const target = id(state.assetTargetInputId);
    if (target) target.value = url;
    showToast('تم رفع الصورة');
  } catch (error) {
    console.error(error);
    showToast(getFriendlyUploadError(error));
  } finally {
    el.singleAssetUploader.value = '';
    state.assetTargetInputId = '';
    el.uploadStatus.textContent = '';
  }
}

async function uploadFilesToCloudinary(files, folder) {
  const preset = (state.company.cloudinaryPreset || el.cloudinaryPresetInput.value || DEFAULT_COMPANY.cloudinaryPreset || 'Joodkids').trim();
  if (!preset) throw new Error('يرجى إدخال Cloudinary Upload Preset أولاً');
  const urls = [];
  for (const file of files) {
    el.uploadStatus.textContent = `جارٍ رفع ${file.name}...`;
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', preset);
    body.append('folder', `joodkids/${folder}`);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error?.message || data?.message || response.statusText || 'Cloudinary upload failed';
      throw new Error(msg);
    }
    urls.push(data.secure_url);
  }
  return urls;
}

function getFriendlyUploadError(error) {
  const message = String(error?.message || '').trim();
  if (!message) return 'تعذر رفع الصورة';
  if (message.includes('Upload preset must be specified')) return 'يجب إدخال اسم Upload Preset من Cloudinary داخل لوحة التحكم';
  if (message.includes('Upload preset not found')) return 'اسم Upload Preset غير صحيح أو غير موجود في Cloudinary';
  if (message.includes('must be unsigned')) return 'الـ Upload Preset يجب أن يكون Unsigned وليس Signed';
  if (message.includes('File size too large')) return 'حجم الصورة أكبر من المسموح في إعدادات Cloudinary';
  if (message.includes('Invalid image file')) return 'الملف ليس صورة صالحة';
  return `تعذر الرفع: ${message}`;
}

async function saveProduct() {
  if (!guardAdmin()) return;
  const name = el.productNameInput.value.trim();
  const model = el.productModelInput.value.trim();
  const priceWholesale = toNumber(el.productPriceInput.value);
  const season = el.productSeasonInput.value || getSeasonOptions()[0] || 'صيفي';
  if (!name || !model || Number.isNaN(priceWholesale)) return showToast('الاسم والموديل والسعر مطلوبة');

  const payload = {
    name,
    model,
    priceWholesale,
    season,
    stock: toInt(el.productStockInput.value),
    sizes: el.productSizesInput.value.trim(),
    minQty: Math.max(1, toInt(el.productMinQtyInput.value || '1')),
    badgeText: el.productBadgeInput.value.trim(),
    pinned: el.productPinnedInput.value === 'true',
    visible: el.productVisibleInput.value === 'true',
    description: el.productDescriptionInput.value.trim(),
    codeCategory: deriveCodeCategory(model),
    imageUrls: normalizeImageUrls(state.productImagesDraft),
    updatedAt: serverTimestamp(),
  };

  try {
    if (state.editingProductId) {
      await updateDoc(doc(db, 'products', state.editingProductId), payload);
      showToast('تم تحديث المنتج');
    } else {
      await addDoc(collection(db, 'products'), { ...payload, createdAt: serverTimestamp() });
      showToast('تمت إضافة المنتج');
    }
    await setDoc(doc(db, 'categories', `code-${payload.codeCategory}`), {
      type: 'code', code: String(payload.codeCategory), label: String(payload.codeCategory), updatedAt: serverTimestamp(),
    }, { merge: true });
    resetProductForm();
  } catch (error) {
    console.error(error);
    showToast('تعذر حفظ المنتج');
  }
}

function populateProductForm(product) {
  state.editingProductId = product.id;
  state.productImagesDraft = normalizeImageUrls(product.imageUrls);
  el.productFormTitle.textContent = 'تعديل المنتج';
  el.productNameInput.value = product.name || '';
  el.productModelInput.value = product.model || '';
  el.productPriceInput.value = product.priceWholesale ?? '';
  el.productSeasonInput.value = product.season || getSeasonOptions()[0] || 'صيفي';
  el.productStockInput.value = product.stock ?? 0;
  el.productSizesInput.value = product.sizes || '';
  el.productMinQtyInput.value = product.minQty ?? 1;
  el.productBadgeInput.value = product.badgeText || '';
  el.productPinnedInput.value = String(Boolean(product.pinned));
  el.productVisibleInput.value = String(product.visible !== false);
  el.productDescriptionInput.value = product.description || '';
  el.productImageUrlsInput.value = state.productImagesDraft.join('\n');
  renderProductPreview();
  switchToTab('productTab');
}

function resetProductForm() {
  state.editingProductId = null;
  state.productImagesDraft = [];
  el.productFormTitle.textContent = 'إضافة منتج';
  el.productNameInput.value = '';
  el.productModelInput.value = '';
  el.productPriceInput.value = '';
  el.productSeasonInput.value = getSeasonOptions()[0] || 'صيفي';
  el.productStockInput.value = '0';
  el.productSizesInput.value = '';
  el.productMinQtyInput.value = '1';
  el.productBadgeInput.value = '';
  el.productPinnedInput.value = 'true';
  el.productVisibleInput.value = 'true';
  el.productDescriptionInput.value = '';
  el.productImageUrlsInput.value = '';
  el.productImagesInput.value = '';
  renderProductPreview();
}

function renderProductPreview() {
  el.productImagesPreview.innerHTML = '';
  state.productImagesDraft.forEach((url, index) => {
    const item = document.createElement('div');
    item.className = 'preview-item';
    item.innerHTML = `<img src="${escapeAttr(url)}" alt="preview"><button class="preview-remove">×</button>`;
    item.querySelector('.preview-remove').addEventListener('click', () => {
      state.productImagesDraft.splice(index, 1);
      el.productImageUrlsInput.value = state.productImagesDraft.join('\n');
      renderProductPreview();
    });
    el.productImagesPreview.appendChild(item);
  });
}

async function quickUpdateProduct(productId, data) {
  if (!guardAdmin()) return;
  try {
    await updateDoc(doc(db, 'products', productId), { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error(error);
    showToast('تعذر تحديث المنتج');
  }
}

async function deleteSingleProduct(productId) {
  if (!guardAdmin()) return;
  if (!confirm('حذف هذا المنتج؟')) return;
  try {
    await deleteDoc(doc(db, 'products', productId));
    showToast('تم حذف المنتج');
  } catch (error) {
    console.error(error);
    showToast('تعذر حذف المنتج');
  }
}

function togglePinnedAdminFilter() {
  state.featuredOnlyAdmin = !state.featuredOnlyAdmin;
  el.togglePinnedFilterBtn.textContent = state.featuredOnlyAdmin ? 'كل المنتجات' : 'المثبت فقط';
  renderAdminProducts();
}

async function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  const minQty = Math.max(1, toInt(product.minQty || 1));
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) existing.qty += minQty;
  else state.cart.push({
    id: product.id,
    name: product.name,
    model: product.model,
    priceWholesale: toNumber(product.priceWholesale),
    imageUrl: normalizeImageUrls(product.imageUrls)[0] || '',
    qty: minQty,
  });
  renderCart();
  showToast('تمت إضافة المنتج');
}

function changeCartQty(productId, delta) {
  const item = state.cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter((entry) => entry.id !== productId);
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  renderCart();
}

async function submitOrder() {
  const customerName = el.customerNameInput.value.trim();
  const customerPhone = el.customerPhoneInput.value.trim();
  const city = el.customerCityInput.value.trim();
  const address = el.customerAddressInput.value.trim();
  const paymentMethod = el.paymentMethodInput.value;
  const shippingMethod = el.shippingMethodInput.value;
  const notes = el.customerNotesInput.value.trim();
  if (!customerName || !customerPhone || !city || !address) return showToast('أكمل بيانات العميل');
  if (!state.cart.length) return showToast('السلة فارغة');
  const total = state.cart.reduce((sum, item) => sum + toNumber(item.priceWholesale) * item.qty, 0);
  const order = {
    customerName,
    customerPhone,
    city,
    address,
    paymentMethod,
    shippingMethod,
    notes,
    total,
    status: 'جديد',
    items: state.cart.map((item) => ({
      productId: item.id,
      name: item.name,
      model: item.model,
      priceWholesale: item.priceWholesale,
      qty: item.qty,
      imageUrl: item.imageUrl,
    })),
    createdAt: serverTimestamp(),
  };
  try {
    el.submitOrderBtn.disabled = true;
    await addDoc(collection(db, 'orders'), order);
    const whatsapp = buildWhatsAppLink(buildWhatsAppOrderMessage({ ...order, items: state.cart }));
    if (whatsapp) window.open(whatsapp, '_blank');
    state.cart = [];
    renderCart();
    clearCheckoutForm();
    closeModal('checkoutModal');
    closeDrawers();
    showToast('تم إرسال الطلب');
  } catch (error) {
    console.error(error);
    showToast('تعذر إرسال الطلب');
  } finally {
    el.submitOrderBtn.disabled = false;
  }
}

async function updateOrderStatus(orderId, status) {
  if (!guardAdmin()) return;
  try {
    await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() });
    showToast('تم تحديث الطلب');
  } catch (error) {
    console.error(error);
    showToast('تعذر تحديث الطلب');
  }
}

async function deleteOrder(orderId) {
  if (!guardAdmin()) return;
  if (!confirm('حذف هذا الطلب؟')) return;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
    showToast('تم حذف الطلب');
  } catch (error) {
    console.error(error);
    showToast('تعذر حذف الطلب');
  }
}

function buildWhatsAppOrderMessage(order) {
  return [
    `طلب جديد - ${state.company.companyName || DEFAULT_COMPANY.companyName}`,
    `الاسم: ${order.customerName || ''}`,
    `الهاتف: ${order.customerPhone || ''}`,
    `المدينة: ${order.city || ''}`,
    `العنوان: ${order.address || ''}`,
    `طريقة الدفع: ${order.paymentMethod || ''}`,
    `طريقة الشحن: ${order.shippingMethod || ''}`,
    'تفاصيل الطلب:',
    ...(order.items || []).map((item, index) => `${index + 1}- ${item.name} | موديل ${item.model} | عدد ${item.qty} | ${formatCurrency(item.priceWholesale)}`),
    `الإجمالي: ${formatCurrency(order.total || 0)}`,
    order.notes ? `ملاحظات: ${order.notes}` : '',
  ].filter(Boolean).join('\n');
}

function openWhatsAppDirect() {
  const link = buildWhatsAppLink();
  if (!link) return showToast('رقم واتساب غير مضاف');
  window.open(link, '_blank');
}

function buildWhatsAppLink(message = '') {
  const number = normalizeWhatsAppNumber(state.company.whatsapp || state.company.phone1 || '');
  if (!number) return '';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${text}`;
}

async function exportProductsExcel() {
  try {
    const rows = state.products.map((item) => ({
      name: item.name || '',
      model: item.model || '',
      priceWholesale: item.priceWholesale || 0,
      season: item.season || '',
      stock: item.stock ?? 0,
      sizes: item.sizes || '',
      minQty: item.minQty ?? 1,
      badgeText: item.badgeText || '',
      pinned: Boolean(item.pinned),
      visible: item.visible !== false,
      description: item.description || '',
      codeCategory: item.codeCategory || '',
      image1: normalizeImageUrls(item.imageUrls)[0] || '',
      image2: normalizeImageUrls(item.imageUrls)[1] || '',
      image3: normalizeImageUrls(item.imageUrls)[2] || '',
      image4: normalizeImageUrls(item.imageUrls)[3] || '',
      image5: normalizeImageUrls(item.imageUrls)[4] || '',
      image6: normalizeImageUrls(item.imageUrls)[5] || '',
    }));
    exportRows(rows, 'joodkids-products.xlsx', 'Products');
    showToast('تم تصدير المنتجات');
  } catch (error) {
    console.error(error);
    showToast('تعذر التصدير');
  }
}

async function exportOrdersExcel() {
  try {
    const rows = state.orders.map((item) => ({
      orderId: item.id,
      customerName: item.customerName || '',
      customerPhone: item.customerPhone || '',
      city: item.city || '',
      address: item.address || '',
      paymentMethod: item.paymentMethod || '',
      shippingMethod: item.shippingMethod || '',
      status: item.status || '',
      total: item.total || 0,
      notes: item.notes || '',
      items: (item.items || []).map((row) => `${row.name} x${row.qty}`).join(' | '),
    }));
    exportRows(rows, 'joodkids-orders.xlsx', 'Orders');
    showToast('تم تصدير الطلبات');
  } catch (error) {
    console.error(error);
    showToast('تعذر التصدير');
  }
}

function exportRows(rows, filename, sheetName) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

async function importProductsExcel(event) {
  if (!guardAdmin()) return;
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    let count = 0;
    for (const row of rows) {
      const name = firstValue(row, ['name', 'Name', 'اسم المنتج']);
      const model = String(firstValue(row, ['model', 'Model', 'الموديل']) || '').trim();
      const priceWholesale = toNumber(firstValue(row, ['priceWholesale', 'Price', 'سعر الجملة']));
      if (!name || !model) continue;
      const imageUrls = normalizeImageUrls([
        firstValue(row, ['image1']),
        firstValue(row, ['image2']),
        firstValue(row, ['image3']),
        firstValue(row, ['image4']),
        firstValue(row, ['image5']),
        firstValue(row, ['image6']),
        ...textareaLines(firstValue(row, ['images']) || ''),
      ]);
      await addDoc(collection(db, 'products'), {
        name: String(name).trim(),
        model,
        priceWholesale,
        season: firstValue(row, ['season', 'Season', 'الموسم']) || getSeasonOptions()[0] || 'صيفي',
        stock: toInt(firstValue(row, ['stock', 'Stock', 'الكمية']) || 0),
        sizes: firstValue(row, ['sizes', 'Sizes', 'المقاسات']) || '',
        minQty: Math.max(1, toInt(firstValue(row, ['minQty', 'MinQty', 'الحد الأدنى']) || 1)),
        badgeText: firstValue(row, ['badgeText', 'Badge', 'شارة']) || '',
        pinned: toBool(firstValue(row, ['pinned', 'Pinned', 'مثبت'])),
        visible: firstValue(row, ['visible', 'Visible', 'إظهار']) === '' ? true : toBool(firstValue(row, ['visible', 'Visible', 'إظهار'])),
        description: firstValue(row, ['description', 'Description', 'الوصف']) || '',
        codeCategory: deriveCodeCategory(model),
        imageUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      count += 1;
    }
    showToast(`تم استيراد ${count} منتج`);
  } catch (error) {
    console.error(error);
    showToast('تعذر الاستيراد');
  } finally {
    event.target.value = '';
  }
}

async function deleteCollectionDocs(collectionName, confirmText) {
  if (!guardAdmin()) return;
  const answer = prompt(`للتأكيد اكتب: ${confirmText}`, '');
  if (answer !== confirmText) return showToast('تم الإلغاء');
  try {
    const snap = await getDocs(collection(db, collectionName));
    await batchDeleteSnapshots(snap.docs);
    showToast('تم الحذف');
  } catch (error) {
    console.error(error);
    showToast('تعذر الحذف');
  }
}

async function deleteAllData() {
  if (!guardAdmin()) return;
  const answer = prompt('للتأكيد اكتب: حذف الكل', '');
  if (answer !== 'حذف الكل') return showToast('تم الإلغاء');
  try {
    for (const name of ['products', 'categories', 'orders', 'company', 'settings', 'shipping', 'payments']) {
      const snap = await getDocs(collection(db, name));
      if (!snap.empty) await batchDeleteSnapshots(snap.docs);
    }
    state.cart = [];
    renderCart();
    showToast('تم حذف كل البيانات');
  } catch (error) {
    console.error(error);
    showToast('تعذر حذف البيانات');
  }
}

async function batchDeleteSnapshots(docs) {
  const chunkSize = 400;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    docs.slice(i, i + chunkSize).forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  }
}

function openDrawer(type) {
  closeDrawers();
  if (type === 'menu') el.menuDrawer.classList.add('open');
  if (type === 'cart') el.cartDrawer.classList.add('open');
  if (type === 'admin') el.adminDrawer.classList.add('open');
  el.overlay.classList.add('show');
}

function closeDrawers() {
  el.menuDrawer.classList.remove('open');
  el.cartDrawer.classList.remove('open');
  el.adminDrawer.classList.remove('open');
  el.overlay.classList.remove('show');
}

function openModal(idValue) {
  id(idValue).classList.add('show');
}

function closeModal(idValue) {
  id(idValue).classList.remove('show');
}

function openGallery(urls, index = 0) {
  state.gallery.urls = normalizeImageUrls(urls);
  state.gallery.index = Math.max(0, Math.min(index, state.gallery.urls.length - 1));
  renderGallery();
  openModal('imageModal');
}

function renderGallery() {
  const urls = state.gallery.urls.length ? state.gallery.urls : [placeholderImage('Jood Kids')];
  const activeUrl = urls[state.gallery.index] || urls[0];
  el.modalImage.src = activeUrl;
  el.galleryThumbs.innerHTML = '';
  urls.forEach((url, index) => {
    const btn = document.createElement('button');
    btn.className = `thumb-btn ${index === state.gallery.index ? 'active' : ''}`;
    btn.innerHTML = `<img src="${escapeAttr(url)}" alt="thumb">`;
    btn.addEventListener('click', () => {
      state.gallery.index = index;
      renderGallery();
    });
    el.galleryThumbs.appendChild(btn);
  });
}

function changeGallery(delta) {
  if (!state.gallery.urls.length) return;
  state.gallery.index = (state.gallery.index + delta + state.gallery.urls.length) % state.gallery.urls.length;
  renderGallery();
}

function scrollToFeatured() {
  const target = document.querySelector('[data-pinned="1"]');
  if (!target) return showToast('لا توجد منتجات مثبتة');
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function switchToTab(tabId) {
  el.adminTabs.forEach((item) => item.classList.toggle('active', item.dataset.tab === tabId));
  el.tabsPanels.forEach((item) => item.classList.toggle('active', item.id === tabId));
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    el.installBtn.classList.toggle('hidden', !state.storefront.installEnabled);
  });
  window.addEventListener('appinstalled', () => {
    state.deferredInstallPrompt = null;
    el.installBtn.classList.add('hidden');
  });
}

async function installPwa() {
  if (!state.deferredInstallPrompt) return;
  state.deferredInstallPrompt.prompt();
  await state.deferredInstallPrompt.userChoice.catch(() => null);
  state.deferredInstallPrompt = null;
  el.installBtn.classList.add('hidden');
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.error));
  }
}

function clearCheckoutForm() {
  el.customerNameInput.value = '';
  el.customerPhoneInput.value = '';
  el.customerCityInput.value = '';
  el.customerAddressInput.value = '';
  el.paymentMethodInput.value = 'نقدا من خلال أحد فروعنا';
  el.shippingMethodInput.value = 'استلام من الفرع';
  el.customerNotesInput.value = '';
}

function formatCurrency(value) {
  return `${toNumber(value).toLocaleString('en-US')} ج.م`;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toInt(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  return 0;
}

function normalizeWhatsAppNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `2${digits}`;
  return digits;
}

function deriveCodeCategory(modelValue) {
  const numeric = String(modelValue || '').replace(/\D/g, '');
  if (!numeric) return '0';
  return parseInt(numeric, 10) >= 1000 ? numeric.slice(0, 2) : numeric.slice(0, 1);
}

function normalizeImageUrls(list) {
  return [...new Set((Array.isArray(list) ? list : [list]).flat().map((item) => String(item || '').trim()).filter(Boolean))];
}

function textareaLines(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function parseCommaList(value) {
  return [...new Set(String(value || '').split(',').map((item) => item.trim()).filter(Boolean))];
}

function firstValue(row, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== '') return row[key];
  }
  return '';
}

function toBool(value) {
  return ['true', '1', 'yes', 'نعم', 'y'].includes(String(value).trim().toLowerCase());
}

function initials(text) {
  const value = String(text || 'JK').trim();
  const parts = value.split(/\s+/).slice(0, 2);
  return parts.map((item) => item[0] || '').join('').toUpperCase() || 'JK';
}

function placeholderImage(text, width = 900, height = 1125, isHero = false) {
  const bg1 = encodeURIComponent(state.storefront.accentColor || DEFAULT_STOREFRONT.accentColor);
  const bg2 = encodeURIComponent(state.storefront.accentColor2 || DEFAULT_STOREFRONT.accentColor2);
  const safeText = escapeHTML(text || 'Jood Kids');
  const fontSize = isHero ? 64 : 48;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${bg1}"/>
          <stop offset="1" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="38" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.22)"/>
      <text x="50%" y="50%" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${safeText}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function setLink(anchor, url) {
  if (url) {
    anchor.href = url;
    anchor.style.pointerEvents = 'auto';
    anchor.style.opacity = '1';
  } else {
    anchor.href = '#';
    anchor.style.pointerEvents = 'none';
    anchor.style.opacity = '.45';
  }
}

function makeBadge(text) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = text;
  return badge;
}

function sanitizeClass(value) {
  return String(value || '').replace(/\s+/g, '-');
}

function sanitizePathSegment(value) {
  return String(value || 'asset').replace(/[^a-zA-Z0-9-_]/g, '-');
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => el.toast.classList.remove('show'), 2600);
}
showToast.timer = 0;

function guardAdmin() {
  if (!state.isAdmin) {
    showToast('هذه العملية متاحة للإدارة فقط');
    return false;
  }
  return true;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('تم النسخ');
  } catch {
    showToast('تعذر النسخ');
  }
}

function id(value) {
  return document.getElementById(value);
}

function escapeHTML(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function escapeAttr(value) {
  return escapeHTML(value);
}

function saveLocalJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadLocalJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}


window.addEventListener('DOMContentLoaded', boot);
