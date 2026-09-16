window.api.onBreedingUpdate((newData) => {
    if (typeof renderBreedingCards === "function") {
        renderBreedingCards(newData);
    }
});


// ============================================================
// CARD CREATOR TOGGLE
// ============================================================

function toggleCardCreator() {
    const form = document.getElementById('breeding-form-card');
    const btn = document.getElementById('toggle-creator-btn');

    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.textContent = "Hide Card Creator";
    } else {
        form.style.display = 'none';
        btn.textContent = "Show Card Creator";
    }
}


// ============================================================
// COLOR INPUT RESTRICTION
// 0-6 ONLY + AUTO JUMP
// ============================================================

function setupColorInputListeners() {
    const colorInputs = document.querySelectorAll(".color-input");

    colorInputs.forEach((input, index) => {

        // Prevent double binding
        if (input.dataset.boundBehavior) return;
        input.dataset.boundBehavior = "true";

        input.addEventListener("keydown", (e) => {

            // Functional keys
            const functionalKeys = [
                "Backspace",
                "Tab",
                "ArrowLeft",
                "ArrowRight",
                "Delete"
            ];

            if (functionalKeys.includes(e.key)) return;

            // Only allow 0-6
            const isAllowedNumber = /^[0-6]$/.test(e.key);

            if (isAllowedNumber) {

                e.preventDefault();

                // Replace current value
                input.value = e.key;

                updateColorPreview(input);

                // Auto-jump to next colour
                const nextInput = colorInputs[index + 1];

                if (nextInput) {
                    nextInput.focus();
                }

            } else {

                e.preventDefault();

            }
        });
    });
}


// ============================================================
// COLOR PREVIEW
// ============================================================

function updateColorPreview(input) {

    const val = input.value.trim();

    input.classList.remove(
        "ark-color-0",
        "ark-color-1",
        "ark-color-2",
        "ark-color-3",
        "ark-color-4",
        "ark-color-5",
        "ark-color-6"
    );

    if (val !== "") {

        input.classList.add(`ark-color-${val}`);

        const colors = [
            "#ffffff",
            "#ff0000",
            "#0000ff",
            "#00ff00",
            "#ffff00",
            "#00ffff",
            "#ff00ff"
        ];

        if (colors[val]) {

            input.style.backgroundColor = colors[val];

            input.style.color =
                (
                    val === "0" ||
                    val === "3" ||
                    val === "4" ||
                    val === "5"
                )
                    ? "#000"
                    : "#fff";
        }

    } else {

        input.style.backgroundColor = "#050914";
        input.style.color = "#00ffcc";

    }
}


// ============================================================
// CREATE NEW BREEDING CARD
// ============================================================

async function saveDinoCard() {

    const nameInput = document.getElementById("breed-name");

    const name = nameInput.value.trim();

    if (!name) {

        if (typeof showAppAlert === "function") {
            showAppAlert("Please enter a Dino Name.");
        }

        return;
    }

    const getVal = (id) => {

        return Number(
            document.getElementById(id).value
        ) || 0;

    };

    const newCard = {

        id: Date.now(),

        name: name,

        stats: {

            h: {
                w: getVal("stat-h-w"),
                m: getVal("stat-h-m")
            },

            s: {
                w: getVal("stat-s-w"),
                m: getVal("stat-s-m")
            },

            o: {
                w: getVal("stat-o-w"),
                m: getVal("stat-o-m")
            },

            f: {
                w: getVal("stat-f-w"),
                m: getVal("stat-f-m")
            },

            w: {
                w: getVal("stat-w-w"),
                m: getVal("stat-w-m")
            },

            m: {
                w: getVal("stat-m-w"),
                m: getVal("stat-m-m")
            }

        },

        colors: Array.from(
            document.querySelectorAll(".color-input")
        )
            .map(i => i.value.trim())
            .filter(v => v !== "")
    };

    let allCards = await window.api.getBreeding();

    allCards.push(newCard);

    await window.api.setBreeding(allCards);

    if (typeof triggerButtonSuccess === "function") {
        triggerButtonSuccess(
            "btn-breeding",
            "CARD SAVED!"
        );
    }

    if (typeof launchConfetti === "function") {
        launchConfetti();
    }

    resetBreedingForm();

    renderBreedingCards();
}


// ============================================================
// DELETE CARD
// ============================================================

async function deleteCard(id) {

    let allCards = await window.api.getBreeding();

    allCards = allCards.filter(
        c => c.id !== id
    );

    await window.api.setBreeding(allCards);

    // Close enlarged view if this card was being viewed
    const overlay = document.getElementById("card-overlay");

    if (
        overlay &&
        overlay.style.display !== "none" &&
        overlay.firstElementChild &&
        Number(overlay.firstElementChild.dataset.id) === Number(id)
    ) {

        overlay.style.display = "none";
        overlay.innerHTML = "";

    }

    renderBreedingCards();
}


// ============================================================
// RESET CREATOR FORM
// ============================================================

function resetBreedingForm() {

    const name = document.getElementById("breed-name");

    if (name) {
        name.value = "";
    }

    const keys = [
        "h",
        "s",
        "o",
        "f",
        "w",
        "m"
    ];

    keys.forEach(k => {

        const wild = document.getElementById(
            `stat-${k}-w`
        );

        const mutation = document.getElementById(
            `stat-${k}-m`
        );

        if (wild) wild.value = "";
        if (mutation) mutation.value = "";

    });

    document.querySelectorAll(
        ".color-input"
    ).forEach(i => {

        i.value = "";

        updateColorPreview(i);

    });
}


// ============================================================
// CREATE A BREEDING CARD ELEMENT
// ============================================================

function createBreedingCard(card, index = 0) {

    const div = document.createElement("div");

    div.className = "breeding-card";

    div.style.animationDelay =
        `${index * 0.03}s`;

    div.draggable = true;

    div.dataset.id = card.id;


    // --------------------------------------------------------
    // STAT LABELS
    // --------------------------------------------------------

    const statLabels = {

        h: "HP",
        s: "ST",
        o: "OX",
        f: "FD",
        w: "WT",
        m: "ML"

    };


    // --------------------------------------------------------
    // BUILD STATS
    // --------------------------------------------------------

    let totalLevel = 1;

    let statsHTML = "";


    Object.entries(card.stats || {}).forEach(
        ([key, statObj]) => {

            const wild =
                Number(statObj.w) || 0;

            const mut =
                Number(statObj.m) || 0;

            const total =
                wild + mut;


            // Don't display completely empty stats
            if (
                wild === 0 &&
                mut === 0
            ) {
                return;
            }


            totalLevel += total;


            statsHTML += `

                <div class="editable-stat-row">

                    ${statLabels[key]}:

                    <span
                        class="editable-value"
                        contenteditable="true"
                        spellcheck="false"
                        data-edit-type="stat"
                        data-stat="${key}"
                        data-value-type="w"
                    >${wild}</span>

                    /

                    <span
                        class="editable-value"
                        contenteditable="true"
                        spellcheck="false"
                        data-edit-type="stat"
                        data-stat="${key}"
                        data-value-type="m"
                    >${mut}</span>

                    <span class="stat-total">
                        (${total})
                    </span>

                </div>

            `;
        }
    );


    // --------------------------------------------------------
    // COLORS
    // --------------------------------------------------------

    const colorsHTML =
        (card.colors || [])
            .map((c, colorIndex) => {

                const color = Number(c);

                if (isNaN(color)) {
                    return "";
                }

                return `

                    <div
                        class="color-dot ark-color-${color} editable-color"
                        contenteditable="true"
                        spellcheck="false"
                        data-edit-type="color"
                        data-color-index="${colorIndex}"
                    >${color}</div>

                `;

            })
            .join("");


    // --------------------------------------------------------
    // HTML
    // --------------------------------------------------------

    div.innerHTML = `

        <button
            class="delete-card-btn"
            onclick="deleteCard(${card.id})"
        >×</button>


        <h3
            class="editable-name"
            contenteditable="true"
            spellcheck="false"
            data-edit-type="name"
        >${card.name}</h3>


        <div class="card-stats-grid">

            ${statsHTML}

        </div>


        <div class="card-level-section">

            Level:

            <span class="card-level-value">
                ${totalLevel}
            </span>

        </div>


        <div class="card-colors-row">

            ${colorsHTML}

        </div>

    `;


    // Enable editing
    setupCardEditing(div);


    return div;
}


// ============================================================
// SETUP INLINE EDITING
// ============================================================

function setupCardEditing(cardElement) {

    const editableElements =
        cardElement.querySelectorAll(
            '[contenteditable="true"]'
        );


    editableElements.forEach(el => {


        // ----------------------------------------------------
        // Prevent card click while editing
        // ----------------------------------------------------

        el.addEventListener(
            "mousedown",
            e => {
                e.stopPropagation();
            }
        );


        el.addEventListener(
            "click",
            e => {
                e.stopPropagation();
            }
        );


        // ----------------------------------------------------
        // Focus
        // ----------------------------------------------------

        el.addEventListener(
            "focus",
            () => {

                el.dataset.originalValue =
                    el.innerText.trim();


                // Select all existing text
                const range =
                    document.createRange();

                range.selectNodeContents(el);


                const selection =
                    window.getSelection();

                selection.removeAllRanges();

                selection.addRange(range);

            }
        );


        // ----------------------------------------------------
        // KEYBOARD RESTRICTIONS
        // ----------------------------------------------------

        el.addEventListener(
            "keydown",
            e => {


                // Enter finishes editing
                if (e.key === "Enter") {

                    e.preventDefault();

                    el.blur();

                    return;

                }


                // ------------------------------------------------
                // NAME
                // ------------------------------------------------

                if (
                    el.dataset.editType === "name"
                ) {

                    return;

                }


                // ------------------------------------------------
                // STATS
                // ------------------------------------------------

                if (
                    el.dataset.editType === "stat"
                ) {

                    const allowedKeys = [

                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab"

                    ];


                    if (
                        allowedKeys.includes(e.key)
                    ) {
                        return;
                    }


                    if (!/^[0-9]$/.test(e.key)) {

                        e.preventDefault();

                    }

                    return;

                }


                // ------------------------------------------------
                // COLORS
                // ------------------------------------------------

                if (
                    el.dataset.editType === "color"
                ) {

                    const allowedKeys = [

                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab"

                    ];


                    if (
                        allowedKeys.includes(e.key)
                    ) {
                        return;
                    }


                    // Only 0-6
                    if (!/^[0-6]$/.test(e.key)) {

                        e.preventDefault();

                    }

                }

            }
        );


        // ----------------------------------------------------
        // SAVE WHEN CLICKING AWAY
        // ----------------------------------------------------

        el.addEventListener(
            "blur",
            async () => {

                await saveInlineCardEdit(
                    cardElement,
                    el
                );

            }
        );

    });
}


// ============================================================
// SAVE INLINE EDIT
// ============================================================

async function saveInlineCardEdit(
    cardElement,
    editedElement
) {

    const cardId =
        Number(cardElement.dataset.id);

    const editType =
        editedElement.dataset.editType;


    let allCards =
        await window.api.getBreeding();


    const card =
        allCards.find(
            c => c.id === cardId
        );


    if (!card) return;


    let value =
        editedElement.innerText.trim();


    // ========================================================
    // NAME
    // ========================================================

    if (editType === "name") {

        if (!value) {

            editedElement.innerText =
                card.name;

            return;

        }

        card.name = value;

    }


    // ========================================================
    // STAT
    // ========================================================

    if (editType === "stat") {

        const statKey =
            editedElement.dataset.stat;

        const valueType =
            editedElement.dataset.valueType;


        let numberValue =
            parseInt(value, 10);


        if (
            isNaN(numberValue) ||
            numberValue < 0
        ) {

            numberValue = 0;

        }


        editedElement.innerText =
            numberValue;


        if (!card.stats[statKey]) {

            card.stats[statKey] = {
                w: 0,
                m: 0
            };

        }


        card.stats[statKey][valueType] =
            numberValue;


        // ----------------------------------------------------
        // Update visible stat total
        // ----------------------------------------------------

        const row =
            editedElement.closest(
                ".editable-stat-row"
            );


        if (row) {

            const wild =
                Number(
                    card.stats[statKey].w
                ) || 0;

            const mut =
                Number(
                    card.stats[statKey].m
                ) || 0;


            const total =
                wild + mut;


            const totalElement =
                row.querySelector(
                    ".stat-total"
                );


            if (totalElement) {

                totalElement.innerText =
                    `(${total})`;

            }


            // ------------------------------------------------
            // Recalculate level
            // ------------------------------------------------

            let newLevel = 1;


            Object.values(
                card.stats
            ).forEach(stat => {

                newLevel +=
                    Number(stat.w) || 0;

                newLevel +=
                    Number(stat.m) || 0;

            });


            const levelElement =
                cardElement.querySelector(
                    ".card-level-value"
                );


            if (levelElement) {

                levelElement.innerText =
                    newLevel;

            }

        }

    }


    // ========================================================
    // COLOR
    // ========================================================

    if (editType === "color") {

        const colorIndex =
            Number(
                editedElement.dataset.colorIndex
            );


        let colorValue =
            parseInt(value, 10);


        if (isNaN(colorValue)) {

            colorValue =
                Number(
                    card.colors[colorIndex]
                ) || 0;

        }


        // Force 0-6
        colorValue =
            Math.max(
                0,
                Math.min(
                    6,
                    colorValue
                )
            );


        editedElement.innerText =
            colorValue;


        card.colors[colorIndex] =
            String(colorValue);


        // ----------------------------------------------------
        // Update colour class
        // ----------------------------------------------------

        editedElement.classList.remove(

            "ark-color-0",
            "ark-color-1",
            "ark-color-2",
            "ark-color-3",
            "ark-color-4",
            "ark-color-5",
            "ark-color-6"

        );


        editedElement.classList.add(
            `ark-color-${colorValue}`
        );

    }


    // ========================================================
    // SAVE DATABASE
    // ========================================================

    await window.api.setBreeding(
        allCards
    );


    // ========================================================
    // KEEP ENLARGED CARD IN SYNC
    // ========================================================

    const overlay =
        document.getElementById(
            "card-overlay"
        );


    if (
        overlay &&
        overlay.style.display !== "none" &&
        overlay.firstElementChild
    ) {

        const enlargedCard =
            overlay.firstElementChild;


        if (
            Number(
                enlargedCard.dataset.id
            ) === cardId
        ) {

            const updatedCard =
                allCards.find(
                    c => c.id === cardId
                );


            if (updatedCard) {

                // Preserve enlarged view
                const newCard =
                    createBreedingCard(
                        updatedCard
                    );


                newCard.draggable = false;

                newCard.classList.add(
                    "enlarged-card"
                );


                newCard.style.animationDelay =
                    "0s";


                // Hide delete button
                const deleteBtn =
                    newCard.querySelector(
                        ".delete-card-btn"
                    );


                if (deleteBtn) {

                    deleteBtn.style.display =
                        "none";

                }


                overlay.innerHTML = "";

                overlay.appendChild(
                    newCard
                );

            }

        }

    }


    if (typeof showToast === "function") {

        showToast(
            "Breeding card updated!"
        );

    }

}


// ============================================================
// RENDER ALL CARDS
// ============================================================

async function renderBreedingCards(
    data = null
) {

    const container =
        document.getElementById(
            "breeding-library-display"
        );


    if (!container) return;


    const searchTerm =
        document.getElementById(
            "breeding-search"
        )?.value.toLowerCase() || "";


    const cards =
        data ||
        await window.api.getBreeding();


    container.innerHTML = "";


    cards.forEach(
        (card, index) => {


            // Search filter
            if (
                searchTerm &&
                !card.name
                    .toLowerCase()
                    .includes(searchTerm)
            ) {
                return;
            }


            const div =
                createBreedingCard(
                    card,
                    index
                );


            // ------------------------------------------------
            // DRAG START
            // ------------------------------------------------

            div.addEventListener(
                "dragstart",
                e => {

                    if (
                        e.target.isContentEditable
                    ) {

                        e.preventDefault();

                        return;

                    }


                    div.classList.add(
                        "dragging"
                    );

                }
            );


            // ------------------------------------------------
            // DRAG END
            // ------------------------------------------------

            div.addEventListener(
                "dragend",
                async () => {

                    div.classList.remove(
                        "dragging"
                    );

                    await saveCardOrder();

                }
            );


            // ------------------------------------------------
            // CARD CLICK
            // ------------------------------------------------

            div.addEventListener(
                "click",
                e => {


                    // Delete button
                    if (
                        e.target.classList.contains(
                            "delete-card-btn"
                        )
                    ) {
                        return;
                    }


                    // Editable field
                    if (
                        e.target.isContentEditable
                    ) {
                        return;
                    }


                    // Anything inside editable field
                    if (
                        e.target.closest(
                            '[contenteditable="true"]'
                        )
                    ) {
                        return;
                    }


                    // Enlarge
                    enlargeCard(div);

                }
            );


            container.appendChild(div);

        }
    );


    // --------------------------------------------------------
    // DRAG REORDER
    // --------------------------------------------------------

    container.ondragover = e => {

        e.preventDefault();


        const afterElement =
            getDragAfterElement(
                container,
                e.clientX,
                e.clientY
            );


        const dragging =
            container.querySelector(
                ".dragging"
            );


        if (!dragging) return;


        if (
            afterElement == null
        ) {

            container.appendChild(
                dragging
            );

        } else {

            container.insertBefore(
                dragging,
                afterElement
            );

        }

    };

}


// ============================================================
// DRAG POSITION
// ============================================================

function getDragAfterElement(
    container,
    x,
    y
) {

    const draggableElements =
        [
            ...container.querySelectorAll(
                ".breeding-card:not(.dragging)"
            )
        ];


    return draggableElements.reduce(

        (closest, child) => {

            const box =
                child.getBoundingClientRect();


            const offsetX =
                x -
                box.left -
                box.width / 2;


            const offsetY =
                y -
                box.top -
                box.height / 2;


            const distance =
                Math.sqrt(
                    offsetX * offsetX +
                    offsetY * offsetY
                );


            if (
                distance <
                closest.distance
            ) {

                return {
                    distance: distance,
                    element: child
                };

            }


            return closest;

        },

        {
            distance:
                Number.POSITIVE_INFINITY,

            element: null
        }

    ).element;

}


// ============================================================
// SAVE CARD ORDER
// ============================================================

async function saveCardOrder() {

    const container =
        document.getElementById(
            "breeding-library-display"
        );


    const reorderedIds =
        [
            ...container.querySelectorAll(
                ".breeding-card"
            )
        ]
            .map(
                el =>
                    Number(
                        el.dataset.id
                    )
            );


    let allCards =
        await window.api.getBreeding();


    const sortedCards =
        reorderedIds
            .map(
                id =>
                    allCards.find(
                        c => c.id === id
                    )
            )
            .filter(Boolean);


    await window.api.setBreeding(
        sortedCards
    );

}


// ============================================================
// INIT
// ============================================================

function initBreeding() {

    renderBreedingCards();

    setupColorInputListeners();


    const search =
        document.getElementById(
            "breeding-search"
        );


    if (
        search &&
        !search.dataset.bound
    ) {

        search.dataset.bound =
            "true";


        search.addEventListener(
            "input",
            () => renderBreedingCards()
        );

    }

}


// ============================================================
// ENLARGE CARD
// ============================================================

async function enlargeCard(
    originalCard
) {

    let overlay =
        document.getElementById(
            "card-overlay"
        );


    // ========================================================
    // CREATE OVERLAY
    // ========================================================

    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "card-overlay";


        document.body.appendChild(
            overlay
        );


        // ----------------------------------------------------
        // CLICK OUTSIDE CARD = CLOSE
        // ----------------------------------------------------

        overlay.addEventListener(
            "click",
            e => {

                // Only close when the background itself
                // was clicked.
                if (
                    e.target === overlay
                ) {

                    overlay.style.display =
                        "none";

                    overlay.innerHTML =
                        "";

                }

            }
        );

    }


    // ========================================================
    // GET CURRENT DATABASE CARD
    // ========================================================

    const cardId =
        Number(
            originalCard.dataset.id
        );


    const allCards =
        await window.api.getBreeding();


    const card =
        allCards.find(
            c => c.id === cardId
        );


    if (!card) return;


    // ========================================================
    // CREATE FRESH EDITABLE CARD
    // ========================================================

    const clone =
        createBreedingCard(
            card
        );


    clone.draggable =
        false;


    clone.classList.add(
        "enlarged-card"
    );


    clone.style.animationDelay =
        "0s";


    // ========================================================
    // HIDE DELETE BUTTON
    // ========================================================

    const deleteBtn =
        clone.querySelector(
            ".delete-card-btn"
        );


    if (deleteBtn) {

        deleteBtn.style.display =
            "none";

    }


    // ========================================================
    // DISPLAY
    // ========================================================

    overlay.innerHTML =
        "";


    overlay.appendChild(
        clone
    );


    overlay.style.display =
        "flex";

}


// ============================================================
// LISTEN FOR EXTERNAL BREEDING DATABASE UPDATES
// ============================================================

window.api.onBreedingUpdate((newData) => {

    // Don't unnecessarily destroy an active edit
    const active =
        document.activeElement;


    if (
        active &&
        active.isContentEditable
    ) {
        return;
    }


    if (
        typeof renderBreedingCards ===
        "function"
    ) {

        renderBreedingCards(
            newData
        );

    }

});