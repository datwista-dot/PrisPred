let dinoData = [];

// EDIT LOCK (prevents focus loss)
let isEditing = false;
let editTimers = {};
let filterRedOnly = false;

// =========================
// INIT LOAD
// =========================
if (window.api) {
    window.api.getDinos().then(data => {

        dinoData = data.map(dino => ({
            ...dino,
            male: Number(dino.male) || 0,
            female: Number(dino.female) || 0
        }));

        // Save the newly added stock fields permanently
        window.api.setDinos(dinoData);

        sortData();
        renderTable();
        updateDinoCount();
    });
}

// =========================
// LIVE SYNC FROM MAIN
// =========================
if (window.api) {
    window.api.onDinosUpdate((data) => {

        // If actively typing, ignore background updates
        if (isEditing) return;

        dinoData = data.map(dino => ({
            ...dino,
            male: Number(dino.male) || 0,
            female: Number(dino.female) || 0
        }));

        sortData();
        renderTable();
        updateDinoCount();

        // LIVE SYNC UI UPDATE
        try {
            dinoItemsSource = [...dinoData];
        } catch(e) {
            dinoItemsSource.length = 0;
            dinoItemsSource.push(...dinoData);
        }

        if (typeof initDinos === "function") initDinos();
    });
}

// =========================
// HELPERS
// =========================

function syncDinos() {
    window.api.setDinos(dinoData);

    // LIVE SYNC UI UPDATE
    try {
        dinoItemsSource = [...dinoData];
    } catch(e) {
        dinoItemsSource.length = 0;
        dinoItemsSource.push(...dinoData);
    }

    // Re-draw the dino buttons instantly
    if (typeof initDinos === "function") {
        initDinos();
    }
}

function updateDinoCount(){

    // 1. Update the Dinos count
    document.getElementById("dino-count").innerText =
        "Rainbow Dinos: " + dinoData.length;

    // 2. Calculate total price
    const totalPrice = dinoData.reduce(
        (sum, dino) => sum + (Number(dino.price) || 0),
        0
    );

    // 3. Update Total Price text
    const priceElement = document.getElementById("total-price");
    if (priceElement) {
        priceElement.innerText = "Total Price: " + totalPrice;
    }

    // 4. Update Production Status
    const redDinos = dinoData.filter(d => isDinoInRed(d)).length;
    const orangeDinos = dinoData.filter(d => isDinoInOrange(d)).length;
    const healthyDinos = dinoData.length - redDinos - orangeDinos;

    const breedNowElement = document.getElementById("breed-now-text");
    if (breedNowElement) {
        breedNowElement.innerText =
            `🔴 Breed now: ${redDinos} dinos`;
    }

    const breedSoonElement = document.getElementById("breed-soon-text");
    if (breedSoonElement) {
        breedSoonElement.innerText =
            `🟠 Breed soon: ${orangeDinos} dinos`;
    }

    const healthyElement = document.getElementById("healthy-text");
    if (healthyElement) {
        healthyElement.innerText =
            `🟢 Healthy: ${healthyDinos} dinos`;
    }

    // 5. Calculate total male and female eggs
    const totalMaleEggs = dinoData.reduce(
        (sum, dino) => sum + (Number(dino.male) || 0),
        0
    );

    const totalFemaleEggs = dinoData.reduce(
        (sum, dino) => sum + (Number(dino.female) || 0),
        0
    );

    // 6. Total pairs are limited by whichever gender has fewer eggs
    const totalPairs = Math.min(totalMaleEggs, totalFemaleEggs);

    // 7. Update Total Pairs text
    const pairsElement = document.getElementById("total-pairs-text");
    if (pairsElement) {
        pairsElement.innerText =
            `Total Pairs: ${totalPairs} (${totalMaleEggs} Male eggs / ${totalFemaleEggs} Female eggs)`;
    }
}

// =========================
// IMPORT
// =========================

function importFile(){

    const file = document.getElementById("fileInput").files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const text = e.target.result;

        try {

            const tempWindow = {};

            new Function("window", text)(tempWindow);

            if(
                !tempWindow.DINO_DATA ||
                !Array.isArray(tempWindow.DINO_DATA)
            ){
                throw new Error("DINO_DATA not found");
            }

            dinoData = tempWindow.DINO_DATA.map(dino => ({
                ...dino,
                male: Number(dino.male) || 0,
                female: Number(dino.female) || 0
            }));

            syncDinos();

            sortData();
            renderTable();
            updateDinoCount();

        } catch(err){

            console.error(err);
            alert("Invalid file format");
        }
    };

    reader.readAsText(file);
}

// =========================
// ADD
// =========================

function addDino(){

    const name = document.getElementById("name").value;
    const full = document.getElementById("full").value;
    const price = Number(document.getElementById("price").value);

    if(!name || !full || !price) return;

    dinoData.push({
        name,
        full,
        price,
        freeInBooster: false,
        male: 0,
        female: 0
    });

    syncDinos();

    sortData();
    renderTable();
    updateDinoCount();

    document.getElementById("name").value = "";
    document.getElementById("full").value = "";
    document.getElementById("price").value = "";
}

// =========================
// SORT
// =========================

function sortData(){

    dinoData.sort((a,b) =>
        a.name.localeCompare(b.name)
    );
}

// =========================
// REMOVE
// =========================

function removeDino(index){

    showConfirmModal(
        "Are you sure you want to delete this dino?",
        () => {

            dinoData.splice(index, 1);

            syncDinos();

            renderTable();
            updateDinoCount();
        }
    );
}

// =========================
// UPDATE FIELD
// =========================

function updateField(index, field, value){

    if(field === "price"){

        dinoData[index][field] = Number(value);

    } else {

        dinoData[index][field] = value;
    }

    // debounce sync
    if(editTimers[index]){
        clearTimeout(editTimers[index]);
    }

    editTimers[index] = setTimeout(() => {

        syncDinos();

    }, 500);
}

// =========================
// STOCK ADJUSTMENT
// =========================

function adjustStock(index, field, value, inputElement){

    const adjustment = Number(value);

    // Empty or invalid input = do nothing
    if(value === "" || !Number.isInteger(adjustment)){

        if(inputElement){
            inputElement.value = "";
        }

        return;
    }

    // Make absolutely sure the stock value exists
    if(typeof dinoData[index][field] !== "number"){
        dinoData[index][field] = Number(dinoData[index][field]) || 0;
    }

    // Apply adjustment
    dinoData[index][field] += adjustment;

    // Prevent stock from going below zero
    if(dinoData[index][field] < 0){
        dinoData[index][field] = 0;
    }

    // Save
    syncDinos();

    // Clear adjustment box
    if(inputElement){
        inputElement.value = "";
    }

    // Refresh table so displayed stock updates
    renderTable();
}

// =========================
// TOGGLE BOOSTER
// =========================

function toggleBooster(index){

    dinoData[index].freeInBooster =
        !dinoData[index].freeInBooster;

    syncDinos();
}

// =========================
// FILTER
// =========================

function getFilteredData(){

    const q = document
        .getElementById("search")
        .value
        .toLowerCase();

    return dinoData.filter(d => {
        // 1. Check if it matches the search box
        const matchesSearch = d.name.toLowerCase().includes(q) ||
                              d.full.toLowerCase().includes(q) ||
                              String(d.price).includes(q);
        
        // 2. If the Low Stock Filter is ON, show Red AND Orange (<= 14)
        if (filterRedOnly) {
            return matchesSearch && isDinoLowStock(d);
        }
        
        return matchesSearch;
    });
}

// =========================
// LOW STOCK FILTER
// =========================

function toggleRedFilter() {
    filterRedOnly = !filterRedOnly;
    
    const filterBtn = document.getElementById("btn-filter-red");
    
    if (filterRedOnly) {
        filterBtn.innerText = "Show All Dinos";
        filterBtn.classList.remove("red");
        filterBtn.classList.add("green"); // Turns the button green when filter is active
    } else {
        filterBtn.innerText = "Filter Low Stock";
        filterBtn.classList.remove("green");
        filterBtn.classList.add("red"); // Turns back to red when inactive
        updateDinoCount(); // Refreshes the numbers
    }
    
    renderTable(); // Re-draws the table instantly
}

function isDinoInRed(dino) {
    const male = Number(dino.male) || 0;
    const female = Number(dino.female) || 0;
    
    // A dino needs breeding if female is 7 or less (including 0)
    // OR if male is between 1 and 7 (we ignore 0 to prevent gender-neutral false alarms)
    return (female <= 7) || (male > 0 && male <= 7);
}

function isDinoInOrange(dino) {
    // If it's already in the Red range, we don't count it as Orange
    if (isDinoInRed(dino)) return false;
    
    const male = Number(dino.male) || 0;
    const female = Number(dino.female) || 0;
    
    // It's Orange if female is 8-14, OR if male is 8-14
    return (female > 7 && female <= 14) || (male > 7 && male <= 14);
}

function isDinoLowStock(dino) {
    const male = Number(dino.male) || 0;
    const female = Number(dino.female) || 0;
    
    // Low stock includes Red (<=7) AND Orange (<=14)
    // We ignore male 0 so gender-neutral dinos don't trigger false alarms
    return (female <= 14) || (male > 0 && male <= 14);
}

// =========================
// RENDER TABLE
// =========================

function renderTable(){

    // BLOCK RENDER DURING EDIT
    if(isEditing) return;

    const tbody =
        document.querySelector("#dinoTable tbody");

    tbody.innerHTML = "";

    const data = getFilteredData();

    data.forEach(d => {

        const realIndex = dinoData.indexOf(d);

        // Make sure old dinos without stock values
        // still display correctly
        const maleStock = Number(d.male) || 0;
        const femaleStock = Number(d.female) || 0;

        const row = document.createElement("tr");

        row.innerHTML = `

            <!-- NAME -->
            <td>
                <input type="text"
                    value="${d.name}"
                    onfocus="isEditing=true"
                    onblur="isEditing=false; syncDinos();"
                    oninput="updateField(${realIndex}, 'name', this.value)">
            </td>

            <!-- FULL -->
            <td>
                <input type="text"
                    value="${d.full}"
                    onfocus="isEditing=true"
                    onblur="isEditing=false; syncDinos();"
                    oninput="updateField(${realIndex}, 'full', this.value)">
            </td>

            <!-- PRICE -->
            <td>
                <input type="text"
                    value="${d.price}"
                    onfocus="isEditing=true"
                    onblur="isEditing=false; syncDinos();"
                    oninput="updateField(${realIndex}, 'price', this.value)">
            </td>

            <!-- BOOSTER -->
            <td style="text-align:center;">
                <input type="checkbox"
                    ${d.freeInBooster ? "checked" : ""}
                    onchange="toggleBooster(${realIndex})">
            </td>

			<!-- MALE STOCK -->
			<td style="text-align:center;">
				${maleStock === 0 ? '' : `
                    <span class="stock-value ${maleStock <= 7 ? 'stock-red' : maleStock <= 14 ? 'stock-orange' : 'stock-green'}">
					    ${maleStock}
				    </span>
                `}
			</td>

            <!-- FEMALE STOCK -->
			<td style="text-align:center;">
				${femaleStock === 0 ? '' : `
                    <span class="stock-value ${femaleStock <= 7 ? 'stock-red' : femaleStock <= 14 ? 'stock-orange' : 'stock-green'}">
					    ${femaleStock}
				    </span>
                `}
			</td>

            <!-- ADD MALE -->
            <td style="text-align:center;">
                <input
                    type="number"
                    step="1"
                    placeholder="±"
                    style="width:70px;"
                    onfocus="isEditing=true"
                    onblur="
                        isEditing=false;
                        adjustStock(
                            ${realIndex},
                            'male',
                            this.value,
                            this
                        );
                    "
                >
            </td>

            <!-- ADD FEMALE -->
            <td style="text-align:center;">
                <input
                    type="number"
                    step="1"
                    placeholder="±"
                    style="width:70px;"
                    onfocus="isEditing=true"
                    onblur="
                        isEditing=false;
                        adjustStock(
                            ${realIndex},
                            'female',
                            this.value,
                            this
                        );
                    "
                >
            </td>

            <!-- REMOVE -->
            <td style="text-align:center;">
                <button
                    class="button"
                    onclick="removeDino(${realIndex})">
                    X
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// =========================
// EXPORT
// =========================

function downloadData(){

    let content = "window.DINO_DATA = [\n";

    dinoData.forEach((d, i) => {

        content += `  {
    name: "${String(d.name)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')}",
    full: "${String(d.full)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')}",
    price: ${Number(d.price) || 0},
    freeInBooster: ${Boolean(d.freeInBooster)},
    male: ${Number(d.male) || 0},
    female: ${Number(d.female) || 0}
  }`;

        if(i < dinoData.length - 1){
            content += ",";
        }

        content += "\n";
    });

    content += "];";

    const blob = new Blob(
        [content],
        { type: "application/javascript" }
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "dinoData.js";
    a.click();
}

// =========================
// CONFIRM MODAL
// =========================

function showConfirmModal(message, onConfirm){

    let existing =
        document.getElementById("confirm-modal");

    if(existing) existing.remove();

    const modal =
        document.createElement("div");

    modal.id = "confirm-modal";

    modal.innerHTML = `
        <div class="confirm-box">

            <div class="confirm-text">
                ${message}
            </div>

            <div class="confirm-buttons">

                <button
                    id="confirm-yes"
                    class="button green">
                    Yes
                </button>

                <button
                    id="confirm-no"
                    class="button red">
                    Cancel
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("confirm-yes").onclick = () => {

        modal.remove();
        onConfirm();
    };

    document.getElementById("confirm-no").onclick = () => {

        modal.remove();
    };
}