// =========================
// APP CONTROLLER
// =========================

document.addEventListener("DOMContentLoaded", initApp);

// =========================
// INIT
// =========================

async function initApp() {
    await initDinosSafe();
    initDinoUIState();
    bindUIEvents();

    await initNotes?.();
    await renderBreedingCards?.();

    setMode?.("regular");
}

// =========================
// INIT HELPERS
// =========================

async function initDinosSafe() {
    if (!window.api?.getDinos) return;

    const data = await window.api.getDinos();

    // NEW SINGLE SOURCE OF TRUTH
    dinoItemsSource = data || [];

    if (typeof initDinos === "function") {
        initDinos();
    }
}

function initDinoUIState() {
    const container = document.getElementById("dino-buttons");
    const toggleBtn = document.getElementById("toggle-dinos-btn");

    if (typeof dinosVisible !== "undefined") {
        dinosVisible = false;
    }

    if (container) container.style.display = "none";
    if (toggleBtn) toggleBtn.textContent = "Show Dinos";
}

// =========================
// EVENT BINDING (CLEAN)
// =========================

function bindUIEvents() {

    // 🔁 MODE SWITCHING
    bindClick("btn-regular", () => setMode("regular"));
    bindClick("btn-booster", () => setMode("booster"));
    bindClick("btn-auction", () => setMode("auction"));
    bindClick("btn-admin", () => setMode("admin"));
	bindClick("btn-breeding", () => {
    setMode("breeding");
    initBreeding();
});

    // 🏷️ AUCTION
    bindClick("btn-update-auction", () => updateAuction?.());

    // 🦖 DINOS
    bindClick("toggle-dinos-btn", toggleDinos);
    bindInput("dino-search", filterDinos);
    bindClick("btn-clear-search", clearSearch);

    // 📦 ORDER
    bindClick("btn-scan-order", scanOrderText);
    bindClick("btn-clear-order", clearOrderInput);

    // 👤 CUSTOMER
    bindClick("btn-clear-name", clearCustomerName);

    // 🔐 PIN
    bindClick("btn-pin", generatePin);

    // 📋 COPY / RESET
    bindClick("btn-copy", copyToClipboard);
    bindClick("btn-reset", resetForm);

    // 🌍 GLOBAL DELEGATION (SMART PART)
    document.body.addEventListener("click", handleGlobalClicks);
}

// =========================
// GENERIC BINDERS (KEY CLEANUP)
// =========================

function bindClick(id, handler) {
    document.getElementById(id)?.addEventListener("click", handler);
}

function bindInput(id, handler) {
    document.getElementById(id)?.addEventListener("input", handler);
}

// =========================
// GLOBAL CLICK HANDLER
// =========================

function handleGlobalClicks(e) {
    const t = e.target;

    // Only proceed if the clicked element is a button (or has the dataset)
    
    // 🔵 Fridge COLOR
    if (t.dataset.fridge) {
        setFridgeColor(t.dataset.fridge, e);
    }

    // 🔢 Fridge NUMBER
    if (t.dataset.fridgeNumber) {
        setFridgeNumber(t.dataset.fridgeNumber, e);
    }

    // 💰 Payment (Tek Options)
    if (t.dataset.payment) {
        setPaymentType(t.dataset.payment, e); // Added 'e'
    }

    // 🎯 Discount
    if (t.dataset.discount !== undefined) {
        applyDiscount(parseFloat(t.dataset.discount), e); // Added 'e'
    }
}

document.getElementById("btn-update-auction")?.addEventListener("click", () => {
    updateOrderSummary();
});

// =========================
// GLOBAL HELPERS (SAFE EXPORT)
// =========================

window.saveTableData = saveTableData;
window.loadTableData = loadTableData;
window.attachTableListeners = attachTableListeners;