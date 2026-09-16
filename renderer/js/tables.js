// =========================
// TABLE CONTROLLER (FIXED SAFE SLOT LOGIC)
// =========================

function safeSave(){
    if (typeof saveTableData === "function") {
        saveTableData();
    }
}

function populateTableByMode(){
    if(orderMode === "booster"){
        populateBoosterTable();
    } else {
        populateRegularTable();
    }
}

// =========================
// 🟥 REGULAR TABLE (FIXED - NO OVERWRITE)
// =========================

function populateRegularTable(){
    if(!selectedFridgeLabel) return;

    const row = findFridgeRow(selectedFridgeLabel);
    if(!row) return;

    const customer = document.getElementById("customer-name")?.value?.trim() || "";

    // ✅ Logic updated to use auctionEntries sum from state.js
    const amount = (orderMode === "auction")
        ? auctionEntries.reduce((sum, item) => sum + item.bid, 0)
        : calculateAmount();

    const cells = row.querySelectorAll("td");
    if(cells.length < 3) return;

    const existingName = cells[1].innerText.trim();
    if(existingName !== ""){
        alert("Use another Fridge");
        return;
    }

    cells[1].innerText = customer;
    cells[2].innerText = amount;

    safeSave();
}

// =========================
// 🟩 BOOSTER TABLE (KEEP ADD LOGIC)
// =========================

function populateBoosterTable(){
    const customer = document.getElementById("customer-name")?.value?.trim() || "";
    const amount = calculateAmount();

    const rows = document.querySelectorAll("#booster-table-container table tr");

    for(const row of rows){
        const tds = row.querySelectorAll("td");
        if(tds.length < 2) continue;

        const nameCell = tds[0];
        const amountCell = tds[1];

        if(nameCell.innerText.trim().toLowerCase() === customer.toLowerCase()){

            const existing = Number(amountCell.innerText || 0);

            // =========================
            // ADD INSTEAD OF REPLACE
            // =========================
            amountCell.innerText = existing + amount;

            setTimeout(() => {
                safeSave();
            }, 0);

            return;
        }
    }
}

// =========================
// FRIDGE SEARCH
// =========================

function findFridgeRow(label){
    const tables = document.querySelectorAll("#regular-tables table");

    for(const table of tables){
        const rows = table.querySelectorAll("tr");

        for(const row of rows){
            const firstCell = row.querySelector("td");
            if(!firstCell) continue;

            if(firstCell.innerText.trim().toUpperCase() === label.toUpperCase()){
                return row;
            }
        }
    }
    return null;
}

// =========================
// CLEAR ROW
// =========================

function clearFridgeRow(btn){
    const row = btn.closest("tr");

    const cells = row.querySelectorAll("td");
    if(cells[1]) cells[1].innerText = "";
    if(cells[2]) cells[2].innerText = "";

    safeSave();
}