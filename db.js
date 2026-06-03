// Unified Database Engine - Gurbhej Grocery Store
// Manages local state (LocalStorage) and handles real-time cloud sync with Firebase Firestore.

import { initializeFirebase, getFirebaseInstance } from "./firebase-config.js";

// Sample / Pre-loaded Data
const DEFAULT_PRODUCTS = [
  { id: "prod_sugar", name: "Sugar", nameHi: "चीनी", namePa: "ਖੰਡ", category: "Groceries", unit: "kg", rate: 46 },
  { id: "prod_atta", name: "Atta", nameHi: "आटा", namePa: "ਆਟਾ", category: "Flour", unit: "kg", rate: 35 },
  { id: "prod_rice", name: "Rice", nameHi: "चावल", namePa: "ਚੌਲ", category: "Groceries", unit: "kg", rate: 60 },
  { id: "prod_oil", name: "Mustard Oil", nameHi: "सरसों का तेल", namePa: "ਸਰ੍ਹੋਂ ਦਾ ਤੇਲ", category: "Oils", unit: "litre", rate: 140 },
  { id: "prod_dal", name: "Dal", nameHi: "दाल", namePa: "ਦਾਲ", category: "Pulses", unit: "kg", rate: 95 },
  { id: "prod_tea", name: "Tea", nameHi: "चाय", namePa: "ਚਾਹ", category: "Beverages", unit: "kg", rate: 280 },
  { id: "prod_salt", name: "Salt", nameHi: "नमक", namePa: "ਨਮਕ", category: "Spices", unit: "kg", rate: 22 },
  { id: "prod_soap", name: "Bath Soap", nameHi: "साबुन", namePa: "ਸਾਬਣ", category: "Household", unit: "piece", rate: 30 }
];

const DEFAULT_CATEGORIES = [
  { id: "cat_groceries", name: "Groceries", nameHi: "किराना", namePa: "ਕਰਿਆਨਾ", description: "Daily general grocery items" },
  { id: "cat_flour", name: "Flour", nameHi: "आटा", namePa: "ਆਟਾ", description: "Wheat flour, gram flour, etc." },
  { id: "cat_pulses", name: "Pulses", nameHi: "दालें", namePa: "ਦਾਲਾਂ", description: "Lentils and pulses" },
  { id: "cat_oils", name: "Oils", nameHi: "तेल", namePa: "ਤੇਲ", description: "Cooking oil, mustard oil, ghee" },
  { id: "cat_beverages", name: "Beverages", nameHi: "पेय पदार्थ", namePa: "ਪੇਅ ਪਦਾਰਥ", description: "Tea, coffee, cold drinks, juices" },
  { id: "cat_spices", name: "Spices", nameHi: "मसाले", namePa: "ਮਸਾਲੇ", description: "Spices and condiments" },
  { id: "cat_snacks", name: "Snacks", nameHi: "स्नैक्स", namePa: "ਸਨੈਕਸ", description: "Biscuits, chips, namkeen" },
  { id: "cat_dairy", name: "Dairy", nameHi: "डेयरी", namePa: "ਡੇਅਰੀ", description: "Milk, butter, paneer, curd" },
  { id: "cat_personal_care", name: "Personal Care", nameHi: "व्यक्तिगत देखभाल", namePa: "ਨਿੱਜੀ ਦੇਖਭਾਲ", description: "Shampoo, soaps, toothpaste" },
  { id: "cat_household", name: "Household", nameHi: "घरेलू सामान", namePa: "ਘਰੇਲੂ ਸਮਾਨ", description: "Detergents, cleaning products" }
];

const DEFAULT_CUSTOMERS = [
  { id: "cust_gurpreet", name: "Gurpreet Singh", phone: "9876543210", pendingBalance: 520, totalBills: 1, totalPurchase: 520, lastVisit: "2026-06-01", createdAt: "2026-05-15T10:00:00Z" },
  { id: "cust_amit", name: "Amit Kumar", phone: "9812345678", pendingBalance: 0, totalBills: 1, totalPurchase: 500, lastVisit: "2026-06-01", createdAt: "2026-05-18T12:30:00Z" },
  { id: "cust_rajwinder", name: "Rajwinder Kaur", phone: "9855566677", pendingBalance: 1250, totalBills: 0, totalPurchase: 0, lastVisit: "-", createdAt: "2026-05-20T14:45:00Z" }
];

const DEFAULT_INVOICES = [
  {
    id: "inv_1001",
    invoiceNo: "GS-1001",
    date: "2026-06-01",
    time: "09:30",
    customerId: "cust_gurpreet",
    customerName: "Gurpreet Singh",
    customerPhone: "9876543210",
    items: [
      { id: "prod_sugar", name: "Sugar", nameHi: "चीनी", namePa: "ਖੰਡ", qty: 2, rate: 46, amount: 92 },
      { id: "prod_rice", name: "Rice", nameHi: "चावल", namePa: "ਚੌਲ", qty: 5, rate: 60, amount: 300 },
      { id: "prod_oil", name: "Mustard Oil", nameHi: "सरसों का तेल", namePa: "ਸਰ੍ਹੋਂ ਦਾ ਤੇਲ", qty: 1, rate: 140, amount: 140 }
    ],
    subtotal: 532,
    discount: 12,
    total: 520,
    paymentMode: "udhaar",
    status: "Pending"
  },
  {
    id: "inv_1002",
    invoiceNo: "GS-1002",
    date: "2026-06-01",
    time: "11:15",
    customerId: "cust_amit",
    customerName: "Amit Kumar",
    customerPhone: "9812345678",
    items: [
      { id: "prod_atta", name: "Atta", nameHi: "आटा", namePa: "ਆਟਾ", qty: 10, rate: 35, amount: 350 },
      { id: "prod_dal", name: "Dal", nameHi: "दाल", namePa: "ਦਾਲ", qty: 2, rate: 95, amount: 190 }
    ],
    subtotal: 540,
    discount: 40,
    total: 500,
    paymentMode: "cash",
    status: "Paid"
  }
];

const DEFAULT_PAYMENTS = [
  {
    id: "pay_2001",
    customerId: "cust_gurbhej",
    amount: 200,
    date: "2026-06-01T10:00:00Z",
    paymentMode: "Cash",
    remarks: "Received partial payment at shop"
  }
];

class DatabaseEngine {
  constructor() {
    this.localKeyPrefix = "gurbhej_";
    this.firebaseActive = false;
    this.db = null; // Firestore reference
    this.auth = null; // Firebase Auth reference
    this.syncCallback = null; // UI update listener
  }

  /**
   * Initializes database. Loads cached LocalStorage, dynamically builds settings,
   * and triggers connection to Firebase Firestore if keys exist.
   */
  async init(onSyncReady = null) {
    this.syncCallback = onSyncReady;
    
    const settingsKey = this.getKey("settings");
    
    // Check if it's a completely new user / device (onboarding settings not yet completed)
    if (!localStorage.getItem(settingsKey)) {
      // Initialize as a blank new user/device
      localStorage.setItem(this.getKey("products"), JSON.stringify([]));
      localStorage.setItem(this.getKey("categories"), JSON.stringify([]));
      localStorage.setItem(this.getKey("customers"), JSON.stringify([]));
      localStorage.setItem(this.getKey("invoices"), JSON.stringify([]));
      localStorage.setItem(this.getKey("payments"), JSON.stringify([]));
      localStorage.setItem(this.getKey("expenses"), JSON.stringify([]));
      
      const blankSettings = {
        profileCompleted: false,
        shopName: "",
        ownerName: "",
        shopPhone: "",
        shopAddress: "",
        shopTagline: "",
        upiName: "",
        upiPhone: "",
        upiId: "",
        upiQrImage: ""
      };
      localStorage.setItem(settingsKey, JSON.stringify(blankSettings));
    } else {
      // Existing device safety: if specific keys are missing, initialize to empty arrays to prevent crashes
      const productsKey = this.getKey("products");
      if (localStorage.getItem(productsKey) === null) {
        localStorage.setItem(productsKey, JSON.stringify([]));
      }
      if (localStorage.getItem(this.getKey("categories")) === null) {
        localStorage.setItem(this.getKey("categories"), JSON.stringify([]));
      }
      if (localStorage.getItem(this.getKey("customers")) === null) {
        localStorage.setItem(this.getKey("customers"), JSON.stringify([]));
      }
      if (localStorage.getItem(this.getKey("invoices")) === null) {
        localStorage.setItem(this.getKey("invoices"), JSON.stringify([]));
      }
      if (localStorage.getItem(this.getKey("payments")) === null) {
        localStorage.setItem(this.getKey("payments"), JSON.stringify([]));
      }
      if (localStorage.getItem(this.getKey("expenses")) === null) {
        localStorage.setItem(this.getKey("expenses"), JSON.stringify([]));
      }
    }

    // Try starting Firebase Cloud Connection
    const fb = await initializeFirebase();
    if (fb) {
      this.db = fb.db;
      this.auth = fb.auth;
      this.firebaseActive = true;
      console.log("DatabaseEngine running in cloud-sync mode.");
      
      // Initial Sync from Firestore (Pull Cloud data into Local Storage Cache)
      await this.syncFromCloud();
    } else {
      console.log("DatabaseEngine running in offline standalone mode.");
    }
  }

  getKey(name) {
    return this.localKeyPrefix + name;
  }

  isFirebaseEnabled() {
    return this.firebaseActive;
  }

  // Pre-load static defaults
  resetToDefaults() {
    localStorage.setItem(this.getKey("products"), JSON.stringify([]));
    localStorage.setItem(this.getKey("categories"), JSON.stringify([]));
    localStorage.setItem(this.getKey("customers"), JSON.stringify([]));
    localStorage.setItem(this.getKey("invoices"), JSON.stringify([]));
    localStorage.setItem(this.getKey("payments"), JSON.stringify([]));
    localStorage.setItem(this.getKey("expenses"), JSON.stringify([]));
    
    const blankSettings = {
      profileCompleted: false,
      shopName: "",
      ownerName: "",
      shopPhone: "",
      shopAddress: "",
      shopTagline: "",
      upiName: "",
      upiPhone: "",
      upiId: "",
      upiQrImage: ""
    };
    localStorage.setItem(this.getKey("settings"), JSON.stringify(blankSettings));
  }

  // Generic local fetch helpers
  getLocalData(collection) {
    const data = localStorage.getItem(this.getKey(collection));
    return data ? JSON.parse(data) : [];
  }

  setLocalData(collection, data) {
    localStorage.setItem(this.getKey(collection), JSON.stringify(data));
  }

  /**
   * Syncs Firestore collections down to LocalStorage to ensure offline-first speeds
   */
  async syncFromCloud() {
    if (!this.firebaseActive || !this.db) return;
    try {
      console.log("Starting full database sync from Google Cloud Firestore...");
      
      // 1. Sync Products
      const prodSnap = await this.db.collection("products").get();
      if (!prodSnap.empty) {
        const cloudProds = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.setLocalData("products", cloudProds);
      }

      // 1.5 Sync Categories
      const catSnap = await this.db.collection("categories").get();
      if (!catSnap.empty) {
        const cloudCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.setLocalData("categories", cloudCats);
      }

      // 2. Sync Customers
      const custSnap = await this.db.collection("customers").get();
      if (!custSnap.empty) {
        const cloudCusts = custSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.setLocalData("customers", cloudCusts);
      }

      // 3. Sync Invoices
      const invSnap = await this.db.collection("invoices").get();
      if (!invSnap.empty) {
        const cloudInvs = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.setLocalData("invoices", cloudInvs);
      }

      // 4. Sync Payments
      const paySnap = await this.db.collection("payments").get();
      if (!paySnap.empty) {
        const cloudPays = paySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.setLocalData("payments", cloudPays);
      }

      // 5. Sync Expenses
      const expSnap = await this.db.collection("expenses").get();
      if (!expSnap.empty) {
        const cloudExps = expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.setLocalData("expenses", cloudExps);
      }

      console.log("Database Sync Completed Successfully!");
      if (this.syncCallback) this.syncCallback();
    } catch (error) {
      console.error("Error syncing database from Firestore:", error);
    }
  }

  /**
   * Enable Firebase Cloud Sync with new credentials
   */
  async enableFirebase(config) {
    localStorage.setItem("gurbhej_firebase_config", JSON.stringify(config));
    const fb = await initializeFirebase(config);
    if (fb) {
      this.db = fb.db;
      this.auth = fb.auth;
      this.firebaseActive = true;
      
      // Upload current local state to cloud to prevent data loss
      await this.uploadLocalDataToCloud();
      await this.syncFromCloud();
      return true;
    }
    return false;
  }

  /**
   * Disable Firebase Cloud Sync
   */
  disableFirebase() {
    localStorage.removeItem("gurbhej_firebase_config");
    this.firebaseActive = false;
    this.db = null;
    this.auth = null;
    console.log("Firebase sync deactivated. Switched to offline standalone mode.");
  }

  /**
   * Initial upload of local cached files to a new Cloud Firestore instance
   */
  async uploadLocalDataToCloud() {
    if (!this.firebaseActive || !this.db) return;
    try {
      console.log("Pushing local cache records to Cloud Database...");
      const batch = this.db.batch();

      // Products
      const prods = this.getLocalData("products");
      for (const item of prods) {
        const docRef = this.db.collection("products").doc(item.id);
        batch.set(docRef, item);
      }

      // Categories
      const cats = this.getLocalData("categories");
      for (const item of cats) {
        const docRef = this.db.collection("categories").doc(item.id);
        batch.set(docRef, item);
      }

      // Customers
      const custs = this.getLocalData("customers");
      for (const item of custs) {
        const docRef = this.db.collection("customers").doc(item.id);
        batch.set(docRef, item);
      }

      // Invoices
      const invs = this.getLocalData("invoices");
      for (const item of invs) {
        const docRef = this.db.collection("invoices").doc(item.id);
        batch.set(docRef, item);
      }

      // Payments
      const pays = this.getLocalData("payments");
      for (const item of pays) {
        const docRef = this.db.collection("payments").doc(item.id);
        batch.set(docRef, item);
      }

      // Expenses
      const exps = this.getLocalData("expenses");
      for (const item of exps) {
        const docRef = this.db.collection("expenses").doc(item.id);
        batch.set(docRef, item);
      }

      await batch.commit();
      console.log("Local records successfully uploaded and merged with Firestore!");
    } catch (error) {
      console.error("Error uploading local data to cloud:", error);
    }
  }

  // ==========================================
  // CATEGORIES APIS (CRUD)
  // ==========================================
  getCategories() {
    return this.getLocalData("categories");
  }

  async saveCategory(category) {
    const list = this.getCategories();
    if (!category.id) {
      category.id = "cat_" + Date.now();
      category.updatedAt = new Date().toISOString();
    }

    const idx = list.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...category };
    } else {
      list.push(category);
    }

    this.setLocalData("categories", list);

    // Sync to Firestore
    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("categories").doc(category.id).set(category);
      } catch (e) {
        console.error("Firestore category write queued:", e);
      }
    }
    return category;
  }

  async deleteCategory(id) {
    let list = this.getCategories();
    list = list.filter(c => c.id !== id);
    this.setLocalData("categories", list);

    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("categories").doc(id).delete();
      } catch (e) {
        console.error("Firestore category delete queued:", e);
      }
    }
  }

  // ==========================================
  // PRODUCTS APIS (CRUD)
  // ==========================================
  getProducts() {
    return this.getLocalData("products");
  }

  async saveProduct(product) {
    const list = this.getProducts();
    let isNew = false;
    if (!product.id) {
      product.id = "prod_" + Date.now();
      isNew = true;
    }

    if (product.barcode && product.barcode.trim() !== "") {
      const barcodeClean = product.barcode.trim();
      const duplicate = list.find(p => p.barcode && p.barcode.trim() === barcodeClean && p.id !== product.id);
      if (duplicate) {
        throw new Error("Barcode already assigned to another product");
      }
    }

    const idx = list.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...product };
    } else {
      list.push(product);
    }

    this.setLocalData("products", list);

    // Sync to Firestore
    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("products").doc(product.id).set(product);
      } catch (e) {
        console.error("Firestore product write queued (offline mode):", e);
      }
    }
    return product;
  }

  async deleteProduct(id) {
    let list = this.getProducts();
    list = list.filter(p => p.id !== id);
    this.setLocalData("products", list);

    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("products").doc(id).delete();
      } catch (e) {
        console.error("Firestore product delete queued:", e);
      }
    }
  }

  // ==========================================
  // CUSTOMERS APIS (CRUD)
  // ==========================================
  getCustomers() {
    return this.getLocalData("customers");
  }

  async saveCustomer(customer) {
    const list = this.getCustomers();
    const phone = customer.phone ? customer.phone.trim() : "";
    
    let existing = null;
    if (phone) {
      existing = list.find(c => c.phone && c.phone.trim() === phone);
    }
    
    if (existing) {
      // Reuse the existing customer ID
      const targetId = existing.id;
      const idx = list.findIndex(c => c.id === targetId);
      
      if (idx >= 0) {
        const existingCust = list[idx];
        let mergedTotalBills = (existingCust.totalBills || 0);
        let mergedTotalPurchase = (existingCust.totalPurchase || 0);
        
        if (customer.id !== existingCust.id) {
          mergedTotalBills += (customer.totalBills || 0);
          mergedTotalPurchase += (customer.totalPurchase || 0);
        } else {
          mergedTotalBills = customer.totalBills !== undefined ? customer.totalBills : mergedTotalBills;
          mergedTotalPurchase = customer.totalPurchase !== undefined ? customer.totalPurchase : mergedTotalPurchase;
        }
        
        list[idx] = {
          ...existingCust,
          ...customer,
          id: targetId,
          totalBills: mergedTotalBills,
          totalPurchase: mergedTotalPurchase,
          pendingBalance: customer.pendingBalance !== undefined ? customer.pendingBalance : (existingCust.pendingBalance || 0),
          createdAt: existingCust.createdAt || customer.createdAt || new Date().toISOString(),
          lastVisit: (customer.lastVisit && customer.lastVisit !== "-") ? customer.lastVisit : (existingCust.lastVisit || "-")
        };
        customer = list[idx];
      }
    } else {
      if (!customer.id) {
        customer.id = "cust_" + Date.now();
        customer.pendingBalance = customer.pendingBalance || 0;
        customer.createdAt = new Date().toISOString();
      }
      
      const idx = list.findIndex(c => c.id === customer.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...customer };
      } else {
        list.push(customer);
      }
    }

    this.setLocalData("customers", list);

    // Sync to Firestore
    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("customers").doc(customer.id).set(customer);
      } catch (e) {
        console.error("Firestore customer write queued:", e);
      }
    }
    return customer;
  }

  async deleteCustomer(id) {
    let list = this.getCustomers();
    list = list.filter(c => c.id !== id);
    this.setLocalData("customers", list);

    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("customers").doc(id).delete();
      } catch (e) {
        console.error("Firestore customer delete queued:", e);
      }
    }
  }

  // ==========================================
  // INVOICES & BILLING APIS
  // ==========================================
  getInvoices() {
    return this.getLocalData("invoices");
  }

  async saveInvoice(invoice) {
    const list = this.getInvoices();
    if (!invoice.id) {
      invoice.id = "inv_" + Date.now();
    }

    list.push(invoice);
    this.setLocalData("invoices", list);

    // If invoice is credit/udhaar, update customer pending balance
    if (invoice.paymentMode === "udhaar" && invoice.customerId) {
      await this.adjustCustomerBalance(invoice.customerId, invoice.total);
    }

    // Sync to Firestore
    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("invoices").doc(invoice.id).set(invoice);
      } catch (e) {
        console.error("Firestore invoice write queued:", e);
      }
    }
    return invoice;
  }

  // Helper to adjust customer outstanding balance
  async adjustCustomerBalance(customerId, amount) {
    const list = this.getCustomers();
    const idx = list.findIndex(c => c.id === customerId);
    if (idx >= 0) {
      list[idx].pendingBalance = (list[idx].pendingBalance || 0) + amount;
      this.setLocalData("customers", list);

      if (this.firebaseActive && this.db) {
        try {
          await this.db.collection("customers").doc(customerId).update({
            pendingBalance: list[idx].pendingBalance
          });
        } catch (e) {
          console.error("Firestore customer balance update queued:", e);
        }
      }
    }
  }

  // ==========================================
  // PAYMENTS APIS (UDHAAR COLLECTION)
  // ==========================================
  getPayments() {
    return this.getLocalData("payments");
  }

  async savePayment(payment) {
    const list = this.getPayments();
    if (!payment.id) {
      payment.id = "pay_" + Date.now();
      payment.date = payment.date || new Date().toISOString();
    }

    list.push(payment);
    this.setLocalData("payments", list);

    // Decrement customer pending balance by payment amount
    if (payment.customerId) {
      await this.adjustCustomerBalance(payment.customerId, -payment.amount);
    }

    // Sync to Firestore
    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("payments").doc(payment.id).set(payment);
      } catch (e) {
        console.error("Firestore payment write queued:", e);
      }
    }
    return payment;
  }

  // ==========================================
  // EXPENSES APIS (CRUD)
  // ==========================================
  getExpenses() {
    return this.getLocalData("expenses");
  }

  async saveExpense(expense) {
    const list = this.getExpenses();
    if (!expense.id) {
      expense.id = "exp_" + Date.now();
    }

    const idx = list.findIndex(e => e.id === expense.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...expense };
    } else {
      list.push(expense);
    }

    this.setLocalData("expenses", list);

    // Sync to Firestore
    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("expenses").doc(expense.id).set(expense);
      } catch (e) {
        console.error("Firestore expense write queued:", e);
      }
    }
    return expense;
  }

  async deleteExpense(id) {
    let list = this.getExpenses();
    list = list.filter(e => e.id !== id);
    this.setLocalData("expenses", list);

    if (this.firebaseActive && this.db) {
      try {
        await this.db.collection("expenses").doc(id).delete();
      } catch (e) {
        console.error("Firestore expense delete queued:", e);
      }
    }
  }

  // ==========================================
  // SHOP SETTINGS APIS
  // ==========================================
  getSettings() {
    const data = localStorage.getItem(this.getKey("settings"));
    const defaults = {
      profileCompleted: false,
      shopName: "",
      ownerName: "",
      shopPhone: "",
      shopAddress: "",
      shopTagline: "",
      upiName: "",
      upiPhone: "",
      upiId: "",
      upiQrImage: ""
    };
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.profileCompleted === undefined) {
        parsed.profileCompleted = true;
      }
      return { ...defaults, ...parsed };
    }
    return defaults;
  }

  saveSettings(settings) {
    localStorage.setItem(this.getKey("settings"), JSON.stringify(settings));
    // If connected to Firebase, save shop settings in Firestore config collection too
    if (this.firebaseActive && this.db) {
      try {
        this.db.collection("config").doc("shop_profile").set(settings);
      } catch (e) {
        console.error("Firestore shop profile write queued:", e);
      }
    }
  }

  // ==========================================
  // SYSTEM BACKUP & RESTORE APIS
  // ==========================================
  getBackupJSON() {
    const backup = {
      version: "1.1",
      timestamp: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      customers: this.getCustomers(),
      invoices: this.getInvoices(),
      payments: this.getPayments(),
      expenses: this.getExpenses(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  }

  async restoreFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== "object") {
        throw new Error("Invalid backup file format: data is not a JSON object.");
      }
      if (!Array.isArray(data.products) || !Array.isArray(data.customers) || !Array.isArray(data.invoices)) {
        throw new Error("Invalid backup file format: core collections (products, customers, invoices) are missing or invalid.");
      }

      this.setLocalData("products", data.products);
      this.setLocalData("categories", data.categories || []);
      this.setLocalData("customers", data.customers);
      this.setLocalData("invoices", data.invoices);
      this.setLocalData("payments", data.payments || data.khatabook || []);
      this.setLocalData("expenses", data.expenses || []);
      if (data.settings) this.saveSettings(data.settings);

      // Force push uploaded data to cloud if Firebase is active
      if (this.firebaseActive && this.db) {
        await this.uploadLocalDataToCloud();
      }

      return true;
    } catch (e) {
      console.error("Backup restoration failed:", e);
      return false;
    }
  }
  addSampleProducts() {
    this.setLocalData("products", DEFAULT_PRODUCTS);
    this.setLocalData("categories", DEFAULT_CATEGORIES);
    
    // Add sample expenses for playground testing
    const sampleExpenses = [
      { id: "exp_sample_1", date: new Date().toISOString().split('T')[0], category: "Transport", amount: 200, note: "Delivery van fuel charges" },
      { id: "exp_sample_2", date: new Date().toISOString().split('T')[0], category: "Electricity", amount: 850, note: "Electricity bill partial payment" }
    ];
    this.setLocalData("expenses", sampleExpenses);

    if (this.firebaseActive && this.db) {
      this.uploadLocalDataToCloud();
    }
  }

  clearSampleData() {
    this.setLocalData("products", []);
    this.setLocalData("categories", []);
    this.setLocalData("customers", []);
    this.setLocalData("invoices", []);
    this.setLocalData("payments", []);
    this.setLocalData("expenses", []);

    if (this.firebaseActive && this.db) {
      this.uploadLocalDataToCloud();
    }
  }
}

// Instantiate and export a single global DatabaseEngine
const DB = new DatabaseEngine();
export default DB;
