import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, onSnapshot, getDocs, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD33DgOX1pygN5YtnwDS6i2qL9Npo5nQGk',
  authDomain: 'joodkids-cc621.firebaseapp.com',
  projectId: 'joodkids-cc621',
  storageBucket: 'joodkids-cc621.firebasestorage.app',
  messagingSenderId: '912175230101',
  appId: '1:912175230101:web:b4f18fce627d430d4aff9c',
};

const ADMIN_UID = 'dZS7jUaB43aCL5Km3zr5V4LZuMr1';
const ADMIN_EMAILS = ['admin@sestem.local', 'admin@system.local'];
const CLOUDINARY_CLOUD_NAME = 'dthtzvypx';
const CART_STORAGE_KEY = 'joodkids_cart_wholesale_piece_v3_fast';
const PRODUCT_PAGE_SIZE = 24;
const APP_SW_VERSION = 'joodkids-store-v37';
const APP_ROOT_URL = new URL('./', window.location.href);
const SITE_URL = APP_ROOT_URL.href;
const OPEN_CART_FLAG_KEY = 'joodkids_open_cart_after_nav';
const SITE_NAME_AR = 'جود كيدز';
const SITE_NAME_EN = 'Jood Kids';
const PUBLIC_TRACKING_ENABLED = false;

const DEFAULT_PAYMENT_POLICY = `طرق الدفع
1- نقدا من خلال أحد فروعنا
2- تحويلات بنكية
3- انستا بي
4- محافظ الكترونيه (فودافون كاش أو اتصالات كاش أو أورنج كاش)
5- نعتذر من عملائنا الكرام البيع بالاجل لاي سبب كان`;

const DEFAULT_RETURN_POLICY = `يمكنك عمل طلب استرجاع او استبدال للمنتجات خلال 7 يوم .
و فى حالات عيوب الصناعة 10 يوم من وقت وصول الطلب.

عند إرجاع المنتج, تأكد من وجود جميع الملحقات الخاصة بالطلب بحالتها السليمة و ان المنتج فى عبوته الاصلية وبتغليفه الاصلي والملابس بحالتها كما وصلت للعميل غير مستعملة او ملبوسة او مغسولة.

الاستبدال والاسترجاع علي الملابس الخارجية فقط والتي بدون خصم .`;

const DEFAULT_SHIPPING_POLICY = `تنويه عند رجوع البضاعه بدون تبليغنا قبل الاسترجاع ب 3 ايام على الاقل سوف يتم خصم قيمه الشحن ذهاب و اياب من العربون المدفوع لدينا.

لديك 7 يوم من تاريخ إستلامك أي سلعة لتقدم طلب ارجاعها.`;

const DEFAULT_TERMS_POLICY = `البيع بالجملة فقط.
الأسعار قابلة للتحديث وفق السياسة التجارية.
تأكيد الطلب مرتبط بتوافر المنتج وقت المراجعة.
يحق للإدارة تعديل الواجهة والمنتجات والسياسات من لوحة التحكم.`;

const DEFAULT_PAYMENT_METHODS = [
  { key: 'vodafone', label: 'فودافون كاش', icon: 'fa-solid fa-wallet' },
  { key: 'etisalat', label: 'اتصالات كاش', icon: 'fa-solid fa-wallet' },
  { key: 'orange', label: 'أورنج كاش', icon: 'fa-solid fa-wallet' },
  { key: 'instapay', label: 'انستا بي', icon: 'fa-solid fa-building-columns' },
  { key: 'cash', label: 'كاش', icon: 'fa-solid fa-money-bill-wave' },
  { key: 'shipping', label: 'بوليصة شحن', icon: 'fa-solid fa-file-lines' },
];

const DEFAULT_STOREFRONT = {
  companyName: 'Jood Kids',
  tagline: 'ملابس أطفال بالجملة',
  heroTitle: 'التشكيلة الجديدة',
  heroSubtitle: 'اختيار واضح وسريع للموديلات المتاحة.',
  heroBadge: 'جملة فقط',
  logoUrl: '',
  accentColor: '#b48a4a',
  accentColor2: '#1f2937',
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
  about: '',
};

const DEFAULT_STORE_SETTINGS = {
  returnPolicy: DEFAULT_RETURN_POLICY,
  shippingPolicy: DEFAULT_SHIPPING_POLICY,
  termsPolicy: DEFAULT_TERMS_POLICY,
  seasons: ['صيفي', 'شتوي', 'خريفي'],
  codeCategoryLabels: {},
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  products: [],
  productsLoaded: false,
  orders: [],
  categories: [],
  company: { ...DEFAULT_COMPANY },
  storefront: { ...DEFAULT_STOREFRONT },
  storeSettings: { ...DEFAULT_STORE_SETTINGS },
  payments: { policyText: DEFAULT_PAYMENT_POLICY, methods: [...DEFAULT_PAYMENT_METHODS] },
  cart: loadLocalJSON(CART_STORAGE_KEY, []),
  authUser: null,
  isAdmin: false,
  editingProductId: null,
  productImagesDraft: [],
  featuredOnlyAdmin: false,
  adminProductSearch: '',
  adminProductShowAll: false,
  searchSuggestionIndex: -1,
  gallery: { urls: [], index: 0 },
  filter: { search: '', category: 'all', subCategory: 'all', season: 'all', offersOnly: false, sort: 'featured' },
  deferredInstallPrompt: null,
  assetTargetInputId: '',
  filteredProducts: [],
  renderedCount: PRODUCT_PAGE_SIZE,
  renderScheduled: false,
  catalog: { step: 'seasons', selectedSeason: '', selectedCategory: 'all', selectedSubCategory: 'all', hydratedFromUrl: false },
  invoicePreview: { order: null, blob: null, url: '' },
};

const el = {
  siteContent: id('siteContent'),
  overlay: id('overlay'),
  toast: id('toast'),
  menuToggle: id('menuToggle'),
  closeMenu: id('closeMenu'),
  menuDrawer: id('menuDrawer'),
  cartDrawer: id('cartDrawer'),
  adminDrawer: id('adminDrawer'),
  brandTrigger: id('brandTrigger'),
  navHomeBtn: id('navHomeBtn'),
  navCatalogBtn: id('navCatalogBtn'),
  navOffersBtn: id('navOffersBtn'),
  navContactBtn: id('navContactBtn'),
  menuHomeBtn: id('menuHomeBtn'),
  menuCatalogBtn: id('menuCatalogBtn'),
  menuOffersCount: id('menuOffersCount'),
  offersSection: id('offersSection'),
  offersRail: id('offersRail'),
  viewAllOffersBtn: id('viewAllOffersBtn'),
  heroShopBtn: id('heroShopBtn'),
  heroWhatsappBtn: id('heroWhatsappBtn'),
  heroShowcase: id('heroShowcase'),
  collectionsSection: id('collectionsSection'),
  collectionsGrid: id('collectionsGrid'),
  collectionsCatalogBtn: id('collectionsCatalogBtn'),
  newArrivalsSection: id('newArrivalsSection'),
  newArrivalsRail: id('newArrivalsRail'),
  newArrivalsViewAllBtn: id('newArrivalsViewAllBtn'),
  brandName: id('brandName'),
  brandTagline: id('brandTagline'),
  footerBrandName: id('footerBrandName'),
  brandLogoImage: id('brandLogoImage'),
  brandLogoMark: id('brandLogoMark'),
  installBtn: id('installBtn'),
  menuInstallBtn: id('menuInstallBtn'),
  contactBtn: id('contactBtn'),
  cartToggle: id('cartToggle'),
  cartCount: id('cartCount'),
  heroTitle: id('heroTitle'),
  heroSubtitle: id('heroSubtitle'),
  heroBadge: id('heroBadge'),
  catalogFlowStage: id('catalogFlowStage'),
  catalogFlow: id('catalogFlow'),
  toolbarWrap: id('toolbarWrap'),
  productsHeadingRow: id('productsHeadingRow'),
  productsSectionTitle: id('productsSectionTitle'),
  productsCounter: id('productsCounter'),
  categoriesCounter: id('categoriesCounter'),
  seasonsCounter: id('seasonsCounter'),
  companyAbout: id('companyAbout'),
  searchInput: id('searchInput'),
  searchSuggestions: id('searchSuggestions'),
  sortFilter: id('sortFilter'),
  openFiltersBtn: id('openFiltersBtn'),
  activeFiltersCount: id('activeFiltersCount'),
  activeFilterChips: id('activeFilterChips'),
  filterDrawer: id('filterDrawer'),
  closeFilters: id('closeFilters'),
  filterSeasonList: id('filterSeasonList'),
  filterCategoryList: id('filterCategoryList'),
  filterOffersOnly: id('filterOffersOnly'),
  resetDrawerFiltersBtn: id('resetDrawerFiltersBtn'),
  applyDrawerFiltersBtn: id('applyDrawerFiltersBtn'),
  clearFiltersBtn: id('clearFiltersBtn'),
  visibleCount: id('visibleCount'),
  productsGrid: id('productsGrid'),
  seoCatalog: id('seoCatalog'),
  loadMoreWrap: id('loadMoreWrap'),
  loadMoreBtn: id('loadMoreBtn'),
  emptyState: id('emptyState'),
  menuCategoryList: id('menuCategoryList'),
  menuSeasonList: id('menuSeasonList'),
  menuOffersBtn: id('menuOffersBtn'),
  menuTrackOrderBtn: id('menuTrackOrderBtn'),
  menuContactBtn: id('menuContactBtn'),
  menuNoticeBtn: id('menuNoticeBtn'),
  menuPaymentBtn: id('menuPaymentBtn'),
  menuReturnBtn: id('menuReturnBtn'),
  menuTermsBtn: id('menuTermsBtn'),
  paymentIcons: id('paymentIcons'),
  instagramLink: id('instagramLink'),
  facebookLink: id('facebookLink'),
  telegramLink: id('telegramLink'),
  whatsappLink: id('whatsappLink'),
  modalInstagramLink: id('modalInstagramLink'),
  modalFacebookLink: id('modalFacebookLink'),
  modalTelegramLink: id('modalTelegramLink'),
  modalWhatsappLink: id('modalWhatsappLink'),
  modalFactoryMapLink: id('modalFactoryMapLink'),
  modalShopMapLink: id('modalShopMapLink'),
  floatingWhatsApp: id('floatingWhatsApp'),
  mobileHomeBtn: id('mobileHomeBtn'),
  mobileSearchBtn: id('mobileSearchBtn'),
  mobileOffersBtn: id('mobileOffersBtn'),
  mobileCartBtn: id('mobileCartBtn'),
  mobileCartCount: id('mobileCartCount'),
  closeCart: id('closeCart'),
  cartItems: id('cartItems'),
  cartItemsCount: id('cartItemsCount'),
  cartTotal: id('cartTotal'),
  cartSeriesTotal: id('cartSeriesTotal'),
  cartPiecesTotal: id('cartPiecesTotal'),
  cartAvailabilityNote: id('cartAvailabilityNote'),
  continueShoppingBtn: id('continueShoppingBtn'),
  checkoutBtn: id('checkoutBtn'),
  closeAdmin: id('closeAdmin'),
  adminLoginSection: id('adminLoginSection'),
  adminContent: id('adminContent'),
  adminEmail: id('adminEmail'),
  adminPassword: id('adminPassword'),
  adminLoginBtn: id('adminLoginBtn'),
  adminLogoutBtn: id('adminLogoutBtn'),
  authStatus: id('authStatus'),
  adminProductsCount: id('adminProductsCount'),
  adminVisibleProductsCount: id('adminVisibleProductsCount'),
  adminOffersCount: id('adminOffersCount'),
  adminPendingOrdersCount: id('adminPendingOrdersCount'),
  adminTodayOrdersCount: id('adminTodayOrdersCount'),
  adminHiddenProductsCount: id('adminHiddenProductsCount'),
  adminSeasonsCount: id('adminSeasonsCount'),
  dashboardInsights: id('dashboardInsights'),
  adminOrdersCount: id('adminOrdersCount'),
  adminCategoriesCount: id('adminCategoriesCount'),
  adminOrdersTotal: id('adminOrdersTotal'),
  adminProductsList: id('adminProductsList'),
  adminOffersList: id('adminOffersList'),
  adminProductSearchInput: id('adminProductSearchInput'),
  adminProductSearchClear: id('adminProductSearchClear'),
  adminProductSearchStatus: id('adminProductSearchStatus'),
  toggleAllProductsBtn: id('toggleAllProductsBtn'),
  goAddProductBtn: id('goAddProductBtn'),
  goProductsManagerBtn: id('goProductsManagerBtn'),
  adminOrdersList: id('adminOrdersList'),
  adminTabs: [...document.querySelectorAll('.tab-btn')],
  tabsPanels: [...document.querySelectorAll('.tab-panel')],
  saveAppearanceBtn: id('saveAppearanceBtn'),
  companyNameInput: id('companyNameInput'),
  companyTaglineInput: id('companyTaglineInput'),
  heroTitleInput: id('heroTitleInput'),
  heroSubtitleInput: id('heroSubtitleInput'),
  heroBadgeInput: id('heroBadgeInput'),
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
  termsPolicyInput: id('termsPolicyInput'),
  savePoliciesBtn: id('savePoliciesBtn'),
  seasonsInput: id('seasonsInput'),
  saveSeasonsBtn: id('saveSeasonsBtn'),
  categoryManagerList: id('categoryManagerList'),
  productFormTitle: id('productFormTitle'),
  productNameInput: id('productNameInput'),
  productModelInput: id('productModelInput'),
  productPriceInput: id('productPriceInput'),
  productDiscountInput: id('productDiscountInput'),
  productSeasonInput: id('productSeasonInput'),
  productSubCategoryInput: id('productSubCategoryInput'),
  productSizesInput: id('productSizesInput'),
  productMinQtyInput: id('productMinQtyInput'),
  productBadgeInput: id('productBadgeInput'),
  productPinnedInput: id('productPinnedInput'),
  productVisibleInput: id('productVisibleInput'),
  productStockStatusInput: id('productStockStatusInput'),
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
  quickExcelImportInput: id('quickExcelImportInput'),
  quickImportStatus: id('quickImportStatus'),
  quickImportedProductsList: id('quickImportedProductsList'),
  quickImportPendingCount: id('quickImportPendingCount'),
  deleteProductsBtn: id('deleteProductsBtn'),
  deleteOrdersBtn: id('deleteOrdersBtn'),
  deleteAllDataBtn: id('deleteAllDataBtn'),
  contactModal: id('contactModal'),
  trackOrderModal: id('trackOrderModal'),
  trackOrderInput: id('trackOrderInput'),
  trackOrderBtn: id('trackOrderBtn'),
  trackOrderStatus: id('trackOrderStatus'),
  trackOrderResults: id('trackOrderResults'),
  policyModal: id('policyModal'),
  policyModalTitle: id('policyModalTitle'),
  policyModalContent: id('policyModalContent'),
  imageModal: id('imageModal'),
  modalImage: id('modalImage'),
  galleryPrev: id('galleryPrev'),
  galleryNext: id('galleryNext'),
  galleryThumbs: id('galleryThumbs'),
  checkoutModal: id('checkoutModal'),
  invoiceModal: id('invoiceModal'),
  invoicePreviewImage: id('invoicePreviewImage'),
  invoiceDownloadBtn: id('invoiceDownloadBtn'),
  invoiceWhatsappBtn: id('invoiceWhatsappBtn'),
  quickProductModal: id('quickProductModal'),
  quickProductImage: id('quickProductImage'),
  quickProductName: id('quickProductName'),
  quickProductModel: id('quickProductModel'),
  quickProductPrice: id('quickProductPrice'),
  quickProductSeries: id('quickProductSeries'),
  quickProductSizes: id('quickProductSizes'),
  quickProductCategory: id('quickProductCategory'),
  quickProductSeason: id('quickProductSeason'),
  quickProductStock: id('quickProductStock'),
  quickProductOpenPage: id('quickProductOpenPage'),
  quickProductAddBtn: id('quickProductAddBtn'),
  customerNameInput: id('customerNameInput'),
  customerPhoneInput: id('customerPhoneInput'),
  customerCityInput: id('customerCityInput'),
  customerAddressInput: id('customerAddressInput'),
  paymentMethodInput: id('paymentMethodInput'),
  shippingMethodInput: id('shippingMethodInput'),
  customerNotesInput: id('customerNotesInput'),
  checkoutSummaryItems: id('checkoutSummaryItems'),
  checkoutSeriesCount: id('checkoutSeriesCount'),
  checkoutPiecesCount: id('checkoutPiecesCount'),
  checkoutTotal: id('checkoutTotal'),
  submitOrderBtn: id('submitOrderBtn'),
  singleAssetUploader: id('singleAssetUploader'),
  uploadTriggers: [...document.querySelectorAll('.upload-trigger')],
};

ensureButtonTypes();

function ensureButtonTypes() {
  document.querySelectorAll('button:not([type])').forEach((button) => {
    button.type = 'button';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => queueMicrotask(boot), { once: true });
} else {
  queueMicrotask(boot);
}

function boot() {
  setPersistence(auth, browserSessionPersistence).catch(console.error);
  bindUI();
  hydrateCatalogFromUrl();
  initTabs();
  subscribeData();
  renderCart();
  applyTheme();
  renderStorefront();
  handleInitialCartRoute();
  onAuthStateChanged(auth, handleAuthChange);
  setupInstallPrompt();
  registerServiceWorker();
  openPrivateAdminRoute();
}

function bindUI() {
  const debouncedSearch = debounce(() => { state.filter.search = el.searchInput.value.trim().toLowerCase(); resetRenderedProducts(); applyFilters(); }, 120);
  el.menuToggle.addEventListener('click', () => openDrawer('menu'));
  el.closeMenu.addEventListener('click', closeDrawers);
  el.brandTrigger.addEventListener('click', () => {
    closeDrawers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  el.navHomeBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  el.navCatalogBtn?.addEventListener('click', () => el.catalogFlowStage?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  el.navOffersBtn?.addEventListener('click', openOffersExperience);
  el.navContactBtn?.addEventListener('click', () => openModal('contactModal'));
  el.heroShopBtn?.addEventListener('click', () => el.catalogFlowStage?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  el.heroWhatsappBtn?.addEventListener('click', openWhatsAppDirect);
  el.collectionsCatalogBtn?.addEventListener('click', () => goToSeasonsView({ closeAfter:false }));
  el.newArrivalsViewAllBtn?.addEventListener('click', () => { state.filter.sort='newest'; if (el.sortFilter) el.sortFilter.value='newest'; activateCatalogProducts('', 'all', { preserveSort:true }); });
  el.mobileHomeBtn?.addEventListener('click', () => { closeDrawers(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  el.mobileSearchBtn?.addEventListener('click', () => { closeDrawers(); el.toolbarWrap?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.searchInput?.focus(), 280); });
  el.mobileOffersBtn?.addEventListener('click', openOffersExperience);
  el.mobileCartBtn?.addEventListener('click', () => openDrawer('cart'));
  el.cartToggle.addEventListener('click', () => openDrawer('cart'));
  el.closeCart.addEventListener('click', closeDrawers);
  el.openFiltersBtn?.addEventListener('click', () => { renderFilterDrawer(); openDrawer('filter'); });
  el.closeFilters?.addEventListener('click', closeDrawers);
  el.resetDrawerFiltersBtn?.addEventListener('click', () => { resetAllCommerceFilters(); renderFilterDrawer(); });
  el.applyDrawerFiltersBtn?.addEventListener('click', () => { closeDrawers(); el.productsHeadingRow?.scrollIntoView({ behavior:'smooth', block:'start' }); });
  el.continueShoppingBtn?.addEventListener('click', () => { closeDrawers(); el.productsHeadingRow?.scrollIntoView({ behavior:'smooth', block:'start' }); });
  el.closeAdmin.addEventListener('click', closeDrawers);
  // Keep the admin drawer isolated without binding duplicate touch/pointer handlers.
  el.adminDrawer.addEventListener('click', (event) => {
    if (event.target === el.adminDrawer) event.stopPropagation();
  });
  el.overlay.addEventListener('click', closeDrawers);
  window.addEventListener('hashchange', handleInitialCartRoute);
  el.contactBtn.addEventListener('click', () => openModal('contactModal'));
  el.menuHomeBtn?.addEventListener('click', () => { closeDrawers(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  el.menuCatalogBtn?.addEventListener('click', () => { closeDrawers(); el.catalogFlowStage?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  el.viewAllOffersBtn?.addEventListener('click', () => activateOffersView({ closeAfter: true }));
  el.menuTrackOrderBtn?.addEventListener('click', () => { closeDrawers(); openModal('trackOrderModal'); queueMicrotask(() => el.trackOrderInput?.focus()); });
  el.menuContactBtn.addEventListener('click', () => { closeDrawers(); openModal('contactModal'); });
  el.menuNoticeBtn.addEventListener('click', () => openPolicy('التنويه', state.storeSettings.shippingPolicy || DEFAULT_SHIPPING_POLICY));
  el.menuPaymentBtn.addEventListener('click', () => openPolicy('سياسة الدفع', state.payments.policyText || DEFAULT_PAYMENT_POLICY));
  el.menuReturnBtn.addEventListener('click', () => openPolicy('سياسة الاستبدال والاسترجاع', state.storeSettings.returnPolicy || DEFAULT_RETURN_POLICY));
  el.menuTermsBtn.addEventListener('click', () => openPolicy('الشروط', state.storeSettings.termsPolicy || DEFAULT_TERMS_POLICY));
  el.menuOffersBtn.addEventListener('click', openOffersExperience);
  el.installBtn.addEventListener('click', installPwa);
  el.menuInstallBtn.addEventListener('click', installPwa);
  el.searchInput.addEventListener('input', () => {
    state.searchSuggestionIndex = -1;
    renderSearchSuggestions();
    debouncedSearch();
  });
  el.searchInput.addEventListener('focus', renderSearchSuggestions);
  el.searchInput.addEventListener('keydown', handleSearchSuggestionKeys);
  el.sortFilter.addEventListener('change', () => { state.filter.sort = el.sortFilter.value; resetRenderedProducts(); applyFilters(); });
  el.clearFiltersBtn.addEventListener('click', clearFilters);
  el.loadMoreBtn.addEventListener('click', renderMoreProducts);
  el.floatingWhatsApp.addEventListener('click', openWhatsAppDirect);
  bindExternalLinkButton(el.instagramLink, () => state.company.instagram);
  bindExternalLinkButton(el.facebookLink, () => state.company.facebook);
  bindExternalLinkButton(el.telegramLink, () => state.company.telegram);
  bindExternalLinkButton(el.whatsappLink, () => buildWhatsAppLink());
  bindExternalLinkButton(el.modalInstagramLink, () => state.company.instagram);
  bindExternalLinkButton(el.modalFacebookLink, () => state.company.facebook);
  bindExternalLinkButton(el.modalTelegramLink, () => state.company.telegram);
  bindExternalLinkButton(el.modalWhatsappLink, () => buildWhatsAppLink());
  bindExternalLinkButton(el.modalFactoryMapLink, () => state.company.factoryMap);
  bindExternalLinkButton(el.modalShopMapLink, () => state.company.shopMap);
  el.checkoutBtn.addEventListener('click', () => {
    if (!state.cart.length) return showToast('السلة فارغة');
    if (!validateCartAvailability()) return;
    renderCheckoutSummary();
    openModal('checkoutModal');
  });
  el.submitOrderBtn.addEventListener('click', submitOrder);
  el.trackOrderBtn?.addEventListener('click', searchTrackedOrders);
  el.trackOrderInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchTrackedOrders(); } });
  el.invoiceDownloadBtn?.addEventListener('click', () => downloadActiveInvoice());
  el.invoiceWhatsappBtn?.addEventListener('click', () => openInvoiceWhatsApp());
  el.adminLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminLogin();
  });
  el.adminLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminLogout();
  });
  [el.adminEmail, el.adminPassword].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        adminLogin();
      }
    });
  });
  el.saveAppearanceBtn.addEventListener('click', saveAppearance);
  el.saveCompanyBtn.addEventListener('click', saveCompanyData);
  el.savePoliciesBtn.addEventListener('click', savePolicies);
  el.saveSeasonsBtn.addEventListener('click', saveSeasons);
  el.saveProductBtn.addEventListener('click', saveProduct);
  el.resetProductBtn.addEventListener('click', resetProductForm);
  el.goAddProductBtn?.addEventListener('click', () => { resetProductForm(); activateAdminTab('productAddTab'); queueMicrotask(() => el.productModelInput?.focus()); });
  el.goProductsManagerBtn?.addEventListener('click', () => { activateAdminTab('productsManagerTab'); queueMicrotask(() => el.adminProductSearchInput?.focus()); });
  el.adminProductSearchInput?.addEventListener('input', debounce(() => {
    state.adminProductSearch = normalizeAdminProductSearch(el.adminProductSearchInput.value);
    state.adminProductShowAll = false;
    renderAdminProducts();
  }, 80));
  el.adminProductSearchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      clearAdminProductSearch();
    }
  });
  el.adminProductSearchClear?.addEventListener('click', clearAdminProductSearch);
  el.toggleAllProductsBtn?.addEventListener('click', () => {
    state.adminProductShowAll = !state.adminProductShowAll;
    if (state.adminProductShowAll) {
      state.adminProductSearch = '';
      if (el.adminProductSearchInput) el.adminProductSearchInput.value = '';
    }
    renderAdminProducts();
  });
  el.productImageUrlsInput.addEventListener('input', syncDraftImagesFromTextarea);
  el.productImagesInput.addEventListener('change', handleProductFileUpload);
  el.exportProductsBtn.addEventListener('click', exportProductsExcel);
  el.exportOrdersBtn.addEventListener('click', exportOrdersExcel);
  el.excelImportInput.addEventListener('change', importProductsExcel);
  el.quickExcelImportInput?.addEventListener('change', importQuickProductsExcel);
  el.deleteProductsBtn.addEventListener('click', () => deleteCollectionDocs('products', 'حذف المنتجات'));
  el.deleteOrdersBtn.addEventListener('click', () => deleteCollectionDocs('orders', 'حذف الطلبات'));
  el.deleteAllDataBtn.addEventListener('click', deleteAllData);
  el.togglePinnedFilterBtn.addEventListener('click', togglePinnedAdminFilter);
  el.galleryPrev.addEventListener('click', () => changeGallery(-1));
  el.galleryNext.addEventListener('click', () => changeGallery(1));
  el.singleAssetUploader.addEventListener('change', handleSingleAssetUpload);
  el.uploadTriggers.forEach((btn) => btn.addEventListener('click', () => {
    if (!guardAdmin()) return;
    state.assetTargetInputId = btn.dataset.targetInput;
    el.singleAssetUploader.click();
  }));
  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal(e.currentTarget.dataset.close);
    });
  });
  [el.contactModal, el.trackOrderModal, el.policyModal, el.imageModal, el.checkoutModal, el.invoiceModal, el.quickProductModal].filter(Boolean).forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        e.preventDefault();
        closeModal(modal.id);
      }
    });
  });
  el.quickProductAddBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = e.currentTarget.dataset.productId;
    if (!productId) return;
    addToCart(productId);
  });
  el.quickProductImage?.addEventListener('click', () => {
    const src = el.quickProductImage?.dataset.fullImage || el.quickProductImage?.src;
    if (!src) return;
    openGallery([src], 0);
  });
  document.addEventListener('click', (event) => {
    if (!el.searchSuggestions || el.searchSuggestions.classList.contains('hidden')) return;
    if (event.target === el.searchInput || el.searchSuggestions.contains(event.target)) return;
    hideSearchSuggestions();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.modal.show')) {
      const activeModal = document.querySelector('.modal.show');
      if (activeModal?.id) closeModal(activeModal.id);
    }
  });
}

function initTabs() {
  el.adminTabs.forEach((btn) => btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    activateAdminTab(btn.dataset.tab);
  }));
}

function activateAdminTab(tabId) {
  if (!tabId) return;
  el.adminTabs.forEach((item) => item.classList.toggle('active', item.dataset.tab === tabId));
  el.tabsPanels.forEach((panel) => panel.classList.toggle('active', panel.id === tabId));
  if (tabId === 'productsManagerTab') renderAdminProducts();
  if (tabId === 'quickImportTab') renderQuickImportedProducts();
  if (tabId === 'offersAdminTab') renderAdminOffers();
}

function subscribeData() {
  onSnapshot(collection(db, 'products'), (snapshot) => {
    state.products = snapshot.docs.map((entry) => enrichProduct({ id: entry.id, ...entry.data() }));
    state.productsLoaded = true;
    state.products.sort((a, b) => toMillis(b.createdAt || b.updatedAt) - toMillis(a.createdAt || a.updatedAt));
    resetRenderedProducts();
    scheduleRenderEverything();
  }, console.error);
  onSnapshot(collection(db, 'categories'), (snapshot) => {
    state.categories = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    scheduleRenderEverything();
  }, console.error);
  onSnapshot(doc(db, 'company', 'main'), (entry) => {
    state.company = { ...DEFAULT_COMPANY, ...(entry.exists() ? entry.data() : {}) };
    scheduleRenderEverything();
  }, console.error);
  onSnapshot(doc(db, 'settings', 'storefront'), (entry) => {
    state.storefront = { ...DEFAULT_STOREFRONT, ...(entry.exists() ? entry.data() : {}) };
    const legacyPrimary = String(state.storefront.accentColor || '').toLowerCase();
    const legacySecondary = String(state.storefront.accentColor2 || '').toLowerCase();
    if (legacyPrimary === '#7c3aed' && legacySecondary === '#2563eb') {
      state.storefront.accentColor = DEFAULT_STOREFRONT.accentColor;
      state.storefront.accentColor2 = DEFAULT_STOREFRONT.accentColor2;
    }
    applyTheme();
    scheduleRenderEverything();
  }, console.error);
  onSnapshot(doc(db, 'settings', 'store'), (entry) => {
    state.storeSettings = { ...DEFAULT_STORE_SETTINGS, ...(entry.exists() ? entry.data() : {}) };
    scheduleRenderEverything();
  }, console.error);
  onSnapshot(doc(db, 'payments', 'default'), (entry) => {
    state.payments = { policyText: DEFAULT_PAYMENT_POLICY, methods: [...DEFAULT_PAYMENT_METHODS], ...(entry.exists() ? entry.data() : {}) };
    scheduleRenderEverything();
  }, console.error);
  onSnapshot(doc(db, 'shipping', 'default'), (entry) => {
    const data = entry.exists() ? entry.data() : {};
    state.storeSettings.shippingPolicy = data.policyText || state.storeSettings.shippingPolicy || DEFAULT_SHIPPING_POLICY;
    scheduleRenderEverything();
  }, console.error);
}

let unsubscribeOrders = null;
let publicTrackingBootstrapped = false;

function scheduleRenderEverything() {
  if (state.renderScheduled) return;
  state.renderScheduled = true;
  requestAnimationFrame(() => {
    state.renderScheduled = false;
    renderEverything();
  });
}

function subscribeOrdersIfAdmin() {
  if (!state.isAdmin) {
    if (unsubscribeOrders) {
      unsubscribeOrders();
      unsubscribeOrders = null;
    }
    publicTrackingBootstrapped = false;
    state.orders = [];
    scheduleRenderEverything();
    return;
  }
  if (unsubscribeOrders) return;
  unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
    state.orders = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    state.orders.sort((a, b) => toMillis(b.createdAt || b.updatedAt) - toMillis(a.createdAt || a.updatedAt));
    if (!publicTrackingBootstrapped && state.orders.length) {
      publicTrackingBootstrapped = true;
      syncPublicTrackingCollection(state.orders);
    }
    scheduleRenderEverything();
  }, (error) => {
    console.error(error);
    state.orders = [];
    scheduleRenderEverything();
    showToast('لا يمكن عرض الطلبات إلا بعد دخول الأدمن');
  });
}

function renderEverything() {
  renderStorefront();
  rebuildSeasonOptions();
  renderCategoryManager();
  renderAdminForms();
  renderAdminProducts();
  renderQuickImportedProducts();
  renderAdminOffers();
  renderAdminOrders();
  applyFilters();
  renderCart();
}

function renderStorefront() {
  const companyName = state.company.companyName || state.storefront.companyName || DEFAULT_COMPANY.companyName;
  const tagline = state.company.tagline || state.storefront.tagline || DEFAULT_COMPANY.tagline;
  el.brandName.textContent = companyName;
  el.brandTagline.textContent = tagline;
  el.footerBrandName.textContent = companyName;
  el.heroTitle.textContent = state.storefront.heroTitle || DEFAULT_STOREFRONT.heroTitle;
  el.heroSubtitle.textContent = state.storefront.heroSubtitle || DEFAULT_STOREFRONT.heroSubtitle;
  el.heroBadge.textContent = state.storefront.heroBadge || DEFAULT_STOREFRONT.heroBadge;
  el.companyAbout.textContent = state.company.about || '';
  const logoUrl = state.storefront.logoUrl || '';
  if (logoUrl) {
    el.brandLogoImage.src = logoUrl;
    el.brandLogoImage.classList.remove('hidden');
    el.brandLogoMark.classList.add('hidden');
  } else {
    el.brandLogoImage.classList.add('hidden');
    el.brandLogoMark.classList.remove('hidden');
    el.brandLogoMark.textContent = initials(companyName);
  }
  setActionLink(el.instagramLink, '');
  setActionLink(el.facebookLink, '');
  setActionLink(el.telegramLink, '');
  setActionLink(el.whatsappLink, '');
  setActionLink(el.modalInstagramLink, state.company.instagram);
  setActionLink(el.modalFacebookLink, state.company.facebook);
  setActionLink(el.modalTelegramLink, state.company.telegram);
  setActionLink(el.modalWhatsappLink, buildWhatsAppLink());
  setActionLink(el.modalFactoryMapLink, state.company.factoryMap);
  setActionLink(el.modalShopMapLink, state.company.shopMap);
  const visibleProducts = getVisibleProducts();
  el.productsCounter.textContent = visibleProducts.length.toLocaleString('en-US');
  el.categoriesCounter.textContent = getCodeCategoryKeys().length.toLocaleString('en-US');
  el.seasonsCounter.textContent = getSeasonOptions().length.toLocaleString('en-US');
  el.floatingWhatsApp.classList.toggle('hidden', !state.storefront.floatingWhatsappEnabled || !normalizeWhatsAppNumber(state.company.whatsapp || state.company.phone1));
  el.menuTrackOrderBtn?.classList.toggle('hidden', !PUBLIC_TRACKING_ENABLED);
  const showInstall = state.storefront.installEnabled && Boolean(state.deferredInstallPrompt);
  el.installBtn.classList.toggle('hidden', !showInstall);
  el.menuInstallBtn.classList.toggle('hidden', !showInstall);
  renderPaymentIcons();
  renderHeroShowcase(visibleProducts);
  renderFeaturedCollections(visibleProducts);
  renderNewArrivals(visibleProducts);
  renderOffersSection(visibleProducts);
  syncSiteMeta();
  syncDynamicStructuredData();
}

function renderHeroShowcase(products = []) {
  if (!el.heroShowcase) return;
  const candidates = [...products]
    .filter((product) => normalizeImageUrls(product.imageUrls).length)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
    .slice(0, 3);
  if (!candidates.length) {
    el.heroShowcase.innerHTML = `<div class="hero-showcase-main hero-showcase-placeholder"><i class="fa-solid fa-shirt"></i></div><div class="hero-showcase-side"><div class="hero-showcase-small hero-showcase-placeholder"><i class="fa-solid fa-shirt"></i></div><div class="hero-showcase-small hero-showcase-placeholder"><i class="fa-solid fa-shirt"></i></div></div>`;
    return;
  }
  const buildTile = (product, className) => {
    const image = getProductThumbUrl(normalizeImageUrls(product.imageUrls)[0]);
    const badge = product.model ? `<span class="hero-product-model">Model ${escapeHTML(product.model)}</span>` : '';
    return `<button type="button" class="${className} hero-product-tile" data-hero-product="${escapeAttr(product.id)}"><img src="${escapeAttr(image)}" alt="${escapeAttr(buildProductAlt(product))}" loading="eager" decoding="async" />${badge}</button>`;
  };
  const main = candidates[0], second = candidates[1] || main, third = candidates[2] || main;
  el.heroShowcase.innerHTML = `${buildTile(main,'hero-showcase-main')}<div class="hero-showcase-side">${buildTile(second,'hero-showcase-small')}${buildTile(third,'hero-showcase-small')}</div>`;
  el.heroShowcase.querySelectorAll('[data-hero-product]').forEach((button) => button.addEventListener('click', () => {
    const product = state.products.find((item) => String(item.id) === String(button.dataset.heroProduct));
    if (product) openQuickProduct(product);
  }));
}

function renderFeaturedCollections(products = getVisibleProducts()) {
  if (!el.collectionsSection || !el.collectionsGrid) return;
  const groups = new Map();
  products.forEach((product) => {
    const key = String(product.codeCategory || deriveCodeCategory(product.model) || '').trim();
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  });
  const collections = [...groups.entries()]
    .map(([key, items]) => ({ key, items, label: getCodeCategoryLabel(key), image: getRepresentativeImage(items) }))
    .sort((a,b) => b.items.length - a.items.length)
    .slice(0, 6);
  el.collectionsSection.classList.toggle('hidden', !collections.length);
  el.collectionsGrid.innerHTML = '';
  collections.forEach((collection) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-store-card';
    button.innerHTML = `<span class="collection-store-media">${collection.image ? `<img src="${escapeAttr(collection.image)}" alt="${escapeAttr(collection.label)}" loading="lazy" decoding="async">` : '<i class="fa-solid fa-shirt"></i>'}</span><span class="collection-store-copy"><strong>${escapeHTML(collection.label)}</strong><small>${collection.items.length.toLocaleString('en-US')} موديل</small></span><i class="fa-solid fa-arrow-left collection-arrow"></i>`;
    button.addEventListener('click', () => activateCatalogProducts('', collection.key, { closeAfter:false }));
    el.collectionsGrid.appendChild(button);
  });
}

function renderNewArrivals(products = getVisibleProducts()) {
  if (!el.newArrivalsSection || !el.newArrivalsRail) return;
  const latest = [...products]
    .sort((a,b) => toMillis(b.createdAt || b.updatedAt) - toMillis(a.createdAt || a.updatedAt))
    .slice(0, 10);
  el.newArrivalsSection.classList.toggle('hidden', !latest.length);
  el.newArrivalsRail.innerHTML = '';
  latest.forEach((product) => {
    const image = getProductThumbUrl(normalizeImageUrls(product.imageUrls)[0] || placeholderImage(product.name || product.model || 'Jood Kids'));
    const item = document.createElement('article');
    item.className = 'commerce-mini-product';
    const stock = getStockStatus(product);
    item.innerHTML = `<a class="commerce-mini-media" href="${escapeAttr(getProductPageUrl(product))}"><img src="${escapeAttr(image)}" alt="${escapeAttr(buildProductAlt(product))}" loading="lazy" decoding="async">${hasDiscount(product) ? `<span class="commerce-mini-offer">-${Math.round(toNumber(product.discountPercent))}%</span>` : ''}</a><div class="commerce-mini-body"><small>Model ${escapeHTML(product.model || '-')}</small><a class="commerce-mini-title" href="${escapeAttr(getProductPageUrl(product))}">${escapeHTML(product.name || `موديل ${product.model || ''}`)}</a><div class="commerce-mini-bottom"><strong>${formatCurrency(getDiscountedPiecePrice(product))}</strong><span class="mini-stock ${stock.key}">${escapeHTML(stock.label)}</span></div></div>`;
    el.newArrivalsRail.appendChild(item);
  });
}

function resetAllCommerceFilters() {
  state.catalog.step = 'products';
  state.catalog.selectedSeason = '';
  state.catalog.selectedCategory = 'all';
  state.catalog.selectedSubCategory = 'all';
  state.filter = { search:'', category:'all', subCategory:'all', season:'all', offersOnly:false, sort:'featured' };
  if (el.searchInput) el.searchInput.value='';
  if (el.sortFilter) el.sortFilter.value='featured';
  resetRenderedProducts();
  applyFilters();
  renderCatalogFlow();
}

function renderFilterDrawer() {
  if (!el.filterDrawer) return;
  const makeChoice = (label, active, onClick) => {
    const btn = document.createElement('button');
    btn.type='button';
    btn.className = `filter-choice${active ? ' active' : ''}`;
    btn.textContent = label;
    btn.addEventListener('click', () => { onClick(); renderFilterDrawer(); });
    return btn;
  };
  if (el.filterSeasonList) {
    el.filterSeasonList.innerHTML='';
    el.filterSeasonList.appendChild(makeChoice('كل المواسم', state.filter.season === 'all', () => { state.filter.season='all'; state.catalog.selectedSeason=''; resetRenderedProducts(); applyFilters(); }));
    getSeasonOptions().forEach((season) => el.filterSeasonList.appendChild(makeChoice(season, state.filter.season === season, () => { state.filter.season=season; state.catalog.selectedSeason=season; resetRenderedProducts(); applyFilters(); })));
  }
  if (el.filterCategoryList) {
    el.filterCategoryList.innerHTML='';
    el.filterCategoryList.appendChild(makeChoice('كل التصنيفات', state.filter.category === 'all', () => { state.filter.category='all'; state.filter.subCategory='all'; resetRenderedProducts(); applyFilters(); }));
    getCodeCategoryKeys().forEach((key) => el.filterCategoryList.appendChild(makeChoice(getCodeCategoryLabel(key), state.filter.category === key, () => { state.filter.category=key; state.filter.subCategory='all'; resetRenderedProducts(); applyFilters(); })));
  }
  if (el.filterOffersOnly) {
    el.filterOffersOnly.checked = Boolean(state.filter.offersOnly);
    el.filterOffersOnly.onchange = () => { state.filter.offersOnly = el.filterOffersOnly.checked; resetRenderedProducts(); applyFilters(); renderFilterDrawer(); };
  }
  renderActiveFilters();
}

function renderActiveFilters() {
  const filters = [];
  if (state.filter.season !== 'all') filters.push({ label: state.filter.season, clear: () => { state.filter.season='all'; state.catalog.selectedSeason=''; } });
  if (state.filter.category !== 'all') filters.push({ label: getCodeCategoryLabel(state.filter.category), clear: () => { state.filter.category='all'; state.filter.subCategory='all'; } });
  if (state.filter.subCategory !== 'all') filters.push({ label: state.filter.subCategory, clear: () => { state.filter.subCategory='all'; } });
  if (state.filter.offersOnly) filters.push({ label: 'العروض', clear: () => { state.filter.offersOnly=false; } });
  if (state.filter.search) filters.push({ label: `بحث: ${state.filter.search}`, clear: () => { state.filter.search=''; if (el.searchInput) el.searchInput.value=''; } });
  if (el.activeFiltersCount) {
    el.activeFiltersCount.textContent = String(filters.length);
    el.activeFiltersCount.classList.toggle('hidden', !filters.length);
  }
  if (!el.activeFilterChips) return;
  el.activeFilterChips.innerHTML='';
  filters.slice(0,3).forEach((filter) => {
    const btn=document.createElement('button'); btn.type='button'; btn.className='active-filter-chip'; btn.innerHTML=`<span>${escapeHTML(filter.label)}</span><i class="fa-solid fa-xmark"></i>`;
    btn.addEventListener('click', () => { filter.clear(); resetRenderedProducts(); applyFilters(); });
    el.activeFilterChips.appendChild(btn);
  });
}

function renderOffersSection(products = getVisibleProducts()) {
  if (!el.offersSection || !el.offersRail) return;
  const offers = [...products]
    .filter(hasDiscount)
    .sort((a, b) => {
      const discountDelta = toNumber(b.discountPercent) - toNumber(a.discountPercent);
      if (discountDelta) return discountDelta;
      const pinDelta = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
      if (pinDelta) return pinDelta;
      return toMillis(b.createdAt || b.updatedAt) - toMillis(a.createdAt || a.updatedAt);
    });

  if (el.menuOffersCount) el.menuOffersCount.textContent = String(offers.length);
  el.offersSection.classList.toggle('hidden', offers.length === 0);
  el.offersRail.innerHTML = '';
  if (!offers.length) return;

  const fragment = document.createDocumentFragment();
  offers.slice(0, 8).forEach((product) => {
    const image = getProductThumbUrl(normalizeImageUrls(product.imageUrls)[0] || placeholderImage(product.name || product.model || 'Jood Kids'));
    const discount = Math.round(toNumber(product.discountPercent));
    const oldPiece = getPiecePrice(product);
    const newPiece = getDiscountedPiecePrice(product);
    const item = document.createElement('article');
    item.className = 'offer-card';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `فتح عرض ${product.name || product.model || ''}`);
    item.innerHTML = `
      <div class="offer-card-media">
        <img src="${escapeAttr(image)}" alt="${escapeAttr(buildProductAlt(product))}" loading="lazy" decoding="async" />
        <span class="offer-discount">-${discount}%</span>
      </div>
      <div class="offer-card-body">
        <div class="offer-model">موديل ${escapeHTML(product.model || '-')}</div>
        <h3>${escapeHTML(product.name || `موديل ${product.model || ''}`)}</h3>
        <div class="offer-price-line">
          <strong>${formatCurrency(newPiece)}</strong>
          <del>${formatCurrency(oldPiece)}</del>
        </div>
      </div>`;
    const open = () => openQuickProduct(product);
    item.addEventListener('click', open);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
    fragment.appendChild(item);
  });
  el.offersRail.appendChild(fragment);
}

function openOffersExperience() {
  closeDrawers();
  const offersCount = getVisibleProducts().filter(hasDiscount).length;
  if (!offersCount) {
    showToast('لا توجد عروض مفعلة حالياً');
    return;
  }
  if (el.offersSection && !el.offersSection.classList.contains('hidden')) {
    el.offersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  activateOffersView();
}

function openPrivateAdminRoute() {
  const url = new URL(window.location.href);
  if (url.searchParams.get('manage') !== '1') return;
  requestAnimationFrame(() => openDrawer('admin'));
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

function renderMenu() {
  const selectedCat = state.filter.category;
  const selectedSeason = state.filter.season;
  el.menuCategoryList.innerHTML = '';
  el.menuCategoryList.appendChild(makeFilterChip('الكل', selectedCat === 'all', () => {
    activateCatalogProducts(state.catalog.selectedSeason || '', 'all', { closeAfter: false, scrollIntoView: false, preserveSort: true });
  }));
  getCodeCategoryKeys().forEach((key) => {
    el.menuCategoryList.appendChild(makeFilterChip(getCodeCategoryLabel(key), selectedCat === key, () => {
      activateCatalogProducts(state.catalog.selectedSeason || selectedSeason || '', key, { closeAfter: true, preserveSort: true });
    }));
  });
  el.menuSeasonList.innerHTML = '';
  el.menuSeasonList.appendChild(makeFilterChip('الكل', selectedSeason === 'all', () => {
    goToSeasonsView({ closeAfter: false });
  }));
  getSeasonOptions().forEach((season) => {
    el.menuSeasonList.appendChild(makeFilterChip(season, selectedSeason === season, () => {
      activateCatalogProducts(season, 'all', { closeAfter: true, preserveSort: true });
    }));
  });
  el.menuOffersBtn.classList.toggle('active', state.filter.offersOnly);
}

function makeFilterChip(label, active, onClick) {
  const btn = document.createElement('button');
  btn.className = `filter-chip ${active ? 'active' : ''}`;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function activateOffersView(options = {}) {
  const { toggle = false, closeAfter = false } = options;
  if (state.catalog.step !== 'products') {
    state.catalog.step = 'products';
    state.filter.season = state.catalog.selectedSeason || 'all';
    state.filter.category = state.catalog.selectedCategory || 'all';
  }
  state.filter.offersOnly = toggle ? !state.filter.offersOnly : true;
  resetRenderedProducts();
  applyFilters();
  if (closeAfter) closeDrawers();
  scrollProductsTop();
}

function hydrateCatalogFromUrl() {
  if (state.catalog.hydratedFromUrl) return;
  const url = new URL(window.location.href);
  const season = String(url.searchParams.get('season') || '').trim();
  const category = String(url.searchParams.get('prefix') || 'all').trim() || 'all';
  const subCategory = String(url.searchParams.get('subcat') || 'all').trim() || 'all';
  const screen = String(url.searchParams.get('screen') || '').trim();
  if (season) {
    state.catalog.selectedSeason = season;
    state.catalog.selectedCategory = category;
    state.catalog.selectedSubCategory = subCategory;
    state.catalog.step = screen === 'products' ? 'products' : 'prefixes';
    state.filter.season = season;
    state.filter.category = state.catalog.step === 'products' ? category : 'all';
    state.filter.subCategory = state.catalog.step === 'products' ? subCategory : 'all';
  }
  state.catalog.hydratedFromUrl = true;
}

function syncCatalogRoute() {
  if (!window.history?.replaceState) return;
  const url = new URL(window.location.href);
  url.searchParams.delete('season');
  url.searchParams.delete('prefix');
  url.searchParams.delete('subcat');
  url.searchParams.delete('screen');
  if (state.catalog.selectedSeason) {
    url.searchParams.set('season', state.catalog.selectedSeason);
    if (state.catalog.step === 'products') url.searchParams.set('screen', 'products');
    else if (state.catalog.step === 'prefixes') url.searchParams.set('screen', 'prefixes');
  }
  if (state.catalog.step === 'products' && state.catalog.selectedCategory && state.catalog.selectedCategory !== 'all') {
    url.searchParams.set('prefix', state.catalog.selectedCategory);
  }
  if (state.catalog.step === 'products' && state.catalog.selectedSubCategory && state.catalog.selectedSubCategory !== 'all') {
    url.searchParams.set('subcat', state.catalog.selectedSubCategory);
  }
  window.history.replaceState(null, '', url.toString());
}

function resetCatalogSearch(preserveSort = false) {
  state.filter.search = '';
  state.filter.offersOnly = false;
  el.searchInput.value = '';
  if (!preserveSort) {
    state.filter.sort = 'featured';
    el.sortFilter.value = 'featured';
  }
}

function goToSeasonsView({ closeAfter = false } = {}) {
  state.catalog.step = 'seasons';
  state.catalog.selectedSeason = '';
  state.catalog.selectedCategory = 'all';
  state.catalog.selectedSubCategory = 'all';
  resetCatalogSearch(true);
  state.filter.season = 'all';
  state.filter.category = 'all';
  state.filter.subCategory = 'all';
  resetRenderedProducts();
  if (closeAfter) closeDrawers();
  applyFilters();
  requestAnimationFrame(scrollCatalogTop);
}

function goToSeasonPrefixes(season, { closeAfter = false } = {}) {
  const safeSeason = String(season || '').trim();
  if (!safeSeason) return goToSeasonsView({ closeAfter });
  state.catalog.step = 'prefixes';
  state.catalog.selectedSeason = safeSeason;
  state.catalog.selectedCategory = 'all';
  state.catalog.selectedSubCategory = 'all';
  resetCatalogSearch(true);
  state.filter.season = safeSeason;
  state.filter.category = 'all';
  state.filter.subCategory = 'all';
  resetRenderedProducts();
  if (closeAfter) closeDrawers();
  applyFilters();
  requestAnimationFrame(scrollCatalogTop);
}

function activateCatalogProducts(season = '', category = 'all', options = {}) {
  const { closeAfter = false, scrollIntoView = true, preserveSort = false, subCategory = 'all' } = options || {};
  const safeSeason = String(season || '').trim();
  const safeCategory = String(category || 'all').trim() || 'all';
  const safeSubCategory = normalizeSubCategory(subCategory) || 'all';
  state.catalog.step = 'products';
  state.catalog.selectedSeason = safeSeason;
  state.catalog.selectedCategory = safeCategory;
  state.catalog.selectedSubCategory = safeSubCategory;
  resetCatalogSearch(preserveSort);
  state.filter.season = safeSeason || 'all';
  state.filter.category = safeCategory;
  state.filter.subCategory = safeSubCategory;
  resetRenderedProducts();
  if (closeAfter) closeDrawers();
  applyFilters();
  if (scrollIntoView) requestAnimationFrame(scrollProductsTop);
}

function scrollCatalogTop() {
  el.catalogFlowStage?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollProductsTop() {
  (el.productsHeadingRow || el.toolbarWrap || el.productsGrid)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getProductsForSeason(season) {
  const safeSeason = String(season || '').trim();
  return getVisibleProducts().filter((item) => !safeSeason || String(item.season || '').trim() === safeSeason);
}

function getCategoryKeysForSeason(season) {
  return [...new Set(getProductsForSeason(season).map((item) => String(item.codeCategory || deriveCodeCategory(item.model))).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

function normalizeSubCategory(value) {
  return String(value || '').trim();
}

function getProductSubCategory(product) {
  return normalizeSubCategory(product?.subCategory || product?.subcategory || product?.groupLabel || '');
}

function getSubCategoryKeys({ season = '', category = 'all' } = {}) {
  const safeSeason = String(season || '').trim();
  const safeCategory = String(category || 'all').trim() || 'all';
  return [...new Set(
    getVisibleProducts()
      .filter((item) => !safeSeason || String(item.season || '').trim() === safeSeason)
      .filter((item) => safeCategory === 'all' || String(item.codeCategory || deriveCodeCategory(item.model)) === safeCategory)
      .map((item) => getProductSubCategory(item))
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'ar', { numeric: true, sensitivity: 'base' }));
}

function getRepresentativeImage(items = []) {
  for (const item of items) {
    const url = normalizeImageUrls(item?.imageUrls)[0];
    if (url) return getProductThumbUrl(url);
  }
  return '';
}

function getSeasonIcon(season) {
  const value = String(season || '').trim();
  if (/صيف/i.test(value)) return 'fa-sun';
  if (/شت/i.test(value)) return 'fa-snowflake';
  if (/خريف/i.test(value)) return 'fa-leaf';
  if (/ربيع/i.test(value)) return 'fa-seedling';
  if (/حديث|ولادة|بيبي|مواليد/i.test(value)) return 'fa-baby';
  return 'fa-shirt';
}

function getPrefixIcon(code, label) {
  const text = `${label || ''} ${code || ''}`;
  if (/حديث|ولادة|بيبي|مواليد/i.test(text)) return 'fa-baby';
  if (/بنات|بنت/i.test(text)) return 'fa-ribbon';
  if (/ولاد|اولاد|أولاد/i.test(text)) return 'fa-child';
  const icons = ['fa-shirt', 'fa-layer-group', 'fa-box-open', 'fa-tags', 'fa-bag-shopping', 'fa-socks'];
  const seed = String(code || label || '0').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return icons[seed % icons.length];
}

function buildCatalogCard({ kind = 'season', title = '', subtitle = '', meta = '', count = 0, icon = 'fa-shirt', image = '', season = '', category = '', action = '', accent = '' }) {
  const mediaStyle = image ? ` style="background-image:url('${escapeAttr(image)}')"` : '';
  const accentClass = accent ? ` ${accent}` : '';
  return `
    <button class="catalog-card ${kind === 'season' ? 'catalog-card--season' : 'catalog-card--prefix'}${accentClass}" data-action="${escapeAttr(action)}" data-season="${escapeAttr(season)}" data-category="${escapeAttr(category)}">
      <span class="catalog-card__media"${mediaStyle}>
        <span class="catalog-card__veil"></span>
        <span class="catalog-card__icon"><i class="fa-solid ${escapeAttr(icon)}"></i></span>
      </span>
      <span class="catalog-card__body">
        <strong>${escapeHTML(title)}</strong>
        <span class="catalog-card__subtitle">${escapeHTML(subtitle)}</span>
        <span class="catalog-card__meta">
          <small>${escapeHTML(meta)}</small>
          <b>${Number(count || 0).toLocaleString('en-US')}</b>
        </span>
      </span>
    </button>`;
}

function syncCatalogHero() {
  const step = state.catalog.step;
  const selectedSeason = state.catalog.selectedSeason;
  const selectedCategory = state.catalog.selectedCategory;
  const selectedSubCategory = state.catalog.selectedSubCategory;
  const defaultTitle = state.storefront.heroTitle || DEFAULT_STOREFRONT.heroTitle;
  const defaultSubtitle = state.storefront.heroSubtitle || DEFAULT_STOREFRONT.heroSubtitle;
  const defaultBadge = state.storefront.heroBadge || DEFAULT_STOREFRONT.heroBadge;
  let title = defaultTitle;
  let subtitle = defaultSubtitle;
  let badge = defaultBadge;
  let sectionTitle = 'المنتجات';
  if (step === 'seasons') {
    title = 'المواسم';
    subtitle = 'اختر الموسم لبدء التصفح داخل المتجر.';
    badge = 'واجهة المتجر';
    sectionTitle = 'المنتجات';
  } else if (step === 'prefixes') {
    title = selectedSeason || defaultTitle;
    subtitle = 'اختر البادئة أو اعرض كل موديلات الموسم.';
    badge = 'البادئات';
    sectionTitle = selectedSeason ? `موديلات ${selectedSeason}` : 'المنتجات';
  } else if (step === 'products') {
    const categoryLabel = selectedCategory && selectedCategory !== 'all' ? getCodeCategoryLabel(selectedCategory) : '';
    const subCategoryLabel = selectedSubCategory && selectedSubCategory !== 'all' ? selectedSubCategory : '';
    title = subCategoryLabel || categoryLabel || selectedSeason || defaultTitle;
    if (selectedSeason && categoryLabel && subCategoryLabel) subtitle = `${selectedSeason} • ${categoryLabel} • ${subCategoryLabel}`;
    else if (selectedSeason && categoryLabel) subtitle = `${selectedSeason} • ${categoryLabel}`;
    else if (selectedSeason) subtitle = `كل موديلات ${selectedSeason} مع تصنيف البادئة`;
    else subtitle = defaultSubtitle;
    badge = subCategoryLabel ? 'التصنيف الداخلي' : (categoryLabel ? `بادئة ${selectedCategory}` : (selectedSeason ? 'كل منتجات الموسم' : defaultBadge));
    sectionTitle = subCategoryLabel || categoryLabel || (selectedSeason ? `موديلات ${selectedSeason}` : 'المنتجات');
  }
  el.heroTitle.textContent = title;
  el.heroSubtitle.textContent = subtitle;
  el.heroBadge.textContent = badge;
  if (el.productsSectionTitle) el.productsSectionTitle.textContent = sectionTitle;
}

function renderCatalogFlow() {
  if (!el.catalogFlow) return;
  const step = state.catalog.step;
  const selectedSeason = state.catalog.selectedSeason;
  const selectedCategory = state.catalog.selectedCategory;
  const selectedSubCategory = state.catalog.selectedSubCategory || 'all';
  const seasonOptions = getSeasonOptions();
  const seasonCards = seasonOptions.map((season) => {
    const items = getProductsForSeason(season);
    return buildCatalogCard({
      kind: 'season',
      title: season,
      subtitle: '',
      meta: 'موديل',
      count: items.length,
      icon: getSeasonIcon(season),
      image: getRepresentativeImage(items),
      season,
      action: 'season'
    });
  }).join('');

  let html = '';
  if (step === 'seasons') {
    html = `
      <div class="catalog-browser-card">
        <div class="catalog-browser-head">
          <div>
            <span class="catalog-kicker">Jood Kids</span>
            <h2>اختر الموسم</h2>
          </div>
        </div>
        <div class="catalog-browser-grid season-grid">${seasonCards}</div>
      </div>`;
  } else if (step === 'prefixes') {
    const seasonItems = getProductsForSeason(selectedSeason);
    const prefixCards = getCategoryKeysForSeason(selectedSeason).map((code) => {
      const items = seasonItems.filter((item) => String(item.codeCategory || deriveCodeCategory(item.model)) === String(code));
      return buildCatalogCard({
        kind: 'prefix',
        title: getCodeCategoryLabel(code),
        subtitle: '',
        meta: 'موديل',
        count: items.length,
        icon: getPrefixIcon(code, getCodeCategoryLabel(code)),
        image: getRepresentativeImage(items),
        season: selectedSeason,
        category: code,
        action: 'prefix'
      });
    }).join('');
    html = `
      <div class="catalog-browser-card">
        <div class="catalog-breadcrumb">
          <button class="crumb-btn" data-action="go-seasons">المواسم</button>
          <span class="crumb-sep"><i class="fa-solid fa-angle-left"></i></span>
          <span class="crumb-pill active">${escapeHTML(selectedSeason)}</span>
        </div>
        <div class="catalog-browser-head catalog-browser-head--split">
          <div>
            <span class="catalog-kicker">${escapeHTML(selectedSeason)}</span>
            <h2>اختر البادئة</h2>
            <p>يمكنك عرض كل موديلات الموسم مباشرة أو الدخول إلى بادئة محددة.</p>
          </div>
          <button class="catalog-all-btn" data-action="season-all" data-season="${escapeAttr(selectedSeason)}">
            <i class="fa-solid fa-layer-group"></i>
            <span>كل منتجات الموسم</span>
          </button>
        </div>
        <div class="catalog-browser-grid prefix-grid">${prefixCards || '<div class="catalog-empty-inline">لا توجد بادئات لهذا الموسم بعد.</div>'}</div>
      </div>`;
  } else {
    const seasonItems = selectedSeason ? getProductsForSeason(selectedSeason) : getVisibleProducts();
    const prefixFilters = selectedSeason ? ['all', ...getCategoryKeysForSeason(selectedSeason)] : ['all', ...getCodeCategoryKeys()];
    const prefixChips = prefixFilters.map((code) => {
      const isAll = code === 'all';
      const label = isAll ? 'كل البادئات' : getCodeCategoryLabel(code);
      const count = isAll ? seasonItems.length : seasonItems.filter((item) => String(item.codeCategory || deriveCodeCategory(item.model)) === String(code)).length;
      return `<button class="prefix-filter-chip ${selectedCategory === code ? 'active' : ''}" data-action="filter-prefix" data-season="${escapeAttr(selectedSeason)}" data-category="${escapeAttr(code)}" data-subcategory="all"><span>${escapeHTML(label)}</span><b>${count.toLocaleString('en-US')}</b></button>`;
    }).join('');

    const subCategoryKeys = selectedCategory !== 'all' ? getSubCategoryKeys({ season: selectedSeason, category: selectedCategory }) : [];
    const subCategoryChips = subCategoryKeys.length
      ? ['all', ...subCategoryKeys].map((label) => {
          const isAll = label === 'all';
          const count = isAll
            ? seasonItems.filter((item) => String(item.codeCategory || deriveCodeCategory(item.model)) === String(selectedCategory)).length
            : seasonItems.filter((item) => String(item.codeCategory || deriveCodeCategory(item.model)) === String(selectedCategory) && getProductSubCategory(item) === label).length;
          return `<button class="prefix-filter-chip ${selectedSubCategory === label ? 'active' : ''}" data-action="filter-subcategory" data-season="${escapeAttr(selectedSeason)}" data-category="${escapeAttr(selectedCategory)}" data-subcategory="${escapeAttr(label)}"><span>${escapeHTML(isAll ? 'كل التصنيفات' : label)}</span><b>${count.toLocaleString('en-US')}</b></button>`;
        }).join('')
      : '';

    const categoryLabel = selectedCategory === 'all' ? '' : getCodeCategoryLabel(selectedCategory);
    const title = selectedSubCategory !== 'all' ? selectedSubCategory : (selectedCategory === 'all' ? `كل موديلات ${selectedSeason || 'المتجر'}` : categoryLabel);
    const description = '';

    html = `
      <div class="catalog-browser-card">
        <div class="catalog-breadcrumb">
          <button class="crumb-btn" data-action="go-seasons">المواسم</button>
          ${selectedSeason ? `<span class="crumb-sep"><i class="fa-solid fa-angle-left"></i></span><button class="crumb-btn" data-action="go-prefixes" data-season="${escapeAttr(selectedSeason)}">${escapeHTML(selectedSeason)}</button>` : ''}
          <span class="crumb-sep"><i class="fa-solid fa-angle-left"></i></span>
          <span class="crumb-pill active">${escapeHTML(title)}</span>
        </div>
        <div class="catalog-browser-head catalog-browser-head--split">
          <div>
            <span class="catalog-kicker">${escapeHTML(selectedSeason || 'المتجر')}</span>
            <h2>${escapeHTML(title)}</h2>
            ${description ? `<p>${escapeHTML(description)}</p>` : ''}
          </div>
          <button class="catalog-back-btn" data-action="go-prefixes" data-season="${escapeAttr(selectedSeason)}">
            <i class="fa-solid fa-arrow-right"></i>
            <span>رجوع للبادئات</span>
          </button>
        </div>
        <div class="prefix-filters-stack">
          <div class="prefix-filters-bar">${prefixChips}</div>
          ${subCategoryChips ? `<div class="sub-category-panel"><div class="sub-category-label">التصنيف داخل البادئة</div><div class="prefix-filters-bar">${subCategoryChips}</div></div>` : ''}
        </div>
      </div>`;
  }

  el.catalogFlow.innerHTML = html;
  el.catalogFlow.querySelectorAll('[data-action="season"]').forEach((btn) => btn.addEventListener('click', () => goToSeasonPrefixes(btn.dataset.season)));
  el.catalogFlow.querySelectorAll('[data-action="prefix"]').forEach((btn) => btn.addEventListener('click', () => activateCatalogProducts(btn.dataset.season, btn.dataset.category)));
  el.catalogFlow.querySelectorAll('[data-action="season-all"]').forEach((btn) => btn.addEventListener('click', () => activateCatalogProducts(btn.dataset.season, 'all')));
  el.catalogFlow.querySelectorAll('[data-action="filter-prefix"]').forEach((btn) => btn.addEventListener('click', () => activateCatalogProducts(btn.dataset.season, btn.dataset.category, { preserveSort: true, subCategory: 'all' })));
  el.catalogFlow.querySelectorAll('[data-action="filter-subcategory"]').forEach((btn) => btn.addEventListener('click', () => activateCatalogProducts(btn.dataset.season, btn.dataset.category, { preserveSort: true, subCategory: btn.dataset.subcategory || 'all' })));
  el.catalogFlow.querySelectorAll('[data-action="go-seasons"]').forEach((btn) => btn.addEventListener('click', () => goToSeasonsView()));
  el.catalogFlow.querySelectorAll('[data-action="go-prefixes"]').forEach((btn) => btn.addEventListener('click', () => goToSeasonPrefixes(btn.dataset.season || selectedSeason)));

  const showProducts = step === 'products';
  document.body.classList.toggle('catalog-products-view', showProducts);
  document.body.classList.toggle('catalog-browser-view', !showProducts);
  el.toolbarWrap?.classList.toggle('hidden', !showProducts);
  el.productsHeadingRow?.classList.toggle('hidden', !showProducts);
  el.productsGrid?.classList.toggle('hidden', !showProducts);
  if (!showProducts) {
    el.loadMoreWrap?.classList.add('hidden');
    el.emptyState?.classList.add('hidden');
  }
  syncCatalogHero();
  syncCatalogRoute();
}

function hideSearchSuggestions() {
  if (!el.searchSuggestions) return;
  el.searchSuggestions.classList.add('hidden');
  el.searchSuggestions.innerHTML = '';
  state.searchSuggestionIndex = -1;
}

function getPublicSearchSuggestions(rawValue = el.searchInput?.value || '') {
  const q = normalizeAdminProductSearch(rawValue).replace(/^model\s*/i, '').trim();
  if (!q) return [];
  const modelQ = normalizeModelForAdminSearch(q);
  return getVisibleProducts().map((product) => {
    const model = normalizeModelForAdminSearch(product.model);
    const name = normalizeAdminProductSearch(product.name);
    let score = 99;
    if (model === modelQ) score = 0;
    else if (model.startsWith(modelQ)) score = 1;
    else if (model.includes(modelQ)) score = 2;
    else if (name.startsWith(q)) score = 3;
    else if (name.includes(q)) score = 4;
    return { product, score };
  }).filter((item) => item.score < 99).sort((a,b) => a.score - b.score || String(a.product.model || '').localeCompare(String(b.product.model || ''), 'en', { numeric: true })).slice(0, 6).map((item) => item.product);
}

function renderSearchSuggestions() {
  if (!el.searchSuggestions || !el.searchInput) return;
  const q = el.searchInput.value.trim();
  if (!q) return hideSearchSuggestions();
  const products = getPublicSearchSuggestions(q);
  el.searchSuggestions.innerHTML = '';
  if (!products.length) {
    el.searchSuggestions.innerHTML = '<div class="search-suggestion-empty"><i class="fa-solid fa-magnifying-glass"></i><span>لا يوجد موديل مطابق</span></div>';
    el.searchSuggestions.classList.remove('hidden');
    return;
  }
  products.forEach((product, index) => {
    const image = getMiniImageUrl(normalizeImageUrls(product.imageUrls)[0] || placeholderImage(product.name || product.model || 'Jood Kids'));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-suggestion-item';
    button.setAttribute('role', 'option');
    button.dataset.suggestionIndex = String(index);
    button.innerHTML = `<img src="${escapeAttr(image)}" alt="" loading="lazy" decoding="async"><div><strong>Model ${escapeHTML(product.model || '—')}</strong><span>${escapeHTML(product.name || 'بدون اسم')}</span><small>${escapeHTML(product.sizes || getSeriesQtyText(product) || '')}</small></div><b>${formatCurrency(getDiscountedPiecePrice(product))}</b>`;
    button.addEventListener('click', () => chooseSearchSuggestion(product));
    el.searchSuggestions.appendChild(button);
  });
  el.searchSuggestions.classList.remove('hidden');
}

function chooseSearchSuggestion(product) {
  if (!product) return;
  el.searchInput.value = String(product.model || product.name || '');
  state.filter.search = el.searchInput.value.trim().toLowerCase();
  resetRenderedProducts();
  applyFilters();
  hideSearchSuggestions();
  openQuickProduct(product);
}

function handleSearchSuggestionKeys(event) {
  if (!el.searchSuggestions || el.searchSuggestions.classList.contains('hidden')) {
    if (event.key === 'ArrowDown') renderSearchSuggestions();
    return;
  }
  const items = [...el.searchSuggestions.querySelectorAll('.search-suggestion-item')];
  if (!items.length) {
    if (event.key === 'Escape') hideSearchSuggestions();
    return;
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    state.searchSuggestionIndex = (state.searchSuggestionIndex + delta + items.length) % items.length;
    items.forEach((item, index) => item.classList.toggle('active', index === state.searchSuggestionIndex));
    items[state.searchSuggestionIndex]?.scrollIntoView({ block:'nearest' });
  } else if (event.key === 'Enter' && state.searchSuggestionIndex >= 0) {
    event.preventDefault();
    items[state.searchSuggestionIndex]?.click();
  } else if (event.key === 'Escape') {
    hideSearchSuggestions();
  }
}

function applyFilters() {
  const search = state.filter.search;
  let items = getVisibleProducts().filter((product) => {
    const haystack = `${product._searchText || ''} ${getCodeCategoryLabel(product.codeCategory)} ${product.season || ''} ${getProductSubCategory(product)}`.toLowerCase();
    if (search && !haystack.includes(search)) return false;
    if (state.filter.category !== 'all' && String(product.codeCategory) !== state.filter.category) return false;
    if (state.filter.subCategory !== 'all' && getProductSubCategory(product) !== state.filter.subCategory) return false;
    if (state.filter.season !== 'all' && String(product.season || '') !== state.filter.season) return false;
    if (state.filter.offersOnly && !hasDiscount(product)) return false;
    return true;
  });
  items.sort((a, b) => {
    const sort = state.filter.sort;
    if (sort === 'priceAsc') return getDisplayPrice(a) - getDisplayPrice(b);
    if (sort === 'priceDesc') return getDisplayPrice(b) - getDisplayPrice(a);
    if (sort === 'offers') {
      const offers = Number(hasDiscount(b)) - Number(hasDiscount(a));
      if (offers) return offers;
      return toMillis(b.createdAt || b.updatedAt) - toMillis(a.createdAt || a.updatedAt);
    }
    if (sort === 'modelAsc') return String(a.model || '').localeCompare(String(b.model || ''), 'en', { numeric: true });
    if (sort === 'newest') return toMillis(b.createdAt || b.updatedAt) - toMillis(a.createdAt || a.updatedAt);
    const pinDelta = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinDelta) return pinDelta;
    return toMillis(b.createdAt || b.updatedAt) - toMillis(a.createdAt || a.updatedAt);
  });
  state.filteredProducts = items;
  renderProducts();
  renderMenu();
  renderActiveFilters();
  renderSeoCatalog();
  syncDynamicStructuredData();
  syncSiteMeta();
  renderCatalogFlow();
}

function renderProducts() {
  const items = state.filteredProducts || [];
  const renderedItems = items.slice(0, state.renderedCount);
  el.productsGrid.innerHTML = '';
  el.visibleCount.textContent = items.length > renderedItems.length ? `${renderedItems.length.toLocaleString('en-US')} من ${items.length.toLocaleString('en-US')} منتج` : `${items.length.toLocaleString('en-US')} منتج`;
  el.emptyState.classList.toggle('hidden', items.length > 0);
  el.loadMoreWrap.classList.toggle('hidden', renderedItems.length >= items.length || items.length === 0);
  const fragment = document.createDocumentFragment();
  renderedItems.forEach((product, index) => {
    const card = document.createElement('article');
    card.className = 'product-card product-card--store';
    const urls = normalizeImageUrls(product.imageUrls);
    const originalUrl = urls[0] || placeholderImage(product.name || product.model || 'Jood Kids');
    const thumbUrl = getProductThumbUrl(originalUrl);
    const productAlt = buildProductAlt(product);
    const productLabel = product.name || `موديل ${product.model || ''}`.trim() || 'منتج';
    const productUrl = getProductPageUrl(product);
    const stock = getStockStatus(product);
    const unavailable = stock.key === 'out';
    card.id = getProductAnchorId(product);
    card.setAttribute('data-product-id', String(product.id || ''));
    card.setAttribute('data-model', String(product.model || ''));
    const cardBadge = hasDiscount(product)
      ? `<span class="store-product-badge discount">خصم ${Math.round(toNumber(product.discountPercent))}%</span>`
      : (product.badgeText ? `<span class="store-product-badge">${escapeHTML(product.badgeText)}</span>` : '');
    card.innerHTML = `
      <a class="product-media product-media-link" href="${escapeAttr(productUrl)}" aria-label="فتح ${escapeAttr(productLabel)}">
        <img src="${escapeAttr(thumbUrl)}" alt="${escapeAttr(productAlt)}" title="${escapeAttr(productAlt)}" loading="lazy" decoding="async" fetchpriority="${index < 4 ? 'high' : 'low'}" />
        ${cardBadge}
        <span class="stock-badge ${stock.key}">${escapeHTML(stock.label)}</span>
      </a>
      <div class="product-body">
        <div class="product-heading">
          <a class="product-title product-title-link" href="${escapeAttr(productUrl)}">${escapeHTML(product.name || 'بدون اسم')}</a>
          <div class="product-model-line">${escapeHTML(getProductSubCategory(product) ? `Model ${product.model || '-'} • ${getProductSubCategory(product)}` : `Model ${product.model || '-'}`)}</div>
        </div>
        <div class="store-price-block">
          <div class="piece-price-row${hasDiscount(product) ? ' has-offer' : ''}">
            <span class="piece-price-label">سعر القطعة</span>
            <strong class="piece-price-value">${formatCurrency(getDiscountedPiecePrice(product))}</strong>
            ${hasDiscount(product) ? `<del class="piece-price-old">${formatCurrency(getPiecePrice(product))}</del>` : ''}
          </div>
          <div class="series-price-line"><span>${escapeHTML(getSeriesLabel(product))}</span><strong>${formatCurrency(getDisplayPrice(product))}</strong></div>
        </div>
        <div class="card-actions store-card-actions">
          <button class="primary-btn add-btn" ${unavailable ? 'disabled' : ''} aria-label="أضف ${escapeAttr(productLabel)} إلى السلة"><i class="fa-solid ${unavailable ? 'fa-circle-xmark' : 'fa-cart-plus'}"></i><span>${unavailable ? 'غير متوفر' : 'أضف للسلة'}</span></button>
          <button class="quick-view-btn" type="button" aria-label="عرض سريع"><i class="fa-regular fa-eye"></i></button>
        </div>
      </div>`;
    card.querySelector('.add-btn').addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); addToCart(product.id); });
    card.querySelector('.quick-view-btn').addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); openQuickProduct(product); });
    fragment.appendChild(card);
  });
  el.productsGrid.appendChild(fragment);
}

function getBrandDisplayName() {
  return state.company.companyName || state.storefront.companyName || DEFAULT_COMPANY.companyName || SITE_NAME_AR;
}

function getCanonicalUrl() {
  return SITE_URL;
}

function getStorefrontUrl(params = null, hash = '') {
  const url = new URL(SITE_URL);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  if (hash) url.hash = hash.startsWith('#') ? hash : `#${hash}`;
  return url.href;
}

function getProductPageUrl(product) {
  const url = new URL('product.html', SITE_URL);
  const model = String(product?.model || '').trim();
  if (model) {
    url.searchParams.set('model', model);
    return url.href;
  }
  const id = String(product?.id || '').trim();
  url.searchParams.set('id', id);
  return url.href;
}

function slugifyArabic(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function getProductAnchorId(product) {
  const base = product?.model ? `product-${slugifyArabic(product.model)}` : `product-${slugifyArabic(product?.id || product?.name || 'item')}`;
  return base || 'product-item';
}

function buildProductAlt(product) {
  const brand = getBrandDisplayName();
  const bits = [
    product?.name || '',
    product?.model ? `موديل ${product.model}` : '',
    getCodeCategoryLabel(product?.codeCategory) || '',
    getProductSubCategory(product) || '',
    product?.season || '',
    'ملابس أطفال',
    brand,
  ].filter(Boolean);
  return bits.join(' | ');
}

function buildProductDescription(product) {
  const brand = getBrandDisplayName();
  const parts = [
    product?.description || '',
    product?.sizes ? `المقاسات: ${product.sizes}` : '',
    product?.season ? `الموسم: ${product.season}` : '',
    getCodeCategoryLabel(product?.codeCategory) ? `البادئة: ${getCodeCategoryLabel(product.codeCategory)}` : '',
    getProductSubCategory(product) ? `التصنيف الداخلي: ${getProductSubCategory(product)}` : '',
    `المتجر: ${brand}`
  ].filter(Boolean);
  return parts.join(' • ').slice(0, 500);
}

function syncMetaTag(selector, attr, value) {
  const node = document.querySelector(selector);
  if (node && value) node.setAttribute(attr, value);
}

function syncSiteMeta() {
  const brand = getBrandDisplayName();
  const visibleCount = getVisibleProducts().length;
  const title = `${brand} | ملابس أطفال وحديثي الولادة`;
  const description = `${brand} لملابس الأطفال وحديثي الولادة. ${visibleCount.toLocaleString('en-US')} موديل متاح مع صور المنتجات والتواصل والطلب.`;
  document.title = title;
  syncMetaTag('meta[name="description"]', 'content', description);
  syncMetaTag('meta[property="og:title"]', 'content', title);
  syncMetaTag('meta[property="og:description"]', 'content', description);
  syncMetaTag('meta[name="twitter:title"]', 'content', title);
  syncMetaTag('meta[name="twitter:description"]', 'content', description);
  syncMetaTag('link[rel="canonical"]', 'href', getCanonicalUrl());
  syncMetaTag('meta[property="og:url"]', 'content', getCanonicalUrl());
  syncMetaTag('meta[property="og:site_name"]', 'content', brand);
}

function renderSeoCatalog() {
  if (!el.seoCatalog) return;
  const visibleProducts = getVisibleProducts();
  const brand = getBrandDisplayName();
  const lines = [
    `<h2>${escapeHTML(brand)} - فهرس موديلات ملابس الأطفال وحديثي الولادة</h2>`,
    `<p>${escapeHTML(brand)} يقدم ${visibleProducts.length.toLocaleString('en-US')} موديل من ملابس الأطفال والبيبي وحديثي الولادة.</p>`
  ];
  visibleProducts.forEach((product) => {
    const title = product.name || `موديل ${product.model || ''}`.trim();
    const productUrl = getProductPageUrl(product);
    lines.push(`<article><h3><a href="${escapeAttr(productUrl)}">${escapeHTML(title)}</a></h3><p>${escapeHTML(buildProductDescription(product))}</p></article>`);
  });
  el.seoCatalog.innerHTML = lines.join('');
}

function getPublicImageUrl(product) {
  const urls = normalizeImageUrls(product?.imageUrls);
  return urls[0] || 'https://moadad.github.io/jubilant/assets/icon-512.png';
}

function getSameAsLinks() {
  return [state.company.instagram, state.company.facebook, state.company.telegram].filter((url) => /^https?:\/\//i.test(String(url || '').trim()));
}

function syncDynamicStructuredData() {
  const script = document.getElementById('dynamicStructuredData');
  if (!script) return;
  const brand = getBrandDisplayName();
  const visibleProducts = getVisibleProducts();
  const topProducts = visibleProducts.slice(0, 60);
  const graph = [
    {
      '@type': 'Store',
      '@id': `${SITE_URL}#store`,
      name: brand,
      url: SITE_URL,
      image: state.storefront.logoUrl || 'https://moadad.github.io/jubilant/assets/icon-512.png',
      description: `${brand} لملابس الأطفال وحديثي الولادة`,
      sameAs: getSameAsLinks(),
      telephone: state.company.phone1 || undefined
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}#products`,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: visibleProducts.length,
      itemListElement: topProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getProductPageUrl(product),
        name: product.name || `موديل ${product.model || ''}`.trim()
      }))
    },
    ...topProducts.map((product) => ({
      '@type': 'Product',
      '@id': `${SITE_URL}#${getProductAnchorId(product)}-data`,
      name: product.name || `موديل ${product.model || ''}`.trim(),
      image: [getPublicImageUrl(product)],
      description: buildProductDescription(product),
      sku: String(product.model || product.id || ''),
      category: getCodeCategoryLabel(product.codeCategory) || 'ملابس أطفال',
      brand: { '@type': 'Brand', name: brand },
      itemCondition: 'https://schema.org/NewCondition',
      url: getProductPageUrl(product),
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EGP',
        price: String(getDisplayPrice(product)),
        availability: isOutOfStock(product) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        url: getProductPageUrl(product)
      }
    }))
  ];
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function renderCart() {
  saveLocalJSON(CART_STORAGE_KEY, state.cart);
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const pieces = state.cart.reduce((sum, item) => sum + (getPiecesPerSeries(item) * item.qty), 0);
  el.cartCount.textContent = String(count);
  if (el.mobileCartCount) el.mobileCartCount.textContent = String(count);
  el.cartItemsCount.textContent = getSeriesCountLabel(count);
  if (el.cartSeriesTotal) el.cartSeriesTotal.textContent = String(count);
  if (el.cartPiecesTotal) el.cartPiecesTotal.textContent = String(pieces);
  el.cartItems.innerHTML = '';
  if (!state.cart.length) {
    el.cartItems.innerHTML = '<div class="commerce-empty-cart"><i class="fa-solid fa-bag-shopping"></i><strong>السلة فارغة</strong><span>أضف الموديلات التي تريد طلبها.</span></div>';
    el.cartTotal.textContent = formatCurrency(0);
    if (el.checkoutBtn) el.checkoutBtn.disabled = true;
    if (el.cartAvailabilityNote) el.cartAvailabilityNote.classList.add('hidden');
    renderCheckoutSummary();
    return;
  }
  if (el.checkoutBtn) el.checkoutBtn.disabled = false;
  let total = 0;
  let blockedCount = 0;
  state.cart.forEach((item) => {
    total += toNumber(item.unitPrice) * item.qty;
    const currentProduct = state.productsLoaded ? state.products.find((product) => String(product.id) === String(item.id)) : null;
    const blocked = state.productsLoaded && (!currentProduct || currentProduct.visible === false || isOutOfStock(currentProduct));
    if (blocked) blockedCount += 1;
    const card = document.createElement('div');
    card.className = `cart-item commerce-cart-item${blocked ? ' cart-item-blocked' : ''}`;
    card.innerHTML = `
      <img class="cart-thumb" src="${escapeAttr(getMiniImageUrl(item.imageUrl || placeholderImage(item.name || 'Jood Kids')))}" alt="${escapeAttr(buildProductAlt(item))}" loading="lazy" decoding="async" />
      <div class="cart-product-copy">
        <div class="cart-item-top"><div><h4>${escapeHTML(item.name || '')}</h4><div class="muted">Model ${escapeHTML(item.model || '')} • ${escapeHTML(getSeriesLabel(item))}</div>${blocked ? '<span class="cart-stock-warning">غير متوفر للطلب الآن</span>' : ''}</div><button class="cart-remove-btn" type="button" aria-label="حذف"><i class="fa-solid fa-trash-can"></i></button></div>
        <div class="cart-line-price"><span>سعر السيري</span><strong>${formatCurrency(toNumber(item.unitPrice))}</strong></div>
        <div class="cart-line-bottom"><div class="qty-box"><button data-action="plus">+</button><span>${item.qty}</span><button data-action="minus">-</button></div><strong>${formatCurrency(toNumber(item.unitPrice) * item.qty)}</strong></div>
      </div>`;
    card.querySelector('[data-action="plus"]').addEventListener('click', () => changeCartQty(item.id, 1));
    card.querySelector('[data-action="minus"]').addEventListener('click', () => changeCartQty(item.id, -1));
    card.querySelector('.cart-remove-btn').addEventListener('click', () => { state.cart = state.cart.filter((entry) => entry.id !== item.id); renderCart(); showToast('تم حذف الموديل من السلة'); });
    card.querySelector('.cart-thumb').addEventListener('click', () => openGallery(item.imageUrl ? [item.imageUrl] : [placeholderImage(item.name || 'Jood Kids')], 0));
    el.cartItems.appendChild(card);
  });
  el.cartTotal.textContent = formatCurrency(total);
  if (el.cartAvailabilityNote) {
    el.cartAvailabilityNote.classList.toggle('hidden', blockedCount === 0);
    el.cartAvailabilityNote.textContent = blockedCount ? `${blockedCount} موديل في السلة يحتاج مراجعة أو حذف قبل إتمام الطلب.` : '';
  }
  if (el.checkoutBtn) el.checkoutBtn.disabled = blockedCount > 0;
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  if (!el.checkoutSummaryItems) return;
  el.checkoutSummaryItems.innerHTML = '';
  let total = 0, series = 0, pieces = 0;
  state.cart.forEach((item) => {
    const lineTotal = toNumber(item.unitPrice) * item.qty;
    total += lineTotal; series += item.qty; pieces += getPiecesPerSeries(item) * item.qty;
    const row = document.createElement('div'); row.className='checkout-summary-item';
    row.innerHTML = `<img src="${escapeAttr(getMiniImageUrl(item.imageUrl || placeholderImage(item.name || 'Jood Kids')))}" alt=""><div><strong>${escapeHTML(item.name || `Model ${item.model || ''}`)}</strong><span>Model ${escapeHTML(item.model || '-')} • ${item.qty} سيري</span></div><b>${formatCurrency(lineTotal)}</b>`;
    el.checkoutSummaryItems.appendChild(row);
  });
  if (!state.cart.length) el.checkoutSummaryItems.innerHTML='<div class="muted">لا توجد موديلات في السلة.</div>';
  if (el.checkoutSeriesCount) el.checkoutSeriesCount.textContent=String(series);
  if (el.checkoutPiecesCount) el.checkoutPiecesCount.textContent=String(pieces);
  if (el.checkoutTotal) el.checkoutTotal.textContent=formatCurrency(total);
}

function renderAdminForms() {
  el.companyNameInput.value = state.company.companyName || state.storefront.companyName || '';
  el.companyTaglineInput.value = state.company.tagline || state.storefront.tagline || '';
  el.heroTitleInput.value = state.storefront.heroTitle || '';
  el.heroSubtitleInput.value = state.storefront.heroSubtitle || '';
  el.heroBadgeInput.value = state.storefront.heroBadge || '';
  el.logoUrlInput.value = state.storefront.logoUrl || '';
  el.accentColorInput.value = state.storefront.accentColor || DEFAULT_STOREFRONT.accentColor;
  el.accentColor2Input.value = state.storefront.accentColor2 || DEFAULT_STOREFRONT.accentColor2;
  el.featuredLimitInput.value = String(state.storefront.featuredLimit ?? 8);
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
  el.cloudinaryPresetInput.value = state.company.cloudinaryPreset || DEFAULT_COMPANY.cloudinaryPreset;
  el.companyAboutInput.value = state.company.about || '';
  el.paymentPolicyInput.value = state.payments.policyText || DEFAULT_PAYMENT_POLICY;
  el.returnPolicyInput.value = state.storeSettings.returnPolicy || DEFAULT_RETURN_POLICY;
  el.shippingPolicyInput.value = state.storeSettings.shippingPolicy || DEFAULT_SHIPPING_POLICY;
  el.termsPolicyInput.value = state.storeSettings.termsPolicy || DEFAULT_TERMS_POLICY;
  el.seasonsInput.value = getSeasonOptions().join(', ');
  const visibleProductsCount = state.products.filter((item) => item.visible !== false).length;
  const hiddenProductsCount = Math.max(0, state.products.length - visibleProductsCount);
  const offersCount = state.products.filter((item) => item.visible !== false && hasDiscount(item)).length;
  const pendingOrdersCount = state.orders.filter((item) => !['تم التسليم','ملغي','ملغى','delivered','cancelled'].includes(String(item.status || '').trim().toLowerCase())).length;
  const todayKey = new Date().toLocaleDateString('en-CA');
  const todayOrdersCount = state.orders.filter((item) => {
    const millis = toMillis(item.createdAt || item.updatedAt);
    return millis && new Date(millis).toLocaleDateString('en-CA') === todayKey;
  }).length;
  el.adminProductsCount.textContent = String(state.products.length);
  if (el.adminVisibleProductsCount) el.adminVisibleProductsCount.textContent = `${visibleProductsCount} ظاهر`;
  if (el.adminOffersCount) el.adminOffersCount.textContent = String(offersCount);
  el.adminOrdersCount.textContent = String(state.orders.length);
  if (el.adminPendingOrdersCount) el.adminPendingOrdersCount.textContent = `${pendingOrdersCount} قيد المراجعة`;
  if (el.adminTodayOrdersCount) el.adminTodayOrdersCount.textContent = `${todayOrdersCount} طلب اليوم`;
  if (el.adminHiddenProductsCount) el.adminHiddenProductsCount.textContent = String(hiddenProductsCount);
  el.adminCategoriesCount.textContent = String(getCodeCategoryKeys().length);
  if (el.adminSeasonsCount) el.adminSeasonsCount.textContent = `${getSeasonOptions().length} موسم`;
  el.adminOrdersTotal.textContent = formatCurrency(state.orders.reduce((sum, item) => sum + getOrderTotals(item).total, 0));
  renderDashboardInsights();
}

function rebuildSeasonOptions() {
  const options = getSeasonOptions();
  const current = el.productSeasonInput.value;
  el.productSeasonInput.innerHTML = '';
  options.forEach((season) => {
    const option = document.createElement('option');
    option.value = season;
    option.textContent = season;
    el.productSeasonInput.appendChild(option);
  });
  el.productSeasonInput.value = options.includes(current) ? current : (options[0] || 'صيفي');
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
    const fallbackLabel = state.storeSettings?.codeCategoryLabels?.[String(key)] || '';
    const wrapper = document.createElement('div');
    wrapper.className = 'category-item';
    const inputId = `cat-${key}`;
    wrapper.innerHTML = `<div class="category-code">${escapeHTML(key)}</div><div class="field"><label for="${escapeAttr(inputId)}">الاسم الظاهر</label><input id="${escapeAttr(inputId)}" type="text" value="${escapeAttr(categoryDoc?.label || fallbackLabel)}" placeholder="اسم التصنيف" /></div><button class="ghost-btn" type="button">حفظ</button>`;
    const input = wrapper.querySelector('input');
    const saveBtn = wrapper.querySelector('button');
    const saveCurrent = () => saveCodeCategoryLabel(key, input.value);
    saveBtn.addEventListener('click', saveCurrent);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveCurrent();
      }
    });
    el.categoryManagerList.appendChild(wrapper);
  });
}

function normalizeAdminProductSearch(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeModelForAdminSearch(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s\-_./\\]+/g, '').replace(/^model/, '');
}

function clearAdminProductSearch() {
  state.adminProductSearch = '';
  state.adminProductShowAll = false;
  if (el.adminProductSearchInput) el.adminProductSearchInput.value = '';
  renderAdminProducts();
  queueMicrotask(() => el.adminProductSearchInput?.focus());
}

function getAdminProductSearchResults() {
  let products = [...state.products];
  if (state.featuredOnlyAdmin) products = products.filter((item) => item.pinned);

  const rawSearch = normalizeAdminProductSearch(state.adminProductSearch || el.adminProductSearchInput?.value || '');
  const modelSearch = normalizeModelForAdminSearch(rawSearch);
  if (!rawSearch) {
    return state.adminProductShowAll ? products : [];
  }

  const ranked = products.map((product) => {
    const model = normalizeModelForAdminSearch(product.model);
    const name = String(product.name || '').toLowerCase();
    let rank = 99;
    if (model && model === modelSearch) rank = 0;
    else if (model && model.startsWith(modelSearch)) rank = 1;
    else if (model && model.includes(modelSearch)) rank = 2;
    else if (name.includes(rawSearch)) rank = 3;
    return { product, rank };
  }).filter((entry) => entry.rank < 99);

  ranked.sort((a, b) => a.rank - b.rank || String(a.product.model || '').localeCompare(String(b.product.model || ''), 'ar', { numeric: true }));
  return ranked.map((entry) => entry.product);
}

function renderAdminProducts() {
  if (!el.adminProductsList) return;
  el.adminProductsList.innerHTML = '';
  const products = getAdminProductSearchResults();
  const rawSearch = normalizeAdminProductSearch(state.adminProductSearch || el.adminProductSearchInput?.value || '');

  if (el.adminProductSearchClear) el.adminProductSearchClear.classList.toggle('show', Boolean(rawSearch));
  if (el.toggleAllProductsBtn) el.toggleAllProductsBtn.textContent = state.adminProductShowAll ? 'إخفاء الكل' : 'عرض الكل';
  if (el.togglePinnedFilterBtn) el.togglePinnedFilterBtn.classList.toggle('active-filter', state.featuredOnlyAdmin);

  if (el.adminProductSearchStatus) {
    if (rawSearch) {
      el.adminProductSearchStatus.innerHTML = products.length
        ? `<strong>${products.length}</strong> ${products.length === 1 ? 'نتيجة للموديل' : 'نتائج للموديل'} <b>${escapeHTML(rawSearch)}</b>`
        : `لا توجد نتيجة للموديل <b>${escapeHTML(rawSearch)}</b>`;
    } else if (state.adminProductShowAll) {
      el.adminProductSearchStatus.innerHTML = `جميع المنتجات <strong>${products.length}</strong>`;
    } else {
      el.adminProductSearchStatus.textContent = 'ابدأ بكتابة رقم الموديل';
    }
  }

  if (!products.length) {
    const empty = document.createElement('div');
    empty.className = 'admin-product-search-empty';
    empty.innerHTML = rawSearch
      ? `<i class="fa-solid fa-box-open"></i><strong>الموديل غير موجود</strong><span>تأكد من رقم الموديل أو أضف منتجًا جديدًا.</span><button type="button" class="primary-btn" data-add-new><i class="fa-solid fa-plus"></i><span>إضافة منتج</span></button>`
      : `<i class="fa-solid fa-magnifying-glass"></i><strong>ابحث برقم الموديل</strong><span>اكتب الرقم في مربع البحث لتظهر بيانات المنتج فورًا.</span>`;
    empty.querySelector('[data-add-new]')?.addEventListener('click', () => {
      resetProductForm();
      if (rawSearch) el.productModelInput.value = rawSearch;
      activateAdminTab('productAddTab');
      queueMicrotask(() => el.productNameInput?.focus());
    });
    el.adminProductsList.appendChild(empty);
    return;
  }

  products.forEach((product) => {
    const urls = normalizeImageUrls(product.imageUrls);
    const item = document.createElement('div');
    item.className = 'admin-item admin-product-item admin-product-result-card';
    const visibleLabel = product.visible === false ? 'مخفي' : 'ظاهر';
    const visibleClass = product.visible === false ? 'is-hidden' : 'is-visible';
    const exact = rawSearch && normalizeModelForAdminSearch(product.model) === normalizeModelForAdminSearch(rawSearch);
    if (exact) item.classList.add('exact-model-match');
    item.innerHTML = `
      <img class="admin-product-thumb" src="${escapeAttr(getMiniImageUrl(urls[0] || placeholderImage(product.name || product.model || 'Jood Kids')))}" alt="${escapeAttr(buildProductAlt(product))}" loading="lazy" decoding="async" />
      <div class="admin-product-result-content">
        <div class="admin-product-result-head">
          <div><span class="model-number-label">Model</span><strong class="model-number-value">${escapeHTML(product.model || '—')}</strong></div>
          <span class="admin-visibility-badge ${visibleClass}">${visibleLabel}</span>
        </div>
        <h4>${escapeHTML(product.name || 'بدون اسم')}</h4>
        <div class="admin-product-data-grid">
          <div><span>المقاس</span><strong>${escapeHTML(product.sizes || '—')}</strong></div>
          <div><span>السعر</span><strong>${formatCurrency(getPiecePrice(product))}</strong></div>
          <div><span>السيري</span><strong>${escapeHTML(getSeriesQtyText(product) || '—')}</strong></div>
          <div><span>الموسم</span><strong>${escapeHTML(product.season || '—')}</strong></div>
          <div><span>التصنيف</span><strong>${escapeHTML(getProductSubCategory(product) || getCodeCategoryLabel(product.codeCategory) || '—')}</strong></div>
          <div><span>الخصم</span><strong>${hasDiscount(product) ? `${Math.round(toNumber(product.discountPercent))}%` : '—'}</strong></div>
          <div><span>التوفر</span><strong class="admin-stock-text ${getStockStatus(product).key}">${escapeHTML(getStockStatus(product).label)}</strong></div>
        </div>
      </div>
      <div class="admin-actions admin-product-result-actions">
        <button class="ghost-btn" data-edit><i class="fa-solid fa-pen"></i><span>تعديل</span></button>
        <button class="ghost-btn" data-duplicate><i class="fa-solid fa-copy"></i><span>نسخ</span></button>
        <button class="ghost-btn" data-pin><i class="fa-solid fa-thumbtack"></i><span>${product.pinned ? 'إلغاء التثبيت' : 'تثبيت'}</span></button>
        <button class="danger-btn" data-del><i class="fa-solid fa-trash"></i><span>حذف</span></button>
      </div>`;
    item.querySelector('[data-edit]').addEventListener('click', () => populateProductForm(product));
    item.querySelector('[data-duplicate]')?.addEventListener('click', () => duplicateProduct(product));
    item.querySelector('[data-pin]').addEventListener('click', () => togglePinned(product));
    item.querySelector('[data-del]').addEventListener('click', (event) => deleteProduct(product.id, event.currentTarget));
    el.adminProductsList.appendChild(item);
  });
}

function renderDashboardInsights() {
  if (!el.dashboardInsights) return;
  const offers = state.products.filter((item) => item.visible !== false && hasDiscount(item)).sort((a,b) => toNumber(b.discountPercent) - toNumber(a.discountPercent));
  const latestProduct = [...state.products].sort((a,b) => toMillis(b.createdAt || b.updatedAt) - toMillis(a.createdAt || a.updatedAt))[0];
  const itemFrequency = new Map();
  state.orders.forEach((order) => (Array.isArray(order.items) ? order.items : []).forEach((item) => {
    const key = String(item.model || item.name || '').trim();
    if (!key) return;
    itemFrequency.set(key, (itemFrequency.get(key) || 0) + Math.max(1, toInt(item.qty || 1)));
  }));
  const topOrderItem = [...itemFrequency.entries()].sort((a,b) => b[1] - a[1])[0];
  const cards = [
    { icon:'fa-wand-magic-sparkles', label:'آخر موديل', value: latestProduct ? `Model ${escapeHTML(latestProduct.model || '—')}` : '—' },
    { icon:'fa-percent', label:'أعلى خصم', value: offers[0] ? `${Math.round(toNumber(offers[0].discountPercent))}% • Model ${escapeHTML(offers[0].model || '—')}` : 'لا يوجد' },
    { icon:'fa-fire', label:'الأكثر طلبًا', value: topOrderItem ? `${escapeHTML(topOrderItem[0])} • ${topOrderItem[1]}` : 'لا توجد بيانات بعد' },
  ];
  el.dashboardInsights.innerHTML = cards.map((card) => `<div class="dashboard-insight"><i class="fa-solid ${card.icon}"></i><div><span>${card.label}</span><strong>${card.value}</strong></div></div>`).join('');
}

function renderAdminOffers() {
  if (!el.adminOffersList) return;
  el.adminOffersList.innerHTML = '';
  const offers = [...state.products].filter(hasDiscount).sort((a,b) => toNumber(b.discountPercent) - toNumber(a.discountPercent));
  if (!offers.length) {
    el.adminOffersList.innerHTML = '<div class="admin-product-search-empty"><i class="fa-solid fa-tags"></i><strong>لا توجد عروض مفعلة</strong><span>أضف نسبة خصم لأي موديل وسيظهر هنا وفي قسم العروض بالمتجر.</span></div>';
    return;
  }
  offers.forEach((product) => {
    const url = getMiniImageUrl(normalizeImageUrls(product.imageUrls)[0] || placeholderImage(product.name || product.model || 'Jood Kids'));
    const oldPrice = getPiecePrice(product);
    const newPrice = getDiscountedPiecePrice(product);
    const card = document.createElement('div');
    card.className = 'admin-offer-card';
    card.innerHTML = `<img src="${escapeAttr(url)}" alt="${escapeAttr(buildProductAlt(product))}" loading="lazy" decoding="async"><div class="admin-offer-main"><div class="admin-offer-top"><strong>Model ${escapeHTML(product.model || '—')}</strong><span>-${Math.round(toNumber(product.discountPercent))}%</span></div><h4>${escapeHTML(product.name || 'بدون اسم')}</h4><div class="admin-offer-prices"><del>${formatCurrency(oldPrice)}</del><strong>${formatCurrency(newPrice)}</strong></div></div><button type="button" class="ghost-btn" data-edit-offer><i class="fa-solid fa-pen"></i><span>تعديل العرض</span></button>`;
    card.querySelector('[data-edit-offer]')?.addEventListener('click', () => populateProductForm(product));
    el.adminOffersList.appendChild(card);
  });
}

function duplicateProduct(product) {
  if (!product) return;
  state.editingProductId = null;
  el.productFormTitle.textContent = `نسخ موديل ${product.model || ''}`;
  el.productNameInput.value = product.name || '';
  el.productModelInput.value = '';
  el.productPriceInput.value = String(getPiecePrice(product));
  el.productDiscountInput.value = String(toInt(product.discountPercent || 0));
  el.productSeasonInput.value = product.season || getSeasonOptions()[0] || 'صيفي';
  el.productSubCategoryInput.value = getProductSubCategory(product);
  el.productSizesInput.value = product.sizes || '';
  el.productMinQtyInput.value = getSeriesQtyText(product);
  el.productBadgeInput.value = product.badgeText || '';
  el.productPinnedInput.value = String(Boolean(product.pinned));
  el.productVisibleInput.value = String(product.visible !== false);
  if (el.productStockStatusInput) el.productStockStatusInput.value = normalizeStockStatus(product.stockStatus);
  el.productDescriptionInput.value = product.description || '';
  state.productImagesDraft = normalizeImageUrls(product.imageUrls);
  el.productImageUrlsInput.value = state.productImagesDraft.join('\n');
  renderProductPreview();
  openDrawer('admin');
  activateAdminTab('productAddTab');
  showToast('تم نسخ البيانات. اكتب رقم الموديل الجديد ثم احفظ.');
  queueMicrotask(() => el.productModelInput?.focus());
}

function renderAdminOrders() {
  el.adminOrdersList.innerHTML = '';
  if (!state.orders.length) {
    el.adminOrdersList.innerHTML = '<div class="order-item"><div class="muted">لا توجد طلبات</div></div>';
    return;
  }
  state.orders.forEach((order) => {
    const card = document.createElement('div');
    card.className = 'order-item order-card';
    const orderRef = getOrderReference(order);
    const createdLabel = formatOrderDate(order);
    const totals = getOrderTotals(order);
    const rows = (order.items || []).map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHTML(item.model || '—')}</td>
        <td>${escapeHTML(resolveInvoiceProductName(item))}</td>
        <td>${getSeriesCount(item)}</td>
        <td>${getPieceQuantity(item)}</td>
        <td>${escapeHTML(formatCurrency(getSeriesValue(item)))}</td>
        <td>${escapeHTML(formatCurrency(getLineTotal(item)))}</td>
      </tr>`).join('');
    card.innerHTML = `
      <div class="order-header-meta">
        <div>
          <h4>${escapeHTML(order.customerName || 'طلب جديد')}</h4>
          <div class="muted">${escapeHTML(createdLabel)}</div>
        </div>
        <span class="order-id-chip"><i class="fa-solid fa-receipt"></i><span>${escapeHTML(orderRef)}</span></span>
      </div>
      <div class="order-overview-grid">
        <div class="order-overview-card"><span>الهاتف</span><strong>${escapeHTML(order.customerPhone || '—')}</strong></div>
        <div class="order-overview-card"><span>المدينة</span><strong>${escapeHTML(order.city || '—')}</strong></div>
        <div class="order-overview-card"><span>طريقة الدفع</span><strong>${escapeHTML(order.paymentMethod || '—')}</strong></div>
        <div class="order-overview-card"><span>طريقة الاستلام</span><strong>${escapeHTML(order.shippingMethod || '—')}</strong></div>
      </div>
      <div class="order-address-bar">${escapeHTML(order.address || '—')}</div>
      ${order.notes ? `<div class="order-address-bar order-notes-bar"><strong>ملاحظات:</strong> ${escapeHTML(order.notes)}</div>` : ''}
      <div class="order-lines-wrap">
        <table class="order-lines-table">
          <thead>
            <tr>
              <th>م</th>
              <th>رقم الموديل</th>
              <th>الصنف</th>
              <th>عدد السيري</th>
              <th>كمية القطع</th>
              <th>قيمة السيري</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" class="muted">لا توجد أصناف داخل الطلب</td></tr>'}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">إجمالي الفاتورة</td>
              <td>${totals.series}</td>
              <td>${totals.pieces}</td>
              <td colspan="2">${escapeHTML(formatCurrency(totals.total))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="order-actions" style="margin-top:12px">
        <select data-status>${['جديد', 'قيد المراجعة', 'مكتمل', 'ملغي'].map((status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select>
        <button class="ghost-btn" data-preview><i class="fa-regular fa-image"></i><span>معاينة الفاتورة</span></button>
        <button class="ghost-btn" data-download><i class="fa-solid fa-file-arrow-down"></i><span>تنزيل الفاتورة</span></button>
        <button class="ghost-btn" data-copy><i class="fa-brands fa-whatsapp"></i><span>نسخ واتساب</span></button>
        <button class="danger-btn" data-del>حذف</button>
      </div>`;
    card.querySelector('[data-status]').addEventListener('change', (e) => updateOrderStatus(order.id, e.target.value));
    card.querySelector('[data-preview]').addEventListener('click', () => previewOrderInvoice(order));
    card.querySelector('[data-download]').addEventListener('click', () => downloadInvoiceForOrder(order));
    card.querySelector('[data-copy]').addEventListener('click', () => copyText(buildWhatsAppOrderMessage(order)));
    card.querySelector('[data-del]').addEventListener('click', (event) => deleteOrder(order.id, event.currentTarget));
    el.adminOrdersList.appendChild(card);
  });
}

function normalizeAdminEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function isAllowedAdminUser(user) {
  if (!user) return false;
  const email = normalizeAdminEmail(user.email || '');
  return user.uid === ADMIN_UID || ADMIN_EMAILS.includes(email);
}

async function ensureAdminSession(options = {}) {
  const { silent = false } = options;
  const user = auth.currentUser;
  if (!isAllowedAdminUser(user)) {
    state.authUser = user || null;
    state.isAdmin = false;
    el.authStatus.textContent = user ? (user.email || user.uid || 'غير مسجل') : 'غير مسجل';
    el.adminContent.classList.add('hidden');
    subscribeOrdersIfAdmin();
    if (!silent) {
      showToast('سجل الدخول بحساب الأدمن الصحيح ثم أعد المحاولة');
      openDrawer('admin');
    }
    return false;
  }
  try {
    await user.getIdToken(true);
  } catch (error) {
    console.warn('Token refresh failed', error);
  }
  state.authUser = user;
  state.isAdmin = true;
  el.authStatus.textContent = user.email || user.uid || 'غير مسجل';
  el.adminContent.classList.remove('hidden');
  subscribeOrdersIfAdmin();
  return true;
}

async function adminLogin() {
  const email = el.adminEmail.value.trim();
  const password = el.adminPassword.value;
  if (!email || !password) return showToast('أدخل البريد وكلمة المرور');
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    if (!isAllowedAdminUser(user)) {
      await signOut(auth).catch(() => {});
      return showToast('هذا الحساب ليس أدمن');
    }
    await ensureAdminSession({ silent: true });
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
  if (user && !isAllowedAdminUser(user)) {
    state.authUser = null;
    state.isAdmin = false;
    el.authStatus.textContent = 'غير مصرح';
    el.adminContent.classList.add('hidden');
    subscribeOrdersIfAdmin();
    signOut(auth).catch(() => {});
    showToast('هذا الحساب ليس له صلاحية الإدارة');
    return;
  }
  state.authUser = user;
  state.isAdmin = Boolean(user && isAllowedAdminUser(user));
  el.authStatus.textContent = user ? (user.email || user.uid) : 'غير مسجل';
  el.adminContent.classList.toggle('hidden', !state.isAdmin);
  subscribeOrdersIfAdmin();
}

async function saveAppearance() {
  if (!(await ensureAdminSession())) return;
  try {
    await Promise.all([
      setDoc(doc(db, 'company', 'main'), { companyName: el.companyNameInput.value.trim(), tagline: el.companyTaglineInput.value.trim(), updatedAt: serverTimestamp() }, { merge: true }),
      setDoc(doc(db, 'settings', 'storefront'), {
        companyName: el.companyNameInput.value.trim(),
        tagline: el.companyTaglineInput.value.trim(),
        heroTitle: el.heroTitleInput.value.trim(),
        heroSubtitle: el.heroSubtitleInput.value.trim(),
        heroBadge: el.heroBadgeInput.value.trim(),
        logoUrl: el.logoUrlInput.value.trim(),
        accentColor: el.accentColorInput.value,
        accentColor2: el.accentColor2Input.value,
        featuredLimit: Math.max(0, toInt(el.featuredLimitInput.value || '0')),
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
  if (!(await ensureAdminSession())) return;
  try {
    await setDoc(doc(db, 'company', 'main'), {
      companyName: el.companyNameInput.value.trim(),
      tagline: el.companyTaglineInput.value.trim(),
      phone1: el.companyPhoneInput.value.trim(),
      phone2: el.companyPhone2Input.value.trim(),
      whatsapp: el.companyWhatsappInput.value.trim(),
      address: el.companyAddressInput.value.trim(),
      instagram: el.companyInstagramInput.value.trim(),
      facebook: el.companyFacebookInput.value.trim(),
      telegram: el.companyTelegramInput.value.trim(),
      factoryMap: el.factoryMapInput.value.trim(),
      shopMap: el.shopMapInput.value.trim(),
      cloudinaryPreset: el.cloudinaryPresetInput.value.trim() || 'Joodkids',
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
  if (!(await ensureAdminSession())) return;
  try {
    await Promise.all([
      setDoc(doc(db, 'payments', 'default'), { policyText: el.paymentPolicyInput.value.trim(), methods: DEFAULT_PAYMENT_METHODS, updatedAt: serverTimestamp() }, { merge: true }),
      setDoc(doc(db, 'settings', 'store'), {
        returnPolicy: el.returnPolicyInput.value.trim(),
        shippingPolicy: el.shippingPolicyInput.value.trim(),
        termsPolicy: el.termsPolicyInput.value.trim(),
        seasons: parseCommaList(el.seasonsInput.value),
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(doc(db, 'shipping', 'default'), { policyText: el.shippingPolicyInput.value.trim(), updatedAt: serverTimestamp() }, { merge: true }),
    ]);
    showToast('تم حفظ السياسات');
  } catch (error) {
    console.error(error);
    showToast('تعذر حفظ السياسات');
  }
}

async function saveSeasons() {
  if (!(await ensureAdminSession())) return;
  const seasons = parseCommaList(el.seasonsInput.value);
  const previousSeasons = Array.isArray(state.storeSettings?.seasons) ? [...state.storeSettings.seasons] : [];
  const removedSeasons = previousSeasons.filter((season) => !seasons.includes(season));
  try {
    await setDoc(doc(db, 'settings', 'store'), { seasons, updatedAt: serverTimestamp() }, { merge: true });
    for (const season of seasons) await setDoc(doc(db, 'categories', `season-${season}`), { type: 'season', season, label: season, updatedAt: serverTimestamp() }, { merge: true });
    for (const season of removedSeasons) {
      const seasonDoc = state.categories.find((item) => item.type === 'season' && String(item.season || item.label) === String(season));
      await deleteDocumentVerified('categories', seasonDoc?.id || `season-${season}`);
    }
    state.storeSettings.seasons = seasons;
    state.categories = state.categories.filter((item) => item.type !== 'season' || seasons.includes(String(item.season || item.label)));
    renderAll();
    showToast('تم حفظ المواسم');
  } catch (error) {
    console.error(error);
    showToast(getDeleteErrorMessage(error, 'المواسم'));
  }
}

async function saveCodeCategoryLabel(code, label) {
  if (!(await ensureAdminSession())) return;
  const cleanCode = String(code || '').trim();
  const cleanLabel = String(label || '').trim();
  const categoryLabels = { ...(state.storeSettings?.codeCategoryLabels || {}) };
  try {
    if (!cleanCode) return showToast('رمز التصنيف غير صالح');
    if (!cleanLabel) {
      delete categoryLabels[cleanCode];
      await Promise.all([
        deleteDocumentVerified('categories', `code-${cleanCode}`),
        setDoc(doc(db, 'settings', 'store'), { codeCategoryLabels: categoryLabels, updatedAt: serverTimestamp() }, { merge: true }),
      ]);
      state.categories = state.categories.filter((item) => !(item.type === 'code' && String(item.code || item.label) === cleanCode));
      state.storeSettings.codeCategoryLabels = categoryLabels;
      renderAll();
      showToast('تم مسح اسم التصنيف');
      return;
    }
    const payload = { type: 'code', code: cleanCode, label: cleanLabel, updatedAt: new Date().toISOString() };
    categoryLabels[cleanCode] = cleanLabel;
    await Promise.all([
      setDoc(doc(db, 'categories', `code-${cleanCode}`), payload, { merge: true }),
      setDoc(doc(db, 'settings', 'store'), { codeCategoryLabels: categoryLabels, updatedAt: serverTimestamp() }, { merge: true }),
    ]);
    const existingIndex = state.categories.findIndex((item) => item.type === 'code' && String(item.code || item.label) === cleanCode);
    if (existingIndex >= 0) state.categories[existingIndex] = { ...state.categories[existingIndex], ...payload };
    else state.categories.push(payload);
    state.storeSettings.codeCategoryLabels = categoryLabels;
    renderAll();
    showToast('تم حفظ التصنيف');
  } catch (error) {
    console.error(error);
    showToast(getActionErrorMessage(error, 'تعذر حفظ التصنيف'));
  }
}

function syncDraftImagesFromTextarea() {
  state.productImagesDraft = textareaLines(el.productImageUrlsInput.value);
  renderProductPreview();
}

async function handleProductFileUpload(event) {
  if (!(await ensureAdminSession())) return;
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
  if (!(await ensureAdminSession())) return;
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
  const preset = (state.company.cloudinaryPreset || el.cloudinaryPresetInput.value || 'Joodkids').trim();
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
  if (!(await ensureAdminSession())) return;
  const name = el.productNameInput.value.trim();
  const model = el.productModelInput.value.trim();
  const rawPricePiece = el.productPriceInput.value.trim();
  const pricePiece = toNumber(rawPricePiece);
  const season = el.productSeasonInput.value || getSeasonOptions()[0] || 'صيفي';
  const discountPercent = clamp(toNumber(el.productDiscountInput.value), 0, 99);
  const seriesQtyText = el.productMinQtyInput.value.trim();
  const seriesQtyNumber = getSeriesQtyNumber({ seriesQtyText });
  const priceWholesale = round2(pricePiece * seriesQtyNumber);
  if (!name || !model || rawPricePiece === '' || !seriesQtyText) return showToast('الاسم والموديل وسعر القطعة وكمية السيري مطلوبة');
  const duplicateModel = state.products.find((item) => String(item.id) !== String(state.editingProductId || '') && normalizeModelForAdminSearch(item.model) === normalizeModelForAdminSearch(model));
  if (duplicateModel) {
    state.adminProductSearch = model;
    state.adminProductShowAll = false;
    if (el.adminProductSearchInput) el.adminProductSearchInput.value = model;
    activateAdminTab('productsManagerTab');
    renderAdminProducts();
    return showToast(`رقم الموديل ${model} موجود بالفعل. افتحه للتعديل بدل إنشاء نسخة مكررة.`);
  }
  const payload = {
    name,
    model,
    pricePiece,
    priceWholesale,
    discountPercent,
    season,
    subCategory: normalizeSubCategory(el.productSubCategoryInput.value),
    sizes: el.productSizesInput.value.trim(),
    seriesQtyText,
    badgeText: el.productBadgeInput.value.trim(),
    pinned: el.productPinnedInput.value === 'true',
    visible: el.productVisibleInput.value === 'true',
    stockStatus: normalizeStockStatus(el.productStockStatusInput?.value),
    description: el.productDescriptionInput.value.trim(),
    codeCategory: deriveCodeCategory(model),
    imageUrls: normalizeImageUrls(state.productImagesDraft),
    importPending: false,
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
    const savedModel = model;
    resetProductForm();
    state.adminProductSearch = savedModel;
    state.adminProductShowAll = false;
    if (el.adminProductSearchInput) el.adminProductSearchInput.value = savedModel;
    activateAdminTab('productsManagerTab');
    renderAdminProducts();
  } catch (error) {
    console.error(error);
    showToast('تعذر حفظ المنتج');
  }
}

function populateProductForm(product) {
  state.editingProductId = product.id;
  el.productFormTitle.textContent = `تعديل موديل ${product.model || ''}`;
  el.productNameInput.value = product.name || '';
  el.productModelInput.value = product.model || '';
  el.productPriceInput.value = String(getPiecePrice(product));
  el.productDiscountInput.value = String(toInt(product.discountPercent || 0));
  el.productSeasonInput.value = product.season || getSeasonOptions()[0] || 'صيفي';
  el.productSubCategoryInput.value = getProductSubCategory(product);
  el.productSizesInput.value = product.sizes || '';
  el.productMinQtyInput.value = getSeriesQtyText(product);
  el.productBadgeInput.value = product.badgeText || '';
  el.productPinnedInput.value = String(Boolean(product.pinned));
  el.productVisibleInput.value = String(product.visible !== false);
  if (el.productStockStatusInput) el.productStockStatusInput.value = normalizeStockStatus(product.stockStatus);
  el.productDescriptionInput.value = product.description || '';
  state.productImagesDraft = normalizeImageUrls(product.imageUrls);
  el.productImageUrlsInput.value = state.productImagesDraft.join('\n');
  renderProductPreview();
  openDrawer('admin');
  activateAdminTab('productAddTab');
  queueMicrotask(() => el.productModelInput?.focus());
}

function resetProductForm() {
  state.editingProductId = null;
  el.productFormTitle.textContent = 'إضافة منتج';
  el.productNameInput.value = '';
  el.productModelInput.value = '';
  el.productPriceInput.value = '';
  el.productDiscountInput.value = '0';
  el.productSeasonInput.value = getSeasonOptions()[0] || 'صيفي';
  el.productSubCategoryInput.value = '';
  el.productSizesInput.value = '';
  el.productMinQtyInput.value = '1';
  el.productBadgeInput.value = '';
  el.productPinnedInput.value = 'true';
  el.productVisibleInput.value = 'true';
  if (el.productStockStatusInput) el.productStockStatusInput.value = 'available';
  el.productDescriptionInput.value = '';
  el.productImageUrlsInput.value = '';
  state.productImagesDraft = [];
  renderProductPreview();
}

function renderProductPreview() {
  el.productImagesPreview.innerHTML = '';
  state.productImagesDraft.forEach((url, index) => {
    const item = document.createElement('div');
    item.className = 'preview-image';
    item.innerHTML = `<img src="${escapeAttr(url)}" alt="preview" /><button class="preview-remove"><i class="fa-solid fa-xmark"></i></button>`;
    item.querySelector('button').addEventListener('click', () => {
      state.productImagesDraft.splice(index, 1);
      el.productImageUrlsInput.value = state.productImagesDraft.join('\n');
      renderProductPreview();
    });
    el.productImagesPreview.appendChild(item);
  });
}

async function togglePinned(product) {
  if (!(await ensureAdminSession())) return;
  try {
    await updateDoc(doc(db, 'products', product.id), { pinned: !product.pinned, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error(error);
    showToast('تعذر تحديث التثبيت');
  }
}

async function deleteProduct(productId, button = null) {
  if (!(await ensureAdminSession())) return;
  const product = state.products.find((item) => String(item.id) === String(productId));
  const label = product?.model ? `موديل ${product.model}` : (product?.name || 'هذا المنتج');
  if (!confirm(`سيتم حذف ${label} نهائيًا من المتجر. هل تريد المتابعة؟`)) return;
  setButtonBusy(button, true, 'جارٍ الحذف');
  try {
    await deleteDocumentVerified('products', productId);
    state.products = state.products.filter((item) => String(item.id) !== String(productId));
    state.cart = state.cart.filter((item) => String(item.id) !== String(productId));
    renderCart();
    renderAdminProducts();
    applyFilters();
    renderStorefront();
    showToast('تم حذف المنتج نهائيًا');
  } catch (error) {
    console.error('Delete product failed:', error);
    showToast(getDeleteErrorMessage(error, 'المنتج'));
  } finally { setButtonBusy(button, false); }
}

function togglePinnedAdminFilter() {
  state.featuredOnlyAdmin = !state.featuredOnlyAdmin;
  if (el.togglePinnedFilterBtn) el.togglePinnedFilterBtn.textContent = state.featuredOnlyAdmin ? 'إلغاء فلتر المثبت' : 'المثبت فقط';
  renderAdminProducts();
}

async function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  if (isOutOfStock(product)) return showToast('هذا الموديل غير متوفر للطلب حاليًا');
  const existing = state.cart.find((item) => item.id === productId);
  const unitPrice = getDisplayPrice(product);
  if (existing) existing.qty += 1;
  else state.cart.push({ id: product.id, name: product.name, model: product.model, unitPrice, originalPrice: getSeriesBasePrice(product), pricePiece: getPiecePrice(product), discountPercent: toNumber(product.discountPercent || 0), imageUrl: normalizeImageUrls(product.imageUrls)[0] || '', qty: 1, seriesQtyText: getSeriesQtyText(product) });
  renderCart();
  showToast('تمت إضافة السيري');
}

function changeCartQty(productId, delta) {
  const item = state.cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter((entry) => entry.id !== productId);
  renderCart();
}

function validateCartAvailability() {
  if (!state.productsLoaded) {
    showToast('انتظر لحظة حتى تكتمل مزامنة المنتجات');
    return false;
  }
  const unavailable = [];
  state.cart.forEach((item) => {
    const product = state.products.find((entry) => String(entry.id) === String(item.id));
    if (!product || product.visible === false || isOutOfStock(product)) {
      unavailable.push(item.model || item.name || 'موديل');
      return;
    }
    item.name = product.name;
    item.model = product.model;
    item.unitPrice = getDisplayPrice(product);
    item.originalPrice = getSeriesBasePrice(product);
    item.pricePiece = getPiecePrice(product);
    item.discountPercent = toNumber(product.discountPercent || 0);
    item.imageUrl = normalizeImageUrls(product.imageUrls)[0] || item.imageUrl || '';
    item.seriesQtyText = getSeriesQtyText(product);
  });
  renderCart();
  if (unavailable.length) {
    showToast(`راجع السلة: ${unavailable.slice(0, 3).join('، ')} غير متوفر الآن`);
    return false;
  }
  return true;
}

async function submitOrder() {
  const customerName = el.customerNameInput.value.trim();
  const customerPhone = el.customerPhoneInput.value.trim();
  const city = el.customerCityInput.value.trim();
  const address = el.customerAddressInput.value.trim();
  const paymentMethod = el.paymentMethodInput.value;
  const shippingMethod = el.shippingMethodInput.value;
  const notes = el.customerNotesInput.value.trim();
  if (!validateCartAvailability()) return;
  if (!customerName || !customerPhone || !city || !address) return showToast('أكمل بيانات العميل والاستلام');
  const phoneDigits = customerPhone.replace(/\D/g, '');
  if (phoneDigits.length < 10) return showToast('أدخل رقم هاتف صحيح');
  if (!state.cart.length) return showToast('السلة فارغة');
  const createdAtClient = new Date().toISOString();
  const orderNo = generateOrderNumber(createdAtClient);
  const items = state.cart.map((item) => ({
    productId: item.id,
    name: item.name,
    model: item.model,
    unitPrice: getSeriesValue(item),
    pricePiece: getPiecePrice(item),
    qty: getSeriesCount(item),
    pieceQty: getPieceQuantity(item),
    piecesPerSeries: getPiecesPerSeries(item),
    lineTotal: getLineTotal(item),
    seriesQtyText: getSeriesQtyText(item),
    imageUrl: item.imageUrl,
  }));
  const total = round2(items.reduce((sum, item) => sum + toNumber(item.lineTotal || 0), 0));
  const order = {
    orderNo,
    customerName,
    customerPhone,
    city,
    address,
    paymentMethod,
    shippingMethod,
    notes,
    total,
    status: 'جديد',
    items,
    createdAtClient,
    createdAt: serverTimestamp(),
  };
  try {
    el.submitOrderBtn.disabled = true;
    const docRef = await addDoc(collection(db, 'orders'), order);
    const savedOrder = { ...order, id: docRef.id };
    await syncPublicTracking(savedOrder).catch(console.error);
    closeModal('checkoutModal');
    closeDrawers();
    await openInvoicePreview(savedOrder);
    state.cart = [];
    renderCart();
    ['customerNameInput', 'customerPhoneInput', 'customerCityInput', 'customerAddressInput', 'customerNotesInput'].forEach((key) => el[key].value = '');
    showToast('تم حفظ الطلب وتجهيز الفاتورة');
  } catch (error) {
    console.error(error);
    showToast(getActionErrorMessage(error, 'تعذر إرسال الطلب'));
  } finally {
    el.submitOrderBtn.disabled = false;
  }
}

async function updateOrderStatus(orderId, status) {
  if (!(await ensureAdminSession())) return;
  try {
    await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() });
    const order = state.orders.find((entry) => entry.id === orderId);
    if (order) await syncPublicTracking({ ...order, status, updatedAt: new Date().toISOString() }).catch(console.error);
    showToast('تم تحديث الطلب');
  } catch (error) {
    console.error(error);
    showToast('تعذر تحديث الطلب');
  }
}

async function deleteOrder(orderId, button = null) {
  if (!(await ensureAdminSession())) return;
  if (!confirm('سيتم حذف هذا الطلب نهائيًا. هل تريد المتابعة؟')) return;
  const order = state.orders.find((item) => String(item.id) === String(orderId));
  setButtonBusy(button, true, 'جارٍ الحذف');
  try {
    await deleteDocumentVerified('orders', orderId);
    if (order) await removePublicTracking(order).catch(() => null);
    state.orders = state.orders.filter((item) => String(item.id) !== String(orderId));
    renderAdminOrders();
    renderAdminForms();
    showToast('تم حذف الطلب نهائيًا');
  } catch (error) {
    console.error('Delete order failed:', error);
    showToast(getDeleteErrorMessage(error, 'الطلب'));
  } finally { setButtonBusy(button, false); }
}

async function searchTrackedOrders() {
  const raw = el.trackOrderInput?.value?.trim() || '';
  if (!raw) return showToast('اكتب رقم الطلبية أو رقم الموبايل');
  if (el.trackOrderBtn) el.trackOrderBtn.disabled = true;
  if (el.trackOrderStatus) el.trackOrderStatus.textContent = 'جاري البحث...';
  if (el.trackOrderResults) el.trackOrderResults.innerHTML = '';
  try {
    const results = await findTrackedOrders(raw);
    renderTrackedOrders(results);
    if (el.trackOrderStatus) el.trackOrderStatus.textContent = results.length ? `تم العثور على ${results.length.toLocaleString('en-US')} نتيجة` : 'لا توجد نتيجة مطابقة';
  } catch (error) {
    console.error(error);
    if (el.trackOrderStatus) el.trackOrderStatus.textContent = '';
    showToast('تعذر متابعة الطلبية');
  } finally {
    if (el.trackOrderBtn) el.trackOrderBtn.disabled = false;
  }
}

async function findTrackedOrders(rawValue) {
  if (!PUBLIC_TRACKING_ENABLED) return [];
  const results = new Map();
  const orderNo = normalizeTrackingOrderNo(rawValue);
  if (orderNo) {
    const orderDoc = await getDoc(doc(db, 'public_order_tracking', orderNo));
    if (orderDoc.exists()) results.set(orderDoc.id, { id: orderDoc.id, ...orderDoc.data() });
  }
  if (!results.size) {
    const phoneKeys = getPhoneTrackingKeys(rawValue);
    for (const key of phoneKeys) {
      const snapshot = await getDocs(collection(db, 'public_phone_tracking', key, 'orders'));
      snapshot.docs.forEach((entry) => results.set(entry.id, { id: entry.id, ...entry.data() }));
      if (results.size) break;
    }
  }
  return [...results.values()].sort((a, b) => toMillis(b.createdAtClient || b.updatedAtClient) - toMillis(a.createdAtClient || a.updatedAtClient));
}

function renderTrackedOrders(results = []) {
  if (!el.trackOrderResults) return;
  el.trackOrderResults.innerHTML = '';
  if (!results.length) {
    el.trackOrderResults.innerHTML = '<div class="order-item"><div class="muted">لا توجد بيانات مطابقة</div></div>';
    return;
  }
  results.forEach((order) => {
    const card = document.createElement('div');
    const statusTone = getTrackStatusTone(order.status);
    card.className = 'order-item order-card track-order-card';
    card.innerHTML = `
      <div class="order-header-meta">
        <div>
          <h4>${escapeHTML(order.customerName || 'الطلبية')}</h4>
        </div>
        <span class="order-id-chip"><i class="fa-solid fa-receipt"></i><span>${escapeHTML(getOrderReference(order))}</span></span>
      </div>
      <div class="order-overview-grid">
        <div class="order-overview-card"><span>الحالة</span><strong><span class="track-status-chip ${statusTone}">${escapeHTML(order.status || 'جديد')}</span></strong></div>
        <div class="order-overview-card"><span>الهاتف</span><strong>${escapeHTML(order.customerPhone || '—')}</strong></div>
        <div class="order-overview-card"><span>التاريخ</span><strong>${escapeHTML(formatOrderDate(order))}</strong></div>
        <div class="order-overview-card"><span>المدينة</span><strong>${escapeHTML(order.city || '—')}</strong></div>
      </div>
      <div class="order-overview-grid track-order-totals">
        <div class="order-overview-card"><span>عدد الأصناف</span><strong>${escapeHTML(String(toInt(order.itemsCount || 0)))}</strong></div>
        <div class="order-overview-card"><span>إجمالي السيري</span><strong>${escapeHTML(String(toInt(order.seriesTotal || 0)))}</strong></div>
        <div class="order-overview-card"><span>إجمالي القطع</span><strong>${escapeHTML(String(toInt(order.piecesTotal || 0)))}</strong></div>
        <div class="order-overview-card"><span>الإجمالي</span><strong>${escapeHTML(formatCurrency(order.total || 0))}</strong></div>
      </div>
      <div class="order-address-bar">${escapeHTML(order.itemsSummary || '—')}</div>
    `;
    el.trackOrderResults.appendChild(card);
  });
}

function getTrackStatusTone(status = '') {
  if (status === 'مكتمل') return 'success';
  if (status === 'ملغي') return 'danger';
  if (status === 'قيد المراجعة') return 'info';
  return 'neutral';
}

function normalizeTrackingOrderNo(value = '') {
  return String(value || '').trim().replace(/\s+/g, '').replace(/[^0-9-]/g, '');
}

function getPhoneTrackingKeys(value = '') {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return [];
  const keys = new Set([digits]);
  const noLeadingZeros = digits.replace(/^0+/, '');
  if (noLeadingZeros && noLeadingZeros !== digits) keys.add(noLeadingZeros);
  if (digits.startsWith('20') && digits.length > 2) keys.add(`0${digits.slice(2)}`);
  if (digits.startsWith('963') && digits.length > 3) keys.add(`0${digits.slice(3)}`);
  if (digits.startsWith('0') && digits.length > 1) {
    const local = digits.slice(1);
    keys.add(local);
    if (local.length >= 9) {
      keys.add(`20${local}`);
      keys.add(`963${local}`);
    }
  }
  if (digits.length >= 9) keys.add(digits.slice(-9));
  if (digits.length >= 10) keys.add(digits.slice(-10));
  if (digits.length >= 11) keys.add(digits.slice(-11));
  return [...keys].filter(Boolean);
}

function buildPublicTrackingRecord(order) {
  const totals = getOrderTotals(order);
  const summary = (Array.isArray(order?.items) ? order.items : []).slice(0, 4).map((item) => {
    const productName = resolveInvoiceProductName(item);
    const qty = toInt(item.qty || 0);
    return `${productName}${qty > 0 ? ` × ${qty}` : ''}`;
  }).join(' • ');
  return {
    orderNo: getOrderReference(order),
    customerName: order?.customerName || '',
    customerPhone: order?.customerPhone || '',
    city: order?.city || '',
    status: order?.status || 'جديد',
    total: totals.total,
    seriesTotal: totals.series,
    piecesTotal: totals.pieces,
    itemsCount: Array.isArray(order?.items) ? order.items.length : 0,
    itemsSummary: summary,
    createdAtClient: order?.createdAtClient || new Date().toISOString(),
    updatedAtClient: new Date().toISOString(),
  };
}

async function syncPublicTracking(order) {
  if (!PUBLIC_TRACKING_ENABLED) return;
  const orderRef = normalizeTrackingOrderNo(getOrderReference(order));
  if (!orderRef) return;
  const record = buildPublicTrackingRecord(order);
  const writes = [setDoc(doc(db, 'public_order_tracking', orderRef), record, { merge: true })];
  getPhoneTrackingKeys(order?.customerPhone || '').forEach((phoneKey) => {
    writes.push(setDoc(doc(db, 'public_phone_tracking', phoneKey, 'orders', orderRef), record, { merge: true }));
  });
  await Promise.all(writes);
}

async function removePublicTracking(order) {
  if (!PUBLIC_TRACKING_ENABLED) return;
  const orderRef = normalizeTrackingOrderNo(getOrderReference(order));
  if (!orderRef) return;
  const removals = [deleteDoc(doc(db, 'public_order_tracking', orderRef))];
  getPhoneTrackingKeys(order?.customerPhone || '').forEach((phoneKey) => {
    removals.push(deleteDoc(doc(db, 'public_phone_tracking', phoneKey, 'orders', orderRef)));
  });
  await Promise.allSettled(removals);
}

function syncPublicTrackingCollection(orders = []) {
  if (!PUBLIC_TRACKING_ENABLED) return;
  Promise.allSettled((Array.isArray(orders) ? orders : []).map((order) => syncPublicTracking(order))).catch(console.error);
}

function exportProductsExcel() {
  const rows = state.products.map((product) => ({ name: product.name || '', model: product.model || '', pricePiece: getPiecePrice(product), priceWholesale: getSeriesBasePrice(product), discountPercent: toNumber(product.discountPercent || 0), season: product.season || '', subCategory: getProductSubCategory(product), sizes: product.sizes || '', seriesQtyText: getSeriesQtyText(product), badgeText: product.badgeText || '', pinned: Boolean(product.pinned), visible: product.visible !== false, stockStatus: normalizeStockStatus(product.stockStatus), description: product.description || '', imageUrls: normalizeImageUrls(product.imageUrls).join('\n') }));
  exportWorkbook([{ name: 'products', rows }], 'products');
}

function exportOrdersExcel() {
  const summaryRows = state.orders.map((order) => {
    const totals = getOrderTotals(order);
    return {
      orderNo: getOrderReference(order),
      orderDate: formatOrderDate(order),
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      city: order.city || '',
      address: order.address || '',
      paymentMethod: order.paymentMethod || '',
      shippingMethod: order.shippingMethod || '',
      status: order.status || '',
      notes: order.notes || '',
      modelsCount: totals.models,
      seriesCount: totals.series,
      piecesCount: totals.pieces,
      orderTotal: totals.total,
    };
  });
  const itemRows = state.orders.flatMap((order) => {
    const totals = getOrderTotals(order);
    return (order.items || []).map((item, index) => ({
      orderNo: getOrderReference(order),
      orderDate: formatOrderDate(order),
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      city: order.city || '',
      address: order.address || '',
      paymentMethod: order.paymentMethod || '',
      shippingMethod: order.shippingMethod || '',
      status: order.status || '',
      notes: order.notes || '',
      lineNo: index + 1,
      model: item.model || '',
      productName: resolveInvoiceProductName(item),
      seriesCount: getSeriesCount(item),
      pieceQty: getPieceQuantity(item),
      piecesPerSeries: getPiecesPerSeries(item),
      seriesQtyText: getSeriesQtyText(item),
      seriesValue: getSeriesValue(item),
      lineTotal: getLineTotal(item),
      orderSeriesTotal: totals.series,
      orderPiecesTotal: totals.pieces,
      orderTotal: totals.total,
    }));
  });
  exportWorkbook([
    { name: 'orders_summary', rows: summaryRows },
    { name: 'order_items', rows: itemRows },
  ], 'orders');
}

function exportWorkbook(sheets, filename) {
  if (window.XLSX) {
    const workbook = XLSX.utils.book_new();
    sheets.forEach((entry, index) => {
      const safeName = sanitizeSheetName(entry?.name || `sheet_${index + 1}`);
      const rows = Array.isArray(entry?.rows) && entry.rows.length ? entry.rows : [{ info: 'لا توجد بيانات' }];
      const sheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, sheet, safeName);
    });
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return;
  }
  const firstSheet = Array.isArray(sheets) ? sheets[0] : null;
  const rows = Array.isArray(firstSheet?.rows) ? firstSheet.rows : [];
  const csv = convertRowsToCsv(rows);
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

function sanitizeSheetName(value = '') {
  return String(value || 'sheet').replace(/[\/?*\[\]:]/g, '_').slice(0, 31) || 'sheet';
}


function getQuickImportPendingProducts() {
  return state.products
    .filter((product) => product.importPending === true)
    .sort((a, b) => toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt));
}

function renderQuickImportedProducts() {
  if (!el.quickImportedProductsList) return;
  const products = getQuickImportPendingProducts();
  if (el.quickImportPendingCount) el.quickImportPendingCount.textContent = String(products.length);
  el.quickImportedProductsList.innerHTML = '';

  if (!products.length) {
    el.quickImportedProductsList.innerHTML = `
      <div class="quick-import-empty">
        <i class="fa-solid fa-circle-check"></i>
        <strong>لا توجد موديلات بانتظار الاستكمال</strong>
        <span>بعد استيراد ملف Excel ستظهر الموديلات هنا لرفع الصور واستكمال البيانات.</span>
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  products.forEach((product) => {
    const images = normalizeImageUrls(product.imageUrls);
    const imageUrl = images[0] || placeholderImage(`موديل ${product.model || ''}`);
    const item = document.createElement('div');
    item.className = 'quick-import-item';
    item.innerHTML = `
      <img class="quick-import-thumb" src="${escapeAttr(getMiniImageUrl(imageUrl))}" alt="موديل ${escapeAttr(product.model || '')}" />
      <div class="quick-import-item-body">
        <div class="quick-import-item-head">
          <strong>موديل ${escapeHTML(product.model || '-')}</strong>
          <span class="quick-import-image-state ${images.length ? 'has-image' : 'needs-image'}"><i class="fa-solid ${images.length ? 'fa-image' : 'fa-camera'}"></i>${images.length ? `${images.length} صورة` : 'بدون صورة'}</span>
        </div>
        <h5>${escapeHTML(product.name || 'بدون اسم')}</h5>
        <div class="quick-import-meta">
          <span><b>السعر:</b> ${formatCurrency(getPiecePrice(product))}</span>
          <span><b>السيري:</b> ${escapeHTML(getSeriesQtyText(product))}</span>
          <span><b>المقاسات:</b> ${escapeHTML(product.sizes || '—')}</span>
          <span><b>الموسم:</b> ${escapeHTML(product.season || '—')}</span>
        </div>
      </div>
      <div class="quick-import-item-actions">
        <label class="ghost-btn quick-image-upload-btn">
          <input type="file" accept="image/*" multiple hidden data-quick-image-input="${escapeAttr(product.id)}" />
          <i class="fa-solid fa-cloud-arrow-up"></i><span>${images.length ? 'إضافة صور' : 'رفع صورة'}</span>
        </label>
        <button type="button" class="primary-btn" data-quick-edit="${escapeAttr(product.id)}"><i class="fa-solid fa-pen-to-square"></i><span>استكمال البيانات</span></button>
      </div>`;

    const input = item.querySelector('[data-quick-image-input]');
    input?.addEventListener('change', (event) => uploadQuickProductImages(product, event));
    item.querySelector('[data-quick-edit]')?.addEventListener('click', () => populateProductForm(product));
    fragment.appendChild(item);
  });
  el.quickImportedProductsList.appendChild(fragment);
}

async function importQuickProductsExcel(event) {
  if (!(await ensureAdminSession())) return;
  const input = event.currentTarget || el.quickExcelImportInput;
  const file = input?.files?.[0];
  if (!file) return;
  if (el.quickImportStatus) el.quickImportStatus.textContent = 'جارٍ قراءة الملف والتحقق من الموديلات...';

  try {
    const rows = await readExcelRows(file);
    if (!rows.length) {
      if (el.quickImportStatus) el.quickImportStatus.textContent = 'الملف فارغ.';
      return showToast('الملف فارغ');
    }

    const parsed = [];
    const errors = [];
    rows.forEach((row, index) => {
      const model = String(firstValue(row, ['رقم الموديل', 'model', 'موديل', 'model number', 'modelNumber']) || '').trim();
      const name = String(firstValue(row, ['اسم المنتج', 'name', 'productName', 'product name']) || '').trim();
      const priceRaw = firstValue(row, ['السعر', 'سعر القطعة', 'price', 'pricePiece', 'piecePrice']);
      const seriesQtyText = String(firstValue(row, ['كمية السيري', 'seriesQtyText', 'seriesQty', 'السيري', 'minQty']) || '').trim();
      const sizes = String(firstValue(row, ['المقاسات', 'sizes', 'size']) || '').trim();
      const season = String(firstValue(row, ['الموسم', 'season']) || '').trim();
      const pricePiece = Number(priceRaw);
      const seriesQtyNumber = getSeriesQtyNumber({ seriesQtyText });

      if (!model || !name || String(priceRaw).trim() === '' || !Number.isFinite(pricePiece) || pricePiece < 0 || !seriesQtyText || !sizes || !season) {
        errors.push(index + 2);
        return;
      }
      parsed.push({ model, name, pricePiece: round2(pricePiece), priceWholesale: round2(pricePiece * seriesQtyNumber), seriesQtyText, sizes, season });
    });

    if (!parsed.length) {
      if (el.quickImportStatus) el.quickImportStatus.textContent = 'لم يتم العثور على صفوف صحيحة. راجع أسماء الأعمدة والبيانات.';
      return showToast('لا توجد صفوف صالحة للاستيراد');
    }

    const duplicateRows = [];
    const seenModels = new Set();
    const uniqueRows = parsed.filter((row) => {
      const key = normalizeModelForAdminSearch(row.model);
      if (!key || seenModels.has(key)) {
        duplicateRows.push(row.model);
        return false;
      }
      seenModels.add(key);
      return true;
    });

    const existingByModel = new Map(state.products.map((product) => [normalizeModelForAdminSearch(product.model), product]));
    let created = 0;
    let updated = 0;

    for (let start = 0; start < uniqueRows.length; start += 400) {
      const batch = writeBatch(db);
      uniqueRows.slice(start, start + 400).forEach((row) => {
        const key = normalizeModelForAdminSearch(row.model);
        const existing = existingByModel.get(key);
        const payload = {
          name: row.name,
          model: row.model,
          pricePiece: row.pricePiece,
          priceWholesale: row.priceWholesale,
          season: row.season,
          sizes: row.sizes,
          seriesQtyText: row.seriesQtyText,
          codeCategory: deriveCodeCategory(row.model),
          importPending: true,
          updatedAt: serverTimestamp(),
        };
        if (existing) {
          batch.set(doc(db, 'products', existing.id), payload, { merge: true });
          updated += 1;
        } else {
          const ref = doc(collection(db, 'products'));
          batch.set(ref, {
            ...payload,
            discountPercent: 0,
            subCategory: '',
            badgeText: '',
            pinned: false,
            visible: false,
            stockStatus: 'available',
            description: '',
            imageUrls: [],
            createdAt: serverTimestamp(),
          });
          created += 1;
        }
      });
      await batch.commit();
    }

    const skipped = errors.length + duplicateRows.length;
    if (el.quickImportStatus) {
      el.quickImportStatus.textContent = `تم الاستيراد: ${created} جديد، ${updated} تم تحديثه${skipped ? `، ${skipped} صف تم تخطيه` : ''}. ارفع الصور ثم استكمل البيانات.`;
    }
    activateAdminTab('quickImportTab');
    showToast(`تم تجهيز ${created + updated} موديل للاستكمال`);
  } catch (error) {
    console.error(error);
    if (el.quickImportStatus) el.quickImportStatus.textContent = 'تعذر استيراد الملف. تأكد أنه Excel/CSV وأن أسماء الأعمدة مطابقة للقالب.';
    showToast('تعذر استيراد ملف الموديلات');
  } finally {
    if (input) input.value = '';
  }
}

async function uploadQuickProductImages(product, event) {
  if (!(await ensureAdminSession())) return;
  const input = event.currentTarget;
  const files = [...(input?.files || [])];
  if (!files.length) return;
  const card = input.closest('.quick-import-item');
  const uploadLabel = input.closest('.quick-image-upload-btn');
  const uploadText = uploadLabel?.querySelector('span');
  const uploadIcon = uploadLabel?.querySelector('i');
  const originalText = uploadText?.textContent || '';
  const originalIconClass = uploadIcon?.className || '';
  if (uploadLabel) uploadLabel.classList.add('is-busy');
  if (uploadText) uploadText.textContent = 'جارٍ رفع الصورة';
  if (uploadIcon) uploadIcon.className = 'fa-solid fa-spinner fa-spin';

  try {
    const folder = sanitizePathSegment(product.model || 'products');
    const urls = await uploadFilesToCloudinary(files, folder);
    const merged = normalizeImageUrls([...(normalizeImageUrls(product.imageUrls)), ...urls]);
    await updateDoc(doc(db, 'products', product.id), { imageUrls: merged, updatedAt: serverTimestamp() });
    card?.classList.add('image-uploaded');
    showToast(`تم رفع صورة موديل ${product.model || ''}`);
  } catch (error) {
    console.error(error);
    showToast(getFriendlyUploadError(error));
  } finally {
    if (input) input.value = '';
    if (uploadLabel) uploadLabel.classList.remove('is-busy');
    if (uploadText) uploadText.textContent = originalText;
    if (uploadIcon) uploadIcon.className = originalIconClass;
  }
}

async function importProductsExcel(event) {
  if (!(await ensureAdminSession())) return;
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const rows = await readExcelRows(file);
    if (!rows.length) return showToast('الملف فارغ');
    const batch = writeBatch(db);
    rows.forEach((row) => {
      const name = firstValue(row, ['name', 'اسم المنتج', 'productName']);
      const model = firstValue(row, ['model', 'موديل']);
      const seriesQtyText = String(firstValue(row, ['seriesQtyText', 'seriesQty', 'كمية السيري', 'السيري', 'minQty', 'الحد الأدنى']) || '1').trim();
      const seriesQtyNumber = getSeriesQtyNumber({ seriesQtyText });
      const piecePriceRaw = firstValue(row, ['pricePiece', 'piecePrice', 'سعر القطعة']);
      const seriesPriceRaw = firstValue(row, ['priceWholesale', 'priceSeries', 'price', 'سعر الجملة', 'سعر السيري']);
      const pricePiece = piecePriceRaw !== undefined && piecePriceRaw !== '' ? Number(piecePriceRaw) : round2(Number(seriesPriceRaw || 0) / seriesQtyNumber);
      const priceWholesale = seriesPriceRaw !== undefined && seriesPriceRaw !== '' ? Number(seriesPriceRaw) : round2(pricePiece * seriesQtyNumber);
      if (!name || !model || Number.isNaN(pricePiece) || Number.isNaN(priceWholesale)) return;
      const ref = doc(collection(db, 'products'));
      batch.set(ref, {
        name: String(name).trim(),
        model: String(model).trim(),
        pricePiece,
        priceWholesale,
        discountPercent: clamp(Number(firstValue(row, ['discountPercent', 'discount', 'نسبة الخصم']) || 0), 0, 99),
        season: String(firstValue(row, ['season', 'الموسم']) || getSeasonOptions()[0] || 'صيفي').trim(),
        subCategory: normalizeSubCategory(firstValue(row, ['subCategory', 'subcategory', 'groupLabel', 'التصنيف الداخلي', 'التصنيف الفرعي', 'الفئة'])),
        sizes: String(firstValue(row, ['sizes', 'المقاسات']) || '').trim(),
        seriesQtyText,
        badgeText: String(firstValue(row, ['badgeText', 'شارة']) || '').trim(),
        pinned: toBool(firstValue(row, ['pinned', 'تثبيت']) || false),
        visible: String(firstValue(row, ['visible', 'إظهار']) || 'true').trim() === '' ? true : toBool(firstValue(row, ['visible', 'إظهار']) || true),
        stockStatus: normalizeStockStatus(firstValue(row, ['stockStatus', 'التوفر', 'حالة التوفر']) || 'available'),
        description: String(firstValue(row, ['description', 'الوصف']) || '').trim(),
        codeCategory: deriveCodeCategory(model),
        imageUrls: normalizeImageUrls(textareaLines(firstValue(row, ['imageUrls', 'الصور']) || '').concat(parseMaybeArray(firstValue(row, ['imageUrl', 'صورة']) || ''))),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    showToast('تم استيراد المنتجات');
  } catch (error) {
    console.error(error);
    showToast('تعذر استيراد الملف');
  } finally {
    el.excelImportInput.value = '';
  }
}

async function deleteDocumentVerified(collectionName, documentId) {
  const reference = doc(db, collectionName, documentId);
  await deleteDoc(reference);
  const check = await getDoc(reference);
  if (check.exists()) {
    const error = new Error(`Delete verification failed for ${collectionName}/${documentId}`);
    error.code = 'jood/delete-not-confirmed';
    throw error;
  }
}

async function deleteCollectionInChunks(collectionName) {
  let totalDeleted = 0;
  let passes = 0;
  while (passes < 50) {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) return totalDeleted;
    const docs = snapshot.docs;
    for (let start = 0; start < docs.length; start += 400) {
      const batch = writeBatch(db);
      const chunk = docs.slice(start, start + 400);
      chunk.forEach((entry) => batch.delete(entry.ref));
      await batch.commit();
      totalDeleted += chunk.length;
    }
    passes += 1;
    if ((await getDocs(collection(db, collectionName))).empty) return totalDeleted;
  }
  const error = new Error(`Bulk delete verification failed for ${collectionName}`);
  error.code = 'jood/delete-not-confirmed';
  throw error;
}

function setButtonBusy(button, busy, busyText = 'جارٍ التنفيذ') {
  if (!button) return;
  if (busy) {
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.classList.add('is-busy');
    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>${escapeHTML(busyText)}</span>`;
  } else {
    button.disabled = false;
    button.classList.remove('is-busy');
    if (button.dataset.originalHtml) { button.innerHTML = button.dataset.originalHtml; delete button.dataset.originalHtml; }
  }
}

function getDeleteErrorMessage(error, target = 'البيانات') {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  if (code.includes('permission-denied') || message.includes('permission')) return `تعذر حذف ${target}: صلاحيات Firebase تمنع العملية. طبّق ملف firestore.rules ثم سجّل الدخول من جديد.`;
  if (code.includes('unauthenticated')) return `تعذر حذف ${target}: انتهت جلسة الإدارة. سجّل الدخول من جديد.`;
  if (code.includes('unavailable') || message.includes('network')) return `تعذر حذف ${target}: تحقق من الإنترنت ثم أعد المحاولة.`;
  if (code.includes('delete-not-confirmed')) return `لم يتم تأكيد حذف ${target} من قاعدة البيانات. أعد المحاولة.`;
  return `تعذر حذف ${target}. افتح لوحة الإدارة وأعد المحاولة.`;
}

async function deleteCollectionDocs(collectionName, confirmText) {
  if (!(await ensureAdminSession())) return;
  const answer = prompt(`للتأكيد اكتب بالضبط: ${confirmText}`);
  if (answer !== confirmText) return;
  const button = collectionName === 'products' ? el.deleteProductsBtn : el.deleteOrdersBtn;
  setButtonBusy(button, true, 'جارٍ الحذف');
  try {
    const deleted = await deleteCollectionInChunks(collectionName);
    if (collectionName === 'products') { state.products = []; state.cart = []; renderCart(); renderAdminProducts(); applyFilters(); renderStorefront(); }
    else { state.orders = []; renderAdminOrders(); renderAdminForms(); }
    showToast(deleted ? `تم حذف ${deleted} سجل بنجاح` : 'لا توجد بيانات للحذف');
  } catch (error) {
    console.error(`Bulk delete failed for ${collectionName}:`, error);
    showToast(getDeleteErrorMessage(error, collectionName === 'products' ? 'المنتجات' : 'الطلبات'));
  } finally { setButtonBusy(button, false); }
}

async function deleteAllData() {
  if (!(await ensureAdminSession())) return;
  const phrase = 'حذف كل البيانات';
  const answer = prompt(`للتأكيد النهائي اكتب بالضبط: ${phrase}`);
  if (answer !== phrase) return;
  setButtonBusy(el.deleteAllDataBtn, true, 'جارٍ الحذف');
  try {
    let deleted = 0;
    for (const name of ['products', 'orders', 'categories']) deleted += await deleteCollectionInChunks(name);
    await Promise.all([
      setDoc(doc(db, 'company', 'main'), { ...DEFAULT_COMPANY, updatedAt: serverTimestamp() }),
      setDoc(doc(db, 'settings', 'storefront'), { ...DEFAULT_STOREFRONT, updatedAt: serverTimestamp() }),
      setDoc(doc(db, 'settings', 'store'), { ...DEFAULT_STORE_SETTINGS, updatedAt: serverTimestamp() }),
      setDoc(doc(db, 'payments', 'default'), { policyText: DEFAULT_PAYMENT_POLICY, methods: DEFAULT_PAYMENT_METHODS, updatedAt: serverTimestamp() }),
      setDoc(doc(db, 'shipping', 'default'), { policyText: DEFAULT_SHIPPING_POLICY, updatedAt: serverTimestamp() }),
    ]);
    state.products = []; state.orders = []; state.categories = []; state.cart = [];
    renderCart(); renderAdminProducts(); renderAdminOrders(); renderAdminForms(); applyFilters(); renderStorefront();
    showToast(`تم حذف البيانات وإعادة الإعدادات الافتراضية${deleted ? ` (${deleted} سجل)` : ''}`);
  } catch (error) {
    console.error('Delete all data failed:', error);
    showToast(getDeleteErrorMessage(error, 'كل البيانات'));
  } finally { setButtonBusy(el.deleteAllDataBtn, false); }
}

function openDrawer(which) {
  el.overlay.classList.add('show');
  [el.menuDrawer, el.cartDrawer, el.filterDrawer, el.adminDrawer].filter(Boolean).forEach((drawer) => drawer.classList.remove('show'));
  document.body.classList.add('drawer-open');
  document.body.classList.remove('menu-drawer-open', 'cart-drawer-open', 'filter-drawer-open', 'admin-drawer-open');
  if (which === 'menu') {
    el.menuDrawer.classList.add('show');
    document.body.classList.add('menu-drawer-open');
  }
  if (which === 'cart') {
    el.cartDrawer.classList.add('show');
    document.body.classList.add('cart-drawer-open');
  }
  if (which === 'filter' && el.filterDrawer) {
    el.filterDrawer.classList.add('show');
    document.body.classList.add('filter-drawer-open');
  }
  if (which === 'admin') {
    el.adminDrawer.classList.add('show');
    document.body.classList.add('admin-drawer-open');
  }
}

function closeDrawers() {
  [el.menuDrawer, el.cartDrawer, el.filterDrawer, el.adminDrawer].filter(Boolean).forEach((drawer) => drawer.classList.remove('show'));
  el.overlay.classList.remove('show');
  document.body.classList.remove('drawer-open', 'menu-drawer-open', 'cart-drawer-open', 'filter-drawer-open', 'admin-drawer-open');
}

function handleInitialCartRoute() {
  if (!shouldOpenCartFromRoute()) return;
  queueMicrotask(() => openDrawer('cart'));
  cleanupCartRouteState();
}

function shouldOpenCartFromRoute() {
  const url = new URL(window.location.href);
  return url.searchParams.get('cart') === '1' || url.hash === '#cart' || consumePendingCartOpenFlag();
}

function consumePendingCartOpenFlag() {
  try {
    if (sessionStorage.getItem(OPEN_CART_FLAG_KEY) === '1') {
      sessionStorage.removeItem(OPEN_CART_FLAG_KEY);
      return true;
    }
  } catch {}
  return false;
}

function cleanupCartRouteState() {
  try { sessionStorage.removeItem(OPEN_CART_FLAG_KEY); } catch {}
  const url = new URL(window.location.href);
  let changed = false;
  if (url.searchParams.get('cart') === '1') {
    url.searchParams.delete('cart');
    changed = true;
  }
  if (url.hash === '#cart') {
    url.hash = '';
    changed = true;
  }
  if (changed) history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function openModal(modalId) {
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.classList.toggle('show', modal.id === modalId);
  });
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}
function closeModal(modalId) {
  if (modalId) id(modalId)?.classList.remove('show');
  if (modalId === 'invoiceModal') cleanupInvoicePreview();
  if (!document.querySelector('.modal.show')) {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

function openPolicy(title, text) {
  closeDrawers();
  el.policyModalTitle.textContent = title;
  el.policyModalContent.textContent = text || '';
  openModal('policyModal');
}


function openQuickProduct(product) {
  if (!product || !el.quickProductModal) return;
  const urls = normalizeImageUrls(product.imageUrls);
  const originalUrl = urls[0] || placeholderImage(product.name || product.model || 'Jood Kids');
  const thumbUrl = getProductThumbUrl(originalUrl);
  const productLabel = product.name || `موديل ${product.model || ''}`.trim() || 'منتج';
  const categoryLabel = getCodeCategoryLabel(product.codeCategory);
  const seasonLabel = product.season || '—';
  const subCategoryLabel = getProductSubCategory(product);
  const sizesLabel = product.sizes || '—';
  const seriesLabel = getSeriesLabel(product);
  const productPageUrl = getProductPageUrl(product);
  el.quickProductImage.src = thumbUrl;
  el.quickProductImage.alt = buildProductAlt(product);
  el.quickProductImage.dataset.fullImage = originalUrl;
  el.quickProductName.textContent = product.name || 'بدون اسم';
  el.quickProductModel.textContent = `موديل ${product.model || '-'}`;
  el.quickProductPrice.textContent = formatCurrency(getPiecePrice(product));
  el.quickProductSeries.textContent = seriesLabel;
  el.quickProductSizes.textContent = sizesLabel;
  el.quickProductCategory.textContent = subCategoryLabel ? `${categoryLabel} • ${subCategoryLabel}` : categoryLabel;
  el.quickProductSeason.textContent = seasonLabel;
  const stock = getStockStatus(product);
  if (el.quickProductStock) { el.quickProductStock.className = `stock-status ${stock.key}`; el.quickProductStock.innerHTML = `<i class="fa-solid ${stock.icon}"></i><span>${escapeHTML(stock.longLabel)}</span>`; }
  if (el.quickProductAddBtn) { el.quickProductAddBtn.disabled = stock.key === 'out'; el.quickProductAddBtn.querySelector('span').textContent = stock.key === 'out' ? 'غير متوفر' : 'أضف سيري'; }
  el.quickProductOpenPage.href = productPageUrl;
  el.quickProductOpenPage.setAttribute('aria-label', `فتح صفحة ${productLabel}`);
  el.quickProductAddBtn.dataset.productId = String(product.id || '');
  openModal('quickProductModal');
}

function openGallery(urls, index = 0) {
  state.gallery.urls = urls;
  state.gallery.index = index;
  syncGallery();
  openModal('imageModal');
}

function changeGallery(delta) {
  if (!state.gallery.urls.length) return;
  state.gallery.index = (state.gallery.index + delta + state.gallery.urls.length) % state.gallery.urls.length;
  syncGallery();
}

function syncGallery() {
  const rawUrl = String(state.gallery.urls[state.gallery.index] || '').trim();
  const optimizedUrl = getGalleryImageUrl(rawUrl);
  const fallbackUrl = rawUrl || placeholderImage('Jood Kids');
  el.modalImage.alt = `صورة منتج ${state.gallery.index + 1} - ${getBrandDisplayName()}`;
  el.modalImage.dataset.fallbackUrl = fallbackUrl;
  el.modalImage.dataset.failedOnce = '0';
  el.modalImage.onerror = () => {
    if (el.modalImage.dataset.failedOnce === '1') {
      el.modalImage.onerror = null;
      el.modalImage.src = placeholderImage('Jood Kids');
      return;
    }
    el.modalImage.dataset.failedOnce = '1';
    el.modalImage.src = fallbackUrl;
  };
  el.modalImage.src = optimizedUrl || fallbackUrl;
  el.galleryThumbs.innerHTML = '';
  state.gallery.urls.forEach((imageUrl, index) => {
    const button = document.createElement('button');
    button.className = index === state.gallery.index ? 'active' : '';
    button.innerHTML = `<img src="${escapeAttr(getMiniImageUrl(imageUrl) || imageUrl || placeholderImage('Jood Kids'))}" alt="صورة مصغرة للمنتج ${index + 1}" loading="lazy" decoding="async" />`;
    button.addEventListener('click', () => { state.gallery.index = index; syncGallery(); });
    el.galleryThumbs.appendChild(button);
  });
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    const showInstall = state.storefront.installEnabled;
    el.installBtn.classList.toggle('hidden', !showInstall);
    el.menuInstallBtn.classList.toggle('hidden', !showInstall);
  });
}

async function installPwa() {
  closeDrawers();
  if (!state.deferredInstallPrompt) return showToast('التثبيت غير متاح الآن');
  state.deferredInstallPrompt.prompt();
  await state.deferredInstallPrompt.userChoice.catch(() => null);
  state.deferredInstallPrompt = null;
  el.installBtn.classList.add('hidden');
  el.menuInstallBtn.classList.add('hidden');
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`./service-worker.js?v=${APP_SW_VERSION}`, { updateViaCache: 'none' });
      await registration.update();
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }, { once: true });
}

function openWhatsAppDirect() {
  const link = buildWhatsAppLink();
  if (!link) return showToast('رقم الواتساب غير متوفر');
  safeOpenExternal(link);
}

function buildWhatsAppLink(message = '') {
  const phone = normalizeWhatsAppNumber(state.company.whatsapp || state.company.phone1 || '');
  if (!phone) return '';
  return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

function getActionErrorMessage(error, fallback = 'تعذر تنفيذ العملية') {
  const code = String(error?.code || '').trim();
  const message = String(error?.message || '').trim();
  if (code.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
    return 'لا توجد صلاحية للحفظ. تم تحديث النظام لقراءة حساب الأدمن بالبريد أو UID. إذا استمرت الرسالة فحدّث قواعد Firestore من الملف المرفق ثم أعد تسجيل الدخول';
  }
  if (code.includes('unavailable')) return 'تعذر الاتصال بقاعدة البيانات الآن. أعد المحاولة بعد قليل';
  if (code.includes('failed-precondition')) return 'قاعدة البيانات تحتاج إلى الإعداد المطلوب داخل Firebase ثم إعادة المحاولة';
  return fallback;
}

function getSeriesCount(item) {
  const value = toInt(item?.qty ?? item?.seriesCount ?? 1);
  return value > 0 ? value : 1;
}

function getPiecesPerSeries(item) {
  const explicit = toInt(item?.piecesPerSeries ?? item?.pieceQtyPerSeries ?? item?.packQty ?? 0);
  if (explicit > 0) return explicit;
  const value = getSeriesQtyNumber(item);
  return value > 0 ? value : 1;
}

function getPieceQuantity(item) {
  return getSeriesCount(item) * getPiecesPerSeries(item);
}

function getSeriesValue(item) {
  const explicit = item?.unitPrice ?? item?.priceWholesale ?? item?.seriesPrice;
  if (explicit !== undefined && explicit !== null && String(explicit).trim() !== '') return round2(toNumber(explicit));
  return round2(getPiecePrice(item) * getPiecesPerSeries(item));
}

function getLineTotal(item) {
  return round2(getSeriesCount(item) * getSeriesValue(item));
}

function getLinePiecesTotal(item) {
  return getPieceQuantity(item);
}

function getOrderTotals(order) {
  return (Array.isArray(order?.items) ? order.items : []).reduce((acc, item) => {
    acc.models += 1;
    acc.series += getSeriesCount(item);
    acc.pieces += getLinePiecesTotal(item);
    acc.total += getLineTotal(item);
    return acc;
  }, { models: 0, series: 0, pieces: 0, total: 0 });
}

function buildWhatsAppOrderMessage(order) {
  const brandName = String(state.storefront.companyName || state.company.companyName || 'JOOD KIDS').trim();
  const separator = '━━━━━━━━━━━━━━━━';
  const lines = [
    `*${brandName}*`,
    '*تفاصيل الطلبية*',
    separator,
    `رقم الطلب: ${getOrderReference(order)}`,
    `العميل: ${order.customerName || ''}`,
    `الهاتف: ${order.customerPhone || ''}`,
    `المدينة: ${order.city || ''}`,
    `العنوان: ${order.address || ''}`,
  ];
  if (order.shippingMethod) lines.push(`طريقة الاستلام: ${order.shippingMethod}`);
  if (order.paymentMethod) lines.push(`طريقة الدفع: ${order.paymentMethod}`);
  lines.push(separator, '*الأصناف:*');
  (order.items || []).forEach((item, index) => {
    lines.push(
      `*${index + 1}*`,
      `الصنف: ${resolveInvoiceProductName(item)}`,
      `رقم الموديل: ${item.model || '—'}`,
      `عدد السيري: ${getSeriesCount(item)}`,
      `كمية القطع: ${getPieceQuantity(item)}`,
      separator
    );
  });
  if (order.notes) lines.push(`ملاحظات: ${order.notes}`);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function generateOrderNumber(isoString = '') {
  const date = new Date(isoString || Date.now());
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yy}${mm}${dd}-${hh}${min}${ss}`;
}

function getOrderReference(order) {
  return String(order?.orderNo || order?.id || '—');
}

function formatOrderDate(order) {
  const source = order?.createdAtClient || order?.createdAt || order?.updatedAt || Date.now();
  const date = new Date(typeof source?.toMillis === 'function' ? source.toMillis() : source);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function resolveInvoiceProductName(item) {
  return String(item?.name || `موديل ${item?.model || ''}` || 'منتج').replace(/\s+/g, ' ').trim();
}

function buildInvoiceFilename(order) {
  const ref = sanitizePathSegment(getOrderReference(order) || 'order');
  return `invoice-${ref}.png`;
}

function cleanupInvoicePreview() {
  if (state.invoicePreview.url) URL.revokeObjectURL(state.invoicePreview.url);
  state.invoicePreview = { order: null, blob: null, url: '' };
  if (el.invoicePreviewImage) el.invoicePreviewImage.src = '';
}

async function openInvoicePreview(order) {
  const blob = await createInvoiceImageBlob(order);
  if (!blob) throw new Error('invoice blob not created');
  if (state.invoicePreview.url) URL.revokeObjectURL(state.invoicePreview.url);
  const url = URL.createObjectURL(blob);
  state.invoicePreview = { order, blob, url };
  if (el.invoicePreviewImage) el.invoicePreviewImage.src = url;
  openModal('invoiceModal');
}

async function previewOrderInvoice(order) {
  try {
    await openInvoicePreview(order);
  } catch (error) {
    console.error(error);
    showToast('تعذر تجهيز الفاتورة');
  }
}

async function downloadActiveInvoice() {
  const active = state.invoicePreview;
  if (!active?.order) return showToast('لا توجد فاتورة جاهزة');
  if (active.blob) {
    downloadBlob(active.blob, buildInvoiceFilename(active.order));
    return;
  }
  await downloadInvoiceForOrder(active.order);
}

async function downloadInvoiceForOrder(order) {
  try {
    const blob = await createInvoiceImageBlob(order);
    if (!blob) return showToast('تعذر تجهيز الفاتورة');
    downloadBlob(blob, buildInvoiceFilename(order));
  } catch (error) {
    console.error(error);
    showToast('تعذر تنزيل الفاتورة');
  }
}

function openInvoiceWhatsApp() {
  const order = state.invoicePreview.order;
  if (!order) return showToast('لا توجد بيانات للطلب');
  const link = buildWhatsAppLink(buildWhatsAppOrderMessage(order));
  if (!link) return showToast('رقم الواتساب غير متوفر');
  safeOpenExternal(link);
}

async function createInvoiceImageBlob(order) {
  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch {}
  }
  const canvas = await buildInvoiceCanvas(order);
  return await canvasToBlob(canvas);
}

async function buildInvoiceCanvas(order) {
  const width = 1720;
  const margin = 68;
  const contentWidth = width - (margin * 2);
  const invoiceItems = (Array.isArray(order?.items) ? order.items : []).map((item, index) => ({
    ...item,
    serial: index + 1,
    productName: resolveInvoiceProductName(item),
    seriesCount: getSeriesCount(item),
    pieceQty: getPieceQuantity(item),
    seriesValue: getSeriesValue(item),
    lineTotal: getLineTotal(item),
  }));
  const totals = getOrderTotals(order);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = 400;
  const measure = tempCanvas.getContext('2d');
  setupInvoiceContext(measure);

  const fixedWidths = 92 + 170 + 148 + 150 + 190 + 220;
  const cols = [
    { key: 'serial', title: 'م', width: 92, align: 'center' },
    { key: 'model', title: 'رقم الموديل', width: 170, align: 'center' },
    { key: 'name', title: 'الصنف', width: contentWidth - fixedWidths, align: 'right' },
    { key: 'seriesCount', title: 'عدد السيري', width: 148, align: 'center' },
    { key: 'pieceQty', title: 'كمية القطع', width: 150, align: 'center' },
    { key: 'seriesValue', title: 'قيمة السيري', width: 190, align: 'center' },
    { key: 'lineTotal', title: 'الإجمالي', width: 220, align: 'center' },
  ];

  const rowHeights = invoiceItems.map((item) => {
    measure.font = '600 32px Cairo, sans-serif';
    const lines = wrapCanvasText(measure, item.productName, cols[2].width - 40, 3);
    return Math.max(94, 30 + (lines.length * 38));
  });

  const tableHeight = 84 + rowHeights.reduce((sum, value) => sum + value, 0);
  const headerHeight = 206;
  const infoHeight = 182;
  const summaryHeight = 182;
  const height = Math.max(1660, margin + headerHeight + 26 + infoHeight + 28 + tableHeight + 28 + summaryHeight + margin);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  setupInvoiceContext(ctx);

  drawInvoiceBackground(ctx, width, height);
  const logoSource = getInvoiceLogoSource();
  const logoImage = logoSource ? await loadImageSafe(logoSource) : null;

  let y = margin;
  drawInvoiceHeader(ctx, { width, margin, contentWidth, y, order, logoImage, totals, headerHeight });
  y += headerHeight + 26;

  y = drawInvoiceInfoSection(ctx, { width, margin, contentWidth, y, order, infoHeight });
  y += 28;

  drawInvoiceTable(ctx, { width, margin, contentWidth, y, items: invoiceItems, cols, rowHeights });
  y += tableHeight + 28;

  drawInvoiceSummary(ctx, { width, margin, contentWidth, y, totals, order, summaryHeight });
  return canvas;
}

function setupInvoiceContext(ctx) {
  ctx.direction = 'rtl';
  ctx.textBaseline = 'alphabetic';
  ctx.imageSmoothingEnabled = true;
}

function drawInvoiceBackground(ctx, width, height) {
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#fffdf8');
  bg.addColorStop(1, '#fff8ef');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(194, 154, 63, 0.08)';
  for (let i = 0; i < 20; i += 1) {
    ctx.beginPath();
    ctx.arc((width * 0.12) + (i * 58), 80 + ((i % 4) * 8), 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#d4af5a';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, width - 56, height - 56);
  ctx.strokeStyle = 'rgba(212,175,90,.55)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(46, 46, width - 92, height - 92);
}

function drawInvoiceHeader(ctx, { width, margin, contentWidth, y, order, logoImage, totals, headerHeight }) {
  drawRoundedRect(ctx, margin, y, contentWidth, headerHeight, 34, '#ffffff');
  ctx.fill();
  ctx.strokeStyle = 'rgba(212,175,90,.42)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (logoImage) {
    ctx.drawImage(logoImage, width - margin - 196, y + 34, 132, 132);
  } else {
    ctx.fillStyle = '#6d28d9';
    ctx.beginPath();
    ctx.arc(width - margin - 128, y + 100, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '900 42px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(initials(getBrandDisplayName() || 'JK'), width - margin - 128, y + 113);
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = '#5b2f0b';
  ctx.font = '900 64px Cairo, sans-serif';
  ctx.fillText('فاتورة الطلب', width - margin - 232, y + 90);
  ctx.fillStyle = '#7c6240';
  ctx.font = '700 28px Cairo, sans-serif';
  ctx.fillText(getBrandDisplayName() || SITE_NAME_AR, width - margin - 232, y + 136);
  ctx.fillStyle = '#b78b2d';
  ctx.font = '800 30px Cairo, sans-serif';
  ctx.fillText(`إجمالي الفاتورة: ${formatCurrency(totals.total)}`, width - margin - 232, y + 178);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#6b7280';
  ctx.font = '700 24px Cairo, sans-serif';
  ctx.fillText(`رقم الطلب: ${getOrderReference(order)}`, margin + 28, y + 70);
  ctx.fillText(`التاريخ: ${formatOrderDate(order)}`, margin + 28, y + 108);
  ctx.fillText(`عدد الموديلات: ${totals.models}`, margin + 28, y + 146);
  ctx.fillText(`إجمالي القطع: ${totals.pieces}`, margin + 28, y + 184);
}

function drawInvoiceInfoSection(ctx, { width, margin, contentWidth, y, order, infoHeight }) {
  const gap = 20;
  const boxWidth = (contentWidth - gap) / 2;
  drawInvoiceInfoCard(ctx, width - margin - boxWidth, y, boxWidth, infoHeight, 'بيانات العميل', [
    `العميل: ${order.customerName || '—'}`,
    `الهاتف: ${order.customerPhone || '—'}`,
    `المدينة: ${order.city || '—'}`,
  ]);
  drawInvoiceInfoCard(ctx, margin, y, boxWidth, infoHeight, 'بيانات الطلب', [
    `العنوان: ${order.address || '—'}`,
    `طريقة الدفع: ${order.paymentMethod || '—'}`,
    `طريقة الاستلام: ${order.shippingMethod || '—'}`,
  ]);
  return y + infoHeight;
}

function drawInvoiceInfoCard(ctx, x, y, w, h, title, lines, align = 'right') {
  drawRoundedRect(ctx, x, y, w, h, 24, 'rgba(255,255,255,.96)');
  ctx.fill();
  ctx.strokeStyle = 'rgba(212,175,90,.34)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#b78b2d';
  ctx.font = '800 28px Cairo, sans-serif';
  ctx.textAlign = align === 'right' ? 'right' : 'left';
  const textX = align === 'right' ? x + w - 24 : x + 24;
  ctx.fillText(title, textX, y + 42);
  ctx.fillStyle = '#1f2937';
  ctx.font = '600 25px Cairo, sans-serif';
  lines.forEach((line, index) => {
    const maxWidth = w - 48;
    const wrapped = wrapCanvasText(ctx, line, maxWidth, 2);
    const yy = y + 88 + (index * 31);
    wrapped.forEach((part, partIndex) => ctx.fillText(part, textX, yy + (partIndex * 29)));
  });
}

function drawInvoiceTable(ctx, { width, margin, contentWidth, y, items, cols, rowHeights }) {
  const startX = margin;
  let cursorX = width - margin;
  ctx.fillStyle = '#c79b3b';
  drawRoundedRect(ctx, startX, y, contentWidth, 84, 22, '#c79b3b');
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '800 28px Cairo, sans-serif';

  const cells = cols.map((col) => {
    cursorX -= col.width;
    return { ...col, x: cursorX };
  });

  cells.forEach((cell) => {
    ctx.textAlign = cell.align === 'right' ? 'right' : 'center';
    const textX = cell.align === 'right' ? cell.x + cell.width - 20 : cell.x + (cell.width / 2);
    ctx.fillText(cell.title, textX, y + 52);
    ctx.strokeStyle = 'rgba(255,255,255,.24)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cell.x, y + 8);
    ctx.lineTo(cell.x, y + 76);
    ctx.stroke();
  });

  let currentY = y + 84;
  items.forEach((item, index) => {
    const rowHeight = rowHeights[index] || 94;
    drawRoundedRect(ctx, startX, currentY, contentWidth, rowHeight, 0, index % 2 === 0 ? 'rgba(255,255,255,.95)' : 'rgba(255,248,236,.92)');
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,175,90,.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, currentY, contentWidth, rowHeight);
    cells.forEach((cell) => {
      ctx.strokeStyle = 'rgba(212,175,90,.18)';
      ctx.beginPath();
      ctx.moveTo(cell.x, currentY);
      ctx.lineTo(cell.x, currentY + rowHeight);
      ctx.stroke();
      ctx.fillStyle = '#18212f';
      ctx.font = cell.key === 'name' ? '600 32px Cairo, sans-serif' : '700 28px Cairo, sans-serif';
      ctx.textAlign = cell.align === 'right' ? 'right' : 'center';
      const textX = cell.align === 'right' ? cell.x + cell.width - 20 : cell.x + (cell.width / 2);
      if (cell.key === 'name') {
        const lines = wrapCanvasText(ctx, item.productName, cell.width - 40, 3);
        const lineStartY = currentY + 40;
        lines.forEach((line, idx) => ctx.fillText(line, textX, lineStartY + (idx * 34)));
      } else if (cell.key === 'seriesValue') {
        ctx.fillText(formatCurrency(item.seriesValue), textX, currentY + (rowHeight / 2) + 10);
      } else if (cell.key === 'lineTotal') {
        ctx.fillText(formatCurrency(item.lineTotal), textX, currentY + (rowHeight / 2) + 10);
      } else if (cell.key === 'serial') {
        ctx.fillText(String(item.serial || index + 1), textX, currentY + (rowHeight / 2) + 10);
      } else if (cell.key === 'model') {
        ctx.fillText(String(item.model || '—'), textX, currentY + (rowHeight / 2) + 10);
      } else if (cell.key === 'seriesCount') {
        ctx.fillText(String(item.seriesCount || 0), textX, currentY + (rowHeight / 2) + 10);
      } else if (cell.key === 'pieceQty') {
        ctx.fillText(String(item.pieceQty || 0), textX, currentY + (rowHeight / 2) + 10);
      }
    });
    currentY += rowHeight;
  });
}

function drawInvoiceSummary(ctx, { width, margin, contentWidth, y, totals, order, summaryHeight }) {
  const gap = 18;
  const totalCardWidth = 360;
  const smallCardWidth = (contentWidth - totalCardWidth - (gap * 3)) / 3;
  const summaryCards = [
    { title: 'عدد الموديلات', value: totals.models },
    { title: 'عدد السيري', value: totals.series },
    { title: 'إجمالي القطع', value: totals.pieces },
  ];
  summaryCards.forEach((card, index) => {
    const x = margin + ((smallCardWidth + gap) * index);
    drawRoundedRect(ctx, x, y, smallCardWidth, summaryHeight, 26, 'rgba(255,255,255,.96)');
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,175,90,.34)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#b78b2d';
    ctx.font = '800 28px Cairo, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(card.title, x + smallCardWidth - 24, y + 52);
    ctx.fillStyle = '#18212f';
    ctx.font = '900 52px Cairo, sans-serif';
    ctx.fillText(String(card.value), x + smallCardWidth - 24, y + 122);
    ctx.fillStyle = '#6b7280';
    ctx.font = '700 22px Cairo, sans-serif';
    ctx.fillText(`مرجع الطلب ${getOrderReference(order)}`, x + smallCardWidth - 24, y + 158);
  });

  const totalX = width - margin - totalCardWidth;
  drawRoundedRect(ctx, totalX, y, totalCardWidth, summaryHeight, 30, '#1f2937');
  ctx.fill();
  ctx.strokeStyle = 'rgba(212,175,90,.55)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = '#f4d27b';
  ctx.font = '800 30px Cairo, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('إجمالي الفاتورة', totalX + totalCardWidth - 28, y + 56);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 54px Cairo, sans-serif';
  ctx.fillText(formatCurrency(totals.total), totalX + totalCardWidth - 28, y + 126);
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.font = '700 24px Cairo, sans-serif';
  ctx.fillText('تشمل قيمة السيري والإجمالي النهائي', totalX + totalCardWidth - 28, y + 164);
}

function getInvoiceLogoSource() {
  const logo = String(state.storefront.logoUrl || '').trim();
  return logo || new URL('assets/icon-512.png', window.location.href).href;
}

function drawRoundedRect(ctx, x, y, w, h, r, fillStyle) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
}

function wrapCanvasText(ctx, text, maxWidth, maxLines = 2) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return ['—'];
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const trimmed = lines.slice(0, maxLines);
  let last = trimmed[maxLines - 1];
  while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) last = last.slice(0, -1).trim();
  trimmed[maxLines - 1] = `${last}…`;
  return trimmed;
}

function loadImageSafe(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, 'image/png', 1);
  });
}

function applyTheme() {
  const primary = state.storefront.accentColor || DEFAULT_STOREFRONT.accentColor;
  const secondary = state.storefront.accentColor2 || DEFAULT_STOREFRONT.accentColor2;
  document.documentElement.style.setProperty('--primary', primary);
  document.documentElement.style.setProperty('--primary-2', secondary);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', secondary);
}


function getSeriesQtyText(product) {
  const value = String(product?.seriesQtyText ?? product?.packQtyText ?? product?.minQty ?? '').trim();
  if (!value) return '1';
  return value;
}

function getSeriesQtyNumber(product) {
  const text = getSeriesQtyText(product);
  const match = String(text).match(/\d+(?:\.\d+)?/);
  const qty = match ? Number(match[0]) : 1;
  return qty > 0 ? qty : 1;
}

function getPiecePrice(product) {
  const explicit = product?.pricePiece ?? product?.piecePrice ?? product?.pricePerPiece;
  if (explicit !== undefined && explicit !== null && String(explicit).trim() !== '') return round2(toNumber(explicit));
  const seriesQty = getSeriesQtyNumber(product);
  const seriesPrice = toNumber(product?.priceWholesale || product?.unitPrice || 0);
  return seriesQty > 0 ? round2(seriesPrice / seriesQty) : round2(seriesPrice);
}

function getSeriesBasePrice(product) {
  if (product && (product.pricePiece !== undefined && product.pricePiece !== null && String(product.pricePiece).trim() !== '')) {
    return round2(getPiecePrice(product) * getSeriesQtyNumber(product));
  }
  return round2(toNumber(product?.priceWholesale || product?.unitPrice || 0));
}

function getSeriesLabel(product) {
  const text = getSeriesQtyText(product);
  return /^\d+(?:\.\d+)?$/.test(text) ? `${text} قطعة في السيري` : text;
}

function getSeriesCountLabel(count) {
  const safe = Math.max(0, toInt(count || 0));
  return `${safe} سيري`;
}

function clearFilters() {
  const season = state.catalog.selectedSeason || '';
  const category = state.catalog.step === 'products' ? (state.catalog.selectedCategory || 'all') : 'all';
  const subCategory = state.catalog.step === 'products' ? (state.catalog.selectedSubCategory || 'all') : 'all';
  state.filter = { search: '', category: category || 'all', subCategory: subCategory || 'all', season: season || 'all', offersOnly: false, sort: 'featured' };
  el.searchInput.value = '';
  hideSearchSuggestions();
  el.sortFilter.value = 'featured';
  resetRenderedProducts();
  applyFilters();
}

function resetRenderedProducts() {
  state.renderedCount = PRODUCT_PAGE_SIZE;
}

function renderMoreProducts() {
  state.renderedCount += PRODUCT_PAGE_SIZE;
  renderProducts();
}

function buildProductSearchText(product) {
  return `${product.name || ''} ${product.model || ''} ${product.season || ''} ${product.sizes || ''} ${product.codeCategory || ''} ${getProductSubCategory(product)}`.toLowerCase();
}

function enrichProduct(product) {
  return { ...product, _searchText: buildProductSearchText(product) };
}

function normalizeStockStatus(value) {
  const raw = String(value || 'available').trim().toLowerCase();
  if (['out','unavailable','soldout','غير متوفر','نفذ'].includes(raw)) return 'out';
  if (['limited','low','كمية محدودة','محدود'].includes(raw)) return 'limited';
  return 'available';
}
function getStockStatus(product) {
  const key = normalizeStockStatus(product?.stockStatus);
  if (key === 'out') return { key, label:'غير متوفر', longLabel:'غير متوفر للطلب', icon:'fa-circle-xmark' };
  if (key === 'limited') return { key, label:'كمية محدودة', longLabel:'متوفر بكمية محدودة', icon:'fa-circle-exclamation' };
  return { key:'available', label:'متوفر', longLabel:'متوفر للطلب', icon:'fa-circle-check' };
}
const isOutOfStock = (product) => getStockStatus(product).key === 'out';
const hasDiscount = (product) => toNumber(product.discountPercent || 0) > 0;
const getVisibleProducts = () => state.products.filter((item) => item.visible !== false);

function getDisplayPrice(product) {
  const price = getSeriesBasePrice(product);
  const discount = clamp(toNumber(product.discountPercent || 0), 0, 99);
  return round2(price - (price * discount / 100));
}

function getDiscountedPiecePrice(product) {
  const qty = getSeriesQtyNumber(product);
  return qty > 0 ? round2(getDisplayPrice(product) / qty) : round2(getDisplayPrice(product));
}

function getCodeCategoryKeys() {
  return [...new Set(state.products.map((item) => String(item.codeCategory || deriveCodeCategory(item.model))).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

function getCodeCategoryLabel(code) {
  const safeCode = String(code || '').trim();
  const match = state.categories.find((item) => item.type === 'code' && String(item.code || item.label) === safeCode);
  const fallbackLabel = state.storeSettings?.codeCategoryLabels?.[safeCode];
  return match?.label || fallbackLabel || `تصنيف ${safeCode}`;
}

function getSeasonOptions() {
  return [...new Set([...(Array.isArray(state.storeSettings.seasons) ? state.storeSettings.seasons : []), ...state.products.map((item) => String(item.season || '').trim()).filter(Boolean)])];
}

function deriveCodeCategory(modelValue) {
  const numeric = String(modelValue || '').replace(/\D/g, '');
  if (!numeric) return '0';
  return parseInt(numeric, 10) >= 1000 ? numeric.slice(0, 2) : numeric.slice(0, 1);
}

function parseMaybeArray(value) {
  if (Array.isArray(value)) return value;
  const text = String(value || '').trim();
  if (!text) return [];
  if (text.startsWith('[')) { try { return JSON.parse(text); } catch { return [text]; } }
  return [text];
}

const normalizeImageUrls = (list) => [...new Set((Array.isArray(list) ? list : [list]).flat().map((item) => String(item || '').trim()).filter(Boolean))];
const textareaLines = (value) => String(value || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const parseCommaList = (value) => [...new Set(String(value || '').split(',').map((item) => item.trim()).filter(Boolean))];
const firstValue = (row, keys) => { for (const key of keys) { if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== '') return row[key]; } return ''; };
const toBool = (value) => ['true', '1', 'yes', 'نعم', 'y'].includes(String(value).trim().toLowerCase());
const initials = (text) => String(text || 'JK').trim().split(/\s+/).slice(0, 2).map((item) => item[0] || '').join('').toUpperCase() || 'JK';

function optimizeCloudinaryImage(url, { width = 720, height = 900, crop = 'fill' } = {}) {
  const raw = String(url || '').trim();
  if (!raw || !raw.includes('res.cloudinary.com') || !raw.includes('/image/upload/')) return raw;
  const parts = ['f_auto', 'q_auto', 'dpr_auto', `c_${crop}`];
  if (crop !== 'limit') parts.push('g_auto');
  if (Number.isFinite(width) && width > 0) parts.push(`w_${Math.round(width)}`);
  if (Number.isFinite(height) && height > 0) parts.push(`h_${Math.round(height)}`);
  return raw.replace('/image/upload/', `/image/upload/${parts.join(',')}/`);
}

function getProductThumbUrl(url) {
  return optimizeCloudinaryImage(url, { width: 560, height: 700, crop: 'fill' }) || url;
}

function getMiniImageUrl(url) {
  return optimizeCloudinaryImage(url, { width: 240, height: 300, crop: 'fill' }) || url;
}

function getGalleryImageUrl(url) {
  return optimizeCloudinaryImage(url, { width: 1600, height: NaN, crop: 'limit' }) || String(url || '').trim();
}

function placeholderImage(text, width = 900, height = 1125) {
  const bg1 = encodeURIComponent(state.storefront.accentColor || DEFAULT_STOREFRONT.accentColor);
  const bg2 = encodeURIComponent(state.storefront.accentColor2 || DEFAULT_STOREFRONT.accentColor2);
  const safeText = escapeHTML(text || 'Jood Kids');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="38" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.22)"/><text x="50%" y="50%" fill="white" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" dominant-baseline="middle">${safeText}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function bindExternalLinkButton(button, getUrl) {
  if (!button) return;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (button.disabled || button.classList.contains('hidden') || button.offsetParent === null) return;
    if (document.body.classList.contains('admin-drawer-open') && !button.closest('#contactModal')) return;
    if (document.body.classList.contains('drawer-open') && !button.closest('#contactModal')) return;
    const url = typeof getUrl === 'function' ? getUrl() : '';
    if (!url) return showToast('الرابط غير متوفر');
    safeOpenExternal(url);
  });
}

function safeOpenExternal(url) {
  const clean = String(url || '').trim();
  if (!clean) return;
  window.open(clean, '_blank', 'noopener,noreferrer');
}

function setActionLink(button, url) {
  if (!button) return;
  button.dataset.url = url || '';
  const enabled = Boolean(url);
  button.disabled = !enabled;
  button.style.pointerEvents = enabled ? 'auto' : 'none';
  button.style.opacity = enabled ? '1' : '.45';
}

function makeBadge(text) { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = text; return badge; }
const formatCurrency = (value) => `${round2(toNumber(value || 0)).toLocaleString('en-US')} ج.م`;
const toNumber = (value) => { const num = Number(value); return Number.isFinite(num) ? num : 0; };
const toInt = (value) => parseInt(value, 10) || 0;
const toMillis = (value) => !value ? 0 : typeof value.toMillis === 'function' ? value.toMillis() : value instanceof Date ? value.getTime() : typeof value === 'number' ? value : new Date(value).getTime() || 0;
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const sanitizePathSegment = (value) => String(value || 'folder').trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'folder';
function normalizeWhatsAppNumber(value) { const digits = String(value || '').replace(/\D/g, ''); if (!digits) return ''; if (digits.startsWith('20')) return digits; if (digits.startsWith('0')) return `2${digits}`; return digits; }
function loadLocalJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
const saveLocalJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
function debounce(fn, wait = 120) { let timer = 0; return (...args) => { clearTimeout(timer); timer = window.setTimeout(() => fn(...args), wait); }; }
function showToast(message) { el.toast.textContent = message; el.toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => el.toast.classList.remove('show'), 2600); }
function guardAdmin() { if (state.isAdmin || isAllowedAdminUser(auth.currentUser)) return true; showToast('سجل الدخول أولاً'); openDrawer('admin'); return false; }
async function readExcelRows(file) { if (!window.XLSX) throw new Error('SheetJS not loaded'); const buffer = await file.arrayBuffer(); const workbook = XLSX.read(buffer, { type: 'array' }); return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' }); }
function convertRowsToCsv(rows) { if (!rows.length) return 'info\nلا توجد بيانات'; const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))]; return [headers.join(','), ...rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(','))].join('\n'); }
function escapeCsv(value) { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
function downloadBlob(blob, filename) { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href); }
async function copyText(text) { try { await navigator.clipboard.writeText(text); showToast('تم النسخ'); } catch { showToast('تعذر النسخ'); } }
function id(value) { return document.getElementById(value); }
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function escapeAttr(value) { return escapeHTML(value).replace(/`/g, '&#96;'); }
