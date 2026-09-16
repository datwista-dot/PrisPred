// =========================================================
// ORDER TEMPLATE GETTER
// =========================================================

function getOrderTemplate(type) {
    return (window.ORDER_TEMPLATES && window.ORDER_TEMPLATES[type]) || "";
}

window.getOrderTemplate = getOrderTemplate;


// =========================================================
// ORDER TEMPLATE SAVER
// =========================================================

function saveOrderTemplate(type, value) {
    if (!window.ORDER_TEMPLATES || !Object.prototype.hasOwnProperty.call(window.ORDER_TEMPLATES, type)) {
        return;
    }

    window.ORDER_TEMPLATES[type] = value;
}

window.saveOrderTemplate = saveOrderTemplate;


// =========================================================
// PAYMENT TYPE GETTER
// =========================================================

function getPaymentTypes() {
    return window.PAYMENT_TYPES || [];
}

window.getPaymentTypes = getPaymentTypes;

function savePaymentTypes(paymentTypes) {

    if (
        !Array.isArray(paymentTypes) ||
        !window.PAYMENT_TYPES
    ) {
        return;
    }

    // Make a separate copy BEFORE clearing the original array.
    const updatedPaymentTypes =
        paymentTypes.map(payment => ({
            name: payment.name,
            multiplier: payment.multiplier
        }));

    window.PAYMENT_TYPES.length = 0;

    updatedPaymentTypes.forEach(payment => {

        window.PAYMENT_TYPES.push({
            name: payment.name,
            multiplier: payment.multiplier
        });

    });
}

window.savePaymentTypes = savePaymentTypes;

// =========================================================
// TABLE RENDERING
// =========================================================

function renderRegularTables() {

    const container = document.getElementById("regular-tables");

    if (!container) return;

    if (!Array.isArray(window.REGULAR_TABLE_DATA)) return;

    container.innerHTML = "";

    const firstTable = document.createElement("table");
    const secondTable = document.createElement("table");

    const createHeader = () => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <th>Fridge</th>
            <th>Player Name</th>
            <th>Tek Amount</th>
            <th>Remove</th>
        `;

        return row;
    };

    firstTable.appendChild(createHeader());
    secondTable.appendChild(createHeader());

    window.REGULAR_TABLE_DATA.forEach((item, index) => {

        const row = document.createElement("tr");

        const fridgeCell = document.createElement("td");
        fridgeCell.innerText = item.fridge || "";

		const nameCell = document.createElement("td");
		nameCell.contentEditable = "true";
		nameCell.innerText = item.name || "";

        const amountCell = document.createElement("td");
        amountCell.contentEditable = "true";

        const removeCell = document.createElement("td");

        const removeButton = document.createElement("button");

        removeButton.className = "button clear-fridge";
        removeButton.innerText = "X";

        removeCell.appendChild(removeButton);

        if (item.mention) {

            const mention = document.createElement("span");

            mention.className = "mention wrapper_f61d60 interactive";

            nameCell.appendChild(mention);
        }

        row.appendChild(fridgeCell);
        row.appendChild(nameCell);
        row.appendChild(amountCell);
        row.appendChild(removeCell);

        if (index < 20) {
            firstTable.appendChild(row);
        } else {
            secondTable.appendChild(row);
        }
    });

    container.appendChild(firstTable);
    container.appendChild(secondTable);
}


// =========================================================
// BOOSTER TABLE RENDERING
// =========================================================

function renderBoosterTable() {

    const container = document.getElementById("booster-table-container");

    if (!container) return;

    if (!Array.isArray(window.BOOSTER_TABLE_DATA)) return;

    container.innerHTML = "";

    const wrapper = document.createElement("div");

    wrapper.className = "booster-table-wrapper";

    const firstTable = document.createElement("table");
    const secondTable = document.createElement("table");

    firstTable.className = "booster-table";
    secondTable.className = "booster-table";

    const createHeader = () => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <th>Player Name</th>
            <th>Tek Amount</th>
            <th>Remove</th>
        `;

        return row;
    };

    firstTable.appendChild(createHeader());
    secondTable.appendChild(createHeader());

    window.BOOSTER_TABLE_DATA.forEach((item, index) => {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.innerText = item.name || "";

        const amountCell = document.createElement("td");
        amountCell.contentEditable = "true";

        const removeCell = document.createElement("td");

        const removeButton = document.createElement("button");

        removeButton.className = "button clear-booster";
        removeButton.innerText = "X";

        removeCell.appendChild(removeButton);

        row.appendChild(nameCell);
        row.appendChild(amountCell);
        row.appendChild(removeCell);

        if (index < 20) {
            firstTable.appendChild(row);
        } else {
            secondTable.appendChild(row);
        }
    });

    wrapper.appendChild(firstTable);
    wrapper.appendChild(secondTable);

    container.appendChild(wrapper);
}

// =========================================================
// INITIAL TABLE RENDER
// =========================================================

renderRegularTables();
renderBoosterTable();

// =========================================================
// SETTINGS TABLE PREVIEWS
// =========================================================

function renderSettingsTablePreviews() {

    const regularPreview =
        document.getElementById(
            "settings-regular-table-preview"
        );

    const boosterPreview =
        document.getElementById(
            "settings-booster-table-preview"
        );

    const regularTables =
        document.getElementById(
            "regular-tables"
        );

    const boosterTables =
        document.getElementById(
            "booster-table-container"
        );


    // =====================================================
    // REGULAR TABLE PREVIEW
    // =====================================================

    if (
        regularPreview &&
        regularTables
    ) {

        regularPreview.innerHTML = "";

        const regularClone =
            regularTables.cloneNode(true);

        regularClone.removeAttribute("id");

        regularClone.querySelectorAll(
            "table tr"
        ).forEach(row => {

            const cells =
                row.querySelectorAll("td");

            if (cells.length < 4) {
                return;
            }

            cells[0].contentEditable = "true";
            cells[1].contentEditable = "true";
            cells[2].contentEditable = "true";

        });

        regularPreview.appendChild(
            regularClone
        );
    }

    // =====================================================
    // BOOSTER TABLE PREVIEW
    // =====================================================

    if (
        boosterPreview &&
        boosterTables
    ) {

        boosterPreview.innerHTML = "";

        const boosterClone =
            boosterTables.cloneNode(true);

        boosterClone.removeAttribute("id");

        boosterClone.style.display = "block";

        boosterClone.querySelectorAll(
            "table tr"
        ).forEach(row => {

            const cells =
                row.querySelectorAll("td");

            if (cells.length < 3) {
                return;
            }

            cells[0].contentEditable = "true";
            cells[1].contentEditable = "true";

        });

        boosterPreview.appendChild(
            boosterClone
        );

    }

}

// =========================================================
// ORDER SUMMARY TEXT GETTER
// =========================================================

function getOrderSummaryText(type, field) {

    if (
        !window.ORDER_SUMMARY_TEXT ||
        !window.ORDER_SUMMARY_TEXT[type]
    ) {
        return "";
    }

    return window.ORDER_SUMMARY_TEXT[type][field] || "";
}

window.getOrderSummaryText = getOrderSummaryText;


// =========================================================
// ORDER SUMMARY TEXT SAVER
// =========================================================

function saveOrderSummaryText(type, field, value) {

    if (
        !window.ORDER_SUMMARY_TEXT ||
        !window.ORDER_SUMMARY_TEXT[type] ||
        !Object.prototype.hasOwnProperty.call(
            window.ORDER_SUMMARY_TEXT[type],
            field
        )
    ) {
        return;
    }

    window.ORDER_SUMMARY_TEXT[type][field] = value;
}

window.saveOrderSummaryText = saveOrderSummaryText;


// =========================================================
// LOAD ORDER SUMMARY TEXT SETTINGS
// =========================================================

function loadOrderSummaryTextSettings() {

    const fields = [
        ["settings-regular-collection", "regular", "collection"],
        ["settings-regular-f2f", "regular", "collectionF2F"],
        ["settings-booster-collection", "regular", "boosterCollection"],
        ["settings-booster-perk", "regular", "boosterPerk"],
        ["settings-extra-female", "regular", "extraFemale"],

        ["settings-auction-regular-location", "auction", "regularLocation"],
        ["settings-auction-booster-location", "auction", "boosterLocation"],
        ["settings-auction-collection", "auction", "collection"],
        ["settings-auction-f2f", "auction", "collectionF2F"],
        ["settings-auction-booster-collection", "auction", "boosterCollection"],
        ["settings-auction-detail", "auction", "detail"],
        ["settings-auction-empty-detail", "auction", "emptyDetail"],
        ["settings-auction-total", "auction", "total"]
    ];

    fields.forEach(([elementId, type, field]) => {

        const element =
            document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.value =
            getOrderSummaryText(type, field);

    });
}


// =========================================================
// SAVE ORDER SUMMARY TEXT SETTINGS
// =========================================================

function saveOrderSummaryTextSettings() {

    const fields = [
        ["settings-regular-collection", "regular", "collection"],
        ["settings-regular-f2f", "regular", "collectionF2F"],
        ["settings-booster-collection", "regular", "boosterCollection"],
        ["settings-booster-perk", "regular", "boosterPerk"],
        ["settings-extra-female", "regular", "extraFemale"],

        ["settings-auction-regular-location", "auction", "regularLocation"],
        ["settings-auction-booster-location", "auction", "boosterLocation"],
        ["settings-auction-collection", "auction", "collection"],
        ["settings-auction-f2f", "auction", "collectionF2F"],
        ["settings-auction-booster-collection", "auction", "boosterCollection"],
        ["settings-auction-detail", "auction", "detail"],
        ["settings-auction-empty-detail", "auction", "emptyDetail"],
        ["settings-auction-total", "auction", "total"]
    ];

    fields.forEach(([elementId, type, field]) => {

        const element =
            document.getElementById(elementId);

        if (!element) {
            return;
        }

        saveOrderSummaryText(
            type,
            field,
            element.value
        );

    });
}


// =========================================================
// ORDER SUMMARY TEXT PREVIEW DATA
// =========================================================

function updateAdditionalTextPreview() {

    const preview =
        document.getElementById(
            "settings-additional-text-preview"
        );

    if (!preview) {
        return;
    }

    const selected =
        document.querySelector(
            ".settings-additional-text-field:focus"
        );

    if (!selected) {
        return;
    }

    let text =
        selected.value;

    const previewData = {
        selectedFridgeLabel: "Green #3",
        pin: "1234",
        extraFemale: "125",
        dinoName: "Example Dino",
        bid: "1,000",
        totalBid: "1,000"
    };

    Object.keys(previewData).forEach(key => {

        const variable =
            new RegExp(`{{${key}}}`, "g");

        text =
            text.replace(
                variable,
                previewData[key]
            );

    });

    text =
        text.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );

    text =
        text.replace(
            /\r?\n/g,
            "<br>"
        );

    preview.innerHTML =
        text;
}


// =========================================================
// ORDER SUMMARY PREVIEW
// =========================================================

function updateTemplatePreview(textarea) {

    const preview =
        document.getElementById(
            "settings-template-preview"
        );

    if (!preview || !textarea) {
        return;
    }

    let type = "";

    if (textarea.id === "settings-regular") {
        type = "regular";
    } else if (textarea.id === "settings-booster") {
        type = "booster";
    } else if (textarea.id === "settings-auction") {
        type = "auction";
    }

    if (
        !type ||
        !window.PREVIEW_DATA ||
        !window.PREVIEW_DATA[type]
    ) {
        return;
    }

    let text =
        textarea.value;

    const data =
        window.PREVIEW_DATA[type];

    Object.keys(data).forEach(key => {

        const variable =
            new RegExp(`{{${key}}}`, "g");

        text =
            text.replace(
                variable,
                data[key]
            );

    });

    text =
        text.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );

    text =
        text.replace(
            /\r?\n/g,
            ""
        );

    preview.innerHTML =
        text;
}


// =========================================================
// SAVE ORDER SUMMARY TEMPLATES
// =========================================================

function saveOrderSummaryTemplates() {

    const regular =
        document.getElementById(
            "settings-regular"
        );

    const booster =
        document.getElementById(
            "settings-booster"
        );

    const auction =
        document.getElementById(
            "settings-auction"
        );

    if (regular) {
        saveOrderTemplate(
            "regular",
            regular.value
        );
    }

    if (booster) {
        saveOrderTemplate(
            "booster",
            booster.value
        );
    }

    if (auction) {
        saveOrderTemplate(
            "auction",
            auction.value
        );
    }
}


// =========================================================
// LOAD ORDER SUMMARY TEMPLATES
// =========================================================

function loadOrderSummaryTemplates() {

    const regular =
        document.getElementById(
            "settings-regular"
        );

    const booster =
        document.getElementById(
            "settings-booster"
        );

    const auction =
        document.getElementById(
            "settings-auction"
        );

    if (regular) {
        regular.value =
            getOrderTemplate("regular");
    }

    if (booster) {
        booster.value =
            getOrderTemplate("booster");
    }

    if (auction) {
        auction.value =
            getOrderTemplate("auction");
    }
}


// =========================================================
// SETTINGS SECTION NAVIGATION
// =========================================================

function showSettingsSection(section) {
	
	renderSettingsTablePreviews();

    const sections = [
        "order-summary",
        "payment-type",
        "regular-table",
        "booster-table"
    ];

    const buttons = {
        "order-summary": "settings-btn-order-summary",
        "payment-type": "settings-btn-payment-type",
        "regular-table": "settings-btn-regular-table",
        "booster-table": "settings-btn-booster-table"
    };

    loadOrderSummaryTemplates();
    loadOrderSummaryTextSettings();
    renderPaymentTypes();

    sections.forEach(name => {

        const element =
            document.getElementById(
                `settings-section-${name}`
            );

        if (element) {
            element.style.display = "none";
        }

    });

    Object.values(buttons).forEach(buttonId => {

        const button =
            document.getElementById(
                buttonId
            );

        if (button) {
            button.classList.remove(
                "active"
            );
        }

    });

    const selectedSection =
        document.getElementById(
            `settings-section-${section}`
        );

    if (selectedSection) {
        selectedSection.style.display =
            "block";
    }

    const selectedButton =
        document.getElementById(
            buttons[section]
        );

    if (selectedButton) {
        selectedButton.classList.add(
            "active"
        );
    }

    if (section === "order-summary") {

        let focusedTemplate =
            document.activeElement;

        if (
            !focusedTemplate ||
            ![
                "settings-regular",
                "settings-booster",
                "settings-auction"
            ].includes(
                focusedTemplate.id
            )
        ) {
            focusedTemplate =
                document.getElementById(
                    "settings-regular"
                );
        }

        if (focusedTemplate) {
            updateTemplatePreview(
                focusedTemplate
            );
        }

    }

}


// =========================================================
// PAYMENT TYPE RENDERING
// =========================================================

function renderPaymentTypes() {

    const container =
        document.getElementById(
            "settings-payment-type-list"
        );

    if (!container) {
        return;
    }

    const paymentTypes =
        getPaymentTypes();

    container.innerHTML = "";

    container.style.display =
        "flex";

    container.style.flexDirection =
        "column";

    container.style.gap =
        "4px";

    if (paymentTypes.length === 0) {

        container.innerHTML = `
            <div style="
                text-align: center;
                padding: 20px;
                opacity: 0.7;
            ">
                No payment types have been added yet.
            </div>
        `;

        if (
            typeof renderPaymentButtons ===
            "function"
        ) {
            renderPaymentButtons();
        }

        return;
    }

    paymentTypes.forEach(
        (paymentType, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.style.display =
                "flex";

            row.style.alignItems =
                "center";

            row.style.gap =
                "10px";

            row.style.marginBottom =
                "0";

            row.innerHTML = `
                <input
                    type="text"
                    value="${escapeSettingsHtml(paymentType.name)}"
                    data-payment-index="${index}"
                    data-payment-field="name"
                    style="
                        flex: 1;
                        height: 38px;
                        min-height: 38px;
                        box-sizing: border-box;
                        background: #0b1430;
                        color: #ffffff;
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 6px;
                        padding: 8px 10px;
                    "
                >

                <input
                    type="number"
                    value="${paymentType.multiplier}"
                    data-payment-index="${index}"
                    data-payment-field="multiplier"
                    step="0.01"
                    min="0"
                    style="
                        width: 150px;
                        height: 38px;
                        min-height: 38px;
                        box-sizing: border-box;
                        background: #0b1430;
                        color: #ffffff;
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 6px;
                        padding: 8px 10px;
                    "
                >

                <button
                    type="button"
                    class="button"
                    onclick="removePaymentType(${index})"
                    style="
                        height: 38px;
                        min-height: 38px;
                        box-sizing: border-box;
                        margin: 0;
                    ">
                    Remove
                </button>
            `;

            container.appendChild(
                row
            );

            const inputs =
                row.querySelectorAll(
                    "input"
                );

            inputs.forEach(input => {

                input.addEventListener(
                    "change",
                    function() {

                        updatePaymentType(
                            Number(
                                this.dataset.paymentIndex
                            ),
                            this.dataset.paymentField,
                            this.value
                        );

                    }
                );

            });

        }
    );

    if (
        typeof renderPaymentButtons ===
        "function"
    ) {
        renderPaymentButtons();
    }
}


// =========================================================
// ESCAPE PAYMENT TYPE TEXT
// =========================================================

function escapeSettingsHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


// =========================================================
// ADD PAYMENT TYPE
// =========================================================

function addPaymentType() {

    const nameInput =
        document.getElementById(
            "settings-payment-name"
        );

    const multiplierInput =
        document.getElementById(
            "settings-payment-multiplier"
        );

    if (
        !nameInput ||
        !multiplierInput
    ) {
        return;
    }

    const name =
        nameInput.value.trim();

    const multiplier =
        Number(
            multiplierInput.value
        );

    if (!name) {
        return;
    }

    if (
        multiplierInput.value === "" ||
        Number.isNaN(multiplier) ||
        multiplier < 0
    ) {
        return;
    }

    const paymentTypes =
        getPaymentTypes();

    paymentTypes.push({
        name: name,
        multiplier: multiplier
    });

    savePaymentTypes(
        paymentTypes
    );

    nameInput.value = "";
    multiplierInput.value = "";

    renderPaymentTypes();

}


// =========================================================
// UPDATE PAYMENT TYPE
// =========================================================

function updatePaymentType(
    index,
    field,
    value
) {

    const paymentTypes =
        getPaymentTypes();

    if (!paymentTypes[index]) {
        return;
    }

    if (field === "name") {

        const name =
            value.trim();

        if (!name) {
            renderPaymentTypes();
            return;
        }

        paymentTypes[index].name =
            name;

    }

    if (field === "multiplier") {

        const multiplier =
            Number(value);

        if (
            Number.isNaN(multiplier) ||
            multiplier < 0
        ) {
            renderPaymentTypes();
            return;
        }

        paymentTypes[index].multiplier =
            multiplier;

    }

    savePaymentTypes(
        paymentTypes
    );

    renderPaymentTypes();

}

function removePaymentType(index) {

    const paymentTypes = getPaymentTypes();

    if (!paymentTypes[index]) {
        return;
    }

    const paymentName = paymentTypes[index].name;

    const modal = document.getElementById("app-alert-modal");
    const alertText = document.getElementById("app-alert-text");
    const okButton = document.getElementById("app-alert-ok-btn");

    if (!modal || !alertText || !okButton) {
        return;
    }

    // Save the original OK button state
    const originalText = okButton.innerText;
    const originalHTML = okButton.outerHTML;

    // Change the message
    alertText.innerText =
        `Are you sure you want to remove "${paymentName}"?`;

    // Replace the single OK button with Yes / No buttons
    const buttonContainer = okButton.parentElement;

    buttonContainer.innerHTML = `
        <button
            type="button"
            class="button"
            id="payment-remove-yes"
            style="
                border: 1px solid #ff4d6d;
                color: white;
                padding: 10px 30px;
                margin: 0;
            ">
            Yes
        </button>

        <button
            type="button"
            class="button"
            id="payment-remove-no"
            style="
                padding: 10px 30px;
                margin: 0 0 0 10px;
            ">
            No
        </button>
    `;

    modal.style.display = "flex";

    const yesButton =
        document.getElementById("payment-remove-yes");

    const noButton =
        document.getElementById("payment-remove-no");

    yesButton.onclick = function () {

        paymentTypes.splice(index, 1);

        savePaymentTypes(paymentTypes);

        modal.style.display = "none";

        // Restore the original OK button
        buttonContainer.innerHTML = originalHTML;

        renderPaymentTypes();
    };

    noButton.onclick = function () {

        modal.style.display = "none";

        // Restore the original OK button
        buttonContainer.innerHTML = originalHTML;

        // Reconnect the normal OK button
        const restoredButton =
            document.getElementById("app-alert-ok-btn");

        if (restoredButton) {
            restoredButton.onclick = function () {
                modal.style.display = "none";
            };
        }
    };
}

// =========================================================
// SETTINGS INITIALIZATION
// =========================================================

function initializeSettings() {

    loadOrderSummaryTemplates();
    loadOrderSummaryTextSettings();
    renderPaymentTypes();

    const templateTextareas = [

        document.getElementById(
            "settings-regular"
        ),

        document.getElementById(
            "settings-booster"
        ),

        document.getElementById(
            "settings-auction"
        )

    ];

    templateTextareas.forEach(
        textarea => {

            if (!textarea) {
                return;
            }

            if (
                textarea.dataset.settingsInitialized ===
                "true"
            ) {
                return;
            }

            textarea.dataset.settingsInitialized =
                "true";

            textarea.addEventListener(
                "input",
                function() {
                    updateTemplatePreview(
                        this
                    );
                }
            );

            textarea.addEventListener(
                "focus",
                function() {
                    updateTemplatePreview(
                        this
                    );
                }
            );

            textarea.addEventListener(
                "change",
                function() {
                    saveOrderSummaryTemplates();
                }
            );

        }
    );


    // =====================================================
    // ADDITIONAL ORDER SUMMARY TEXT
    // =====================================================

    const additionalFields =
        document.querySelectorAll(
            ".settings-additional-text-field"
        );

    additionalFields.forEach(
        field => {

            if (
                field.dataset.settingsInitialized ===
                "true"
            ) {
                return;
            }

            field.dataset.settingsInitialized =
                "true";

            field.addEventListener(
                "input",
                function() {

                    saveOrderSummaryTextSettings();
                    updateAdditionalTextPreview();

                }
            );

            field.addEventListener(
                "focus",
                function() {
                    updateAdditionalTextPreview();
                }
            );

            field.addEventListener(
                "change",
                function() {
                    saveOrderSummaryTextSettings();
                }
            );

        }
    );


    showSettingsSection(
        "order-summary"
    );

}


// =========================================================
// START SETTINGS
// =========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSettings
    );

} else {

    initializeSettings();

}