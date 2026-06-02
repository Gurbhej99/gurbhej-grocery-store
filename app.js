// Main Application Controller - Gurbhej Grocery Store
// Connects UI events, translations, bidirectional billing, Khatabook ledgers, and dynamic SVG graphics.

import TRANSLATIONS from "./translation.js";
import DB from "./db.js";

// ==========================================
// LIGHTWEIGHT LOCAL TRANSLITERATION ENGINE
// ==========================================
// Syllable/dictionary-based English to Hindi/Punjabi mapping. Requires zero paid APIs.

const GROCERY_TRANSLIT_DICT = {
  "sugar": ["चीनी", "ਖੰਡ"],
  "atta": ["आटा", "ਆਟਾ"],
  "rice": ["चावल", "ਚੌਲ"],
  "oil": ["सरसों का तेल", "ਸਰ੍ਹੋਂ ਦਾ ਤੇਲ"],
  "dal": ["दाल", "ਦਾਲ"],
  "tea": ["चाय", "ਚਾਹ"],
  "salt": ["नमक", "ਨਮਕ"],
  "soap": ["साबुन", "ਸਾਬਣ"],
  "milk": ["दूध", "ਦੁੱਧ"],
  "ghee": ["घी", "ਘਿਓ"],
  "butter": ["मक्खन", "ਮੱਖਣ"],
  "bhujia": ["भुजिया", "ਭੁਜੀਆ"],
  "paneer": ["पनीर", "ਪਨੀਰ"],
  "flour": ["आटा", "ਆਟਾ"],
  "biscuit": ["बिस्कुट", "ਬਿਸਕੁਟ"],
  "chips": ["चिप्स", "ਚਿਪਸ"],
  "bread": ["ब्रेड", "ਬ੍ਰੈਡ"],
  "onion": ["प्याज़", "ਪਿਆਜ਼"],
  "potato": ["आलू", "ਆਲੂ"],
  "tomato": ["टमाटर", "ਟਮਾਟਰ"],
  "garlic": ["लहसुन", "ਲਸਣ"],
  "ginger": ["अदरक", "ਅਦਰਕ"],
  "store": ["स्टोर", "ਸਟੋਰ"],
  "gurbhej": ["गुरभेज", "ਗੁਰਭੇਜ"]
};

const PHONETIC_MAP = {
  hi: {
    consonants: {
      bh: "भ", ch: "च", chh: "छ", dh: "ध", gh: "घ", jh: "झ", kh: "ख", ph: "फ", sh: "श", th: "थ",
      b: "ब", c: "क", d: "द", f: "फ", g: "ग", h: "ह", j: "ज", k: "क", l: "ल", m: "म", n: "न",
      p: "प", r: "र", s: "स", t: "त", v: "व", w: "व", y: "य", z: "ज़"
    },
    vowels: {
      aa: "ा", ee: "ी", oo: "ू", ai: "ै", au: "ौ", ae: "े",
      a: "ा", e: "े", i: "ि", o: "ो", u: "ु"
    },
    indepVowels: {
      a: "अ", aa: "आ", i: "इ", ee: "ई", u: "उ", oo: "ऊ", e: "ए", o: "ओ"
    }
  },
  pa: {
    consonants: {
      bh: "ਭ", ch: "ਚ", chh: "ਛ", dh: "ਧ", gh: "ਘ", jh: "ਝ", kh: "ਖ", ph: "ਫ", sh: "ਸ਼", th: "ਥ",
      b: "ਬ", c: "ਕ", d: "ਦ", f: "ਫ", g: "ਗ", h: "ਹ", j: "ਜ", k: "ਕ", l: "ਲ", m: "ਮ", n: "ਨ",
      p: "ਪ", r: "ਰ", s: "ਸ", t: "ਤ", v: "ਵ", w: "ਵ", y: "ਯ", z: "ਜ਼"
    },
    vowels: {
      aa: "ਾ", ee: "ੀ", oo: "ੂ", ai: "ੈ", au: "ੌ", ae: "ੇ",
      a: "ਾ", e: "ੇ", i: "ਿ", o: "ੋ", u: "ੁ"
    },
    indepVowels: {
      a: "ਅ", aa: "ਆ", i: "ਇ", ee: "ਈ", u: "ਉ", oo: "ਊ", e: "ਏ", o: "ਓ"
    }
  }
};

function transliterateEnglishWord(word, lang) {
  const clean = word.trim().toLowerCase();
  if (!clean) return "";
  if (GROCERY_TRANSLIT_DICT[clean]) {
    return lang === "hi" ? GROCERY_TRANSLIT_DICT[clean][0] : GROCERY_TRANSLIT_DICT[clean][1];
  }

  const rules = PHONETIC_MAP[lang];
  let result = "";
  let i = 0;

  while (i < clean.length) {
    const char = clean[i];
    const next = clean[i + 1] || "";
    const double = char + next;

    if (rules.consonants[double]) {
      result += rules.consonants[double];
      i += 2;
      const nextVowel = clean[i] || "";
      const nextNextVowel = clean[i + 1] || "";
      const doubleV = nextVowel + nextNextVowel;
      if (rules.vowels[doubleV]) {
        result += rules.vowels[doubleV];
        i += 2;
      } else if (rules.vowels[nextVowel]) {
        result += rules.vowels[nextVowel];
        i += 1;
      }
    } else if (rules.consonants[char]) {
      result += rules.consonants[char];
      i += 1;
      const nextVowel = clean[i] || "";
      const nextNextVowel = clean[i + 1] || "";
      const doubleV = nextVowel + nextNextVowel;
      if (rules.vowels[doubleV]) {
        result += rules.vowels[doubleV];
        i += 2;
      } else if (rules.vowels[nextVowel]) {
        result += rules.vowels[nextVowel];
        i += 1;
      }
    } else {
      if (rules.indepVowels[double]) {
        result += rules.indepVowels[double];
        i += 2;
      } else if (rules.indepVowels[char]) {
        result += rules.indepVowels[char];
        i += 1;
      } else {
        result += char;
        i += 1;
      }
    }
  }
  return result;
}

function transliterateText(text, lang) {
  if (!text) return "";
  return text
    .split(/\s+/)
    .map(w => transliterateEnglishWord(w, lang))
    .join(" ");
}

function getShopProfile() {
  const settings = DB.getSettings();
  
  const shopName = settings.shopName && settings.shopName.trim() ? settings.shopName.trim() : "Update shop profile in Settings";
  const shopTagline = settings.shopTagline && settings.shopTagline.trim() ? settings.shopTagline.trim() : "";
  
  const addressVal = settings.shopAddress ? settings.shopAddress.trim() : "";
  const shopAddress = (addressVal && addressVal !== "Main Bazaar, Gurdaspur, Punjab, India" && addressVal !== "Main Bazaar, Gurdaspur, Punjab") ? addressVal : "Update shop profile in Settings";
  
  const phoneVal = settings.shopPhone ? settings.shopPhone.trim() : "";
  const shopPhone = (phoneVal && phoneVal !== "9876543210") ? phoneVal : "Update shop profile in Settings";
  
  return {
    shopName,
    shopTagline,
    shopAddress,
    shopPhone
  };
}

// Unified Helper to clean and format multilingual product names in a single line
function formatProductName(product) {
  if (!product) return "";
  
  let enName = product.name || "";
  if (enName.includes(" (")) {
    enName = enName.split(" (")[0];
  }
  enName = enName.trim();

  let hiName = product.nameHi || "";
  if (!hiName || hiName === enName) {
    hiName = transliterateText(enName, "hi");
  }
  hiName = hiName.trim();

  let paName = product.namePa || "";
  if (!paName || paName === enName) {
    paName = transliterateText(enName, "pa");
  }
  paName = paName.trim();

  const hasTranslations = (hiName && hiName !== enName) || (paName && paName !== enName);

  if (hasTranslations) {
    if (hiName === paName) {
      return `${enName} (${hiName})`;
    }
    return `${enName} (${hiName} / ${paName})`;
  }

  return enName;
}

// Global App State
const state = {
  activePage: "dashboard",
  activeLang: localStorage.getItem("gurbhej_lang") || "en",
  cart: [], // Array of { id, name, rate, unit, qty, amount }
  selectedBillingCustomerId: "",
  selectedKhatabookCustomerId: "",
  currentInvoice: null, // Holds the invoice currently in the modal viewer
  reportsSortOrder: "desc", // Default newest first
  firebaseEnabled: false
};

// ==========================================
// INITIALIZATION AND ROUTING
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  // Show success toast notifications after PWA redirects/reloads
  if (sessionStorage.getItem("pwa_restore_success") === "true") {
    sessionStorage.removeItem("pwa_restore_success");
    showToast("Database successfully restored from backup!", "success");
  }
  if (sessionStorage.getItem("pwa_reset_success") === "true") {
    sessionStorage.removeItem("pwa_reset_success");
    showToast("Local database wiped & cleanly reset!", "success");
  }

  // Register PWA Service Worker for offline support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
      .then(reg => console.log("[Service Worker] Registered successfully:", reg.scope))
      .catch(err => console.error("[Service Worker] Registration failed:", err));
  }

  // Initialize Database Engine
  showToast("Initializing database...", "info");
  await DB.init(async () => {
    // Database sync callback (fired when Firebase cloud sync triggers an update)
    updateCloudStatusIndicator();
    populateCategoryDropdowns();
    renderActivePage();
    checkFirstTimeProfile();
  });

  state.firebaseEnabled = DB.isFirebaseEnabled();
  updateCloudStatusIndicator();

  // Setup Language UI
  setLanguage(state.activeLang);

  // Populate category dropdowns on load
  populateCategoryDropdowns();

  // Bind Header Language Buttons
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const lang = e.target.dataset.lang;
      setLanguage(lang);
    });
  });

  // Bind Sidebar Page Buttons
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const button = e.currentTarget;
      const page = button.dataset.page;
      switchPage(page);
    });
  });

  // Bind Mobile Bottom Nav Page Buttons
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    if (link.id === "mobile-nav-more-btn") return; // More button handled separately
    link.addEventListener("click", (e) => {
      const button = e.currentTarget;
      const page = button.dataset.page;
      switchPage(page);
    });
  });

  // Bind Hamburger / More popover items
  document.querySelectorAll(".mobile-more-item").forEach(link => {
    link.addEventListener("click", (e) => {
      const button = e.currentTarget;
      const page = button.dataset.page;
      switchPage(page);
      document.getElementById("mobile-more-popover").style.display = "none";
    });
  });

  // Bind More button toggling
  const moreBtn = document.getElementById("mobile-nav-more-btn");
  const morePopover = document.getElementById("mobile-more-popover");
  const closePopover = document.getElementById("btn-close-more-popover");

  if (moreBtn && morePopover) {
    moreBtn.addEventListener("click", () => {
      morePopover.style.display = "flex";
    });
  }

  if (closePopover && morePopover) {
    closePopover.addEventListener("click", () => {
      morePopover.style.display = "none";
    });
    // Click outside popover card closes it
    morePopover.addEventListener("click", (e) => {
      if (e.target === morePopover) {
        morePopover.style.display = "none";
      }
    });
  }

  // Setup Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "F2" || (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {
      e.preventDefault();
      switchPage("billing");
      const searchBox = document.getElementById("billing-product-search");
      if (searchBox) searchBox.focus();
    }
  });

  // Bind Modals Close Buttons
  document.querySelectorAll(".btn-close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
      closeAllModals();
    });
  });

  // Register all feature event listeners
  setupBillingEventListeners();
  setupProductEventListeners();
  setupCategoryEventListeners();
  setupKhatabookEventListeners();
  setupReportsEventListeners();
  setupSettingsEventListeners();
  setupCustomersEventListeners();
  setupExpensesEventListeners();
  setupProfileSetupEventListeners();

  // Draw initial page
  renderActivePage();
  checkFirstTimeProfile();
  
  showToast("Ready / ਤਿਆਰ / तैयार", "success");
});

// Routing switcher
function switchPage(pageId) {
  state.activePage = pageId;
  
  // Update sidebar active highlights
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.dataset.page === pageId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Update mobile bottom nav highlights
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    if (link.dataset.page === pageId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Highlight 'More' button if active page is inside its popover drawer
  const moreBtn = document.getElementById("mobile-nav-more-btn");
  if (moreBtn) {
    if (["categories", "khatabook", "settings", "customers", "expenses"].includes(pageId)) {
      moreBtn.classList.add("active");
    } else {
      moreBtn.classList.remove("active");
    }
  }

  // Switch display panel
  document.querySelectorAll(".page-view").forEach(view => {
    if (view.id === `${pageId}-view`) {
      view.classList.add("active");
    } else {
      view.classList.remove("active");
    }
  });

  // Update header text based on page
  const titleEl = document.getElementById("page-header-title");
  const subtitleEl = document.getElementById("page-header-subtitle");
  
  titleEl.textContent = getTranslation(pageId);
  
  // Set professional subtitles for each tab
  const subtitles = {
    dashboard: "Store Overview, Today's Sales & Metrics",
    billing: "Super Fast Invoice Billing Calculator (Press F2)",
    products: "Manage Store Inventory Catalog & Selling Rates",
    categories: "Manage Store Inventory Categories & Multilingual Names",
    khatabook: "Udhaar Ledger Tracker & GPay Payment Receipts",
    reports: "Interactive Daily/Monthly Sales Analytical Statements",
    settings: "Shop Information Details & Firebase Real-time Sync",
    customers: "CRM Customer Profile Database & Statistics",
    expenses: "Daily Expenses Tracker, Form CRUD Actions & Profit Analytics"
  };
  subtitleEl.textContent = subtitles[pageId];

  // Refresh page specific views
  renderActivePage();
}

function renderActivePage() {
  switch (state.activePage) {
    case "dashboard":
      renderDashboard();
      break;
    case "billing":
      renderBilling();
      break;
    case "products":
      renderProducts();
      break;
    case "categories":
      renderCategories();
      break;
    case "khatabook":
      renderKhatabook();
      break;
    case "reports":
      renderReports();
      break;
    case "settings":
      renderSettings();
      break;
    case "customers":
      renderCustomers();
      break;
    case "expenses":
      renderExpenses();
      break;
  }
}

// ==========================================
// TRANSLATION SYSTEM
// ==========================================
function setLanguage(lang) {
  state.activeLang = lang;
  localStorage.setItem("gurbhej_lang", lang);

  // Update header active selector buttons
  document.querySelectorAll(".lang-btn").forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Translate all DOM elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = getTranslation(key);
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = getTranslation(key);
  });

  // Translate headers if page is active
  const titleEl = document.getElementById("page-header-title");
  if (titleEl) {
    titleEl.textContent = getTranslation(state.activePage);
  }

  // Refresh active page to instantly translate dynamic lists
  renderActivePage();
}

function getTranslation(key) {
  const dict = TRANSLATIONS[state.activeLang] || TRANSLATIONS["en"];
  return dict[key] || TRANSLATIONS["en"][key] || key;
}

// ==========================================
// SYSTEM METRICS & DASHBOARD
// ==========================================
function renderDashboard() {
  const invoices = DB.getInvoices();
  const customers = DB.getCustomers();
  const products = DB.getProducts();
  const expenses = DB.getExpenses();

  // Get current date string in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate Metrics
  let todaySales = 0;
  let cashSales = 0;
  let creditSales = 0;
  let pendingUdhaar = 0;
  let todayExpenses = 0;
  let monthlyExpenses = 0;

  // Filter invoices for today
  const todayInvs = invoices.filter(inv => inv.date === todayStr);
  todayInvs.forEach(inv => {
    todaySales += inv.total;
    if (inv.paymentMode === "cash") {
      cashSales += inv.total;
    } else if (inv.paymentMode === "udhaar") {
      creditSales += inv.total;
    }
  });

  // Calculate net pending outstanding udhaar balances
  customers.forEach(c => {
    pendingUdhaar += c.pendingBalance || 0;
  });

  // Tally expenses for today and current month
  expenses.forEach(e => {
    const eDate = new Date(e.date);
    const amount = parseFloat(e.amount || 0);
    
    if (e.date === todayStr) {
      todayExpenses += amount;
    }
    
    if (eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear) {
      monthlyExpenses += amount;
    }
  });

  // Calculate Net Profit (Total Sales - Total Expenses)
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const netProfit = totalSales - totalExpenses;

  // Render values to DOM
  document.getElementById("stat-today-sales").textContent = `₹${todaySales.toLocaleString("en-IN")}`;
  document.getElementById("stat-cash-sales").textContent = `₹${cashSales.toLocaleString("en-IN")}`;
  document.getElementById("stat-credit-sales").textContent = `₹${creditSales.toLocaleString("en-IN")}`;
  document.getElementById("stat-pending-udhaar").textContent = `₹${pendingUdhaar.toLocaleString("en-IN")}`;
  document.getElementById("stat-total-customers").textContent = customers.length;
  document.getElementById("stat-total-products").textContent = products.length;

  const todayExpEl = document.getElementById("stat-today-expenses");
  if (todayExpEl) todayExpEl.textContent = `₹${todayExpenses.toLocaleString("en-IN")}`;

  const monthlyExpEl = document.getElementById("stat-monthly-expenses");
  if (monthlyExpEl) monthlyExpEl.textContent = `₹${monthlyExpenses.toLocaleString("en-IN")}`;

  const netProfitEl = document.getElementById("stat-net-profit");
  if (netProfitEl) {
    netProfitEl.textContent = `₹${netProfit.toLocaleString("en-IN")}`;
    if (netProfit < 0) {
      netProfitEl.className = "stat-value danger";
    } else {
      netProfitEl.className = "stat-value success";
    }
  }

  // Draw pure SVG Charts
  drawWeeklySalesChart(invoices);
  drawTopProductsTally(invoices);
}

// Draw pure SVG weekly trend line graph
function drawWeeklySalesChart(invoices) {
  const chartSvg = document.getElementById("dashboard-trend-chart");
  if (!chartSvg) return;

  // Clear SVG except definitions
  const defs = chartSvg.querySelector("defs");
  chartSvg.innerHTML = "";
  if (defs) chartSvg.appendChild(defs);

  // Generate date labels for past 7 days
  const dataPoints = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // Tally sales for this date
    let salesTotal = 0;
    invoices.forEach(inv => {
      if (inv.date === dateStr) salesTotal += inv.total;
    });

    const dayName = d.toLocaleDateString(state.activeLang === "en" ? "en-US" : (state.activeLang === "hi" ? "hi-IN" : "pa-IN"), { weekday: 'short' });
    dataPoints.push({ label: dayName, value: salesTotal });
  }

  const totalSales = dataPoints.reduce((sum, p) => sum + p.value, 0);
  const parent = chartSvg.parentNode;
  const existing = parent.querySelector(".chart-empty-state");
  if (existing) existing.remove();

  if (totalSales === 0) {
    chartSvg.style.display = "none";
    const placeholder = document.createElement("div");
    placeholder.className = "chart-empty-state";
    placeholder.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; height: 180px; color: var(--text-muted); font-size: 0.95rem; font-weight: 500; text-align: center; width: 100%;";
    placeholder.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="40" height="40" style="margin-bottom: 8px; stroke-width: 1.5; color: var(--border);">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <span data-i18n="noSalesData">${getTranslation("noSalesData") || "No sales data available"}</span>
    `;
    parent.appendChild(placeholder);
    return;
  } else {
    chartSvg.style.display = "block";
  }

  // Chart coordinates
  const width = 500;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;
  const plotWidth = width - (paddingX * 2);
  const plotHeight = height - (paddingY * 2);

  // Find max value for scale
  const maxVal = Math.max(...dataPoints.map(p => p.value), 1000); // at least ₹1000 scale
  const scaleY = plotHeight / maxVal;
  const stepX = plotWidth / 6;

  // Grid Lines
  for (let i = 0; i <= 4; i++) {
    const yVal = maxVal * (i / 4);
    const yCoord = height - paddingY - (yVal * scaleY);
    
    const line = createSVGElement("line", {
      x1: paddingX,
      y1: yCoord,
      x2: width - paddingX,
      y2: yCoord,
      class: "chart-grid-line"
    });
    chartSvg.appendChild(line);

    // Text labels
    const text = createSVGElement("text", {
      x: paddingX - 8,
      y: yCoord + 4,
      "text-anchor": "end",
      class: "chart-text"
    });
    text.textContent = `₹${Math.round(yVal)}`;
    chartSvg.appendChild(text);
  }

  // Draw line coordinates
  let pathD = "";
  let areaD = `M ${paddingX} ${height - paddingY}`;
  const points = [];

  dataPoints.forEach((p, idx) => {
    const x = paddingX + (idx * stepX);
    const y = height - paddingY - (p.value * scaleY);
    points.push({ x, y, val: p.value });

    if (idx === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
    areaD += ` L ${x} ${y}`;

    // X Axis Labels
    const labelText = createSVGElement("text", {
      x: x,
      y: height - paddingY + 16,
      "text-anchor": "middle",
      class: "chart-text",
      style: "font-weight: 600;"
    });
    labelText.textContent = p.label;
    chartSvg.appendChild(labelText);
  });

  areaD += ` L ${paddingX + (6 * stepX)} ${height - paddingY} Z`;

  // Draw Filled Area
  const areaPath = createSVGElement("path", {
    d: areaD,
    class: "chart-area"
  });
  chartSvg.appendChild(areaPath);

  // Draw Line
  const linePath = createSVGElement("path", {
    d: pathD,
    class: "chart-line"
  });
  chartSvg.appendChild(linePath);

  // Draw interactive dots & labels
  points.forEach((pt) => {
    const circle = createSVGElement("circle", {
      cx: pt.x,
      cy: pt.y,
      class: "chart-dot"
    });
    
    // Simple hover title tip
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `₹${pt.val}`;
    circle.appendChild(title);

    chartSvg.appendChild(circle);

    // Value text above dot
    if (pt.val > 0) {
      const valText = createSVGElement("text", {
        x: pt.x,
        y: pt.y - 8,
        "text-anchor": "middle",
        class: "chart-text",
        style: "font-weight: 700; fill: var(--primary);"
      });
      valText.textContent = `₹${pt.val}`;
      chartSvg.appendChild(valText);
    }
  });
}

function drawTopProductsTally(invoices) {
  const container = document.getElementById("top-products-tally");
  if (!container) return;
  container.innerHTML = "";

  // Tally quantities sold by product id
  const productTally = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!productTally[item.name]) {
        productTally[item.name] = 0;
      }
      productTally[item.name] += item.qty;
    });
  });

  // Sort and pick top 5
  const topProducts = Object.entries(productTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topProducts.length === 0) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 180px; color: var(--text-muted); font-size: 0.95rem; font-weight: 500; text-align: center; width: 100%;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="40" height="40" style="margin-bottom: 8px; stroke-width: 1.5; color: var(--border);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <span data-i18n="noSalesData">${getTranslation("noSalesData") || "No sales data available"}</span>
      </div>
    `;
    return;
  }

  const maxQty = topProducts[0][1];

  topProducts.forEach(([name, qty]) => {
    const percentage = maxQty > 0 ? (qty / maxQty) * 100 : 0;
    
    const row = document.createElement("div");
    row.className = "top-product-item";
    row.innerHTML = `
      <div class="product-item-meta">
        <span class="name">${name}</span>
        <span class="tally">${qty.toFixed(1)} sold</span>
      </div>
      <div class="bar-container">
        <div class="bar-fill" style="width: 0%"></div>
      </div>
    `;
    container.appendChild(row);

    // Trigger sliding animation using micro-delay
    setTimeout(() => {
      const fill = row.querySelector(".bar-fill");
      if (fill) fill.style.width = `${percentage}%`;
    }, 100);
  });
}

function createSVGElement(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (let key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  return el;
}

// ==========================================
// FAST BILLING SCREEN FEATURES
// ==========================================
function setupBillingEventListeners() {
  const searchInput = document.getElementById("billing-product-search");
  const suggestionsBox = document.getElementById("billing-search-suggestions");
  const discountInput = document.getElementById("summary-discount-input");

  // Dynamic Suggestion search on input
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 1) {
      suggestionsBox.classList.remove("active");
      return;
    }

    const products = DB.getProducts();
    const matches = products.filter(p => {
      const nameHi = p.nameHi || transliterateText(p.name, "hi");
      const namePa = p.namePa || transliterateText(p.name, "pa");
      return p.name.toLowerCase().includes(query) || 
             nameHi.toLowerCase().includes(query) ||
             namePa.toLowerCase().includes(query) ||
             p.category.toLowerCase().includes(query);
    });

    renderSearchSuggestions(matches);
  });

  // Close dropdown on clicking outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.remove("active");
    }
  });

  // Recalculate totals on discount adjustment
  discountInput.addEventListener("input", () => {
    recalculateCartTotals();
  });

  // Customer phone auto-fill search & purchase history badge controller
  const phoneInput = document.getElementById("billing-customer-phone");
  const nameInput = document.getElementById("billing-customer-name");
  
  // PWA Contact Picker API check & listener
  const selectContactBtn = document.getElementById("btn-select-contact");
  if (selectContactBtn) {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      selectContactBtn.style.display = "inline-block";
      
      selectContactBtn.addEventListener("click", async () => {
        try {
          const props = ['name', 'tel'];
          const opts = { multiple: false };
          const contacts = await navigator.contacts.select(props, opts);
          
          if (contacts && contacts.length > 0) {
            const contact = contacts[0];
            const name = (contact.name && contact.name.length > 0) ? contact.name[0] : "";
            const tel = (contact.tel && contact.tel.length > 0) ? contact.tel[0] : "";
            
            // Clean phone number: remove any non-digit character (keep only numbers)
            let cleanTel = tel.replace(/[^0-9]/g, "");
            
            // Clean country prefix (+91 or 91) if it's 12 digits or starts with 91
            if (cleanTel.length === 12 && cleanTel.startsWith("91")) {
              cleanTel = cleanTel.substring(2);
            } else if (cleanTel.length > 10 && cleanTel.startsWith("0")) {
              cleanTel = cleanTel.substring(1);
            }
            
            if (name) nameInput.value = name;
            if (cleanTel) {
              phoneInput.value = cleanTel;
              // Dispatch input event so the customer autosearch listener fires!
              phoneInput.dispatchEvent(new Event("input"));
            }
            showToast("Contact selected successfully!", "success");
          }
        } catch (err) {
          console.error("Contact selection failed:", err);
          showToast("Contact access cancelled / denied.", "info");
        }
      });
    }
  }
  
  if (phoneInput && nameInput) {
    phoneInput.addEventListener("input", () => {
      const phoneVal = phoneInput.value.trim();
      const hint = document.getElementById("billing-customer-history-hint");
      
      if (phoneVal.length === 0) {
        nameInput.value = "Walk-in Customer";
      }
      
      if (phoneVal.length >= 3) {
        const customers = DB.getCustomers();
        const found = customers.find(c => c.phone === phoneVal);
        
        if (found) {
          nameInput.value = found.name;
          state.selectedBillingCustomerId = found.id;
          
          if (hint) {
            hint.textContent = `Registered Customer: Purchased ${found.totalBills || 0} times previously (Total spent: ₹${(found.totalPurchase || 0).toFixed(2)})`;
            hint.style.display = "block";
          }
          
          const dropdown = document.getElementById("billing-customer-dropdown");
          if (dropdown) dropdown.value = found.id;
        } else {
          if (hint) {
            hint.style.display = "none";
          }
          state.selectedBillingCustomerId = "";
        }
      } else {
        if (hint) {
          hint.style.display = "none";
        }
        state.selectedBillingCustomerId = "";
      }
    });
  }

  // Bind Cash / Udhaar Buttons
  document.getElementById("pay-mode-cash").addEventListener("click", () => {
    toggleBillingPaymentMode("cash");
  });

  document.getElementById("pay-mode-udhaar").addEventListener("click", () => {
    toggleBillingPaymentMode("udhaar");
  });

  // Inline Add Customer from Billing screen
  document.getElementById("btn-add-customer-inline").addEventListener("click", () => {
    openModal("modal-customer");
  });

  // Clear Cart Action
  document.getElementById("btn-clear-cart").addEventListener("click", () => {
    state.cart = [];
    renderCart();
    showToast("Cart cleared!", "info");
  });

  // Submit / Generate Invoice Action
  document.getElementById("btn-checkout-bill").addEventListener("click", () => {
    generateInvoice();
  });

  // Professional Invoice Slip Modal buttons
  const invoicePrintBtn = document.getElementById("invoice-print-btn");
  if (invoicePrintBtn) {
    invoicePrintBtn.addEventListener("click", () => {
      window.print();
    });
  }

  const invoicePdfBtn = document.getElementById("invoice-pdf-btn");
  if (invoicePdfBtn) {
    invoicePdfBtn.addEventListener("click", () => {
      downloadInvoicePDF();
    });
  }

  const invoiceWhatsappBtn = document.getElementById("invoice-whatsapp-btn");
  if (invoiceWhatsappBtn) {
    invoiceWhatsappBtn.addEventListener("click", () => {
      shareInvoiceWhatsApp();
    });
  }

  const invoiceSharePdfBtn = document.getElementById("invoice-share-pdf-btn");
  if (invoiceSharePdfBtn) {
    invoiceSharePdfBtn.addEventListener("click", () => {
      shareInvoicePDF();
    });
  }
}

function renderBilling() {
  // Populate Quick Pick Grid
  renderQuickPicks();

  // Load active customers into udhaar dropdown selector
  populateBillingCustomerSelector();

  // Render existing Cart
  renderCart();
}

function renderQuickPicks() {
  const grid = document.getElementById("quick-picks-items-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const products = DB.getProducts();
  
  // Pick first 8 products as Quick select items
  const quickItems = products.slice(0, 8);

  if (quickItems.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); font-size: 0.85rem;">No products in inventory. Add products in settings!</div>`;
    return;
  }

  quickItems.forEach(prod => {
    const btn = document.createElement("button");
    btn.className = "quick-pick-btn";
    btn.innerHTML = `
      <span class="quick-pick-name">${prod.name.split(" (")[0]}</span>
      <span class="quick-pick-rate">₹${prod.rate}/${prod.unit}</span>
    `;
    btn.addEventListener("click", () => {
      addProductToCart(prod);
    });
    grid.appendChild(btn);
  });
}

function populateBillingCustomerSelector() {
  const select = document.getElementById("billing-customer-dropdown");
  if (!select) return;
  
  // Retain first placeholder option
  select.innerHTML = `<option value="" data-i18n="selectCustomer">${getTranslation("selectCustomer")}</option>`;

  const customers = DB.getCustomers();
  customers.forEach(cust => {
    const opt = document.createElement("option");
    opt.value = cust.id;
    opt.textContent = `${cust.name} (Bal: ₹${cust.pendingBalance})`;
    if (cust.id === state.selectedBillingCustomerId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  // Sync state selection on change and auto-fill details inputs
  select.addEventListener("change", (e) => {
    state.selectedBillingCustomerId = e.target.value;
    const cust = DB.getCustomers().find(c => c.id === e.target.value);
    if (cust) {
      document.getElementById("billing-customer-name").value = cust.name;
      document.getElementById("billing-customer-phone").value = cust.phone || "";
    } else {
      document.getElementById("billing-customer-name").value = "Walk-in Customer";
      document.getElementById("billing-customer-phone").value = "";
    }
  });
}

// Render filtered dropdown matching items
function renderSearchSuggestions(matches) {
  const suggestionsBox = document.getElementById("billing-search-suggestions");
  if (!suggestionsBox) return;
  suggestionsBox.innerHTML = "";

  if (matches.length === 0) {
    suggestionsBox.innerHTML = `<div style="padding: 12px 18px; color: var(--text-muted); font-size: 0.9rem;">No matching product found.</div>`;
    suggestionsBox.classList.add("active");
    return;
  }

  matches.forEach((prod, index) => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    const displayName = formatProductName(prod);
    div.innerHTML = `
      <div class="suggestion-info">
        <span class="suggestion-name">${displayName}</span>
        <span class="suggestion-category">${prod.category}</span>
      </div>
      <span class="suggestion-rate">₹${prod.rate} / ${prod.unit}</span>
    `;
    div.addEventListener("click", () => {
      addProductToCart(prod);
      suggestionsBox.classList.remove("active");
      document.getElementById("billing-product-search").value = "";
    });
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.classList.add("active");
}

function addProductToCart(product) {
  // Check if already in cart
  const exists = state.cart.find(item => item.id === product.id);
  if (exists) {
    exists.qty += 1;
    exists.amount = parseFloat((exists.qty * exists.rate).toFixed(2));
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      rate: product.rate,
      unit: product.unit,
      qty: 1,
      amount: product.rate
    });
  }

  renderCart();
  showToast(`${product.name.split(" (")[0]} added!`, "success");
}

function renderCart() {
  const tbody = document.getElementById("cart-items-body");
  const countEl = document.getElementById("cart-item-count");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (state.cart.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted);" data-i18n="noData">${getTranslation("noData")}</td>
      </tr>
    `;
    countEl.textContent = `0 Items`;
    recalculateCartTotals();
    return;
  }

  countEl.textContent = `${state.cart.length} Items`;

  state.cart.forEach((item, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 600; color: var(--dark);">${item.name.split(" (")[0]} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(${item.unit})</span></td>
      <td style="font-weight: 500;">₹${item.rate}</td>
      <td>
        <input type="number" class="form-control cart-input cart-qty-input" value="${item.qty}" min="0.001" step="any">
        <div class="quick-qty-box">
          <button class="quick-qty-btn" data-add="0.25">+250g</button>
          <button class="quick-qty-btn" data-add="0.5">+500g</button>
          <button class="quick-qty-btn" data-add="1">+1</button>
        </div>
      </td>
      <td>
        <input type="number" class="form-control cart-input cart-amount-input" style="width:90px;" value="${item.amount.toFixed(2)}" min="1" step="any">
      </td>
      <td class="num-cell">
        <button class="btn-delete-item" data-idx="${idx}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </td>
    `;

    // Connect Fast Bidirectional inputs
    const qtyInput = tr.querySelector(".cart-qty-input");
    const amountInput = tr.querySelector(".cart-amount-input");

    // Bidirectional Qty to Amount calculation
    qtyInput.addEventListener("input", () => {
      let qty = parseFloat(qtyInput.value);
      if (isNaN(qty) || qty <= 0) qty = 0;
      
      item.qty = qty;
      item.amount = parseFloat((qty * item.rate).toFixed(2));
      amountInput.value = item.amount.toFixed(2);
      
      recalculateCartTotals();
    });

    // Bidirectional Amount to Qty calculation (Auto-calculates quantity on Rupee budget!)
    amountInput.addEventListener("input", () => {
      let amount = parseFloat(amountInput.value);
      if (isNaN(amount) || amount <= 0) amount = 0;

      item.amount = amount;
      item.qty = parseFloat((amount / item.rate).toFixed(2));
      qtyInput.value = item.qty;

      recalculateCartTotals();
    });

    // Quick Qty Increments triggers
    tr.querySelectorAll(".quick-qty-btn").forEach(qBtn => {
      qBtn.addEventListener("click", () => {
        const val = parseFloat(qBtn.dataset.add);
        let currentQty = parseFloat(qtyInput.value) || 0;
        
        // If unit is piece/gram, adjust scaling
        if (item.unit === "piece") {
          currentQty = Math.round(currentQty + (val >= 1 ? val : 1));
        } else {
          currentQty = parseFloat((currentQty + val).toFixed(3));
        }
        
        qtyInput.value = currentQty;
        item.qty = currentQty;
        item.amount = parseFloat((currentQty * item.rate).toFixed(2));
        amountInput.value = item.amount.toFixed(2);
        
        recalculateCartTotals();
      });
    });

    // Delete item row trigger
    tr.querySelector(".btn-delete-item").addEventListener("click", (e) => {
      const idxToDelete = parseInt(e.currentTarget.dataset.idx);
      state.cart.splice(idxToDelete, 1);
      renderCart();
    });

    tbody.appendChild(tr);
  });

  recalculateCartTotals();
}

function recalculateCartTotals() {
  let subtotal = 0;
  state.cart.forEach(item => {
    subtotal += item.amount;
  });

  const discountEl = document.getElementById("summary-discount-input");
  let discount = parseFloat(discountEl.value) || 0;
  if (discount < 0) {
    discount = 0;
    discountEl.value = 0;
  }
  if (discount > subtotal) {
    discount = subtotal;
    discountEl.value = subtotal;
  }

  const grandTotal = parseFloat((subtotal - discount).toFixed(2));

  document.getElementById("summary-subtotal").textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById("summary-grand-total").textContent = `₹${grandTotal.toFixed(2)}`;
}

function toggleBillingPaymentMode(mode) {
  const cashBtn = document.getElementById("pay-mode-cash");
  const udhaarBtn = document.getElementById("pay-mode-udhaar");
  const customerBox = document.getElementById("billing-udhaar-customer-box");

  if (mode === "cash") {
    cashBtn.classList.add("active");
    udhaarBtn.classList.remove("active");
    customerBox.style.display = "none";
    state.activeBillingMode = "cash";
  } else {
    udhaarBtn.classList.add("active");
    cashBtn.classList.remove("active");
    customerBox.style.display = "flex";
    state.activeBillingMode = "udhaar";
    populateBillingCustomerSelector();
  }
}

// Generate active billing invoice slip
async function generateInvoice() {
  if (state.cart.length === 0) {
    showToast("Add items to the cart first!", "error");
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + item.amount, 0);
  const discount = parseFloat(document.getElementById("summary-discount-input").value) || 0;
  const grandTotal = subtotal - discount;

  const inputName = document.getElementById("billing-customer-name").value.trim() || "Walk-in Customer";
  const inputPhone = document.getElementById("billing-customer-phone").value.trim();

  let resolvedCustomerId = null;

  if (inputPhone) {
    const customers = DB.getCustomers();
    const foundCust = customers.find(c => c.phone === inputPhone);
    const todayStr = new Date().toISOString().split("T")[0];

    if (foundCust) {
      foundCust.name = inputName;
      foundCust.totalBills = (foundCust.totalBills || 0) + 1;
      foundCust.totalPurchase = (foundCust.totalPurchase || 0) + grandTotal;
      foundCust.lastVisit = todayStr;
      await DB.saveCustomer(foundCust);
      resolvedCustomerId = foundCust.id;
    } else {
      const newCust = {
        id: "cust_" + Date.now(),
        name: inputName,
        phone: inputPhone,
        pendingBalance: 0, // saveInvoice will adjust it if it's udhaar
        totalBills: 1,
        totalPurchase: grandTotal,
        lastVisit: todayStr,
        createdAt: new Date().toISOString()
      };
      await DB.saveCustomer(newCust);
      resolvedCustomerId = newCust.id;
    }
  } else {
    // No phone number
    if (state.activeBillingMode === "udhaar") {
      if (state.selectedBillingCustomerId) {
        const foundCust = DB.getCustomers().find(c => c.id === state.selectedBillingCustomerId);
        if (foundCust) {
          const todayStr = new Date().toISOString().split("T")[0];
          foundCust.name = inputName;
          foundCust.totalBills = (foundCust.totalBills || 0) + 1;
          foundCust.totalPurchase = (foundCust.totalPurchase || 0) + grandTotal;
          foundCust.lastVisit = todayStr;
          await DB.saveCustomer(foundCust);
          resolvedCustomerId = foundCust.id;
        } else {
          showToast("Selected customer not found in database.", "error");
          return;
        }
      } else {
        showToast("Select or register a customer for Udhaar (Credit) payment!", "error");
        return;
      }
    }
  }

  // Auto-generate invoice serial
  const invoices = DB.getInvoices();
  const nextInvNum = invoices.length > 0 
    ? "GS-" + (parseInt(invoices[invoices.length - 1].invoiceNo.split("-")[1]) + 1)
    : "GS-1001";

  const shopSettings = DB.getSettings();

  const invoice = {
    invoiceNo: nextInvNum,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
    customerId: resolvedCustomerId,
    customerName: inputName,
    customerPhone: inputPhone,
    items: [...state.cart],
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(grandTotal.toFixed(2)),
    paymentMode: state.activeBillingMode || "cash",
    status: state.activeBillingMode === "udhaar" ? "Pending" : "Paid"
  };

  showToast("Saving invoice...", "info");
  const savedInv = await DB.saveInvoice(invoice);

  // Clear state
  state.cart = [];
  document.getElementById("summary-discount-input").value = 0;
  renderCart();
  
  // Reset fields to default
  document.getElementById("billing-customer-name").value = "Walk-in Customer";
  document.getElementById("billing-customer-phone").value = "";
  state.selectedBillingCustomerId = "";
  
  const hint = document.getElementById("billing-customer-history-hint");
  if (hint) hint.style.display = "none";

  // Show Thermal slip Modal
  openInvoiceModal(savedInv);
  showToast("Invoice saved successfully!", "success");
}

function openInvoiceModal(invoice) {
  state.currentInvoice = invoice;
  const shop = getShopProfile();

  // Populate Shop metadata
  document.getElementById("invoice-shop-name").textContent = shop.shopName;
  document.getElementById("invoice-shop-tagline").textContent = shop.shopTagline || "";
  document.getElementById("invoice-shop-address").textContent = shop.shopAddress || "";
  document.getElementById("invoice-shop-phone").textContent = shop.shopPhone ? `Phone: ${shop.shopPhone}` : "";

  // Populate Invoice metadata
  document.getElementById("invoice-no-val").textContent = invoice.invoiceNo;
  document.getElementById("invoice-date-val").textContent = `${invoice.date} ${invoice.time}`;
  document.getElementById("invoice-customer-val").textContent = invoice.customerName;
  
  const phoneRow = document.getElementById("invoice-phone-row");
  if (invoice.customerPhone) {
    document.getElementById("invoice-phone-val").textContent = invoice.customerPhone;
    phoneRow.style.display = "flex";
  } else {
    phoneRow.style.display = "none";
  }

  // Populate Invoice items table
  const tbody = document.getElementById("invoice-items-body");
  tbody.innerHTML = "";
  invoice.items.forEach(item => {
    const tr = document.createElement("tr");
    
    // Retrieve product record from DB to obtain saved Hindi/Punjabi names
    const fullProd = DB.getProducts().find(p => p.id === item.id);
    const displayName = formatProductName(fullProd || item);
    
    tr.innerHTML = `
      <td>
        <div style="font-weight: bold; font-family: 'Outfit', sans-serif; font-size:12px;">${displayName}</div>
      </td>
      <td class="num-cell" style="vertical-align: top;">₹${item.rate}</td>
      <td class="num-cell" style="vertical-align: top;">${item.qty} ${item.unit}</td>
      <td class="num-cell" style="vertical-align: top;">₹${item.amount.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Populate Totals
  document.getElementById("invoice-subtotal-val").textContent = `₹${invoice.subtotal.toFixed(2)}`;
  document.getElementById("invoice-discount-val").textContent = `₹${invoice.discount.toFixed(2)}`;
  document.getElementById("invoice-total-val").textContent = `₹${invoice.total.toFixed(2)}`;
  
  // Format Payment mode title
  const modeVal = document.getElementById("invoice-paymode-val");
  const upiSection = document.getElementById("invoice-upi-section");
  if (invoice.paymentMode === "udhaar") {
    modeVal.textContent = "UDHAAR (CREDIT / PENDING)";
    modeVal.style.color = "var(--danger)";

    // Populate UPI dynamic block
    const upiName = shop.upiName || "Gurbhej Singh";
    const upiPhone = shop.upiPhone || "7973679747";
    const upiId = shop.upiId || "paytm.s1sd9a3@pty";
    
    document.getElementById("invoice-upi-name-val").textContent = upiName;
    document.getElementById("invoice-upi-phone-val").textContent = upiPhone;
    document.getElementById("invoice-upi-id-val").textContent = upiId;
    document.getElementById("invoice-upi-amount-val").textContent = invoice.total.toFixed(2);

    const qrContainer = document.getElementById("invoice-upi-qr-container");
    if (qrContainer) {
      qrContainer.innerHTML = "";
      if (shop.upiQrImage) {
        const img = document.createElement("img");
        img.src = shop.upiQrImage;
        img.className = "invoice-upi-qr-img";
        img.alt = "UPI QR Code";
        qrContainer.appendChild(img);
      } else {
        const img = document.createElement("img");
        const cleanName = encodeURIComponent(upiName);
        const upiString = `upi://pay?pa=${upiId}&pn=${cleanName}&am=${invoice.total.toFixed(2)}&cu=INR`;
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
        img.className = "invoice-upi-qr-img";
        img.alt = "UPI QR Code";
        img.onerror = () => {
          qrContainer.innerHTML = `<div style="border: 2px dashed #000; padding: 12px; font-size: 10px; width: 150px; font-family: monospace;">Scan QR not available offline without custom upload</div>`;
        };
        qrContainer.appendChild(img);
      }
    }
    if (upiSection) upiSection.style.display = "flex";
  } else {
    modeVal.textContent = "CASH (PAID)";
    modeVal.style.color = "var(--success)";
    if (upiSection) upiSection.style.display = "none";
  }

  openModal("modal-invoice-slip");
}

function padEnd(str, targetLength, padChar = " ") {
  str = String(str);
  if (str.length >= targetLength) return str.substring(0, targetLength);
  return str + padChar.repeat(targetLength - str.length);
}

function padStart(str, targetLength, padChar = " ") {
  str = String(str);
  if (str.length >= targetLength) return str.substring(0, targetLength);
  return padChar.repeat(targetLength - str.length) + str;
}

function getEnglishName(name) {
  if (!name) return "";
  let clean = String(name);
  
  // Remove brackets like ( / ) or any parentheses/brackets and their contents
  clean = clean.replace(/\([^)]*\)/g, "");
  clean = clean.replace(/\[[^\]]*\]/g, "");
  
  // Remove remaining bracket characters
  clean = clean.replace(/[(){}[\]]/g, "");
  
  // Remove Devanagari (Hindi) and Gurmukhi (Punjabi) characters
  clean = clean.replace(/[\u0900-\u097F]/g, "");
  clean = clean.replace(/[\u0A00-\u0A7F]/g, "");
  
  // Remove non-ASCII characters (e.g. Rupee or other symbols)
  clean = clean.replace(/[^\x20-\x7E]/g, "");
  
  // Replace slash or other symbols
  clean = clean.replace(/\//g, " ");
  
  // Clean up extra spaces
  clean = clean.replace(/\s+/g, " ");
  
  return clean.trim();
}

async function generatePDFDocument() {
  const invoice = state.currentInvoice;
  if (!invoice) return null;

  const { jsPDF } = window.jspdf;
  if (!jsPDF) return null;
  if (!window.html2canvas) {
    console.error("html2canvas is not loaded.");
    return null;
  }

  // 1. Populate the dedicated print template
  const shop = getShopProfile();
  const settings = DB.getSettings();

  document.getElementById("pdf-shop-name").textContent = shop.shopName;
  document.getElementById("pdf-shop-tagline").textContent = shop.shopTagline || "";
  document.getElementById("pdf-shop-address").textContent = shop.shopAddress || "";
  document.getElementById("pdf-shop-phone").textContent = shop.shopPhone ? `Phone: ${shop.shopPhone}` : "";

  document.getElementById("pdf-invoice-no").textContent = invoice.invoiceNo;
  document.getElementById("pdf-date-time").textContent = `${invoice.date} ${invoice.time}`;
  document.getElementById("pdf-customer-name").textContent = invoice.customerName;

  const phoneRow = document.getElementById("pdf-customer-phone-row");
  if (invoice.customerPhone) {
    document.getElementById("pdf-customer-phone").textContent = invoice.customerPhone;
    phoneRow.style.display = "block";
  } else {
    phoneRow.style.display = "none";
  }

  // Populate products table
  const tbody = document.getElementById("pdf-items-body");
  tbody.innerHTML = "";
  invoice.items.forEach(item => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #f5f5f5";
    
    const pName = formatProductName(item);
    const rateVal = parseFloat(item.rate);
    const qtyVal = parseFloat(item.qty);
    const amountVal = parseFloat(item.amount);

    tr.innerHTML = `
      <td class="col-item">${pName}</td>
      <td class="col-rate">Rs.${rateVal % 1 === 0 ? rateVal.toFixed(0) : rateVal.toFixed(2)}</td>
      <td class="col-qty">${qtyVal}</td>
      <td class="col-amount" style="font-weight: bold;">Rs.${amountVal % 1 === 0 ? amountVal.toFixed(0) : amountVal.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Totals
  const subtotalVal = parseFloat(invoice.subtotal);
  document.getElementById("pdf-subtotal").textContent = `Rs.${subtotalVal % 1 === 0 ? subtotalVal.toFixed(0) : subtotalVal.toFixed(2)}`;
  
  const discountVal = parseFloat(invoice.discount);
  document.getElementById("pdf-discount").textContent = `Rs.${discountVal % 1 === 0 ? discountVal.toFixed(0) : discountVal.toFixed(2)}`;
  
  const totalVal = parseFloat(invoice.total);
  document.getElementById("pdf-total").textContent = `Rs.${totalVal % 1 === 0 ? totalVal.toFixed(0) : totalVal.toFixed(2)}`;
  document.getElementById("pdf-payment-mode").textContent = invoice.paymentMode.toUpperCase();

  // Udhaar QR Section
  const upiSection = document.getElementById("pdf-upi-section");
  const isUdhaar = invoice.paymentMode === "udhaar";
  if (isUdhaar) {
    document.getElementById("pdf-upi-name").textContent = settings.upiName || "Gurbhej Singh";
    document.getElementById("pdf-upi-phone").textContent = settings.upiPhone || "7973679747";
    document.getElementById("pdf-upi-id").textContent = settings.upiId || "paytm.s1sd9a3@pty";
    document.getElementById("pdf-upi-due").textContent = `Rs.${totalVal % 1 === 0 ? totalVal.toFixed(0) : totalVal.toFixed(2)}`;

    const qrImg = document.getElementById("pdf-upi-qr");
    const noQrSpan = document.getElementById("pdf-upi-no-qr");
    if (settings.upiQrImage) {
      if (qrImg) {
        qrImg.src = settings.upiQrImage;
        qrImg.style.display = "block";
      }
      if (noQrSpan) noQrSpan.style.display = "none";
    } else {
      if (qrImg) qrImg.style.display = "none";
      if (noQrSpan) noQrSpan.style.display = "block";
    }
    upiSection.style.display = "block";
  } else {
    upiSection.style.display = "none";
  }

  // 2. Render print container using html2canvas
  const element = document.getElementById("pdf-print-template");
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for highly sharp, professional high-DPI prints
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false
    });

    const imgData = canvas.toDataURL("image/png");
    
    // Receipt width is fixed to exactly 80mm
    const pdfWidth = 80;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pdfWidth, pdfHeight]
    });

    doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

    return { doc, filename: `Invoice_${invoice.invoiceNo}.pdf` };
  } catch (err) {
    console.error("html2canvas PDF generation failed:", err);
    return null;
  }
}

// Download PDF Invoice
async function downloadInvoicePDF() {
  showToast("Generating PDF Invoice...", "info");
  const result = await generatePDFDocument();
  if (result) {
    result.doc.save(result.filename);
    showToast("PDF Invoice downloaded!", "success");
  } else {
    showToast("PDF generation failed.", "error");
  }
}

// Share PDF Invoice
async function shareInvoicePDF() {
  showToast("Preparing PDF for Sharing...", "info");
  const result = await generatePDFDocument();
  if (!result) {
    showToast("PDF generation failed.", "error");
    return;
  }

  try {
    const pdfBlob = result.doc.output("blob");
    const file = new File([pdfBlob], result.filename, { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        text: `Gurbhej Grocery Store Invoice - ${invoice.invoiceNo}`
      });
      showToast("PDF shared successfully!", "success");
    } else {
      alert("Web Share API is not supported on this device/browser for files. Please download the PDF and attach it manually.");
    }
  } catch (err) {
    console.error("PDF sharing failed:", err);
    showToast("Sharing cancelled or failed.", "error");
  }
}

// Share formatted invoice to customer's WhatsApp using official wa.me format
function shareInvoiceWhatsApp() {
  const invoice = state.currentInvoice;
  if (!invoice) return;

  const shop = getShopProfile();
  
  // Format WhatsApp message block exactly as requested
  let msg = `${shop.shopName}\n`;
  if (shop.shopTagline) msg += `${shop.shopTagline}\n`;
  if (shop.shopAddress && shop.shopAddress !== "Update shop profile in Settings") {
    msg += `Address: ${shop.shopAddress}\n`;
  }
  if (shop.shopPhone && shop.shopPhone !== "Update shop profile in Settings") {
    msg += `Phone: ${shop.shopPhone}\n`;
  }
  msg += `\n`;
  msg += `Invoice No: ${invoice.invoiceNo}\n`;
  msg += `Date: ${invoice.date} ${invoice.time}\n\n`;
  msg += `Customer: ${invoice.customerName}\n\n`;
  msg += `Items:\n`;

  invoice.items.forEach((item, index) => {
    const fullProd = DB.getProducts().find(p => p.id === item.id);
    const displayName = formatProductName(fullProd || item);
    msg += `${index + 1}. ${displayName} - ${item.qty} ${item.unit} x ₹${item.rate} = ₹${item.amount}\n`;
  });

  msg += `\nGrand Total: ₹${invoice.total}\n\n`;
  
  if (invoice.paymentMode === "udhaar") {
    // Note: UPI configurations are fetched from the complete DB settings object
    const settings = DB.getSettings();
    const upiName = settings.upiName || "Gurbhej Singh";
    const upiPhone = settings.upiPhone || "7973679747";
    const upiId = settings.upiId || "paytm.s1sd9a3@pty";
    
    msg += `Pending Udhaar Payment:\n`;
    msg += `Scan QR or pay via UPI:\n`;
    msg += `Name: ${upiName}\n`;
    msg += `Phone: ${upiPhone}\n`;
    msg += `UPI ID: ${upiId}\n`;
    msg += `Amount Due: ₹${invoice.total.toFixed(2)}\n\n`;
  }

  msg += `Thank you for shopping with ${shop.shopName}.`;

  const urlEncodedMsg = encodeURIComponent(msg);
  const cleanPhone = invoice.customerPhone ? invoice.customerPhone.replace(/[^0-9]/g, "") : "";

  let whatsappLink = "";
  if (cleanPhone.length === 10) {
    whatsappLink = `https://wa.me/91${cleanPhone}?text=${urlEncodedMsg}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
    whatsappLink = `https://wa.me/${cleanPhone}?text=${urlEncodedMsg}`;
  } else if (cleanPhone.length > 0) {
    whatsappLink = `https://wa.me/${cleanPhone}?text=${urlEncodedMsg}`;
  } else {
    whatsappLink = `https://wa.me/?text=${urlEncodedMsg}`;
  }

  window.open(whatsappLink, "_blank");
  showToast("Opening WhatsApp Web...", "success");
}

// ==========================================
// PRODUCTS INVENTORY PAGE (CRUD)
// ==========================================
function setupProductEventListeners() {
  const prodNameInput = document.getElementById("product-name");
  const prodNameHi = document.getElementById("product-name-hi");
  const prodNamePa = document.getElementById("product-name-pa");

  // Real-time dynamic auto-fill transliteration
  prodNameInput.addEventListener("input", () => {
    const text = prodNameInput.value;
    prodNameHi.value = transliterateText(text, "hi");
    prodNamePa.value = transliterateText(text, "pa");
  });

  // Bind Add Product click
  document.getElementById("btn-add-product").addEventListener("click", () => {
    document.getElementById("product-modal-title").textContent = getTranslation("addProduct");
    document.getElementById("product-id").value = "";
    document.getElementById("product-form").reset();
    populateCategoryDropdowns(); // Ensure dropdown is populated dynamically
    prodNameHi.value = "";
    prodNamePa.value = "";
    openModal("modal-product");
  });

  // Bind inline Product Forms Submit
  document.getElementById("product-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const prodId = document.getElementById("product-id").value;
    const prod = {
      name: prodNameInput.value.trim(),
      nameHi: prodNameHi.value.trim() || prodNameInput.value.trim(),
      namePa: prodNamePa.value.trim() || prodNameInput.value.trim(),
      category: document.getElementById("product-category").value,
      unit: document.getElementById("product-unit").value,
      rate: parseFloat(document.getElementById("product-rate").value)
    };

    if (prodId) {
      prod.id = prodId;
      showToast("Updating product rate...", "info");
    } else {
      showToast("Adding product to list...", "info");
    }

    await DB.saveProduct(prod);
    closeAllModals();
    renderProducts();
    showToast("Product rates updated!", "success");
  });

  // Search input filtering
  document.getElementById("product-list-search").addEventListener("input", () => {
    renderProducts();
  });

  // Category selection filtering
  document.getElementById("product-category-filter").addEventListener("change", () => {
    renderProducts();
  });
}

function renderProducts() {
  const tbody = document.getElementById("product-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const query = document.getElementById("product-list-search").value.toLowerCase();
  const categoryFilter = document.getElementById("product-category-filter").value;

  const products = DB.getProducts();

  // Filter listings
  const filtered = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query) || 
                         (p.nameHi && p.nameHi.toLowerCase().includes(query)) ||
                         (p.namePa && p.namePa.toLowerCase().includes(query)) ||
                         p.category.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted);" data-i18n="noData">${getTranslation("noData")}</td>
      </tr>
    `;
    return;
  }

  filtered.forEach(p => {
    const tr = document.createElement("tr");
    const displayName = formatProductName(p);
    
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--dark); font-family: 'Outfit', sans-serif;">${displayName}</td>
      <td><span class="product-row-category">${p.category}</span></td>
      <td style="text-transform:uppercase; font-size:0.85rem; font-weight:500;">${p.unit}</td>
      <td class="product-row-rate">₹${p.rate}</td>
      <td class="num-cell">
        <div class="product-actions-cell" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-icon-only btn-edit" data-id="${p.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="btn btn-danger btn-icon-only btn-delete" data-id="${p.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </td>
    `;

    // Connect Edit Button click
    tr.querySelector(".btn-edit").addEventListener("click", () => {
      document.getElementById("product-modal-title").textContent = getTranslation("editProduct");
      document.getElementById("product-id").value = p.id;
      document.getElementById("product-name").value = p.name;
      document.getElementById("product-name-hi").value = p.nameHi || transliterateText(p.name, "hi");
      document.getElementById("product-name-pa").value = p.namePa || transliterateText(p.name, "pa");
      
      // Ensure category dropdown contains the edit target category
      populateCategoryDropdowns(p.category);
      
      document.getElementById("product-category").value = p.category;
      document.getElementById("product-unit").value = p.unit;
      document.getElementById("product-rate").value = p.rate;
      openModal("modal-product");
    });

    // Connect Delete Button click
    tr.querySelector(".btn-delete").addEventListener("click", async () => {
      const confirmMsg = `Are you sure you want to delete ${p.name.split(" (")[0]}?`;
      if (confirm(confirmMsg)) {
        showToast("Deleting product...", "info");
        await DB.deleteProduct(p.id);
        renderProducts();
        showToast("Product deleted successfully!", "success");
      }
    });

    tbody.appendChild(tr);
  });
}

// ==========================================
// CATEGORY MANAGEMENT AND DROPDOWNS POPULATION
// ==========================================
function populateCategoryDropdowns(selectedCategoryName = null) {
  const categories = DB.getCategories();
  
  // Alphabetical sort for dropdown readability
  categories.sort((a, b) => a.name.localeCompare(b.name));

  // 1. Populate product form select dropdown
  const prodCategorySelect = document.getElementById("product-category");
  if (prodCategorySelect) {
    let optionsHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
    // Add quick create option at the bottom
    optionsHTML += `<option value="__ADD_NEW_CATEGORY__" style="font-weight: bold; color: var(--primary);">+ Add New Category</option>`;
    prodCategorySelect.innerHTML = optionsHTML;
    if (selectedCategoryName) {
      prodCategorySelect.value = selectedCategoryName;
    }
  }

  // 2. Populate product manager catalog filter dropdown
  const productCategoryFilter = document.getElementById("product-category-filter");
  if (productCategoryFilter) {
    let optionsHTML = `<option value="">All Categories</option>`;
    optionsHTML += categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
    productCategoryFilter.innerHTML = optionsHTML;
  }
}

function setupCategoryEventListeners() {
  const catForm = document.getElementById("category-form");
  const catNameInput = document.getElementById("category-name");
  const catNameHi = document.getElementById("category-name-hi");
  const catNamePa = document.getElementById("category-name-pa");

  // Standard category English input auto-fill transliteration
  catNameInput.addEventListener("input", (e) => {
    const text = e.target.value;
    catNameHi.value = transliterateText(text, "hi");
    catNamePa.value = transliterateText(text, "pa");
  });

  // Quick category English input auto-fill transliteration
  const quickCatNameInput = document.getElementById("quick-category-name");
  const quickCatNameHi = document.getElementById("quick-category-name-hi");
  const quickCatNamePa = document.getElementById("quick-category-name-pa");

  quickCatNameInput.addEventListener("input", (e) => {
    const text = e.target.value;
    quickCatNameHi.value = transliterateText(text, "hi");
    quickCatNamePa.value = transliterateText(text, "pa");
  });

  // Category list Add button click
  document.getElementById("btn-add-category").addEventListener("click", () => {
    document.getElementById("category-modal-title").textContent = getTranslation("addCategory");
    catForm.reset();
    document.getElementById("category-id").value = "";
    openModal("modal-category");
    catNameInput.focus();
  });

  // Save Standard Category
  catForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const catId = document.getElementById("category-id").value;
    const name = catNameInput.value.trim();
    const nameHi = catNameHi.value.trim() || name;
    const namePa = catNamePa.value.trim() || name;
    const description = document.getElementById("category-description").value.trim();

    // Prevent duplicate category names (case-insensitive, ignoring self in edit mode)
    const existing = DB.getCategories();
    const isDuplicate = existing.some(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== catId);
    if (isDuplicate) {
      alert(getTranslation("duplicateCategoryAlert"));
      return;
    }

    if (catId) {
      showToast("Updating category...", "info");
    } else {
      showToast("Creating category...", "info");
    }

    const cat = { name, nameHi, namePa, description };
    if (catId) cat.id = catId;

    const saved = await DB.saveCategory(cat);
    closeAllModals();
    showToast("Category saved!", "success");

    // Dynamic propagation: Refresh selectors and Categories list
    populateCategoryDropdowns(saved.name);
    renderCategories();
  });

  // Categories list Search input
  document.getElementById("category-list-search").addEventListener("input", () => {
    renderCategories();
  });

  // Inline Quick Add Category triggers
  document.getElementById("product-category").addEventListener("change", (e) => {
    if (e.target.value === "__ADD_NEW_CATEGORY__") {
      // Reset Product select index immediately to prevent stuck selection state
      e.target.selectedIndex = 0;
      
      // Clear quick-add form and launch modal
      document.getElementById("quick-category-form").reset();
      openModal("modal-quick-category");
      document.getElementById("quick-category-name").focus();
    }
  });

  // Link quick-add underneath product catalog filter
  document.getElementById("link-quick-add-category").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("quick-category-form").reset();
    openModal("modal-quick-category");
    document.getElementById("quick-category-name").focus();
  });

  // Close Quick Add Category Modal
  document.getElementById("btn-close-quick-category").addEventListener("click", () => {
    document.getElementById("modal-quick-category").classList.remove("active");
  });
  document.getElementById("btn-cancel-quick-category").addEventListener("click", () => {
    document.getElementById("modal-quick-category").classList.remove("active");
  });

  // Save Quick Add Category
  document.getElementById("quick-category-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("quick-category-name").value.trim();
    const nameHi = document.getElementById("quick-category-name-hi").value.trim() || name;
    const namePa = document.getElementById("quick-category-name-pa").value.trim() || name;

    // Prevent duplicates (case-insensitive)
    const existing = DB.getCategories();
    const isDuplicate = existing.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      alert(getTranslation("duplicateCategoryAlert"));
      return;
    }

    showToast("Creating category...", "info");
    const saved = await DB.saveCategory({ name, nameHi, namePa, description: "" });
    document.getElementById("modal-quick-category").classList.remove("active");
    showToast("Category created!", "success");

    // Dynamic propagation: Refresh selections & automatically select the new category for the active product form!
    populateCategoryDropdowns(saved.name);
    
    // Sync Categories list if open in background
    if (state.activePage === "categories") {
      renderCategories();
    }
  });
}

function renderCategories() {
  const tbody = document.getElementById("category-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const query = document.getElementById("category-list-search").value.toLowerCase();
  const categories = DB.getCategories();

  const filtered = categories.filter(c => {
    return c.name.toLowerCase().includes(query) ||
           (c.nameHi && c.nameHi.toLowerCase().includes(query)) ||
           (c.namePa && c.namePa.toLowerCase().includes(query)) ||
           (c.description && c.description.toLowerCase().includes(query));
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--text-muted);" data-i18n="noData">${getTranslation("noData")}</td>
      </tr>
    `;
    return;
  }

  filtered.forEach(c => {
    const tr = document.createElement("tr");
    
    // Format Multilingual display label: English (Hindi / Punjabi)
    let displayName = c.name;
    const transParts = [];
    if (c.nameHi && c.nameHi !== c.name) transParts.push(c.nameHi);
    if (c.namePa && c.namePa !== c.name) transParts.push(c.namePa);
    if (transParts.length > 0) {
      displayName += ` (${transParts.join(" / ")})`;
    }

    tr.innerHTML = `
      <td style="font-weight:600; color:var(--dark); font-family: 'Outfit', sans-serif;">${displayName}</td>
      <td style="color: var(--text-muted); font-size: 0.9rem;">${c.description || "-"}</td>
      <td class="num-cell">
        <div class="product-actions-cell" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-icon-only btn-edit" data-id="${c.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="btn btn-danger btn-icon-only btn-delete" data-id="${c.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </td>
    `;

    // Bind Edit Button click
    tr.querySelector(".btn-edit").addEventListener("click", () => {
      document.getElementById("category-modal-title").textContent = getTranslation("editCategory");
      document.getElementById("category-id").value = c.id;
      document.getElementById("category-name").value = c.name;
      document.getElementById("category-name-hi").value = c.nameHi || "";
      document.getElementById("category-name-pa").value = c.namePa || "";
      document.getElementById("category-description").value = c.description || "";
      openModal("modal-category");
    });

    // Bind Delete Button click with Product Relational Integrity warning
    tr.querySelector(".btn-delete").addEventListener("click", async () => {
      // Find all products actively using this category name (case-insensitive)
      const linkedProducts = DB.getProducts().filter(p => p.category.toLowerCase() === c.name.toLowerCase());
      
      if (linkedProducts.length > 0) {
        const prodNamesList = linkedProducts.map(p => p.name.split(" (")[0]).join(", ");
        const alertMsg = getTranslation("categoryUsedWarning").replace("{list}", prodNamesList);
        if (!confirm(alertMsg)) {
          return;
        }
      } else {
        const confirmMsg = `Are you sure you want to delete the category "${c.name}"?`;
        if (!confirm(confirmMsg)) {
          return;
        }
      }

      showToast("Deleting category...", "info");
      await DB.deleteCategory(c.id);
      showToast("Category deleted!", "success");

      // Dynamic propagation
      populateCategoryDropdowns();
      renderCategories();
    });

    tbody.appendChild(tr);
  });
}

// ==========================================
// KHATABOOK / UDHAAR LEDGER PAGE
// ==========================================
function setupKhatabookEventListeners() {
  // Add Customer modal click
  document.getElementById("btn-add-customer").addEventListener("click", () => {
    document.getElementById("customer-form").reset();
    openModal("modal-customer");
  });

  // Handle customer saving submit
  document.getElementById("customer-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("customer-name").value;
    const phone = document.getElementById("customer-phone").value;
    const openingBal = parseFloat(document.getElementById("customer-opening-balance").value) || 0;

    showToast("Adding new account...", "info");
    const cust = await DB.saveCustomer({ name, phone, pendingBalance: openingBal });
    
    closeAllModals();
    renderKhatabook();
    
    // Auto-select newly created customer
    selectCustomerForLedger(cust.id);
    showToast("Customer account created!", "success");
  });

  // Record Payment Received Submit
  document.getElementById("payment-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const customerId = document.getElementById("payment-customer-id").value;
    const amount = parseFloat(document.getElementById("payment-amount").value);
    const mode = document.getElementById("payment-mode").value;
    const remarks = document.getElementById("payment-remarks").value;

    showToast("Recording payment...", "info");
    await DB.savePayment({
      customerId,
      amount,
      paymentMode: mode,
      remarks: remarks || `Recorded cash payment of ₹${amount}`
    });

    closeAllModals();
    renderKhatabook();
    selectCustomerForLedger(customerId);
    showToast("Payment recorded & outstanding updated!", "success");
  });

  // Record Payment button inside Ledger panel
  document.getElementById("btn-record-payment").addEventListener("click", () => {
    if (!state.selectedKhatabookCustomerId) return;
    document.getElementById("payment-form").reset();
    document.getElementById("payment-customer-id").value = state.selectedKhatabookCustomerId;
    openModal("modal-payment");
  });

  // Live Ledger search
  document.getElementById("khatabook-customer-search").addEventListener("input", () => {
    renderKhatabookCustomers();
  });

  // Mobile Back button click to return to customer list
  const backBtn = document.getElementById("btn-back-to-customers");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const layout = document.querySelector(".khatabook-layout");
      if (layout) {
        layout.classList.remove("show-details");
      }
      state.selectedKhatabookCustomerId = "";
      document.querySelectorAll(".customer-card-item").forEach(item => item.classList.remove("active"));
    });
  }
}

function renderKhatabook() {
  renderKhatabookCustomers();
  
  // Reload details if a customer was previously selected
  if (state.selectedKhatabookCustomerId) {
    selectCustomerForLedger(state.selectedKhatabookCustomerId);
  }
}

function renderKhatabookCustomers() {
  const container = document.getElementById("khatabook-customers-list");
  if (!container) return;
  container.innerHTML = "";

  const query = document.getElementById("khatabook-customer-search").value.toLowerCase();
  const customers = DB.getCustomers();

  // Filter customers matching query
  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(query) || 
    (c.phone && c.phone.includes(query))
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 24px 0;">No accounts found.</div>`;
    return;
  }

  filtered.forEach(cust => {
    const card = document.createElement("div");
    card.className = `customer-card-item ${cust.id === state.selectedKhatabookCustomerId ? "active" : ""}`;
    card.innerHTML = `
      <div class="customer-card-info">
        <span class="customer-card-name">${cust.name}</span>
        <span class="customer-card-phone">${cust.phone ? '📞 ' + cust.phone : 'No Contact Phone'}</span>
      </div>
      <div class="customer-card-balance">
        <div class="balance-val ${cust.pendingBalance > 0 ? "pending" : "clear"}">₹${cust.pendingBalance.toLocaleString("en-IN")}</div>
        <div class="balance-label">${cust.pendingBalance > 0 ? "Udhaar Owed" : "Cleared"}</div>
      </div>
    `;

    // Connect selection trigger
    card.addEventListener("click", () => {
      // Highlight selection
      document.querySelectorAll(".customer-card-item").forEach(item => item.classList.remove("active"));
      card.classList.add("active");

      selectCustomerForLedger(cust.id);
    });

    container.appendChild(card);
  });
}

function selectCustomerForLedger(customerId) {
  state.selectedKhatabookCustomerId = customerId;
  const customer = DB.getCustomers().find(c => c.id === customerId);
  if (!customer) return;

  // Set mobile show-details class
  const layout = document.querySelector(".khatabook-layout");
  if (layout) {
    layout.classList.add("show-details");
  }

  // Toggle active views
  document.getElementById("ledger-empty-panel").style.display = "none";
  const ledgerPanel = document.getElementById("ledger-detail-panel");
  ledgerPanel.style.display = "block";

  // Fill Details
  document.getElementById("ledger-customer-title").textContent = customer.name;
  document.getElementById("ledger-customer-phone").textContent = customer.phone ? `Phone: ${customer.phone}` : "No Contact Details";
  document.getElementById("ledger-balance-value").textContent = `₹${customer.pendingBalance.toLocaleString("en-IN")}`;

  // Outline Balance Card color based on debt status
  const balCard = document.getElementById("ledger-status-card");
  const balInfo = balCard.querySelector(".ledger-balance-info");
  
  if (customer.pendingBalance > 0) {
    balCard.className = "ledger-balance-card pending";
    balInfo.className = "ledger-balance-info pending";
    balInfo.querySelector("h4").textContent = getTranslation("amountOwed");
  } else {
    balCard.className = "ledger-balance-card settled";
    balInfo.className = "ledger-balance-info settled";
    balInfo.querySelector("h4").textContent = getTranslation("amountSettled");
  }

  // Compile chronologically sorted combined ledger (Credit Invoices + Cash Payments received)
  const invoices = DB.getInvoices().filter(inv => inv.customerId === customerId && inv.paymentMode === "udhaar");
  const payments = DB.getPayments().filter(pay => pay.customerId === customerId);

  const timeline = [];
  invoices.forEach(inv => {
    timeline.push({
      type: "credit",
      id: inv.id,
      title: `${getTranslation("invoiceBill")}`,
      refNo: inv.invoiceNo,
      date: new Date(`${inv.date}T${inv.time}:00`).toISOString(),
      amount: inv.total,
      remarks: inv.items.map(item => item.name.split(" (")[0]).join(", "),
      invoiceObj: inv // Keep ref to open past invoices directly!
    });
  });

  payments.forEach(pay => {
    timeline.push({
      type: "payment",
      id: pay.id,
      title: `${getTranslation("paymentReceived")}`,
      refNo: pay.paymentMode,
      date: pay.date,
      amount: pay.amount,
      remarks: pay.remarks || "Recorded GPay/Cash settlement"
    });
  });

  // Sort timeline newest first
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  const timelineBox = document.getElementById("ledger-timeline-container");
  timelineBox.innerHTML = "";

  if (timeline.length === 0) {
    timelineBox.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 32px 0;">No ledger ledger statements created yet.</div>`;
    return;
  }

  timeline.forEach(event => {
    const card = document.createElement("div");
    card.className = `timeline-event-card ${event.type}`;
    
    const formattedDate = new Date(event.date).toLocaleDateString(state.activeLang === "en" ? "en-US" : (state.activeLang === "hi" ? "hi-IN" : "pa-IN"), {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    card.innerHTML = `
      <div class="event-details">
        <span class="event-title">
          ${event.title}
          <span class="invoice-no">${event.refNo}</span>
        </span>
        <span class="event-date">${formattedDate}</span>
        <span class="event-remarks">${event.remarks}</span>
      </div>
      <div class="event-amount">
        <span class="event-amount-val">${event.type === "credit" ? "+" : "-"} ₹${event.amount}</span>
        ${event.type === "credit" ? `
          <button class="btn btn-secondary btn-icon-only btn-view-inv" style="width:28px; height:28px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        ` : ""}
      </div>
    `;

    // Connect View past credit invoice trigger directly from timeline!
    if (event.type === "credit" && event.invoiceObj) {
      card.querySelector(".btn-view-inv").addEventListener("click", () => {
        openInvoiceModal(event.invoiceObj);
      });
    }

    timelineBox.appendChild(card);
  });
}

// ==========================================
// REPORTS PAGE
// ==========================================
function setupReportsEventListeners() {
  const typeFilter = document.getElementById("report-type-filter");
  const fromDate = document.getElementById("report-from-date");
  const toDate = document.getElementById("report-to-date");
  const searchQuery = document.getElementById("report-search-query");

  // Sync inputs on date triggers
  typeFilter.addEventListener("change", () => {
    renderReports();
  });
  
  fromDate.addEventListener("change", () => {
    document.querySelectorAll(".quick-date-btn").forEach(btn => btn.classList.remove("active"));
    renderReports();
  });

  toDate.addEventListener("change", () => {
    document.querySelectorAll(".quick-date-btn").forEach(btn => btn.classList.remove("active"));
    renderReports();
  });

  if (searchQuery) {
    searchQuery.addEventListener("input", () => {
      renderReports();
    });
  }

  // Bind Quick Date filters
  document.querySelectorAll(".quick-date-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Toggle active states
      document.querySelectorAll(".quick-date-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");

      const range = e.target.dataset.range;
      const todayStr = new Date().toISOString().split("T")[0];

      let fromStr = todayStr;
      let toStr = todayStr;

      if (range === "today") {
        fromStr = todayStr;
        toStr = todayStr;
      } else if (range === "yesterday") {
        const yesterday = new Date(Date.now() - 86400000);
        fromStr = yesterday.toISOString().split("T")[0];
        toStr = yesterday.toISOString().split("T")[0];
      } else if (range === "7days") {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        fromStr = sevenDaysAgo.toISOString().split("T")[0];
        toStr = todayStr;
      } else if (range === "month") {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        fromStr = `${yyyy}-${mm}-01`;
        
        const lastDay = new Date(yyyy, d.getMonth() + 1, 0);
        toStr = `${yyyy}-${mm}-${String(lastDay.getDate()).padStart(2, "0")}`;
      } else if (range === "all") {
        fromStr = "2020-01-01";
        toStr = todayStr;
      }

      fromDate.value = fromStr;
      toDate.value = toStr;
      renderReports();
    });
  });

  // Bind Sort Toggle
  const sortToggle = document.getElementById("report-sort-toggle");
  if (sortToggle) {
    sortToggle.addEventListener("click", () => {
      if (state.reportsSortOrder === "desc") {
        state.reportsSortOrder = "asc";
        document.getElementById("report-sort-icon").textContent = "↑";
        document.getElementById("report-sort-label").textContent = "Oldest First";
      } else {
        state.reportsSortOrder = "desc";
        document.getElementById("report-sort-icon").textContent = "↓";
        document.getElementById("report-sort-label").textContent = "Newest First";
      }
      renderReports();
    });
  }
}

function renderReports() {
  const type = document.getElementById("report-type-filter").value;
  const start = document.getElementById("report-from-date").value;
  const end = document.getElementById("report-to-date").value;

  const invoices = DB.getInvoices();
  const tbody = document.getElementById("report-table-body");
  const thead = document.getElementById("report-table-head");
  const grandTally = document.getElementById("report-grand-tally");
  const resTitle = document.getElementById("report-result-title");

  // Toggle search row visibility dynamically
  const searchRow = document.getElementById("report-search-row");
  if (searchRow) {
    if (type === "history") {
      searchRow.style.display = "block";
    } else {
      searchRow.style.display = "none";
    }
  }

  tbody.innerHTML = "";
  
  // Filter invoices within date range
  const rangeInvs = invoices.filter(inv => inv.date >= start && inv.date <= end);
  let totalSales = 0;

  if (type === "daily") {
    resTitle.textContent = `${getTranslation("dailyReport")} (${start} to ${end})`;
    
    // Daily Table Head
    thead.innerHTML = `
      <tr>
        <th data-i18n="invoiceNumber">Invoice No</th>
        <th data-i18n="dateTime">Date & Time</th>
        <th data-i18n="customer">Customer</th>
        <th class="num-cell" data-i18n="total">Total (₹)</th>
        <th data-i18n="paymentMode">Payment Mode</th>
        <th style="text-align: center;">Actions</th>
      </tr>
    `;

    // Sort range invoices based on selected sort order (Invoice No, Date & Time)
    rangeInvs.sort((a, b) => {
      const dateTimeA = `${a.date} ${a.time}`;
      const dateTimeB = `${b.date} ${b.time}`;
      
      const numA = parseInt((a.invoiceNo || "").split("-")[1]) || 0;
      const numB = parseInt((b.invoiceNo || "").split("-")[1]) || 0;

      if (state.reportsSortOrder === "desc") {
        if (dateTimeB !== dateTimeA) return dateTimeB.localeCompare(dateTimeA);
        return numB - numA;
      } else {
        if (dateTimeA !== dateTimeB) return dateTimeA.localeCompare(dateTimeB);
        return numA - numB;
      }
    });

    if (rangeInvs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);" data-i18n="noData">${getTranslation("noData")}</td></tr>`;
      grandTally.textContent = `Total Sales: ₹0`;
      return;
    }

    rangeInvs.forEach(inv => {
      totalSales += inv.total;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--dark);">${inv.invoiceNo}</td>
        <td>${inv.date} ${inv.time}</td>
        <td style="font-weight:500;">${inv.customerName}</td>
        <td class="num-cell" style="font-weight:700; color:var(--dark);">₹${inv.total}</td>
        <td><span class="product-row-category" style="${inv.paymentMode === 'udhaar' ? 'background-color:var(--danger-light); color:var(--danger);' : 'background-color:var(--success-light); color:var(--success);'}">${inv.paymentMode.toUpperCase()}</span></td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
            <button class="btn btn-secondary btn-sm btn-view-hist" style="padding: 4px 8px; font-size: 0.75rem;">View</button>
            <button class="btn btn-secondary btn-sm btn-pdf-hist" style="padding: 4px 8px; font-size: 0.75rem;">PDF</button>
            <button class="btn btn-secondary btn-sm btn-print-hist" style="padding: 4px 8px; font-size: 0.75rem;">Print</button>
            <button class="btn btn-primary btn-sm btn-wa-hist" style="padding: 4px 8px; font-size: 0.75rem;">WhatsApp</button>
          </div>
        </td>
      `;

      // Event handlers with safe transient currentInvoice context swapping
      tr.querySelector(".btn-view-hist").addEventListener("click", () => {
        openInvoiceModal(inv);
      });

      tr.querySelector(".btn-pdf-hist").addEventListener("click", () => {
        const oldCurrent = state.currentInvoice;
        state.currentInvoice = inv;
        downloadInvoicePDF();
        state.currentInvoice = oldCurrent;
      });

      tr.querySelector(".btn-print-hist").addEventListener("click", () => {
        const oldCurrent = state.currentInvoice;
        state.currentInvoice = inv;
        openInvoiceModal(inv);
        setTimeout(() => {
          window.print();
          state.currentInvoice = oldCurrent;
        }, 300);
      });

      tr.querySelector(".btn-wa-hist").addEventListener("click", () => {
        const oldCurrent = state.currentInvoice;
        state.currentInvoice = inv;
        shareInvoiceWhatsApp();
        state.currentInvoice = oldCurrent;
      });

      tbody.appendChild(tr);
    });

  } else if (type === "monthly") {
    resTitle.textContent = `${getTranslation("monthlyReport")} (${start} to ${end})`;
    thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Bills Generated</th>
        <th>Cash Tally (₹)</th>
        <th>Udhaar Tally (₹)</th>
        <th class="num-cell">Total Sales (₹)</th>
      </tr>
    `;

    // Group sales aggregates by Date
    const dailyMap = {};
    rangeInvs.forEach(inv => {
      if (!dailyMap[inv.date]) {
        dailyMap[inv.date] = { count: 0, cash: 0, udhaar: 0, total: 0 };
      }
      dailyMap[inv.date].count++;
      dailyMap[inv.date].total += inv.total;
      if (inv.paymentMode === "cash") {
        dailyMap[inv.date].cash += inv.total;
      } else {
        dailyMap[inv.date].udhaar += inv.total;
      }
    });

    const dates = Object.keys(dailyMap).sort();
    if (dates.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);" data-i18n="noData">${getTranslation("noData")}</td></tr>`;
      grandTally.textContent = `Total Sales: ₹0`;
      return;
    }

    dates.forEach(d => {
      const stats = dailyMap[d];
      totalSales += stats.total;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:600; color:var(--dark);">${d}</td>
        <td style="font-weight:500;">${stats.count} bills</td>
        <td style="color:var(--success); font-weight:600;">₹${stats.cash}</td>
        <td style="color:var(--danger); font-weight:600;">₹${stats.udhaar}</td>
        <td class="num-cell" style="font-weight:700; color:var(--dark);">₹${stats.total}</td>
      `;
      tbody.appendChild(tr);
    });

  } else if (type === "product") {
    resTitle.textContent = `${getTranslation("productSales")} (${start} to ${end})`;
    thead.innerHTML = `
      <tr>
        <th data-i18n="productName">Product Name</th>
        <th data-i18n="category">Category</th>
        <th>Quantity Sold</th>
        <th class="num-cell" data-i18n="total">Total Value (₹)</th>
      </tr>
    `;

    // Group aggregates by product
    const prodMap = {};
    rangeInvs.forEach(inv => {
      inv.items.forEach(item => {
        if (!prodMap[item.name]) {
          prodMap[item.name] = { category: "", qty: 0, total: 0, unit: item.unit };
        }
        // Resolve category if possible
        const origProd = DB.getProducts().find(p => p.name === item.name);
        prodMap[item.name].category = origProd ? origProd.category : "Groceries";
        prodMap[item.name].qty += item.qty;
        prodMap[item.name].total += item.amount;
      });
    });

    const items = Object.keys(prodMap).sort();
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);" data-i18n="noData">${getTranslation("noData")}</td></tr>`;
      grandTally.textContent = `Total Sales: ₹0`;
      return;
    }

    items.forEach(it => {
      const stats = prodMap[it];
      totalSales += stats.total;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:600; color:var(--dark);">${it.split(" (")[0]}</td>
        <td><span class="product-row-category">${stats.category}</span></td>
        <td style="font-weight:500;">${stats.qty.toFixed(2)} ${stats.unit}</td>
        <td class="num-cell" style="font-weight:700; color:var(--dark);">₹${stats.total}</td>
      `;
      tbody.appendChild(tr);
    });

  } else if (type === "history") {
    resTitle.textContent = `${getTranslation("invoiceHistory")} (${start} to ${end})`;
    thead.innerHTML = `
      <tr>
        <th data-i18n="invoiceNumber">Invoice No</th>
        <th data-i18n="dateTime">Date & Time</th>
        <th data-i18n="customer">Customer</th>
        <th class="num-cell" data-i18n="total">Total (₹)</th>
        <th data-i18n="paymentMode">Payment Mode</th>
        <th style="text-align: center;">Actions</th>
      </tr>
    `;

    // Filter range invoices by search query (invoice number, customer name, customer phone)
    const searchQuery = document.getElementById("report-search-query").value.trim().toLowerCase();
    const filteredInvs = rangeInvs.filter(inv => {
      if (!searchQuery) return true;
      const invNo = (inv.invoiceNo || "").toLowerCase();
      const custName = (inv.customerName || "").toLowerCase();
      const custPhone = (inv.customerPhone || "").toLowerCase();
      return invNo.includes(searchQuery) || custName.includes(searchQuery) || custPhone.includes(searchQuery);
    });

    // Sort range invoices based on selected sort order (Invoice No, Date & Time)
    filteredInvs.sort((a, b) => {
      const dateTimeA = `${a.date} ${a.time}`;
      const dateTimeB = `${b.date} ${b.time}`;
      
      const numA = parseInt((a.invoiceNo || "").split("-")[1]) || 0;
      const numB = parseInt((b.invoiceNo || "").split("-")[1]) || 0;

      if (state.reportsSortOrder === "desc") {
        if (dateTimeB !== dateTimeA) return dateTimeB.localeCompare(dateTimeA);
        return numB - numA;
      } else {
        if (dateTimeA !== dateTimeB) return dateTimeA.localeCompare(dateTimeB);
        return numA - numB;
      }
    });

    if (filteredInvs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);" data-i18n="noData">${getTranslation("noData")}</td></tr>`;
      grandTally.textContent = `Total Sales: ₹0`;
      return;
    }

    filteredInvs.forEach(inv => {
      totalSales += inv.total;
      const tr = document.createElement("tr");
      
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--dark);">${inv.invoiceNo}</td>
        <td>${inv.date} ${inv.time}</td>
        <td style="font-weight:500;">${inv.customerName}</td>
        <td class="num-cell" style="font-weight:700; color:var(--dark);">₹${inv.total}</td>
        <td><span class="product-row-category" style="${inv.paymentMode === 'udhaar' ? 'background-color:var(--danger-light); color:var(--danger);' : 'background-color:var(--success-light); color:var(--success);'}">${inv.paymentMode.toUpperCase()}</span></td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
            <button class="btn btn-secondary btn-sm btn-view-hist" style="padding: 4px 8px; font-size: 0.75rem;">View</button>
            <button class="btn btn-secondary btn-sm btn-pdf-hist" style="padding: 4px 8px; font-size: 0.75rem;">PDF</button>
            <button class="btn btn-secondary btn-sm btn-print-hist" style="padding: 4px 8px; font-size: 0.75rem;">Print</button>
            <button class="btn btn-primary btn-sm btn-wa-hist" style="padding: 4px 8px; font-size: 0.75rem;">WhatsApp</button>
          </div>
        </td>
      `;

      // Event handlers with safe transient currentInvoice context swapping
      tr.querySelector(".btn-view-hist").addEventListener("click", () => {
        openInvoiceModal(inv);
      });

      tr.querySelector(".btn-pdf-hist").addEventListener("click", () => {
        const oldCurrent = state.currentInvoice;
        state.currentInvoice = inv;
        downloadInvoicePDF();
        state.currentInvoice = oldCurrent;
      });

      tr.querySelector(".btn-print-hist").addEventListener("click", () => {
        const oldCurrent = state.currentInvoice;
        state.currentInvoice = inv;
        openInvoiceModal(inv);
        setTimeout(() => {
          window.print();
          state.currentInvoice = oldCurrent;
        }, 300);
      });

      tr.querySelector(".btn-wa-hist").addEventListener("click", () => {
        const oldCurrent = state.currentInvoice;
        state.currentInvoice = inv;
        shareInvoiceWhatsApp();
        state.currentInvoice = oldCurrent;
      });

      tbody.appendChild(tr);
    });
  } else if (type === "daily_expense") {
    resTitle.textContent = `${getTranslation("dailyExpenseReport")} (${start} to ${end})`;
    thead.innerHTML = `
      <tr>
        <th style="width: 25%;" data-i18n="expenseDate">Expense Date</th>
        <th style="width: 25%;" data-i18n="expenseCategory">Category</th>
        <th style="width: 20%; text-align: right;" data-i18n="expenseAmount">Amount (₹)</th>
        <th style="width: 30%;" data-i18n="expenseNote">Note / Description</th>
      </tr>
    `;

    const rangeExps = DB.getExpenses().filter(e => e.date >= start && e.date <= end);
    rangeExps.sort((a, b) => {
      if (state.reportsSortOrder === "desc") {
        return b.date.localeCompare(a.date);
      } else {
        return a.date.localeCompare(b.date);
      }
    });

    let totalExps = 0;
    if (rangeExps.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);" data-i18n="noData">No expenses found</td></tr>`;
      grandTally.textContent = `Total Expenses: ₹0`;
      return;
    }

    rangeExps.forEach(e => {
      const amountNum = parseFloat(e.amount || 0);
      totalExps += amountNum;
      const tr = document.createElement("tr");
      
      const categoryKey = e.category.toLowerCase();
      const categoryTranslated = getTranslation(categoryKey) || e.category;

      tr.innerHTML = `
        <td>${e.date}</td>
        <td style="font-weight: 600; color: var(--dark);">${categoryTranslated}</td>
        <td class="num-cell" style="font-weight: 700; color: var(--danger); text-align: right;">₹${amountNum.toFixed(2)}</td>
        <td style="color: var(--text-muted);">${e.note || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
    grandTally.textContent = `Total Expenses: ₹${totalExps.toLocaleString("en-IN")}`;

  } else if (type === "monthly_expense") {
    resTitle.textContent = `${getTranslation("monthlyExpenseReport")} (${start} to ${end})`;
    thead.innerHTML = `
      <tr>
        <th style="width: 40%;">Month</th>
        <th style="width: 30%; text-align: right;">Total Amount (₹)</th>
        <th style="width: 30%; text-align: center;">Expenses Count</th>
      </tr>
    `;

    const rangeExps = DB.getExpenses().filter(e => e.date >= start && e.date <= end);
    const groups = {};
    
    rangeExps.forEach(e => {
      const eDate = new Date(e.date);
      const monthName = eDate.toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!groups[monthName]) {
        groups[monthName] = { amount: 0, count: 0 };
      }
      groups[monthName].amount += parseFloat(e.amount || 0);
      groups[monthName].count += 1;
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
    if (state.reportsSortOrder === "asc") {
      sortedGroups.reverse();
    }

    let totalExps = 0;
    if (sortedGroups.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);" data-i18n="noData">No monthly data available</td></tr>`;
      grandTally.textContent = `Total Expenses: ₹0`;
      return;
    }

    sortedGroups.forEach(month => {
      const data = groups[month];
      totalExps += data.amount;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--dark);">${month}</td>
        <td class="num-cell" style="font-weight: 700; color: var(--danger); text-align: right;">₹${data.amount.toFixed(2)}</td>
        <td style="text-align: center;">${data.count}</td>
      `;
      tbody.appendChild(tr);
    });
    grandTally.textContent = `Total Expenses: ₹${totalExps.toLocaleString("en-IN")}`;

  } else if (type === "category_expense") {
    resTitle.textContent = `${getTranslation("categoryExpenseReport")} (${start} to ${end})`;
    thead.innerHTML = `
      <tr>
        <th style="width: 40%;" data-i18n="expenseCategory">Category</th>
        <th style="width: 30%; text-align: right;" data-i18n="expenseAmount">Total Spent (₹)</th>
        <th style="width: 30%; text-align: center;">Share (%)</th>
      </tr>
    `;

    const rangeExps = DB.getExpenses().filter(e => e.date >= start && e.date <= end);
    const groups = {};
    let totalExps = 0;

    rangeExps.forEach(e => {
      const amount = parseFloat(e.amount || 0);
      totalExps += amount;
      if (!groups[e.category]) {
        groups[e.category] = 0;
      }
      groups[e.category] += amount;
    });

    const sortedCategories = Object.keys(groups).sort((a, b) => groups[b] - groups[a]);
    if (state.reportsSortOrder === "asc") {
      sortedCategories.reverse();
    }

    if (sortedCategories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);" data-i18n="noData">No category data available</td></tr>`;
      grandTally.textContent = `Total Expenses: ₹0`;
      return;
    }

    sortedCategories.forEach(cat => {
      const amount = groups[cat];
      const pct = totalExps > 0 ? (amount / totalExps) * 100 : 0;
      const tr = document.createElement("tr");

      const categoryKey = cat.toLowerCase();
      const categoryTranslated = getTranslation(categoryKey) || cat;

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--dark);">${categoryTranslated}</td>
        <td class="num-cell" style="font-weight: 700; color: var(--danger); text-align: right;">₹${amount.toFixed(2)}</td>
        <td style="text-align: center; font-weight: 600; color: var(--text-muted);">${pct.toFixed(1)}%</td>
      `;
      tbody.appendChild(tr);
    });
    grandTally.textContent = `Total Expenses: ₹${totalExps.toLocaleString("en-IN")}`;
  }

  // Set localizations triggers
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = getTranslation(key);
  });

  if (!["daily_expense", "monthly_expense", "category_expense"].includes(type)) {
    grandTally.textContent = `Total Sales: ₹${totalSales.toLocaleString("en-IN")}`;
  }
}

// ==========================================
// SETTINGS SCREEN & STORAGE BACKUP
// ==========================================
function setupSettingsEventListeners() {
  const profileForm = document.getElementById("settings-profile-form");
  const backupBtn = document.getElementById("btn-backup-data");
  const restoreInput = document.getElementById("settings-restore-file");
  const resetBtn = document.getElementById("btn-reset-db");
  const firebaseCheck = document.getElementById("settings-firebase-enable");
  const firebaseFields = document.getElementById("firebase-config-fields-panel");
  const firebaseSaveBtn = document.getElementById("btn-save-firebase");

  // Save Shop profile submit
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const current = DB.getSettings();
    const updated = {
      ...current,
      shopName: document.getElementById("settings-shop-name").value.trim(),
      shopPhone: document.getElementById("settings-shop-phone").value.trim(),
      shopAddress: document.getElementById("settings-shop-address").value.trim(),
      shopTagline: current.shopTagline || ""
    };
    
    showToast("Saving shop details...", "info");
    DB.saveSettings(updated);
    showToast("Shop Profile settings updated!", "success");
  });

  // JSON Download backup
  backupBtn.addEventListener("click", () => {
    const dataStr = DB.getBackupJSON();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileName = `GurbhejStore_Backup_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();

    showToast("Store backup file downloaded!", "success");
  });

  // Restore DB uploaded file trigger
  restoreInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show visual confirmation prompt
    const confirmMsg = "This will replace current local data. Continue?";
    if (!confirm(confirmMsg)) {
      restoreInput.value = ""; // Clear file selection
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      showToast("Reading backup file...", "info");
      try {
        const data = JSON.parse(event.target.result);
        if (!data || typeof data !== "object") {
          throw new Error("Backup file is not a valid JSON object.");
        }
        if (!Array.isArray(data.products) || !Array.isArray(data.customers) || !Array.isArray(data.invoices)) {
          throw new Error("Invalid schema: missing core collections.");
        }

        const success = await DB.restoreFromJSON(event.target.result);
        if (success) {
          sessionStorage.setItem("pwa_restore_success", "true");
          window.location.reload();
        } else {
          showToast("Error! Failed to restore database.", "error");
          restoreInput.value = "";
        }
      } catch (err) {
        showToast("Error! Invalid backup JSON: " + err.message, "error");
        restoreInput.value = "";
      }
    };
    reader.onerror = () => {
      showToast("Error reading file!", "error");
      restoreInput.value = "";
    };
    reader.readAsText(file);
  });

  // Hard Reset Local Database
  resetBtn.addEventListener("click", () => {
    const confirmMsg = "CRITICAL WARNING: This will permanently delete all store catalog products, sales invoices, customer lists, and Khatabook ledger entries. This action CANNOT be undone!\n\nAre you absolutely sure you want to proceed?";
    
    if (confirm(confirmMsg)) {
      const userInput = prompt("To confirm deleting all local data, please type the word RESET:");
      
      if (userInput === "RESET") {
        showToast("Resetting database...", "info");
        DB.resetToDefaults();
        sessionStorage.setItem("pwa_reset_success", "true");
        window.location.reload();
      } else {
        showToast("Reset aborted. The word typed was incorrect.", "info");
      }
    }
  });

  // Firebase configurations fields animation panel switcher
  firebaseCheck.addEventListener("change", () => {
    if (firebaseCheck.checked) {
      firebaseFields.style.display = "block";
      // Fill current keys if they exist
      const cached = JSON.parse(localStorage.getItem("gurbhej_firebase_config"));
      if (cached) {
        document.getElementById("firebase-config-apiKey").value = cached.apiKey || "";
        document.getElementById("firebase-config-projectId").value = cached.projectId || "";
        document.getElementById("firebase-config-authDomain").value = cached.authDomain || "";
        document.getElementById("firebase-config-storageBucket").value = cached.storageBucket || "";
        document.getElementById("firebase-config-appId").value = cached.appId || "";
      }
    } else {
      firebaseFields.style.display = "none";
      DB.disableFirebase();
      updateCloudStatusIndicator();
      showToast("Disconnected from Firebase. standalone local mode active.", "info");
    }
  });

  // Connect Firebase action
  firebaseSaveBtn.addEventListener("click", async () => {
    const keys = {
      apiKey: document.getElementById("firebase-config-apiKey").value.trim(),
      projectId: document.getElementById("firebase-config-projectId").value.trim(),
      authDomain: document.getElementById("firebase-config-authDomain").value.trim(),
      storageBucket: document.getElementById("firebase-config-storageBucket").value.trim(),
      appId: document.getElementById("firebase-config-appId").value.trim()
    };

    if (!keys.apiKey || !keys.projectId) {
      showToast("API Key and Project ID are required!", "error");
      return;
    }

    showToast("Connecting to Google Cloud Firebase...", "info");
    const connected = await DB.enableFirebase(keys);
    
    if (connected) {
      updateCloudStatusIndicator();
      showToast("Cloud Connection Established! Sync is active.", "success");
    } else {
      showToast("Connection failed! Verify credentials.", "error");
    }
  });

  // UPI Payment Settings Form Handlers
  const upiForm = document.getElementById("settings-upi-form");
  const upiQrFile = document.getElementById("settings-upi-qr-file");
  const removeQrBtn = document.getElementById("btn-remove-upi-qr");
  let upiQrBase64 = "";

  // Preview helper
  const updateQrPreview = (base64) => {
    const previewContainer = document.getElementById("upi-qr-preview-container");
    if (previewContainer) {
      if (base64) {
        previewContainer.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: contain;">`;
        if (removeQrBtn) removeQrBtn.style.display = "inline-flex";
      } else {
        previewContainer.innerHTML = `<span style="font-size: 0.7rem; color: var(--text-muted); text-align: center; padding: 4px;">No QR</span>`;
        if (removeQrBtn) removeQrBtn.style.display = "none";
      }
    }
  };

  // Pre-load base64 for submission
  if (upiForm) {
    const cachedSettings = DB.getSettings();
    upiQrBase64 = cachedSettings.upiQrImage || "";
  }

  // File Upload Input listener
  if (upiQrFile) {
    upiQrFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast("Please upload an image file only!", "error");
        upiQrFile.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        upiQrBase64 = event.target.result;
        updateQrPreview(upiQrBase64);
        showToast("UPI QR Image uploaded!", "success");
      };
      reader.readAsDataURL(file);
    });
  }

  // Remove QR Button listener
  if (removeQrBtn) {
    removeQrBtn.addEventListener("click", () => {
      upiQrBase64 = "";
      if (upiQrFile) upiQrFile.value = "";
      updateQrPreview("");
      showToast("UPI QR Image removed!", "info");
    });
  }

  // Form Submit listener
  if (upiForm) {
    upiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const current = DB.getSettings();
      const updated = {
        ...current,
        upiName: document.getElementById("settings-upi-name").value.trim(),
        upiPhone: document.getElementById("settings-upi-phone").value.trim(),
        upiId: document.getElementById("settings-upi-id").value.trim(),
        upiQrImage: upiQrBase64
      };

      showToast("Saving UPI Settings...", "info");
      DB.saveSettings(updated);
      showToast("UPI Payment Settings updated!", "success");
    });
  }

  // Add Sample Products button
  const addSampleBtn = document.getElementById("btn-add-sample-products");
  if (addSampleBtn) {
    addSampleBtn.addEventListener("click", () => {
      showToast("Adding sample products & categories...", "info");
      DB.addSampleProducts();
      showToast("Sample products & transaction data successfully loaded!", "success");
      
      // Re-populate and render page
      populateCategoryDropdowns();
      renderActivePage();
    });
  }

  // Clear Sample Data button
  const clearSampleBtn = document.getElementById("btn-clear-sample-data");
  if (clearSampleBtn) {
    clearSampleBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all sample data? This will empty all products, categories, customers, and invoices, keeping only your shop profile.")) {
        showToast("Clearing all data records...", "info");
        DB.clearSampleData();
        showToast("All sample products and transaction records cleared!", "success");
        
        // Re-populate and render page
        populateCategoryDropdowns();
        renderActivePage();
      }
    });
  }
}

function renderSettings() {
  const shop = DB.getSettings();
  document.getElementById("settings-shop-name").value = shop.shopName;
  document.getElementById("settings-shop-phone").value = shop.shopPhone;
  document.getElementById("settings-shop-address").value = shop.shopAddress;

  const firebaseCheck = document.getElementById("settings-firebase-enable");
  const firebaseFields = document.getElementById("firebase-config-fields-panel");

  if (DB.isFirebaseEnabled()) {
    firebaseCheck.checked = true;
    firebaseFields.style.display = "block";
    const cached = JSON.parse(localStorage.getItem("gurbhej_firebase_config"));
    if (cached) {
      document.getElementById("firebase-config-apiKey").value = cached.apiKey || "";
      document.getElementById("firebase-config-projectId").value = cached.projectId || "";
      document.getElementById("firebase-config-authDomain").value = cached.authDomain || "";
      document.getElementById("firebase-config-storageBucket").value = cached.storageBucket || "";
      document.getElementById("firebase-config-appId").value = cached.appId || "";
    }
  } else {
    firebaseCheck.checked = false;
    firebaseFields.style.display = "none";
  }

  // Populate UPI Settings
  document.getElementById("settings-upi-name").value = shop.upiName || "";
  document.getElementById("settings-upi-phone").value = shop.upiPhone || "";
  document.getElementById("settings-upi-id").value = shop.upiId || "";

  // Pre-load base64 and show preview
  const previewContainer = document.getElementById("upi-qr-preview-container");
  const removeQrBtn = document.getElementById("btn-remove-upi-qr");
  if (previewContainer) {
    if (shop.upiQrImage) {
      previewContainer.innerHTML = `<img src="${shop.upiQrImage}" style="width: 100%; height: 100%; object-fit: contain;">`;
      if (removeQrBtn) removeQrBtn.style.display = "inline-flex";
    } else {
      previewContainer.innerHTML = `<span style="font-size: 0.7rem; color: var(--text-muted); text-align: center; padding: 4px;">No QR</span>`;
      if (removeQrBtn) removeQrBtn.style.display = "none";
    }
  }
}

// ==========================================
// SYSTEM HELPERS AND VIEW INTERFACING
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach(modal => {
    modal.classList.remove("active");
  });
  state.currentInvoice = null;
}

function showToast(text, type = "success") {
  const toast = document.getElementById("toast-notification");
  const icon = document.getElementById("toast-icon");
  const txt = document.getElementById("toast-text");

  if (!toast) return;

  txt.textContent = text;
  icon.textContent = type === "success" ? "✓" : (type === "error" ? "✕" : "ℹ");
  
  toast.className = `active ${type}`;

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3200);
}

function updateCloudStatusIndicator() {
  const indicator = document.getElementById("cloud-sync-indicator");
  const text = document.getElementById("cloud-sync-text");

  if (text) {
    if (DB.isFirebaseEnabled()) {
      if (indicator) indicator.className = "sync-dot active";
      text.textContent = "Firebase Sync Active";
    } else {
      if (indicator) indicator.className = "sync-dot";
      text.textContent = "Offline stand-alone Mode";
    }
  }
}

// ==========================================
// CUSTOMERS CRM SYSTEM
// ==========================================
function renderCustomers() {
  const customers = DB.getCustomers();
  const searchInput = document.getElementById("customer-list-search-crm");
  const query = (searchInput?.value || "").trim().toLowerCase();

  const filtered = customers.filter(c => {
    return c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query));
  });

  const tally = document.getElementById("crm-total-tally");
  if (tally) {
    tally.textContent = `Total Customers: ${filtered.length}`;
  }

  const tbody = document.getElementById("crm-table-body");
  if (tbody) {
    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No customers found.</td></tr>`;
    } else {
      filtered.forEach(cust => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight: bold; color: var(--dark);">${cust.name}</td>
          <td>${cust.phone || "-"}</td>
          <td>${cust.totalBills || 0}</td>
          <td style="font-weight: bold; color: var(--primary);">₹${(cust.totalPurchase || 0).toFixed(2)}</td>
          <td>${cust.lastVisit || "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
}

function setupCustomersEventListeners() {
  const searchInput = document.getElementById("customer-list-search-crm");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderCustomers();
    });
  }
}

// ==========================================
// EXPENSE MANAGEMENT SYSTEM (CRUD & FILTERS)
// ==========================================
function renderExpenses() {
  const expenses = DB.getExpenses();
  const rangeFilter = document.getElementById("expense-range-filter")?.value || "this_month";
  const catFilter = document.getElementById("expense-cat-filter")?.value || "all";
  
  // Apply Date Range Filter
  let filtered = expenses;
  const now = new Date();
  
  if (rangeFilter === "this_week") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    filtered = filtered.filter(e => {
      const eDate = new Date(e.date);
      return eDate >= sevenDaysAgo && eDate <= now;
    });
  } else if (rangeFilter === "this_month") {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    filtered = filtered.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
    });
  } else if (rangeFilter === "custom") {
    const fromStr = document.getElementById("expense-from-date")?.value;
    const toStr = document.getElementById("expense-to-date")?.value;
    if (fromStr && toStr) {
      const fromDate = new Date(fromStr);
      const toDate = new Date(toStr);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => {
        const eDate = new Date(e.date);
        return eDate >= fromDate && eDate <= toDate;
      });
    }
  }
  
  // Apply Category Filter
  if (catFilter !== "all") {
    filtered = filtered.filter(e => e.category === catFilter);
  }
  
  // Sort by newest date first
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Calculate Total Tally
  const totalVal = filtered.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const tallyEl = document.getElementById("expense-total-tally");
  if (tallyEl) {
    tallyEl.textContent = `₹${totalVal % 1 === 0 ? totalVal.toFixed(0) : totalVal.toFixed(2)}`;
  }
  
  // Populate Table
  const tbody = document.getElementById("expenses-table-body");
  if (tbody) {
    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;" data-i18n="noData">No expenses found.</td></tr>`;
      translateElement(tbody);
    } else {
      filtered.forEach(exp => {
        const tr = document.createElement("tr");
        const amountNum = parseFloat(exp.amount || 0);
        
        // Translate category if possible
        const categoryKey = exp.category.toLowerCase();
        const categoryTranslated = getTranslation(categoryKey) || exp.category;
        
        tr.innerHTML = `
          <td>${exp.date}</td>
          <td style="font-weight: 600; color: var(--dark);">${categoryTranslated}</td>
          <td style="text-align: right; font-weight: bold; color: var(--danger);">₹${amountNum % 1 === 0 ? amountNum.toFixed(0) : amountNum.toFixed(2)}</td>
          <td style="color: var(--text-muted); font-size: 0.95rem;">${exp.note || "-"}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 6px; justify-content: center;">
              <button class="btn btn-secondary btn-sm edit-exp-btn" data-id="${exp.id}" style="padding: 4px 8px; font-size: 0.75rem;" data-i18n="edit">Edit</button>
              <button class="btn btn-danger btn-sm delete-exp-btn" data-id="${exp.id}" style="padding: 4px 8px; font-size: 0.75rem;" data-i18n="delete">Delete</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
      
      // Bind Edit/Delete buttons dynamically
      tbody.querySelectorAll(".edit-exp-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          editExpenseInline(id);
        });
      });
      
      tbody.querySelectorAll(".delete-exp-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          if (confirm("Are you sure you want to delete this expense?")) {
            await DB.deleteExpense(id);
            showToast("Expense deleted successfully!", "success");
            renderExpenses();
            renderDashboard();
          }
        });
      });
      
      // Translate elements
      translateElement(tbody);
    }
  }
}

function editExpenseInline(id) {
  const expenses = DB.getExpenses();
  const exp = expenses.find(e => e.id === id);
  if (!exp) return;
  
  document.getElementById("expense-id-input").value = exp.id;
  document.getElementById("expense-date-input").value = exp.date;
  document.getElementById("expense-category-input").value = exp.category;
  document.getElementById("expense-amount-input").value = exp.amount;
  document.getElementById("expense-note-input").value = exp.note || "";
  
  // Update header title to Edit
  document.getElementById("expense-form-title").textContent = getTranslation("editExpense");
  document.getElementById("btn-cancel-expense").style.display = "inline-block";
  document.getElementById("btn-save-expense").textContent = getTranslation("save");
}

function setupExpensesEventListeners() {
  const form = document.getElementById("expense-form");
  const cancelBtn = document.getElementById("btn-cancel-expense");
  const rangeFilter = document.getElementById("expense-range-filter");
  const catFilter = document.getElementById("expense-cat-filter");
  const customApply = document.getElementById("btn-apply-expense-custom");
  
  // Set default date to today
  const dateInput = document.getElementById("expense-date-input");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const id = document.getElementById("expense-id-input").value;
      const date = document.getElementById("expense-date-input").value;
      const category = document.getElementById("expense-category-input").value;
      const amount = parseFloat(document.getElementById("expense-amount-input").value);
      const note = document.getElementById("expense-note-input").value.trim();
      
      if (!date || !category || isNaN(amount) || amount <= 0) {
        showToast("Please enter valid expense details.", "error");
        return;
      }
      
      const expenseObj = {
        date,
        category,
        amount,
        note
      };
      
      if (id) {
        expenseObj.id = id;
      }
      
      await DB.saveExpense(expenseObj);
      showToast(id ? "Expense updated successfully!" : "Expense recorded successfully!", "success");
      
      // Reset Form
      resetExpenseForm();
      renderExpenses();
      renderDashboard();
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      resetExpenseForm();
    });
  }
  
  if (rangeFilter) {
    rangeFilter.addEventListener("change", (e) => {
      const customDates = document.getElementById("expense-custom-dates");
      if (e.target.value === "custom") {
        if (customDates) customDates.style.display = "flex";
      } else {
        if (customDates) customDates.style.display = "none";
        renderExpenses();
      }
    });
  }
  
  if (catFilter) {
    catFilter.addEventListener("change", () => {
      renderExpenses();
    });
  }
  
  if (customApply) {
    customApply.addEventListener("click", () => {
      renderExpenses();
    });
  }
}

function resetExpenseForm() {
  const form = document.getElementById("expense-form");
  if (form) form.reset();
  document.getElementById("expense-id-input").value = "";
  const dateInput = document.getElementById("expense-date-input");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  document.getElementById("expense-form-title").textContent = getTranslation("addExpense");
  document.getElementById("btn-cancel-expense").style.display = "none";
  document.getElementById("btn-save-expense").textContent = getTranslation("saveExpense");
}

// ==========================================
// FIRST-TIME SHOP PROFILE SETUP & EDIT
// ==========================================
let setupQrBase64 = "";

function checkFirstTimeProfile() {
  const shop = DB.getSettings();
  if (!shop.profileCompleted) {
    // Populate form fields with existing settings if any
    document.getElementById("setup-shop-name").value = shop.shopName || "";
    document.getElementById("setup-owner-name").value = shop.ownerName || "";
    document.getElementById("setup-shop-phone").value = shop.shopPhone || "";
    document.getElementById("setup-shop-address").value = shop.shopAddress || "";
    document.getElementById("setup-shop-tagline").value = shop.shopTagline || "";
    document.getElementById("setup-upi-name").value = shop.upiName || "";
    document.getElementById("setup-upi-phone").value = shop.upiPhone || "";
    document.getElementById("setup-upi-id").value = shop.upiId || "";
    
    setupQrBase64 = shop.upiQrImage || "";
    const preview = document.getElementById("setup-qr-preview");
    const container = document.getElementById("setup-qr-preview-container");
    const removeBtn = document.getElementById("btn-setup-remove-qr");
    
    if (setupQrBase64) {
      if (preview) preview.src = setupQrBase64;
      if (container) container.style.display = "block";
      if (removeBtn) removeBtn.style.display = "inline-block";
    } else {
      if (preview) preview.src = "";
      if (container) container.style.display = "none";
      if (removeBtn) removeBtn.style.display = "none";
    }
    
    // Hide cancel/close button on mandatory setup
    const closeBtn = document.getElementById("btn-setup-close");
    if (closeBtn) closeBtn.style.display = "none";
    
    // Open Setup Screen
    const overlay = document.getElementById("profile-setup-overlay");
    if (overlay) overlay.style.display = "block";
  }
}

function setupProfileSetupEventListeners() {
  const setupForm = document.getElementById("profile-setup-form");
  const setupQrFile = document.getElementById("setup-upi-qr");
  const setupRemoveQrBtn = document.getElementById("btn-setup-remove-qr");
  const setupQrPreview = document.getElementById("setup-qr-preview");
  const setupQrPreviewContainer = document.getElementById("setup-qr-preview-container");
  const setupResetBtn = document.getElementById("btn-setup-reset");
  const setupCloseBtn = document.getElementById("btn-setup-close");
  const editProfileBtn = document.getElementById("btn-edit-full-profile");

  // QR Image uploader inside Setup screen
  if (setupQrFile) {
    setupQrFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (!file.type.startsWith("image/")) {
        showToast("Please upload an image file only!", "error");
        setupQrFile.value = "";
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setupQrBase64 = event.target.result;
        if (setupQrPreview) setupQrPreview.src = setupQrBase64;
        if (setupQrPreviewContainer) setupQrPreviewContainer.style.display = "block";
        if (setupRemoveQrBtn) setupRemoveQrBtn.style.display = "inline-block";
        showToast("UPI QR Image uploaded!", "success");
      };
      reader.readAsDataURL(file);
    });
  }

  // QR Image remover inside Setup screen
  if (setupRemoveQrBtn) {
    setupRemoveQrBtn.addEventListener("click", () => {
      setupQrBase64 = "";
      if (setupQrFile) setupQrFile.value = "";
      if (setupQrPreview) setupQrPreview.src = "";
      if (setupQrPreviewContainer) setupQrPreviewContainer.style.display = "none";
      if (setupRemoveQrBtn) setupRemoveQrBtn.style.display = "none";
      showToast("UPI QR Image removed!", "info");
    });
  }

  // Reset Setup fields
  if (setupResetBtn) {
    setupResetBtn.addEventListener("click", () => {
      if (setupForm) setupForm.reset();
      setupQrBase64 = "";
      if (setupQrPreview) setupQrPreview.src = "";
      if (setupQrPreviewContainer) setupQrPreviewContainer.style.display = "none";
      if (setupRemoveQrBtn) setupRemoveQrBtn.style.display = "none";
      showToast("Setup inputs cleared!", "info");
    });
  }

  // Close Setup overlay
  if (setupCloseBtn) {
    setupCloseBtn.addEventListener("click", () => {
      const overlay = document.getElementById("profile-setup-overlay");
      if (overlay) overlay.style.display = "none";
    });
  }

  // Profile Save Form Submit
  if (setupForm) {
    setupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const updated = {
        profileCompleted: true,
        shopName: document.getElementById("setup-shop-name").value.trim(),
        ownerName: document.getElementById("setup-owner-name").value.trim(),
        shopPhone: document.getElementById("setup-shop-phone").value.trim(),
        shopAddress: document.getElementById("setup-shop-address").value.trim(),
        shopTagline: document.getElementById("setup-shop-tagline").value.trim(),
        upiName: document.getElementById("setup-upi-name").value.trim(),
        upiPhone: document.getElementById("setup-upi-phone").value.trim(),
        upiId: document.getElementById("setup-upi-id").value.trim(),
        upiQrImage: setupQrBase64
      };
      
      showToast("Saving shop profile...", "info");
      DB.saveSettings(updated);
      showToast("Shop profile successfully saved!", "success");
      
      const overlay = document.getElementById("profile-setup-overlay");
      if (overlay) overlay.style.display = "none";
      
      // Sync controls and render dashboard
      renderSettings();
      switchPage("dashboard");
    });
  }

  // Bind settings "Edit Store Profile" banner button
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      const shop = DB.getSettings();
      
      document.getElementById("setup-shop-name").value = shop.shopName || "";
      document.getElementById("setup-owner-name").value = shop.ownerName || "";
      document.getElementById("setup-shop-phone").value = shop.shopPhone || "";
      document.getElementById("setup-shop-address").value = shop.shopAddress || "";
      document.getElementById("setup-shop-tagline").value = shop.shopTagline || "";
      document.getElementById("setup-upi-name").value = shop.upiName || "";
      document.getElementById("setup-upi-phone").value = shop.upiPhone || "";
      document.getElementById("setup-upi-id").value = shop.upiId || "";
      
      setupQrBase64 = shop.upiQrImage || "";
      if (setupQrBase64) {
        if (setupQrPreview) setupQrPreview.src = setupQrBase64;
        if (setupQrPreviewContainer) setupQrPreviewContainer.style.display = "block";
        if (setupRemoveQrBtn) setupRemoveQrBtn.style.display = "inline-block";
      } else {
        if (setupQrPreview) setupQrPreview.src = "";
        if (setupQrPreviewContainer) setupQrPreviewContainer.style.display = "none";
        if (setupRemoveQrBtn) setupRemoveQrBtn.style.display = "none";
      }
      
      // Make Cancel button visible in edit mode
      if (setupCloseBtn) setupCloseBtn.style.display = "inline-block";
      
      const overlay = document.getElementById("profile-setup-overlay");
      if (overlay) overlay.style.display = "block";
    });
  }
}
