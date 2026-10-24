import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  ArrowLeft, ArrowUpLeft, BarChart3, Bell, Box, ChevronDown, CircleDollarSign, ClipboardList, Download, ExternalLink,
  Facebook, Heart, Instagram, LayoutDashboard, Menu, Package, Percent, Plus, Search, Settings2, ShieldCheck,
  ShoppingBag, ShoppingCart, Sparkles, Star, TrendingUp, Truck, Users, Wallet, X
} from "lucide-react";
import { buildPerformanceExcelHtml } from "../../../shared/analyticsExport";
import { buildInventoryExcelHtml, buildOrdersExcelHtml, filterOrdersForReport } from "../../../shared/reportExport";
import { LanguageToggle, useLanguage } from "@/contexts/LanguageContext";

const storage = {
  woven: "/manus-storage/bag-woven_be0cf152.jpg",
  canvas: "/manus-storage/bag-canvas_c62f0ff5.jpg",
  leather: "/manus-storage/bag-leather_c1853658.jpg",
  tote: "/manus-storage/bag-tote_a4a8991f.jpg",
};

const demoProducts = [
  { id: 1, sku: "BV-WVN-001", name: "حقيبة شاطئ منسوجة", category: "صيفي", sourceType: "handmade", sellingPrice: "649.00", costPrice: "390.00", stock: 24, minStock: 5, imageUrl: storage.woven, badge: "الأكثر مبيعاً" },
  { id: 2, sku: "BV-LTH-012", name: "حقيبة جلد طبيعية ميني", category: "جلود", sourceType: "handmade", sellingPrice: "1190.00", costPrice: "740.00", stock: 12, minStock: 4, imageUrl: storage.leather, badge: "صناعة يدوية" },
  { id: 3, sku: "BV-CNV-008", name: "توت باج كانفاس يومي", category: "عملي", sourceType: "local", sellingPrice: "329.00", costPrice: "175.00", stock: 46, minStock: 8, imageUrl: storage.canvas, badge: "اختيار الأسبوع" },
  { id: 4, sku: "BV-TOT-034", name: "شنطة كتف بخامة طبيعية", category: "كاجوال", sourceType: "china", sellingPrice: "799.00", costPrice: "460.00", stock: 7, minStock: 6, imageUrl: storage.tote, badge: "كمية محدودة" },
];

const categories = [
  { label: "newArrivals", value: "new", icon: Sparkles },
  { label: "handmade", value: "handmade", icon: Heart },
  { label: "summerPicks", value: "summer", icon: ShoppingBag },
  { label: "offersToday", value: "offers", icon: Percent },
];

const navItems = [
  { key: "dashboard", label: "نظرة عامة", value: "dashboard", icon: LayoutDashboard },
  { key: "products", label: "المنتجات", value: "products", icon: Package },
  { key: "orders", label: "الطلبات", value: "orders", icon: ClipboardList },
  { key: "team", label: "الموظفون والمسوقون", value: "team", icon: Users },
  { key: "inventory", label: "المخزون", value: "inventory", icon: Box },
  { key: "commissions", label: "العمولات", value: "commissions", icon: Percent },
  { key: "finance", label: "المحاسبة", value: "finance", icon: Wallet },
  { key: "settings", label: "الإعدادات", value: "settings", icon: Settings2 },
];

function formatPrice(value: string | number, language: "ar" | "en" = "ar") {
  const numericValue = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", { style: "currency", currency: "EGP", maximumFractionDigits: 2 }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function Storefront({ onAdmin }: { onAdmin: () => void }) {
  const { t, language } = useLanguage();
  const { data: liveProducts } = trpc.products.list.useQuery();
  const orderMutation = trpc.orders.create.useMutation();
  const products = liveProducts?.length ? liveProducts : demoProducts;
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<number[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || product.sourceType === activeCategory;
    return matchesSearch && matchesCategory;
  });
  const cartItems = products.filter(product => cart.includes(product.id));
  const cartTotal = cartItems.reduce((sum, product) => sum + Number(product.sellingPrice), 0);

  const addToCart = (id: number) => {
    setCart(items => items.includes(id) ? items : [...items, id]);
    toast.success("تمت إضافة المنتج إلى السلة");
  };

  const placeDemoOrder = async () => {
    if (!cartItems.length) return toast.error("أضف منتجاً واحداً على الأقل");
    try {
      await orderMutation.mutateAsync({ customerName: "عميل BagVora", customerPhone: "01000000000", customerAddress: "سيتم التواصل لتأكيد العنوان", items: cartItems.map(item => ({ productId: item.id, quantity: 1 })) });
      toast.success("تم استلام طلبك! سنتواصل معك للتأكيد");
      setCart([]); setShowCart(false);
    } catch { toast.info("السلة جاهزة — فعّل تسجيل الدخول وقاعدة البيانات لاستقبال الطلبات فعلياً"); }
  };

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#1f2933]">
      <header className="sticky top-0 z-30 border-b border-[#eadfd2] bg-[#fbf8f3]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4 lg:px-8">
          <button className="flex items-center gap-3 text-right" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/manus-storage/bagvora-logo_7cd0a86f.png" alt="BagVora" className="brand-logo" />
          </button>
          <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-[#6f6258] lg:flex">
            <a href="#shop" className="nav-link active">{t("storefront")}</a><a href="#collections" className="nav-link">{t("collections")}</a><a href="#story" className="nav-link">{t("story")}</a><a href="#reviews" className="nav-link">{t("reviews")}</a>
          </nav>
          <div className="mr-auto flex items-center gap-2">
            <LanguageToggle />
            <button className="icon-button hidden sm:inline-flex" onClick={() => toast.info("البحث في كل منتجات BagVora") } aria-label="بحث"><Search size={18} /></button>
            <button className="relative icon-button" onClick={() => setShowCart(v => !v)} aria-label="السلة"><ShoppingCart size={18} />{cart.length > 0 && <span className="cart-count">{cart.length}</span>}</button>
            <button className="hidden rounded-full bg-[#202b2d] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ae785c] sm:inline-flex" onClick={onAdmin}>{t("admin")} <ArrowLeft size={14} className="mr-2" /></button>
            <button className="icon-button lg:hidden"><Menu size={18} /></button>
          </div>
        </div>
        {showCart && <div className="absolute left-5 top-[76px] w-[min(360px,calc(100vw-40px))] rounded-2xl border border-[#eadfd2] bg-white p-5 shadow-2xl lg:left-8">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">{t("shoppingCart")}</h3><button onClick={() => setShowCart(false)}><X size={16} /></button></div>
          {cartItems.length ? <><div className="space-y-3">{cartItems.map(item => <div key={item.id} className="flex items-center gap-3"><img src={item.imageUrl ?? storage.canvas} className="h-12 w-12 rounded-xl object-cover" /><div className="flex-1"><p className="text-sm font-semibold">{item.name}</p><small className="text-[#ae785c]">{formatPrice(item.sellingPrice)}</small></div></div>)}</div><div className="my-4 flex justify-between border-t pt-4 text-sm"><span>{t("total")}</span><strong>{formatPrice(cartTotal + 60, language)}</strong></div><button onClick={placeDemoOrder} className="w-full rounded-xl bg-[#ae785c] px-4 py-3 text-sm font-bold text-white hover:bg-[#8f5e47]">{t("checkout")}</button></> : <p className="py-8 text-center text-sm text-[#8b8077]">{t("emptyCart")}</p>}
        </div>}
      </header>

      <main>
        <section className="hero-section mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-20">
          <div className="order-2 lg:order-1">
            <div className="eyebrow"><span className="h-px w-8 bg-[#ae785c]" /> {t("newSeason")}</div>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#202b2d] sm:text-6xl lg:text-7xl">{t("heroTitle")}</h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#76685f]">{t("heroDescription")}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4"><a href="#shop" className="primary-button">{t("discover")} <ArrowLeft size={17} /></a><a href="#story" className="text-button">{t("ourStory")} <ArrowUpLeft size={16} /></a></div>
            <div className="mt-12 flex items-center gap-8 border-t border-[#eadfd2] pt-6 text-xs text-[#8b8077]"><div><strong className="block text-xl text-[#202b2d]">+2.4k</strong>{t("happyCustomers")}</div><div><strong className="block text-xl text-[#202b2d]">4.9/5</strong><span className="text-[#d49c3f]">★★★★★</span></div><div><strong className="block text-xl text-[#202b2d]">48h</strong>{t("fastShipping")}</div></div>
          </div>
          <div className="order-1 relative min-h-[460px] lg:order-2">
            <div className="hero-blob" /><div className="hero-image-wrap"><img src={storage.leather} alt="حقيبة جلد BagVora" /></div>
            <div className="float-card top-8 right-1 sm:right-8"><span className="float-icon"><Sparkles size={15} /></span><div><strong>{t("editorPick")}</strong><small>{t("naturalLeather")}</small></div></div>
            <div className="float-card bottom-8 left-0 sm:left-8"><div className="avatar-stack"><span>م</span><span>س</span><span>ن</span></div><div><strong>{t("ordersToday")}</strong><small>{t("joinFamily")}</small></div></div>
            <span className="hero-stamp">EST<br /><b>2026</b></span>
          </div>
        </section>

        <section id="collections" className="border-y border-[#eadfd2] bg-[#f5eee7] py-5"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-5 sm:justify-between lg:px-8">{categories.map(({ label, icon: Icon, value }) => <button key={value} onClick={() => { setActiveCategory(value === "handmade" ? "handmade" : "all"); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }} className="category-pill"><Icon size={16} className="text-[#ae785c]" />{t(label)}<ArrowUpLeft size={14} className="mr-1 text-[#bdafa4]" /></button>)}</div></section>

        <section id="shop" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6"><div><div className="eyebrow">{t("selectedCollection")}</div><h2 className="section-title mt-3">{t("piecesYouLove")}</h2></div><div className="flex items-center gap-3"><div className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} /></div><button className="text-button hidden sm:flex">{t("viewAll")} <ArrowLeft size={15} /></button></div></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} language={language} onAdd={() => addToCart(product.id)} />)}</div>
        </section>

        <section id="story" className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:pb-24"><div className="relative"><img src={storage.woven} alt="تفاصيل حقيبة منسوجة" className="h-[420px] w-full rounded-[2rem] object-cover" /><div className="absolute -bottom-5 -left-3 rounded-2xl bg-[#202b2d] px-5 py-4 text-white shadow-xl sm:-left-5"><p className="text-2xl font-semibold">03</p><small className="text-xs text-[#c4b8ad]">مصادر نختار منها</small></div></div><div className="lg:pr-12"><div className="eyebrow">أكثر من مجرد حقيبة</div><h2 className="section-title mt-3 max-w-xl">نختارها كأنها<br /><em className="serif-italic text-[#ae785c]">لنا.</em></h2><p className="mt-6 max-w-xl leading-8 text-[#76685f]">من ورش يدوية صغيرة إلى موردين نثق بهم، نبحث عن القطع التي تجمع بين التفاصيل الجميلة والسعر العادل. كل منتج في BagVora له مصدر واضح، وسعر محسوب، وقصة تستحق أن تُحكى.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="story-feature"><ShieldCheck size={20} /><div><strong>اختيار موثوق</strong><small>فحص كل قطعة قبل الشحن</small></div></div><div className="story-feature"><Truck size={20} /><div><strong>توصيل لبابك</strong><small>نتابع طلبك خطوة بخطوة</small></div></div></div></div></section>

        <section id="reviews" className="bg-[#202b2d] px-5 py-16 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="eyebrow light">قالوا عن BagVora</div><h2 className="section-title mt-3 text-white">حكايات وصلت لنا</h2></div><div className="text-[#e4b17f]">★★★★★ <span className="mr-2 text-sm text-[#bfc5c5]">4.9 من 5</span></div></div><div className="mt-10 grid gap-4 md:grid-cols-3"><ReviewCard text="الحقيبة طلعت أجمل من الصور بكتير، والتغليف شيك جداً. أكيد مش آخر طلب!" name="سارة محمد" role="عميلة منذ 2024" /><ReviewCard text="بحب إن كل منتج مكتوب مصدره وتفاصيله. وصلتني بسرعة والخامة ممتازة." name="نورهان علي" role="عميلة منذ 2025" /><ReviewCard text="فكرة التسوق من صناع محليين وموردين موثوقين في مكان واحد وفرت عليّ وقت كبير." name="مريم عادل" role="عميلة منذ 2025" /></div></div></section>
      </main>
      <footer className="border-t border-[#eadfd2] bg-[#fbf8f3] px-5 py-8 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-[#76685f] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><img src="/manus-storage/bagvora-logo_7cd0a86f.png" alt="BagVora" className="brand-logo footer-logo" /><span>© 2026 BagVora — نحمل قصتك</span></div><div className="flex flex-wrap items-center gap-4"><a href="mailto:bagvora26@gmail.com">bagvora26@gmail.com</a><a href="https://wa.me/201224173736" className="font-semibold text-[#ae785c]">واتساب: 01224173736</a><a href="/privacy">الخصوصية</a><a href="/terms">الشروط</a><Instagram size={17} /><Facebook size={17} /></div></div></footer>
    </div>
  );
}

function ProductCard({ product, index, language, onAdd }: { product: any; index: number; language: "ar" | "en"; onAdd: () => void }) {
  const { t } = useLanguage();
  return <article className="product-card group"><div className="product-image-wrap"><img src={product.imageUrl ?? storage.canvas} alt={product.name} /><span className="product-badge">{product.badge ?? (index % 2 ? t("new") : t("selectedForYou"))}</span><button className="wishlist"><Heart size={17} /></button><button className="quick-add" onClick={onAdd}>{t("addToCart")} <Plus size={14} /></button></div><div className="pt-4"><div className="mb-1 flex items-center justify-between text-[11px] text-[#a08f82]"><span>{product.category}</span><span className="flex items-center gap-1 text-[#d49c3f]"><Star size={12} fill="currentColor" /> 4.9</span></div><h3 className="font-semibold text-[#293438]">{product.name}</h3><div className="mt-2 flex items-center justify-between"><strong className="text-lg text-[#ae785c]">{formatPrice(product.sellingPrice, language)}</strong><span className="text-[10px] text-[#a08f82]">{t("remaining")} {product.stock}</span></div></div></article>;
}

function ReviewCard({ text, name, role }: { text: string; name: string; role: string }) { return <div className="review-card"><div className="mb-5 text-[#e4b17f]">★★★★★</div><p className="leading-8 text-[#e2e7e6]">“{text}”</p><div className="mt-7 flex items-center gap-3"><span className="review-avatar">{name.charAt(0)}</span><div><strong className="block text-sm">{name}</strong><small className="text-xs text-[#9ea9a8]">{role}</small></div></div></div>; }

function AdminPanel({ onStore }: { onStore: () => void }) {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const [active, setActive] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const { data: dashboard } = trpc.dashboard.summary.useQuery(undefined, { enabled: isAuthenticated });
  const { data: liveProducts } = trpc.products.adminList.useQuery(undefined, { enabled: isAuthenticated });
  const { data: liveOrders } = trpc.orders.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: teamMembers } = trpc.team.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: commissionRows } = trpc.commissions.list.useQuery(undefined, { enabled: isAuthenticated });
  const filteredOrders = useMemo(() => filterOrdersForReport(liveOrders ?? [], { dateFrom: orderDateFrom, dateTo: orderDateTo, status: orderStatusFilter }), [liveOrders, orderDateFrom, orderDateTo, orderStatusFilter]);
  const [showAdd, setShowAdd] = useState(false);
  const [showTeamAdd, setShowTeamAdd] = useState(false);
  const [productSku, setProductSku] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCost, setProductCost] = useState("");
  const [productSize, setProductSize] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productStock, setProductStock] = useState("0");
  const [productCategory, setProductCategory] = useState("جديد");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRole, setMemberRole] = useState<"admin" | "employee" | "marketer">("employee");
  const [memberCode, setMemberCode] = useState("");
  const [memberRate, setMemberRate] = useState("5");
  const [memberPermissions, setMemberPermissions] = useState<string[]>(["orders"]);
  const utils = trpc.useUtils();
  const uploadProductImage = trpc.products.uploadImage.useMutation({ onSuccess: result => { setProductImage(result.url); toast.success("تم رفع الصورة"); }, onError: error => toast.error(error.message || "تعذر رفع الصورة") });
  const createProduct = trpc.products.create.useMutation({ onSuccess: () => { toast.success("تمت إضافة المنتج"); setShowAdd(false); setProductSku(""); setProductName(""); setProductPrice(""); setProductCost(""); setProductSize(""); setProductImage(""); setProductStock("0"); utils.products.list.invalidate(); }, onError: error => toast.error(error.message || "تعذر حفظ المنتج") });
  const createMember = trpc.team.create.useMutation({ onSuccess: () => { toast.success("تمت إضافة عضو الفريق"); setShowTeamAdd(false); setMemberName(""); setMemberEmail(""); setMemberPhone(""); setMemberCode(""); setMemberRate("5"); setMemberPermissions(["orders"]); utils.team.list.invalidate(); }, onError: error => toast.error(error.message || "تعذر حفظ عضو الفريق") });
  const markCommissionPaid = trpc.commissions.markPaid.useMutation({ onSuccess: () => { toast.success("تم تسجيل صرف العمولة"); utils.commissions.list.invalidate(); utils.dashboard.summary.invalidate(); }, onError: error => toast.error(error.message || "تعذر صرف العمولة") });
  const stats = [
    { label: t("totalSales"), value: dashboard ? formatPrice(dashboard.revenue) : "—", change: dashboard ? t("actualOrders") : t("loading"), icon: CircleDollarSign, tone: "gold" },
    { label: t("netProfit"), value: dashboard ? formatPrice(dashboard.profit) : "—", change: dashboard ? t("afterExpenses") : t("loading"), icon: TrendingUp, tone: "green" },
    { label: t("pendingOrders"), value: dashboard?.pendingOrders ?? "—", change: dashboard ? t("newAndConfirmed") : t("loading"), icon: ShoppingBag, tone: "peach" },
    { label: t("lowStock"), value: dashboard?.lowStock ?? "—", change: dashboard ? t("needsFollowup") : t("loading"), icon: Box, tone: "blue" },
  ];
  const addProduct = () => {
    if (!productSku || !productName || !productPrice) return toast.error("اكتب الكود والاسم والسعر");
    if (!isAuthenticated) return toast.info("سجّل الدخول كمدير لحفظ المنتجات فعلياً");
    createProduct.mutate({ sku: productSku, name: productName, category: productCategory || "جديد", size: productSize || undefined, sourceType: "local", imageUrl: productImage || undefined, costPrice: Number(productCost || Number(productPrice) * .6), sellingPrice: Number(productPrice), stock: Number(productStock || 0), minStock: 5, isFeatured: 0 });
  };
  const addMember = () => {
    if (!memberName || !memberEmail || !memberCode) return toast.error("اكتب الاسم والبريد وكود الموظف");
    createMember.mutate({ name: memberName, email: memberEmail, phone: memberPhone || undefined, role: memberRole, employeeCode: memberCode, permissions: memberRole === "admin" ? ["products", "orders", "inventory", "commissions", "finance"] : memberPermissions as Array<"products" | "orders" | "inventory" | "commissions" | "finance">, commissionRate: Number(memberRate || 0) });
  };
  const uploadImage = (file?: File) => {
    if (!file) return;
    if (!(["image/jpeg", "image/png", "image/webp"] as string[]).includes(file.type)) return toast.error("اختر صورة JPG أو PNG أو WEBP");
    if (file.size > 4 * 1024 * 1024) return toast.error("حجم الصورة يجب ألا يتجاوز 4 ميجابايت");
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") uploadProductImage.mutate({ dataUrl: reader.result }); };
    reader.readAsDataURL(file);
  };
  return <div className="admin-shell">{mobileNavOpen && <div className="mobile-admin-nav-backdrop" onClick={() => setMobileNavOpen(false)}><aside className="mobile-admin-nav" onClick={event => event.stopPropagation()}><div className="mb-10 flex items-center justify-between"><div className="flex items-center gap-3"><span className="brand-mark">BV</span><strong className="text-lg text-white">BagVora</strong></div><button className="icon-button mobile-admin-close" onClick={() => setMobileNavOpen(false)} aria-label={language === "ar" ? "إغلاق القائمة" : "Close menu"}><X size={18} /></button></div><nav className="space-y-1">{navItems.map(({ key, value, icon: Icon }) => <button key={value} onClick={() => { setActive(value); setMobileNavOpen(false); }} className={`admin-nav-item ${active === value ? "selected" : ""}`}><Icon size={17} />{t(key)}{value === "orders" && <span className="nav-notice">8</span>}</button>)}</nav></aside></div>}<aside className="admin-sidebar"><div className="mb-12 flex items-center gap-3"><span className="brand-mark">BV</span><div><strong className="block text-lg text-white">BagVora</strong><small className="text-[9px] uppercase tracking-[0.22em] text-[#d8a783]">control center</small></div></div><div className="mb-5 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7c8889]">{t("workspace")}</div><nav className="space-y-1">{navItems.map(({ key, value, icon: Icon }) => <button key={value} onClick={() => setActive(value)} className={`admin-nav-item ${active === value ? "selected" : ""}`}><Icon size={17} />{t(key)}{value === "orders" && <span className="nav-notice">8</span>}</button>)}</nav><div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block"><div className="mb-3 flex items-center gap-2 text-xs text-[#b2bfbd]"><ShieldCheck size={15} className="text-[#d8a783]" /> {t("securePermissions")}</div><p className="text-[11px] leading-5 text-[#788688]">{t("secureDescription")}</p></div></aside><div className="admin-main"><header className="admin-topbar"><div className="flex items-center gap-3"><LanguageToggle />{!isAuthenticated && <button onClick={() => startLogin()} className="secondary-button compact">{t("loginAdmin")}</button>}<button className="icon-button admin-mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label={language === "ar" ? "فتح قائمة الإدارة" : "Open admin menu"}><Menu size={18} /><span className="mobile-menu-label">{language === "ar" ? "القائمة" : "Menu"}</span></button><div><p className="text-xs text-[#8b9696]">السبت، 26 سبتمبر 2026</p><h1 className="mt-1 text-xl font-bold text-[#202b2d]">{t(navItems.find(x => x.value === active)?.key ?? "dashboard")}</h1></div></div><div className="flex items-center gap-3">{!isAuthenticated && <button onClick={() => startLogin()} className="secondary-button compact">{t("loginAdmin")}</button>}<button className="icon-button"><Bell size={17} /></button><div className="hidden h-8 w-px bg-[#e7e3de] sm:block" /><div className="flex items-center gap-2"><span className="admin-avatar">{user?.name?.charAt(0) ?? "م"}</span><div className="hidden text-right sm:block"><strong className="block text-xs">{user?.name ?? "محمد السعدني"}</strong><small className="text-[10px] text-[#8b9696]">{t("systemManager")}</small></div><ChevronDown size={14} className="text-[#8b9696]" /></div></div></header><main className="admin-content"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-[#8b9696]">{t("welcomeBack")}</p><h2 className="mt-1 text-2xl font-bold text-[#202b2d]">{t("goodMorning")} <span className="text-[#d49c3f]">✦</span></h2></div><div className="flex gap-2"><button onClick={onStore} className="secondary-button"><ExternalLink size={15} /> {t("viewStore")}</button>{active === "orders" && <button onClick={() => downloadExcelReport("bagvora-orders", buildOrdersExcelHtml(filteredOrders), "تم تنزيل تقرير الطلبات")} className="secondary-button compact"><Download size={14} /> {t("orderReport")}</button>}{active === "inventory" && <button onClick={() => downloadExcelReport("bagvora-inventory", buildInventoryExcelHtml(liveProducts ?? []), "تم تنزيل تقرير المخزون")} className="secondary-button compact"><Download size={14} /> {t("inventoryReport")}</button>}{active === "team" && <button onClick={() => setShowTeamAdd(true)} className="primary-button compact"><Plus size={15} /> {t("addTeam")}</button>}<button onClick={() => setShowAdd(true)} className="primary-button compact"><Plus size={15} /> {t("addProduct")}</button></div></div>{active === "orders" && <div className="report-filter-card"><div><strong>{t("filterOrders")}</strong><small>{t("reportHint")}</small></div><div className="report-filter-fields"><label>{t("fromDate")}<input type="date" value={orderDateFrom} onChange={e => setOrderDateFrom(e.target.value)} /></label><label>{t("toDate")}<input type="date" value={orderDateTo} onChange={e => setOrderDateTo(e.target.value)} /></label><label>{t("orderStatus")}<select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}><option value="all">{t("allStatuses")}</option><option value="new">جديد</option><option value="confirmed">مؤكد</option><option value="shipping">قيد الشحن</option><option value="delivered">تم التسليم</option><option value="cancelled">ملغى</option></select></label><button className="text-button" onClick={() => { setOrderDateFrom(""); setOrderDateTo(""); setOrderStatusFilter("all"); }}>{t("clearFilters")}</button></div><p className="report-filter-count">سيتم تصدير <strong>{filteredOrders.length}</strong> من أصل <strong>{liveOrders?.length ?? 0}</strong> طلب</p></div>}{active === "dashboard" && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, change, icon: Icon, tone }) => <div className="stat-card" key={label}><div className="flex items-start justify-between"><span className={`stat-icon ${tone}`}><Icon size={19} /></span><span className="stat-change">{change}</span></div><p className="mt-6 text-xs text-[#8b9696]">{label}</p><strong className="mt-1 block text-2xl font-bold text-[#202b2d]">{value}</strong></div>)}</div><div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="mini-stat-card"><span>{t("totalSales")}</span><strong>{formatPrice(dashboard?.totalSales ?? 0)}</strong><small>{t("nonCancelled")}</small></div><div className="mini-stat-card"><span>{t("commissions")}</span><strong>{formatPrice(dashboard?.totalCommissions ?? 0)}</strong><small>{t("recordedLedger")}</small></div><div className="mini-stat-card"><span>{t("salesOrders")}</span><strong>{dashboard?.totalCompletedOrders ?? 0}</strong><small>{t("completedOrInProgress")}</small></div></div><PerformancePanel data={dashboard?.memberPerformance} /><div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]"><div className="panel-card"><div className="panel-heading"><div><h3>{t("salesPerformance")}</h3><p>{t("revenueLastMonths")}</p></div><button className="filter-chip">{t("lastSixMonths")} <ChevronDown size={13} /></button></div><div className="chart-wrap"><div className="chart-y"><span>60k</span><span>40k</span><span>20k</span><span>0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 600 220" preserveAspectRatio="none" className="line-chart"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ae785c" stopOpacity=".23" /><stop offset="1" stopColor="#ae785c" stopOpacity="0" /></linearGradient></defs><path d="M0,160 C45,145 65,172 100,125 S160,135 200,92 S270,140 300,98 S365,65 400,90 S450,92 500,48 S545,75 600,24 L600,220 L0,220 Z" fill="url(#fill)" /><path d="M0,160 C45,145 65,172 100,125 S160,135 200,92 S270,140 300,98 S365,65 400,90 S450,92 500,48 S545,75 600,24" fill="none" stroke="#ae785c" strokeWidth="3" /></svg><div className="chart-x"><span>أبريل</span><span>مايو</span><span>يونيو</span><span>يوليو</span><span>أغسطس</span><span>سبتمبر</span></div></div></div></div><div className="panel-card"><div className="panel-heading"><div><h3>{t("productSources")}</h3><p>{t("assortmentDistribution")}</p></div><BarChart3 size={18} className="text-[#8b9696]" /></div><div className="donut-wrap"><div className="donut"><div><strong>124</strong><small>منتج</small></div></div><div className="legend"><span><i className="dot clay" />صناعة يدوية <b>38%</b></span><span><i className="dot dark" />من الصين <b>31%</b></span><span><i className="dot gold" />السوق المحلي <b>24%</b></span><span><i className="dot pale" />دروبشيبنج <b>7%</b></span></div></div></div></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><div className="panel-card"><div className="panel-heading"><div><h3>{t("latestOrders")}</h3><p>{t("followLatestOrders")}</p></div><button className="text-button" onClick={() => setActive("orders")}>{t("viewAll")} <ArrowLeft size={14} /></button></div><OrdersTable orders={liveOrders} /></div><div className="panel-card"><div className="panel-heading"><div><h3>{t("topMarketers")}</h3><p>{t("byThisMonthSales")}</p></div><Users size={18} className="text-[#8b9696]" /></div><div className="leader-list">{dashboard?.memberPerformance?.length ? dashboard.memberPerformance.slice(0, 3).map((member: any, index: number) => <Leader key={member.employeeCode} name={member.name} code={member.employeeCode} value={Number(member.sales).toLocaleString("ar-EG")} rank={String(index + 1).padStart(2, "0")} />) : <div className="empty-state"><strong>{t("noReferrals")}</strong><small>{t("referralsHint")}</small></div>}</div></div></div></>}{active !== "dashboard" && <AdminSection active={active} products={liveProducts} teamMembers={teamMembers} commissions={commissionRows} onAdd={() => setShowAdd(true)} onAddTeam={() => setShowTeamAdd(true)} onMarkCommissionPaid={(id) => markCommissionPaid.mutate({ id })} />}</main></div>{showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><div className="modal-card" onClick={e => e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">منتج جديد</p><h3 className="mt-1 text-xl font-bold">أضف قطعة للتشكيلة</h3></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={16} /></button></div><div className="grid gap-3 sm:grid-cols-2"><label>{t("productCode")}<input value={productSku} onChange={e => setProductSku(e.target.value)} placeholder="BV-001" /></label><label>{t("productName")}<input value={productName} onChange={e => setProductName(e.target.value)} placeholder="مثال: حقيبة كتف جلد" /></label><label>{t("category")}<input value={productCategory} onChange={e => setProductCategory(e.target.value)} placeholder="جلود" /></label><label>{t("size")}<input value={productSize} onChange={e => setProductSize(e.target.value)} placeholder="صغير / متوسط / كبير" /></label><label>{t("sellingPrice")}<input type="number" min="0" value={productPrice} onChange={e => setProductPrice(e.target.value)} placeholder="0.00" /></label><label>{t("costPrice")}<input type="number" min="0" value={productCost} onChange={e => setProductCost(e.target.value)} placeholder="تلقائية إن تُرك فارغاً" /></label><label>{t("stock")}<input type="number" min="0" value={productStock} onChange={e => setProductStock(e.target.value)} placeholder="0" /></label><label>{t("imageUpload")}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => uploadImage(e.target.files?.[0])} disabled={uploadProductImage.isPending} />{uploadProductImage.isPending && <small>جارٍ رفع الصورة...</small>}</label><label>{t("imageUrl")} (optional)<input type="url" value={productImage} onChange={e => setProductImage(e.target.value)} placeholder={language === "ar" ? "https://... أو رابط التخزين" : "https://... or storage URL"} /></label></div><div className="mt-5 flex justify-end gap-2"><button className="secondary-button" onClick={() => setShowAdd(false)}>إلغاء</button><button className="primary-button compact" onClick={addProduct}>حفظ المنتج</button></div></div></div>}{showTeamAdd && <div className="modal-backdrop" onClick={() => setShowTeamAdd(false)}><div className="modal-card" onClick={e => e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">عضو فريق جديد</p><h3 className="mt-1 text-xl font-bold">إضافة موظف أو مسوّق</h3></div><button className="icon-button" onClick={() => setShowTeamAdd(false)}><X size={16} /></button></div><div className="grid gap-3 sm:grid-cols-2"><label>{t("name")}<input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="الاسم بالكامل" /></label><label>{t("email")}<input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="name@example.com" /></label><label>{t("phone")}<input value={memberPhone} onChange={e => setMemberPhone(e.target.value)} placeholder="010..." /></label><label>{t("employeeCode")}<input value={memberCode} onChange={e => setMemberCode(e.target.value)} placeholder="MK-1001" /></label><label>{t("role")}<select value={memberRole} onChange={e => setMemberRole(e.target.value as typeof memberRole)}><option value="employee">موظف</option><option value="marketer">مسوّق</option><option value="admin">مدير</option></select></label><label>{t("commissionRate")}<input type="number" min="0" step="0.01" value={memberRate} onChange={e => setMemberRate(e.target.value)} /></label></div><div className="mt-4 rounded-xl bg-[#f7f3ee] p-4"><strong className="text-sm">{t("permissions")}</strong><div className="mt-3 grid gap-2 sm:grid-cols-3">{[["products", "المنتجات"], ["orders", "الطلبات"], ["inventory", "المخزون"], ["commissions", "العمولات"], ["finance", "المحاسبة"]].map(([key, label]) => <label key={key} className="flex flex-row-reverse items-center justify-end gap-2 text-xs"><input type="checkbox" checked={memberRole === "admin" || memberPermissions.includes(key)} disabled={memberRole === "admin"} onChange={() => setMemberPermissions(items => items.includes(key) ? items.filter(item => item !== key) : [...items, key])} />{label}</label>)}</div><small className="mt-2 block text-[#8b9696]">المدير يحصل على جميع الصلاحيات تلقائياً.</small></div><div className="mt-5 flex justify-end gap-2"><button className="secondary-button" onClick={() => setShowTeamAdd(false)}>إلغاء</button><button className="primary-button compact" disabled={createMember.isPending} onClick={addMember}>{createMember.isPending ? "جارٍ الحفظ..." : "حفظ العضو"}</button></div></div></div>}</div>;
}

function AdminSection({ active, products, teamMembers, commissions, onAdd, onAddTeam, onMarkCommissionPaid }: { active: string; products?: any[]; teamMembers?: any[]; commissions?: any[]; onAdd: () => void; onAddTeam: () => void; onMarkCommissionPaid: (id: number) => void }) {
  const { t } = useLanguage();
  const messages: Record<string, { title: string; desc: string; icon: any }> = { products: { title: "كتالوج المنتجات", desc: "إدارة الأسعار، المصادر، الصور وحالة المخزون.", icon: Package }, orders: { title: "مركز الطلبات", desc: "متابعة الطلبات من التأكيد حتى التسليم.", icon: ClipboardList }, team: { title: "الفريق والمسوقون", desc: "بيانات الموظفين، أكواد الإحالة ونسب العمولات.", icon: Users }, inventory: { title: "المخزون والحركة", desc: "استقبال وصرف وتسويات من كل المصادر.", icon: Box }, commissions: { title: "العمولات والإحالات", desc: "احسب عمولة كل مسوق حسب القطع والمبيعات الشهرية.", icon: Percent }, finance: { title: "المحاسبة والربحية", desc: "رأس المال، التكاليف، الرواتب، الأرباح والخسائر.", icon: Wallet }, settings: { title: "إعدادات المنصة", desc: "إدارة النسب والصلاحيات وسجل التغييرات.", icon: Settings2 } }; const data = messages[active] ?? messages.products; const Icon = data.icon; return <div className="panel-card min-h-[520px]"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eee9e3] pb-5"><div className="flex items-center gap-3"><span className="section-icon"><Icon size={20} /></span><div><h3 className="text-xl font-bold">{data.title}</h3><p className="mt-1 text-sm text-[#8b9696]">{data.desc}</p></div></div>{active === "products" && <button onClick={onAdd} className="primary-button compact"><Plus size={15} /> {t("addProduct")}</button>}{active === "finance" && <button onClick={() => toast.info("تصدير ملف Excel متاح بعد ربط Google Sheets") } className="secondary-button"><ExternalLink size={15} /> تصدير البيانات</button>}</div>{active === "products" ? <div className="mt-5 overflow-x-auto"><table className="data-table"><thead><tr><th>المنتج</th><th>الكود/المقاس</th><th>المصدر</th><th>سعر البيع</th><th>المخزون</th><th>الحالة</th></tr></thead><tbody>{(products?.length ? products : demoProducts).map((p: any) => <tr key={p.id}><td><div className="flex items-center gap-3"><img src={p.imageUrl ?? storage.canvas} className="h-10 w-10 rounded-lg object-cover" /><div><strong>{p.name}</strong><small>{p.sku}</small></div></div></td><td>{p.sku}<small>{p.size || "بدون مقاس"}</small></td><td>{p.sourceType === "handmade" ? "صناعة يدوية" : p.sourceType === "china" ? "الصين" : "محلي"}</td><td className="font-semibold text-[#ae785c]">{formatPrice(p.sellingPrice)}</td><td><span className={p.stock <= p.minStock ? "text-red-500" : ""}>{p.stock}</span> قطعة</td><td><span className="status-pill success">نشط</span></td></tr>)}</tbody></table></div> : active === "team" ? <TeamTable members={teamMembers} onAdd={onAddTeam} /> : active === "commissions" ? <CommissionTable rows={commissions} onMarkPaid={onMarkCommissionPaid} /> : <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">{["إعدادات النسب محفوظة مركزياً", "سجل تغييرات كامل لكل تعديل", "تصدير CSV / Excel جاهز", "صلاحيات المدير والموظف منفصلة", "ربط إحالات السوشيال", "دروبشيبنج قابل للتفعيل"].map((item, i) => <div className="feature-tile" key={item}><span>{String(i + 1).padStart(2, "0")}</span><strong>{item}</strong><small>متاح ضمن النسخة الأساسية</small></div>)}</div>}</div>;
}

function CommissionTable({ rows, onMarkPaid }: { rows?: any[]; onMarkPaid: (id: number) => void }) {
  const { t, language } = useLanguage();
  const statusLabel: Record<string, string> = { pending: t("new"), approved: language === "ar" ? "معتمدة" : "Approved", paid: language === "ar" ? "مدفوعة" : "Paid" };
  return <div className="mt-5 overflow-x-auto"><table className="data-table"><thead><tr><th>{t("employeeCode")}</th><th>{t("orderReport")}</th><th>{t("totalSales")}</th><th>{t("commissions")}</th><th>{t("createdAt")}</th><th>{t("orderStatus")}</th><th>{t("settings")}</th></tr></thead><tbody>{rows?.length ? rows.map((row: any) => <tr key={row.id}><td>{row.memberId}</td><td>{row.orderId ?? "—"}</td><td>{formatPrice(row.saleAmount, language)}</td><td className="font-semibold text-[#ae785c]">{formatPrice(row.commissionAmount, language)}</td><td>{row.period}</td><td><span className={`status-pill ${row.status === "paid" ? "success" : row.status === "approved" ? "info" : "warning"}`}>{statusLabel[row.status] ?? row.status}</span></td><td>{row.status === "approved" ? <button className="secondary-button compact" onClick={() => onMarkPaid(row.id)}>{language === "ar" ? "تسجيل الصرف" : "Mark paid"}</button> : <span className="text-xs text-[#8b9696]">{row.status === "paid" ? (language === "ar" ? "تم الصرف" : "Paid") : "—"}</span>}</td></tr>) : <tr><td colSpan={7}><div className="empty-state">{language === "ar" ? "لا توجد عمولات مسجلة بعد" : "No commissions recorded yet"}</div></td></tr>}</tbody></table></div>;
}

function TeamTable({ members, onAdd }: { members?: any[]; onAdd: () => void }) { const rows = members ?? []; const permissionLabels: Record<string, string> = { products: "منتجات", orders: "طلبات", inventory: "مخزون", commissions: "عمولات", finance: "محاسبة" }; return <div className="mt-5"><div className="mb-4 flex justify-end"><button onClick={onAdd} className="primary-button compact"><Plus size={15} /> إضافة عضو</button></div>{rows.length ? <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>الاسم</th><th>التواصل</th><th>الدور</th><th>الكود</th><th>الصلاحيات</th><th>العمولة</th><th>الحالة</th></tr></thead><tbody>{rows.map((m: any) => { let permissions: string[] = []; try { permissions = m.permissions ? JSON.parse(m.permissions) : []; } catch { permissions = []; } return <tr key={m.id}><td><strong>{m.name}</strong></td><td>{m.email}<small>{m.phone || "بدون هاتف"}</small></td><td>{m.role === "marketer" ? "مسوّق" : m.role === "admin" ? "مدير" : "موظف"}</td><td>{m.employeeCode}</td><td><small>{m.role === "admin" ? "كل الصلاحيات" : permissions.map(p => permissionLabels[p] ?? p).join("، ") || "لا توجد"}</small></td><td>{m.commissionRate}%</td><td><span className="status-pill success">{m.status === "active" ? "نشط" : "غير نشط"}</span></td></tr>})}</tbody></table></div> : <div className="feature-tile"><strong>لا يوجد أعضاء مسجلون بعد</strong><small>أضف الموظفين والمسوقين من الزر أعلاه.</small></div>}</div>; }
function OrdersTable({ orders }: { orders?: any[] }) { const rows = orders?.length ? orders.slice(0, 4) : [{ orderNumber: "BV-48291", customerName: "سارة محمود", total: "1,838", status: "shipping" }, { orderNumber: "BV-48290", customerName: "نورهان علي", total: "649", status: "delivered" }, { orderNumber: "BV-48287", customerName: "مريم عادل", total: "1,129", status: "new" }, { orderNumber: "BV-48284", customerName: "أحمد سالم", total: "329", status: "confirmed" }]; return <div className="mt-5 overflow-x-auto"><table className="data-table"><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>{rows.map((r: any) => <tr key={r.orderNumber}><td className="font-semibold">{r.orderNumber}</td><td>{r.customerName}</td><td>{formatPrice(r.total)}</td><td><span className={`status-pill ${r.status === "delivered" ? "success" : r.status === "shipping" ? "info" : "warning"}`}>{r.status === "delivered" ? "تم التسليم" : r.status === "shipping" ? "قيد الشحن" : r.status === "confirmed" ? "مؤكد" : "جديد"}</span></td></tr>)}</tbody></table></div>; }
function Leader({ name, code, value, rank }: { name: string; code: string; value: string; rank: string }) { return <div className="leader-row"><span className="rank">{rank}</span><span className="leader-avatar">{name.charAt(0)}</span><div className="flex-1"><strong className="block text-sm">{name}</strong><small className="text-[10px] text-[#8b9696]">{code}</small></div><strong className="text-sm text-[#ae785c]">{value} ج.م</strong></div>; }

function downloadPerformanceExcel(rows: Array<{ name: string; employeeCode: string; role: string; sales: number; commissions: number; orders: number }>) {
  const blob = new Blob(["\ufeff", buildPerformanceExcelHtml(rows)], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `bagvora-performance-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  toast.success("تم تنزيل تقرير Excel");
}

function downloadExcelReport(filename: string, html: string, successMessage: string) {
  const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  toast.success(successMessage);
}

function PerformancePanel({ data }: { data?: Array<{ name: string; employeeCode: string; role: string; sales: number; commissions: number; orders: number }> }) {
  const { t } = useLanguage();
  const rows = data ?? [];
  return <div className="panel-card mt-5"><div className="panel-heading"><div><h3>إحصائيات الأداء</h3><p>{t("totalSales")} و{t("commissions")} حسب الموظف</p></div><div className="flex items-center gap-2"><button className="secondary-button compact" onClick={() => downloadPerformanceExcel(rows)}><Download size={14} /> تصدير Excel</button><CircleDollarSign size={18} className="text-[#ae785c]" /></div></div>{rows.length ? <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>الموظف / المسوّق</th><th>الدور</th><th>الطلبات</th><th>المبيعات</th><th>العمولة</th></tr></thead><tbody>{rows.map(row => <tr key={row.employeeCode}><td><strong>{row.name}</strong><small>{row.employeeCode}</small></td><td>{row.role === "marketer" ? "مسوّق" : row.role === "admin" ? "مدير" : "موظف"}</td><td>{row.orders}</td><td className="font-semibold">{formatPrice(row.sales)}</td><td className="font-semibold text-[#ae785c]">{formatPrice(row.commissions)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>لا توجد مبيعات إحالة مسجلة بعد</strong><small>ستظهر نتائج كل موظف أو مسوّق هنا بعد ربط الطلبات بكود الإحالة.</small></div>}</div>;
}

export default function Home() { const [view, setView] = useState<"store" | "admin">(() => new URLSearchParams(window.location.search).get("admin") === "1" ? "admin" : "store"); const openAdmin = () => { window.history.pushState({}, "", "?admin=1"); setView("admin"); }; const openStore = () => { window.history.pushState({}, "", "/"); setView("store"); }; return view === "store" ? <Storefront onAdmin={openAdmin} /> : <AdminPanel onStore={openStore} />; }
