// =========================================================
// AUCTION LIST LOGIC
// =========================================================

function addAuctionItem() {
    const nameInput = document.getElementById("auction-dino-name");
    const bidInput = document.getElementById("auction-bid");

    const name = nameInput.value.trim();
    const bid = Number(bidInput.value) || 0;

    if (name !== "" && bid > 0) {
        auctionEntries.push({ name: name, bid: bid });
        nameInput.value = "";
        bidInput.value = "";
        updateOrderSummary();

        // TRIGGER FEEDBACK HERE
        triggerButtonSuccess("btn-update-auction", "Auction Added!");
    } else {
        showAppAlert("Please enter both a Dino Name and a Winning Tek Amount.");
    }
}


// =========================================================
// CORE UI FUNCTIONS
// =========================================================

function updateModeUI() {
    document.getElementById("btn-regular")?.classList.remove("active");
    document.getElementById("btn-booster")?.classList.remove("active");
    document.getElementById("btn-auction")?.classList.remove("active");
    document.getElementById("btn-admin")?.classList.remove("active");
    document.getElementById("btn-notes")?.classList.remove("active");
    document.getElementById("btn-breeding")?.classList.remove("active");
    document.getElementById("btn-ads")?.classList.remove("active");
    document.getElementById("btn-settings")?.classList.remove("active");

    document.getElementById(`btn-${orderMode}`)?.classList.add("active");
}


function setMode(mode) {
    orderMode = mode;

    document.body.classList.remove(
        "template-regular",
        "template-booster",
        "template-auction",
        "template-admin",
        "template-notes",
        "template-breeding",
        "template-ads",
        "template-settings"
    );

    document.body.classList.add(`template-${mode}`);

    updateModeUI();
    updateTitle();

    if (typeof recalcFromDinos === "function") {
        recalcFromDinos();
    }

    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }

    if (mode === "admin" && typeof renderTable === "function") {
        renderTable();
        updateDinoCount();
    }

    updateAuctionBoosterUI();
}


function toggleDinos() {
    const container = document.getElementById("dino-buttons");

    dinosVisible = !dinosVisible;

    container.style.display =
        dinosVisible
            ? "flex"
            : "none";

    document.getElementById("toggle-dinos-btn").textContent =
        dinosVisible
            ? "Hide Dinos"
            : "Show Dinos";
}


function setFridgeColor(c, event) {
    fridgeColor = c;

    if (activeFridgeColorBtn) {
        activeFridgeColorBtn.classList.remove("active");
    }

    activeFridgeColorBtn = event.target;
    activeFridgeColorBtn.classList.add("active");

    updateSelectedFridge();

    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }
}


function setFridgeNumber(n, event) {
    fridgeNumber = n;

    if (activeFridgeNumberBtn) {
        activeFridgeNumberBtn.classList.remove("active");
    }

    activeFridgeNumberBtn = event.target;
    activeFridgeNumberBtn.classList.add("active");

    updateSelectedFridge();

    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }
}


function setPaymentType(type, event) {
    paymentType = type;

    // Get the multiplier from the saved Settings payment types
    const paymentTypes =
        (typeof getPaymentTypes === "function")
            ? getPaymentTypes()
            : [];

    const selectedPaymentType =
        paymentTypes.find(
            payment => payment.name === type
        );

    if (selectedPaymentType) {
        multiplier = Number(selectedPaymentType.multiplier) || 0;
    } else {
        // Safety fallback for existing payment types
        multiplier = 1;
    }

    if (activePaymentBtn) {
        activePaymentBtn.classList.remove("active");
    }

    activePaymentBtn = event.target;
    activePaymentBtn.classList.add("active");

    if (typeof recalcFromDinos === "function") {
        recalcFromDinos();
    }

    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }
}


function applyDiscount(value, event) {
    discountMultiplier = 1 - value;
    discountText =
        value > 0
            ? `(${value * 100}% Discount)`
            : "";

    if (activeDiscountBtn) {
        activeDiscountBtn.classList.remove("active");
    }

    activeDiscountBtn = event.target;
    activeDiscountBtn.classList.add("active");

    if (typeof recalcFromDinos === "function") {
        recalcFromDinos();
    }

    if (typeof updateOrderSummary === "function") {
        updateOrderSummary();
    }
}


function resetApp() {
    document.getElementById("customer-name").value = "";
    document.getElementById("customer-name").classList.remove("booster-detected");

    document.getElementById("auction-dino-name").value = "";
    document.getElementById("auction-bid").value = "";

    document.getElementById("order-summary")?.classList.remove("scan-success-glow");

    if (document.getElementById("order-input")) {
        document.getElementById("order-input").value = "";
    }

    auctionEntries = [];
    dinoItems = [];
    fridgeColor = "";
    fridgeNumber = "";
    paymentType = "";
    discountText = "";
    discountMultiplier = 1;

    if (activeFridgeColorBtn) {
        activeFridgeColorBtn.classList.remove("active");
    }

    if (activeFridgeNumberBtn) {
        activeFridgeNumberBtn.classList.remove("active");
    }

    if (activePaymentBtn) {
        activePaymentBtn.classList.remove("active");
    }

    if (activeDiscountBtn) {
        activeDiscountBtn.classList.remove("active");
    }

    activeFridgeColorBtn = null;
    activeFridgeNumberBtn = null;
    activePaymentBtn = null;
    activeDiscountBtn = null;

    isF2F = false;

    document.getElementById("btn-f2f")?.classList.remove("active");

    isFanatic = false;

    document.getElementById("btn-fanatic")?.classList.remove("active");

    const charCounter =
        document.getElementById("char-count");

    if (charCounter) {
        charCounter.textContent = "0 / 2000";
        charCounter.classList.remove("char-limit-exceeded");
    }

    updateSelectedFridge();
    updateOrderSummary();
    updateAuctionBoosterUI();
}


function clearCustomerName() {
    const nameInput =
        document.getElementById("customer-name");

    if (nameInput) {
        nameInput.value = "";
        nameInput.classList.remove("booster-detected");
    }

    auctionEntries = [];

    updateAuctionBoosterUI();
    updateOrderSummary();
}


function toggleF2F() {
    isF2F = !isF2F;

    const btn =
        document.getElementById("btn-f2f");

    if (isF2F) {
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }

    updateOrderSummary();
}


let isFanatic = false;


// =========================================================
// FANATIC MODE
// =========================================================

function toggleFanatic() {
    isFanatic = !isFanatic;

    const btn =
        document.getElementById("btn-fanatic");

    if (isFanatic) {
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }

    if (typeof recalcFromDinos === "function") {
        recalcFromDinos();
    }

    updateOrderSummary();
}


// =========================================================
// SETTINGS TEXT HELPER
// =========================================================

function getSummaryText(type, key) {
    if (typeof getOrderSummaryText !== "function") {
        return "";
    }

    return getOrderSummaryText(type, key) || "";
}


// =========================================================
// SUMMARY & POPULATION
// =========================================================

function updateOrderSummary() {

    const box =
        document.getElementById("order-summary");

    if (!box) {
        return;
    }

    updateSelectedFridge();


    // =========================================================
    // TEMPLATE 1: AUCTION MODE
    // =========================================================

    if (orderMode === "auction") {

        const customer =
            document.getElementById("customer-name")?.value || "";

        const boosterRow =
            findBoosterRow(customer);

        const isBooster =
            !!boosterRow;


        // =====================================================
        // PIN
        // =====================================================

        let pin =
            document.getElementById("pin-display")?.innerText || "";


        // =====================================================
        // AUCTION NAMES
        // =====================================================

        const namesArray =
            auctionEntries.map(
                item => item.name
            );

        let headerName =
            namesArray.length > 0
                ? namesArray.join(" & ")
                : "Adult Pair";


        let auctionWord =
            auctionEntries.length > 1
                ? "auctions"
                : "auction";


        // =====================================================
        // AUCTION DETAILS
        // =====================================================

        let totalBid = 0;

        let detailsHTML =
            auctionEntries.map(
                item => {

                    totalBid += item.bid;

                    let detailText =
                        getSummaryText(
                            "auction",
                            "detail"
                        );

                    detailText =
                        detailText.replace(
                            /{{dinoName}}/g,
                            item.name
                        );

                    detailText =
                        detailText.replace(
                            /{{bid}}/g,
                            item.bid
                        );

                    return detailText;

                }
            ).join("<br><br>");


        if (auctionEntries.length === 0) {

            detailsHTML =
                getSummaryText(
                    "auction",
                    "emptyDetail"
                );

        }


        // =====================================================
        // AUCTION TOTAL
        // =====================================================

        let totalText =
            getSummaryText(
                "auction",
                "total"
            );

        totalText =
            totalText.replace(
                /{{totalBid}}/g,
                totalBid
            );


        // =====================================================
        // AUCTION LOCATION
        // =====================================================

        let locationText = "";

        if (isBooster) {

            locationText =
                getSummaryText(
                    "auction",
                    "boosterLocation"
                );

        } else {

            locationText =
                getSummaryText(
                    "auction",
                    "regularLocation"
                );

        }


        // =====================================================
        // AUCTION COLLECTION LINE
        // =====================================================

        let collectionLine = "";

        if (isBooster) {

            collectionLine =
                getSummaryText(
                    "auction",
                    "boosterCollection"
                );

        } else {

            if (
                typeof isF2F !== "undefined" &&
                isF2F
            ) {

                collectionLine =
                    getSummaryText(
                        "auction",
                        "collectionF2F"
                    );

                collectionLine =
                    collectionLine.replace(
                        /{{selectedFridgeLabel}}/g,
                        selectedFridgeLabel
                    );

                collectionLine =
                    collectionLine.replace(
                        /{{pin}}/g,
                        pin
                    );

            } else {

                collectionLine =
                    getSummaryText(
                        "auction",
                        "collection"
                    );

                collectionLine =
                    collectionLine.replace(
                        /{{selectedFridgeLabel}}/g,
                        selectedFridgeLabel
                    );

                collectionLine =
                    collectionLine.replace(
                        /{{pin}}/g,
                        pin
                    );

            }

        }


        // =====================================================
        // LOAD SAVED AUCTION TEMPLATE
        // =====================================================

        let summaryText =
            typeof getOrderTemplate === "function"
                ? getOrderTemplate("auction")
                : "";


        // =====================================================
        // REPLACE AUCTION VARIABLES
        // =====================================================

        const auctionData = {

            headerName:
                headerName,

            auctionWord:
                auctionWord,

            locationText:
                locationText,

            collectionLine:
                collectionLine,

            detailsHTML:
                detailsHTML,

            totalText:
                totalText

        };


        Object.keys(auctionData).forEach(
            key => {

                const variable =
                    new RegExp(
                        `{{${key}}}`,
                        "g"
                    );

                summaryText =
                    summaryText.replace(
                        variable,
                        auctionData[key]
                    );

            }
        );


        box.innerHTML =
            summaryText;


    } else {

        // =====================================================
        // TEMPLATE 2: REGULAR / BOOSTER MODE
        // =====================================================


        // =====================================================
        // BUILD DINO TEXT
        // =====================================================

        let dinoText =
            dinoItems.map(
                (d, index) => {

                    const isFree =
                        (
                            orderMode === "booster" &&
                            !isFanatic &&
                            d.freeInBooster
                        );


                    const priceDisplay =
                        isFree
                            ? 0
                            : (
                                d.basePrice ??
                                d.price ??
                                0
                            );


                    let text =
                        `${d.full}: ${priceDisplay}`;


                    // =================================================
                    // BOOSTER PERK TEXT
                    // =================================================

                    if (
                        orderMode === "booster" &&
                        !isFanatic &&
                        d.freeInBooster
                    ) {

                        let boosterPerkText =
                            getSummaryText(
                                "regular",
                                "boosterPerk"
                            );

                        text += boosterPerkText;

                    }


                    // =================================================
                    // EXTRA FEMALE TEXT
                    // =================================================

                    if (
                        d.extraFemale &&
                        d.extraFemale > 0
                    ) {

                        let extraFemaleText =
                            getSummaryText(
                                "regular",
                                "extraFemale"
                            );

                        extraFemaleText =
                            extraFemaleText.replace(
                                /{{extraFemale}}/g,
                                d.extraFemale
                            );

                        text += extraFemaleText;

                    }


                    // =================================================
                    // INJECT WARNING UI IF PARSER IS UNSURE
                    // =================================================

                    if (d._isUnsure) {

                        const safeOriginal =
                            d._originalInput.replace(
                                /'/g,
                                "\\'"
                            );


                        let alternativesHtml =
                            d._alternatives.map(
                                alt => {

                                    const safeAltName =
                                        alt.name.replace(
                                            /'/g,
                                            "\\'"
                                        );


                                    return `
                                        <button
                                            class="button"
                                            style="font-size:12px; padding:4px 8px; margin:2px;"
                                            onclick="learnDino(${index}, '${safeOriginal}', '${safeAltName}')">
                                            ${alt.name}
                                        </button>
                                    `;

                                }
                            ).join("");


                        text += `
                            <span
                                class="unsure-flag"
                                style="
                                    display:inline-block;
                                    position:relative;
                                    margin-left:10px;
                                ">

                                <span
                                    style="
                                        cursor:pointer;
                                        font-size:1.2em;
                                    "
                                    onclick="toggleSuggestions(${index})">
                                    ⚠️
                                </span>

                                <div
                                    id="suggestions-${index}"
                                    style="
                                        display:none;
                                        position:absolute;
                                        bottom:120%;
                                        left:0;
                                        background:#1e1e24;
                                        border:1px solid #ff4d6d;
                                        padding:10px;
                                        border-radius:5px;
                                        z-index:100;
                                        width:260px;
                                        box-shadow:0 4px 12px rgba(0,0,0,0.8);
                                    ">

                                    <p
                                        style="
                                            margin:0 0 8px 0;
                                            font-size:13px;
                                            color:#fff;
                                        ">

                                        Unsure about:
                                        <b style="color:#ff4d6d;">
                                            "${d._originalInput}"
                                        </b>

                                        <br>

                                        Did you mean:

                                    </p>

                                    ${alternativesHtml}

                                </div>

                            </span>
                        `;

                    }


                    return text;

                }
            ).join("<br>");


        // =====================================================
        // PIN
        // =====================================================

        let pin =
            document.getElementById(
                "pin-display"
            )?.innerText || "";


        // =====================================================
        // CURRENT AMOUNT
        // =====================================================

        let currentAmount =
            (
                typeof calculateAmount ===
                "function"
            )
                ? calculateAmount()
                : 0;


        // =====================================================
        // COLLECTION LINE
        // =====================================================

        let collectionLine = "";


        if (
            orderMode === "booster"
        ) {

            collectionLine =
                getSummaryText(
                    "regular",
                    "boosterCollection"
                );

        } else {

            if (
                typeof isF2F !== "undefined" &&
                isF2F
            ) {

                collectionLine =
                    getSummaryText(
                        "regular",
                        "collectionF2F"
                    );

                collectionLine =
                    collectionLine.replace(
                        /{{selectedFridgeLabel}}/g,
                        selectedFridgeLabel
                    );

                collectionLine =
                    collectionLine.replace(
                        /{{pin}}/g,
                        pin
                    );

            } else {

                collectionLine =
                    getSummaryText(
                        "regular",
                        "collection"
                    );

                collectionLine =
                    collectionLine.replace(
                        /{{selectedFridgeLabel}}/g,
                        selectedFridgeLabel
                    );

                collectionLine =
                    collectionLine.replace(
                        /{{pin}}/g,
                        pin
                    );

            }

        }


        // =====================================================
        // LOAD SAVED TEMPLATE
        // =====================================================

        const templateType =
            orderMode === "booster"
                ? "booster"
                : "regular";


        let summaryText =
            typeof getOrderTemplate === "function"
                ? getOrderTemplate(templateType)
                : "";


        // =====================================================
        // REPLACE TEMPLATE VARIABLES
        // =====================================================

        const templateData = {

            collectionLine:
                collectionLine,

            dinoText:
                dinoText,

            currentAmount:
                currentAmount,

            paymentType:
                paymentType,

            discountText:
                discountText

        };


        Object.keys(templateData).forEach(
            key => {

                const variable =
                    new RegExp(
                        `{{${key}}}`,
                        "g"
                    );

                summaryText =
                    summaryText.replace(
                        variable,
                        templateData[key]
                    );

            }
        );


        // =====================================================
        // PUT FINAL SUMMARY INTO BOX
        // =====================================================

        box.innerHTML =
            summaryText;

    }


    // =========================================================
    // GLOBAL: CHARACTER COUNTING LOGIC
    // =========================================================

    const charCounter =
        document.getElementById(
            "char-count"
        );


    if (charCounter) {

        const count =
            box.innerText.length;


        charCounter.textContent =
            `${count} / 2000`;


        if (count > 2000) {

            charCounter.classList.add(
                "char-limit-exceeded"
            );

        } else {

            charCounter.classList.remove(
                "char-limit-exceeded"
            );

        }

    }

}


// =========================================================
// CLIPBOARD & TABLES
// =========================================================

function copyToClipboard() {

    let success = true;

    const customer =
        document.getElementById("customer-name")?.value || "";


    if (orderMode === "booster") {

        success =
            populateBooster();

    } else if (orderMode === "auction") {

        const boosterRow =
            findBoosterRow(customer);

        const totalAmount =
            auctionEntries.reduce(
                (sum, item) => sum + item.bid,
                0
            );


        if (boosterRow) {

            const tds =
                boosterRow.querySelectorAll("td");

            const tekCell =
                tds[1];

            const existing =
                Number(tekCell.innerText || 0);

            tekCell.innerText =
                existing + totalAmount;

            if (typeof saveTableData === "function") {
                saveTableData();
            }

        } else {

            success =
                populateRegularOrAuction();

        }

    } else {

        success =
            populateRegularOrAuction();

    }


    // Do NOT deduct stock if the order failed
    if (!success) {
        return;
    }


    // ==========================================
    // DEDUCT MALE + FEMALE STOCK
    // ==========================================

    deductOrderStock();


    setTimeout(() => {

        const text =
            document.getElementById(
                "order-summary"
            )?.innerText || "";


        if (text) {

            navigator.clipboard.writeText(text);

            triggerButtonSuccess(
                "btn-copy",
                "Copied!"
            );

        }

    }, 50);
}


function populateBooster() {

    const customer =
        document.getElementById(
            "customer-name"
        )?.value?.trim() || "";


    const amount =
        (
            typeof calculateAmount ===
            "function"
        )
            ? calculateAmount()
            : 0;


    const rows =
        document.querySelectorAll(
            "#booster-table-container table tr"
        );


    let found = false;


    for (const row of rows) {

        const tds =
            row.querySelectorAll("td");

        if (tds.length < 2) {
            continue;
        }


        const nameCell =
            tds[0];

        const tekCell =
            tds[1];


        if (
            nameCell.innerText.trim().toLowerCase() ===
            customer.toLowerCase()
        ) {

            const existing =
                Number(tekCell.innerText || 0);

            tekCell.innerText =
                existing + amount;

            found = true;

            break;

        }

    }


    if (found) {

        if (typeof saveTableData === "function") {
            saveTableData();
        }

        return true;

    } else {

        showAppAlert(
            "Customer not found in Booster Table. Please check spelling or add them manually."
        );

        return false;

    }

}


function populateRegularOrAuction() {

    if (!selectedFridgeLabel) {

        showAppAlert(
            "Please select a Fridge Color and Number first."
        );

        return false;

    }


    const row =
        findFridgeRow(selectedFridgeLabel);


    if (!row) {
        return false;
    }


    const customer =
        document.getElementById(
            "customer-name"
        )?.value || "";


    const amount =
        (orderMode === "auction")
            ? auctionEntries.reduce(
                (sum, item) => sum + item.bid,
                0
            )
            : calculateAmount();


    const cells =
        row.querySelectorAll("td");


    if (cells.length < 3) {
        return false;
    }


    if (
        cells[1].innerText.trim() !== ""
    ) {

        showAppAlert(
            "Fridge Full, use different Fridge"
        );

        return false;

    }


    cells[1].innerText =
        customer;

    cells[2].innerText =
        amount;


    if (typeof saveTableData === "function") {
        saveTableData();
    }


    return true;
}


// =========================================================
// HELPERS
// =========================================================

function findFridgeRow(label) {

    const tables =
        document.querySelectorAll(
            "#regular-tables table"
        );


    for (const table of tables) {

        const rows =
            table.querySelectorAll("tr");


        for (const row of rows) {

            const firstCell =
                row.querySelector("td");


            if (!firstCell) {
                continue;
            }


            if (
                firstCell.innerText.trim().toUpperCase() ===
                label.toUpperCase()
            ) {

                return row;

            }

        }

    }


    return null;
}


function findBoosterRow(customer) {

    const rows =
        document.querySelectorAll(
            "#booster-table-container table tr"
        );


    for (const row of rows) {

        const tds =
            row.querySelectorAll("td");


        if (tds.length < 2) {
            continue;
        }


        if (
            tds[0].innerText.trim().toLowerCase() ===
            customer.trim().toLowerCase()
        ) {

            return row;

        }

    }


    return null;
}


function updateTitle() {

    const title =
        document.getElementById(
            "main-title"
        );


    if (orderMode === "admin") {

        title.textContent =
            "Prismatic Predators Admin";

    } else if (orderMode === "notes") {

        title.textContent =
            "Prismatic Predators Notes";

    } else if (orderMode === "breeding") {

        title.textContent =
            "Prismatic Predators Breeding";

    } else if (orderMode === "ads") {

        title.textContent =
            "Prismatic Predators Ad Creator";

    } else if (orderMode === "settings") {

        title.textContent =
            "Prismatic Predators Settings";

    } else {

        title.textContent =
            "Prismatic Predators Order Form";

    }

}


function updateSelectedFridge() {

    if (!fridgeColor && !fridgeNumber) {

        selectedFridgeLabel =
            "None Selected";

        return;

    }


    selectedFridgeLabel =
        `${fridgeColor || "[Color]"} ${fridgeNumber ? "#" + fridgeNumber : "[#]"}`;
}


function showAppAlert(message) {

    const modal =
        document.getElementById(
            "app-alert-modal"
        );


    document.getElementById(
        "app-alert-text"
    ).innerText = message;


    modal.style.display =
        "flex";


    document.getElementById(
        "app-alert-ok-btn"
    ).onclick = () =>
        modal.style.display = "none";

}


// =========================================================
// EVENT LISTENERS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "btn-update-auction"
        )?.addEventListener(
            "click",
            addAuctionItem
        );


        document.getElementById(
            "btn-reset"
        )?.addEventListener(
            "click",
            resetApp
        );


        document.getElementById(
            "btn-clear-name"
        )?.addEventListener(
            "click",
            clearCustomerName
        );


        document.getElementById(
            "btn-notes"
        )?.addEventListener(
            "click",
            () => setMode("notes")
        );


        document.getElementById(
            "btn-ads"
        )?.addEventListener(
            "click",
            () => setMode("ads")
        );


        document.getElementById(
            "btn-settings"
        )?.addEventListener(
            "click",
            () => setMode("settings")
        );


        document.getElementById(
            "btn-f2f"
        )?.addEventListener(
            "click",
            toggleF2F
        );


        document.getElementById(
            "btn-fanatic"
        )?.addEventListener(
            "click",
            toggleFanatic
        );


        document.getElementById(
            "customer-name"
        )?.addEventListener(
            "input",
            checkBoosterStatus
        );


        if (typeof renderNotes === "function") {
            renderNotes();
        }


        const scrollBtn =
            document.getElementById(
                "btn-scroll-top"
            );


        if (
            scrollBtn &&
            window.scrollY < 100
        ) {

            scrollBtn.classList.add(
                "hidden"
            );

        }

    }
);


let isAlwaysOnTop = false;


function toggleAlwaysOnTop() {

    isAlwaysOnTop =
        !isAlwaysOnTop;


    const btn =
        document.getElementById(
            "pin-btn"
        );


    window.windowControls.setAlwaysOnTop(
        isAlwaysOnTop
    );


    if (isAlwaysOnTop) {

        btn.classList.add(
            "active"
        );

    } else {

        btn.classList.remove(
            "active"
        );

    }

}


function scrollToTop() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


window.onscroll = function() {

    const btn =
        document.getElementById(
            "btn-scroll-top"
        );


    if (btn) {

        if (
            document.body.scrollTop > 100 ||
            document.documentElement.scrollTop > 100
        ) {

            btn.classList.remove(
                "hidden"
            );

        } else {

            btn.classList.add(
                "hidden"
            );

        }

    }

};


function updateAuctionBoosterUI() {

    // =========================================================
    // ONLY DO THIS IN AUCTION MODE
    // =========================================================

    if (orderMode !== "auction") {

        document.body.classList.remove(
            "auction-booster-detected"
        );

        return;

    }


    // =========================================================
    // GET CUSTOMER NAME
    // =========================================================

    const nameInput =
        document.getElementById(
            "customer-name"
        );


    const customer =
        nameInput?.value.trim() || "";


    // =========================================================
    // CHECK BOOSTER TABLE
    // =========================================================

    const isBooster =
        customer !== "" &&
        !!findBoosterRow(customer);


    // =========================================================
    // APPLY / REMOVE AUCTION BOOSTER CLASS
    // =========================================================

    if (isBooster) {

        document.body.classList.add(
            "auction-booster-detected"
        );

    } else {

        document.body.classList.remove(
            "auction-booster-detected"
        );

    }

}


function checkBoosterStatus() {

    const nameInput =
        document.getElementById(
            "customer-name"
        );


    if (!nameInput) {
        return;
    }


    const name =
        nameInput.value.trim();


    const boosterRow =
        findBoosterRow(name);


    if (
        name !== "" &&
        boosterRow
    ) {

        nameInput.classList.add(
            "booster-detected"
        );

    } else {

        nameInput.classList.remove(
            "booster-detected"
        );

    }


    // Update auction controls immediately
    updateAuctionBoosterUI();


    // Update the order summary
    updateOrderSummary();

}


function playSuccessSound() {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {
        return;
    }


    const ctx =
        new AudioContext();


    // 1. Oscillators for the high-pitched shimmer

    const osc1 =
        ctx.createOscillator();

    const osc2 =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    // 2. The Echo Effect

    const delay =
        ctx.createDelay();

    const feedback =
        ctx.createGain();


    osc1.type =
        "sine";


    osc1.frequency.setValueAtTime(
        2800,
        ctx.currentTime
    );


    osc2.type =
        "sine";


    osc2.frequency.setValueAtTime(
        4200,
        ctx.currentTime
    );


    // Initial "Tink" Volume

    gain.gain.setValueAtTime(
        0,
        ctx.currentTime
    );


    gain.gain.linearRampToValueAtTime(
        0.08,
        ctx.currentTime + 0.005
    );


    gain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + 0.1
    );


    // 3. Setup Echo Timing and Decay

    delay.delayTime.value =
        0.08;


    feedback.gain.value =
        0.4;


    // 4. Routing the "Pipe"

    osc1.connect(gain);
    osc2.connect(gain);

    gain.connect(ctx.destination);

    gain.connect(delay);

    delay.connect(feedback);

    feedback.connect(delay);

    feedback.connect(ctx.destination);


    osc1.start();
    osc2.start();


    osc1.stop(
        ctx.currentTime + 0.15
    );

    osc2.stop(
        ctx.currentTime + 0.15
    );

}


// =========================================================
// BUTTON SUCCESS
// =========================================================

// Updated: Glows rainbow, plays sound, shows toast, but leaves text alone

function triggerButtonSuccess(
    buttonId,
    successText
) {

    const btn =
        document.getElementById(
            buttonId
        );


    if (!btn) {
        return;
    }


    // 1. Play sound

    playSuccessSound();


    // 2. Show the Rainbow Toast

    showToast(
        successText
    );


    // 3. Add the rainbow glow class

    btn.classList.add(
        "button-rainbow-glow"
    );


    // 4. Remove the glow after 2 seconds

    setTimeout(() => {

        btn.classList.remove(
            "button-rainbow-glow"
        );

    }, 2000);

}


function showToast(message) {

    let container =
        document.getElementById(
            "toast-container"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "toast-container";

        document.body.appendChild(
            container
        );

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "toast-rainbow";


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    // Stay for 2 seconds, then trigger the fade out

    setTimeout(() => {

        toast.classList.add(
            "toast-fade-out"
        );


        // Remove from DOM after the 0.4s transition ends

        setTimeout(() =>
            toast.remove(),
            400
        );

    }, 2000);

}


function launchConfetti() {

    const colors = [
        "#ff4d6d",
        "#ffd166",
        "#00ff9d",
        "#4da3ff",
        "#b26bff"
    ];


    const particleCount =
        50;


    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );


        particle.className =
            "confetti-particle";


        // Randomize shape slightly

        const isWide =
            Math.random() > 0.5;


        particle.style.width =
            isWide
                ? "18px"
                : "12px";


        particle.style.height =
            "12px";


        particle.style.backgroundColor =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        document.body.appendChild(
            particle
        );


        // Physics logic

        const angle =
            Math.random() *
            Math.PI *
            2;


        const velocity =
            5 +
            Math.random() *
            10;


        const xDir =
            Math.cos(angle) *
            velocity *
            40;


        const yDir =
            Math.sin(angle) *
            velocity *
            40;


        const rotation =
            Math.random() *
            1080;


        // Animation

        const animation =
            particle.animate(
                [
                    {
                        transform:
                            "translate(-50%, -50%) scale(0) rotate(0deg)",
                        opacity: 0
                    },

                    {
                        transform:
                            "translate(-50%, -50%) scale(1.2) rotate(45deg)",
                        opacity: 1,
                        offset: 0.1
                    },

                    {
                        transform:
                            `translate(calc(-50% + ${xDir}px), calc(-50% + ${yDir}px)) scale(0.4) rotate(${rotation}deg)`,
                        opacity: 0
                    }
                ],
                {
                    duration:
                        2000 +
                        Math.random() *
                        1000,

                    easing:
                        "cubic-bezier(0.1, 0.5, 0.2, 1)",

                    fill:
                        "forwards"
                }
            );


        animation.onfinish =
            () => particle.remove();

    }

}
