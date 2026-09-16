function recalcFromDinos(){
    baseAmount = 0;

    dinoItems.forEach(d => {
        // Check if the Fanatic toggle is ON (safely checking in case it hasn't loaded yet)
        const fanaticMode = typeof isFanatic !== 'undefined' && isFanatic;
        
        // Only give it for free if: It's Booster Mode AND they are NOT a Fanatic AND the Dino has the free perk
        const isFree = (orderMode === "booster" && !fanaticMode && d.freeInBooster);

        if(!isFree){
            baseAmount += Number(d.basePrice);
        }

        if(d.extraFemale){
            baseAmount += d.extraFemale;
        }
    });

    // SAFE CALL
    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }
}

// =========================
// DEDUCT ORDER STOCK
// =========================

function deductOrderStock() {

    // 1. NEW: Check if the checkbox is checked before doing anything else
    const deductCheckbox = document.getElementById("deduct-stock-checkbox");
    
    // If the checkbox exists and is unchecked, exit the function without deducting
    if (deductCheckbox && !deductCheckbox.checked) {
        console.log("Stock deduction skipped because the checkbox is unchecked.");
        return; 
    }

    // Prevent the same order from deducting stock twice
    if (window.orderStockDeducted) {
        console.log("Stock already deducted for this order.");
        return;
    }

    if (!Array.isArray(dinoItems) || dinoItems.length === 0) {
        return;
    }

    // Work directly from the master dino data
    const stockData = dinoItemsSource || [];

    dinoItems.forEach(item => {

        const stockDino = stockData.find(
            d => d.name.toLowerCase() === item.name.toLowerCase()
        );

        if (!stockDino) {
            console.warn("Could not find stock for:", item.name);
            return;
        }

        // Make sure stock values are numbers
        stockDino.male = Number(stockDino.male) || 0;
        stockDino.female = Number(stockDino.female) || 0;

		// NEW GENDER-NEUTRAL CHECK
        if (stockDino.male === 0) {
            
            // If male is 0, assume gender-neutral and deduct 2 from female instead
            stockDino.female -= 2;
            
            // Extra female egg still consumes one additional
            if (item.extraFemale) {
                stockDino.female -= 1;
            }

        } else {
            
            // NORMAL LOGIC: 1 male + 1 female
            stockDino.male -= 1;
            stockDino.female -= 1;
            
            if (item.extraFemale) {
                stockDino.female -= 1;
            }
        }

        // Never allow stock to go below zero
        stockDino.male = Math.max(0, stockDino.male);
        stockDino.female = Math.max(0, stockDino.female);
    });

    // Save the updated stock permanently
    if (window.api && window.api.setDinos) {
        window.api.setDinos(stockData);
    }

    // Mark this order as deducted
    window.orderStockDeducted = true;

    // Refresh the local order button data
    try {
        dinoItemsSource = [...stockData];
    } catch (e) {
        dinoItemsSource.length = 0;
        dinoItemsSource.push(...stockData);
    }

    // Refresh dino buttons if available
    if (typeof initDinos === "function") {
        initDinos();
    }

    console.log("Order stock deducted successfully.");
}

function calculateAmount(){
    return Math.round(baseAmount * multiplier * discountMultiplier);
}

function applyDiscount(d){
    discountMultiplier = 1 - d;

    if(d === 0) discountText = "";
    else if(d === 0.1) discountText = "(10% Discount Applied)";
    else if(d === 0.25) discountText = "(25% Discount Applied)";
    else if(d === 0.35) discountText = "(35% Discount Applied)";
    else if(d === 0.5) discountText = "(50% Discount Applied)";
    else if(d === 1) discountText = "(100% Discount Applied)";

    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }
}

function setPaymentType(t) {

    paymentType = t;

    // Get the payment types from settingsdata.js
    const paymentTypes =
        typeof getPaymentTypes === "function"
            ? getPaymentTypes()
            : [];

    // Find the selected payment type
    const selectedPayment =
        paymentTypes.find(
            payment => payment.name === t
        );

    // Use the configured multiplier
    if (selectedPayment) {

        multiplier =
            Number(selectedPayment.multiplier);

    } else {

        // Fallback if the payment type cannot be found
        multiplier = 1;

    }

    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }
}

function generatePin(){
    let pin;
    do {
        pin = Math.floor(1000 + Math.random()*9000).toString();
    } while(new Set(pin).size !== pin.length);

    document.getElementById("pin-display").innerText = pin;

    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }
}

function resetForm() {
    // 1. Reset Logical State (Variables in state.js)
    fridgeColor = '';
    fridgeNumber = '';
    paymentType = '';
    discountText = '';
    discountMultiplier = 1;
    baseAmount = 0;
    multiplier = 1;
    amount = 0;
    selectedFridgeLabel = null;
    dinoItems = []; // Clear the scanned dinos
	// Reset stock deduction protection for the new order
    window.orderStockDeducted = false;
    
    // ✅ NEW: Reset Parser Counter Logic
    totalRequestedInText = 0; 

    // 2. Clear stored button references
    activeFridgeColorBtn = null;
    activeFridgeNumberBtn = null;
    activePaymentBtn = null;
    activeDiscountBtn = null;

    // 3. Remove "active" glow from ALL buttons
    const activeButtons = document.querySelectorAll('.button.active');
    activeButtons.forEach(btn => btn.classList.remove('active'));

    // 4. Clear Text Inputs and Textareas
    const inputsToClear = [
        "customer-name", 
        "auction-dino-name", 
        "auction-bid", 
        "order-input",
        "dino-search"
    ];
    
    inputsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    // 5. Clear specific UI displays
    const displaysToClear = ["pin-display", "order-summary"];
    displaysToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

    // ✅ NEW: Refresh the Counter UI to show 0 / 0
    if (typeof updateCounterUI === "function") {
        updateCounterUI();
    }

    // 6. Restore the Mode highlight
    updateModeUI();

    // 7. Refresh the summary (will show empty/None Selected)
    updateOrderSummary();

    console.log("Form Reset Complete");
}

function copyPinToClipboard() {
    const pinDisplay = document.getElementById('pin-display');
    const copyButton = document.getElementById('btn-copy-pin');
    const pin = pinDisplay.textContent.trim();

    if (!pin) {
        return;
    }

    navigator.clipboard.writeText(pin).then(() => {
        copyButton.textContent = 'Copied!';

        setTimeout(() => {
            copyButton.textContent = 'Copy PIN';
        }, 1500);
    });
}

/* expose globally */
window.recalcFromDinos = recalcFromDinos;
window.calculateAmount = calculateAmount;
window.applyDiscount = applyDiscount;
window.setPaymentType = setPaymentType;
window.generatePin = generatePin;
window.resetForm = resetForm;