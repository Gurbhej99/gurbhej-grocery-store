# Gurbhej Grocery Store - Fast Billing & Khatabook Static SPA

A premium, high-fidelity Single Page Application (SPA) designed for fast-paced grocery retail billing, credit ledgers (Khatabook), inventory cataloging, reports, and dynamic multilingual operations. 

Engineered with an **offline-first local architecture**, the application reads and writes instantly using `LocalStorage` caches, ensuring rapid checkout transactions at the counter. It includes an optional, real-time background sync hook that propagates data to **Google Cloud Firestore** when internet connectivity is active.

---

## 🌟 Key Features

### 1. Fast Billing & Bidirectional Weighing Math
* **Instant Autocomplete Search**: Focus instantly using keyboard shortcuts (`/` or `F2`). As you type, the dropdown dynamically matches English, Hindi, or Punjabi names.
* **Direct Grid Selection**: Grid of top-selling items for rapid one-click cart additions.
* **Bidirectional Weight Math**:
  * Entering **Quantity** updates **Amount** based on the selling rate.
  * Entering a customer's budget **Amount** (e.g. ₹100 sugar at ₹46/kg) automatically calibrates **Quantity** (evaluates exactly to `2.17 kg` rather than unrounded float points).
  * *Rapid Scales Adjustments*: Add weights in one click with built-in buttons (`+250g`, `+500g`, `+1`).

### 2. Multi-lingual Phonetic Transliterator
* The application runs in **English**, **Hindi (हिन्दी)**, or **Punjabi (ਪੰਜਾਬੀ)**, switching the entire UI vocabulary instantly.
* Includes an offline phonetic syllable transliteration engine. Typing an English item or category name automatically populates the Hindi and Punjabi equivalents on the fly (which remain manually editable).

### 3. Dynamic Category Management (CRUD & Inline Quick-Add)
* **Dedicated Categories Page**: A comprehensive panel allowing standard CRUD listing, searches, and configurations.
* **relational Integrity Guard**: Deleting a category checked against active inventory warns the merchant with a list of products using it (e.g., warning that "Atta" uses "Flour" before unlinking).
* **Inline Quick-Add**: 
  * Scroll to the bottom of the category dropdown on the product form to find `+ Add New Category`.
  * Opens a z-indexed quick modal overlay on top of the product popup.
  * Saving writes the category to the database, updates the dropdown, and **automatically selects** it for the product under setup without discarding form values.
  * An identical quick link is placed right underneath the catalog category search filter.

### 4. Professional Invoice Slip
* Styled like an authentic 80mm grocery thermal receipt.
* Includes custom serial numbers (e.g., `GS-1002`), customer details, payments summaries, and tailorable shop footers.
* **Native Thermal Print**: Custom `@media print` rules hide all SPA menus, headers, and sidebars, centering and printing *only* the receipt slip.
* **Offline PDF Export**: Converts the HTML thermal slip into a clean PDF instantly via browser canvases and jsPDF.
* **WhatsApp Direct Routing**: Prefills markdown-formatted invoice messages. If the customer's phone number is saved, routes the pre-filled message directly to `https://wa.me/91[Phone]`, otherwise opens standard WhatsApp routing.

### 5. Khatabook Credit Tracker
* Color-coded balances indicate outstanding debts (Red for outstanding debts, Green for fully settled accounts).
* Compiles unified chronological timelines showing invoice values (debited) and recorded payment receipt sums (credited).
* Clickable past credit ledger events launch receipt overlays instantly for transactional audits.

---

## 🛠️ Technology Stack & Zero-Build Design

To remain lightweight, highly resilient, and completely free of local compilation limits, this project uses **Zero-Build Architecture**:
1. **HTML5**: Semantic tags, canvas, and modular scripts.
2. **ES6 Javascript**: Dynamic imports, asynchronous adapters, and pure modular controller events.
3. **Vanilla CSS**: Premium modern HSL tokens, glassmorphic blur panel arrays, and print medias.
4. **External CDNs**: Loaded dynamically for jsPDF and Firebase SDKs.

No `npm install`, `node_modules`, `webpack`, or local bundlers are required! 

---

## 🚀 Deployment Instructions (Static Web Hosting)

Because Gurbhej Grocery Store is a 100% static web application, it can be hosted for **free** on any static host and runs natively from `index.html`.

### Running Locally (Pre-deployment)
Modern browsers enforce CORS safety rules on ES6 JS module imports (`import ... from "./..."`) when loaded directly from a local drive (`file:///...`). To run the app locally, serve it using any lightweight server:

* **Using Python** (Pre-installed on most machines):
  ```powershell
  python -m http.server 8000
  ```
  Then open **[http://localhost:8000](http://localhost:8000)** in your browser.
* **Using Node (npx)**:
  ```bash
  npx serve
  ```

---

### Free Deployment Platforms

#### Option A: Netlify (Easiest - 10 Seconds)
1. Register for a free account at [Netlify](https://www.netlify.com/).
2. Go to your Netlify Dashboard and navigate to **Sites**.
3. Scroll to the bottom where it says **"Want to deploy a new site without connecting to Git? Drag and drop your site folder here"**.
4. Simply drag and drop the `gurbhej grocery store` folder.
5. Your site is instantly live with a secure `https://...` URL!

#### Option B: GitHub Pages (Recommended for updates)
1. Create a new repository on your GitHub account.
2. Commit and push the project files to the `main` branch.
3. Go to the repository **Settings** tab.
4. In the left sidebar, click **Pages**.
5. Under **Build and deployment**, select **Deploy from a branch** and select your branch as `main` (folder `/root`).
6. Click **Save**. Your app will be live within 1–2 minutes!

#### Option C: Vercel
1. Install Vercel CLI globally or connect your GitHub account at [Vercel](https://vercel.com/).
2. Run `vercel` in the project root directory and follow the short prompts to deploy.

---

## ☁️ Setting Up Cloud Sync (Google Firebase Firestore)

By default, the application runs in **LocalStorage stand-alone mode** (highly secure, local browser storage). If you want real-time cloud backups across devices:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**. Name it `Gurbhej Grocery Store`.
2. In the project dashboard, click the **Web icon (</>)** to register a new Web App.
3. Firebase will show a configuration script. Copy *only* the configuration JSON block:
   ```json
   {
     "apiKey": "AIzaSy...",
     "authDomain": "gurbhej-store.firebaseapp.com",
     "projectId": "gurbhej-store",
     "storageBucket": "gurbhej-store.appspot.com",
     "messagingSenderId": "...",
     "appId": "..."
   }
   ```
4. Open the Gurbhej Grocery Store app, go to the **Settings** tab.
5. Under **Firebase Sync Settings**, paste the JSON block into the configuration text area and toggle the **"Sync Data to Firebase"** switch.
6. The app will immediately authenticate and merge all your offline local sales data with the Firestore cloud databases, activating live synchronization!
