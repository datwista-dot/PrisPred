// =========================
// TABLE STORAGE SYSTEM (FIXED SLOT-BASED)
// =========================

// =========================
// SAVE
// =========================
function saveTableData() {

    const data = [];

    // =========================
    // REGULAR TABLES
    // =========================
    const regularRows = document.querySelectorAll("#regular-tables table tr");

    regularRows.forEach((row) => {
        const cells = row.querySelectorAll("td");

        if (cells.length < 3) return;

        const fridge = cells[0]?.innerText.trim() || "";
        const name = cells[1]?.innerText.trim() || "";
        const amount = cells[2]?.innerText.trim() || "";

        data.push({
            type: "regular",
            fridge,
            name,
            amount
        });
    });

    // =========================
    // BOOSTER TABLES
    // =========================
    const boosterRows = document.querySelectorAll("#booster-table-container table tr");

    boosterRows.forEach((row) => {
        const cells = row.querySelectorAll("td");

        if (cells.length < 2) return;

        const name = cells[0]?.innerText.trim() || "";
        const amount = cells[1]?.innerText.trim() || "";

        data.push({
            type: "booster",
            name,
            amount
        });
    });

    window.api?.setPlayers?.(data);
}

// =========================
// LOAD
// =========================
function loadTableData() {

    if (!window.api?.getPlayers) return;

    window.api.getPlayers().then(players => {
        if (!Array.isArray(players)) return;

        // =========================
        // REGULAR TABLE LOAD
        // =========================
        const regularRows = document.querySelectorAll("#regular-tables table tr");

        let regularIndex = 0;

        regularRows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length < 3) return;

            const data = players.filter(p => p.type === "regular")[regularIndex];
            regularIndex++;

            if (!data) return;

            cells[0].innerText = data.fridge || cells[0].innerText;
            cells[1].innerText = data.name || "";
            cells[2].innerText = data.amount || "";
        });

        // =========================
        // BOOSTER TABLE LOAD
        // =========================
        const boosterRows = document.querySelectorAll("#booster-table-container table tr");

        let boosterIndex = 0;

        boosterRows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length < 2) return;

            const data = players.filter(p => p.type === "booster")[boosterIndex];
            boosterIndex++;

            if (!data) return;

            // KEEP PREDEFINED NAME
            if (data.name) {
                cells[0].innerText = data.name;
            }

            cells[1].innerText = data.amount || "";
        });
    });
}

// =========================
// LISTENERS (FIXED)
// =========================
function attachTableListeners() {

    // capture ANY edit inside td (not just direct td edits)
    document.addEventListener("input", (e) => {

        const td = e.target.closest("td");
        if (!td) return;

        saveTableData();
    });

    document.addEventListener("paste", (e) => {
        const td = e.target.closest("td");
        if (!td) return;

        setTimeout(saveTableData, 10);
    });

    document.addEventListener("click", (e) => {

        const btn = e.target.closest(".clear-fridge, .clear-booster");
        if (!btn) return;

        const row = btn.closest("tr");
        if (!row) return;

        const cells = row.querySelectorAll("td");

        // =========================
        // CLEAR REGULAR ROW
        // =========================
        if (btn.classList.contains("clear-fridge")) {
            if (cells[1]) cells[1].innerText = "";
            if (cells[2]) cells[2].innerText = "";
        }

        // =========================
        // CLEAR BOOSTER ROW
        // =========================
        if (btn.classList.contains("clear-booster")) {
            // keep predefined name, clear only amount
            if (cells[1]) cells[1].innerText = "";
        }

        saveTableData();
    });
}

// =========================
// INIT
// =========================
function initStorage() {
    attachTableListeners();
    loadTableData();
}

window.addEventListener("DOMContentLoaded", initStorage);

// =========================
// EXPORTS
// =========================
window.saveTableData = saveTableData;
window.loadTableData = loadTableData;