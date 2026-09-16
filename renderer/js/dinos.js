// =========================
// GLOBAL STATE FOR COUNTER & MEMORY
// =========================
let totalRequestedInText = 0;
let learnedSynonyms = {};

// 🔥 Load the custom dictionary via our new bridge when the file loads!
if (window.api && window.api.getParserData) {
    window.api.getParserData().then(data => {
        if (data) learnedSynonyms = data;
    });
}

// 🔥 Helper to save newly learned words
function saveLearnedSynonym(badInput, correctName) {
    learnedSynonyms[badInput.toLowerCase()] = correctName;
    if (window.api && window.api.setParserData) {
        window.api.setParserData(learnedSynonyms);
        console.log(`Learned: "${badInput}" -> "${correctName}"`);
    }
}

// =========================
// INIT BUTTONS
// =========================
function initDinos() {
    const container = document.getElementById("dino-buttons");
    const data = dinoItemsSource || [];

    container.innerHTML = "";

    data.forEach(d => {
        const btn = document.createElement("button");
        btn.className = "button";
        btn.textContent = d.name;

        btn.onclick = () => {
            dinoItems.push({
                ...d,
                basePrice: Number(d.price),
                extraFemale: 0,
                _isUnsure: false // Manual clicks are never unsure
            });

            lastDinoIndex = dinoItems.length - 1;
            recalcFromDinos();
            updateCounterUI();
            if (typeof updateOrderSummary === "function") updateOrderSummary();
        };

        container.appendChild(btn);
    });
}

// =========================
// ACTIONS
// =========================
function addExtraFemale() {
    if (lastDinoIndex < 0) return;

    let item = dinoItems[lastDinoIndex];
    let extra = item.basePrice / 2;

    item.extraFemale += extra;
    recalcFromDinos();
    if (typeof updateOrderSummary === "function") updateOrderSummary();
}

function undoLastAction() {
    if (dinoItems.length === 0) return;

    dinoItems.pop();
    lastDinoIndex = dinoItems.length - 1;

    recalcFromDinos();
    updateCounterUI();
    if (typeof updateOrderSummary === "function") updateOrderSummary();
}

// =========================
// 🔥 UPDATED PARSER SYSTEM
// =========================
const COLORS = ["red", "blue", "green", "yellow", "cyan", "magenta"];
const VERSION_REGEX = /v\d+/i;

const SYNONYMS = {
    aberrant: ["ab"],
    pego: ["pegomastax", "pegomastak", "pegomastac"],
    pt: ["pteranodon", "ptera", "pternadon"],
    velo: ["velonasaur", "velonosaur"],
    maeguana: ["mae"],
    mosa: ["mosasaur", "mosasaurus"],
    tuso: ["tusoteuthis", "tuso"],
    daeodon: ["deadon", "dae", "dayo"],
    wyvern: ["wivern", "wvern", "wyvrn", "wivarn", "wyv"],
    gigantopithecus: ["giantopithecus", "gigantopithacus", "gigantithecus", "gigantopicus"],
    morellatops: ["morella"],
    iguanodon: ["iguana"],
    gloon: ["gloons"],
	kapro: ["kaprosuchus"]
};

function applySynonyms(word) {
    const lowWord = word.toLowerCase();
    for (const [correct, list] of Object.entries(SYNONYMS)) {
        if (lowWord === correct || list.includes(lowWord)) {
            return correct;
        }
    }
    return word;
}

function cleanChunk(text) {
    let cleaned = text.toLowerCase();

    // 1. Remove currency phrases like "tek ceilings"
    cleaned = cleaned.replace(/\btek\s+(ceilings?|walls?|foundations?|c|w|f)\b/g, ' ');

    // 2. 🔥 THE SMARTER FIX: Target "Price + Tek" combos before we remove the numbers!
    // This looks for any number 20 or higher right next to the word "tek" (e.g., "500 tek" or "tek 200")
    // It ignores small numbers, so quantities like "2 tek rex" or "10 tek rex" are completely safe!
    cleaned = cleaned.replace(/\b([2-9]\d|[1-9]\d{2,})\s*tek\b/g, ' ');
    cleaned = cleaned.replace(/\btek\s*([2-9]\d|[1-9]\d{2,})\b/g, ' ');

    // 3. Remove arrows and symbols
    cleaned = cleaned.replace(/->|=>|-->|==>|\*|\-/g, ' ');

    // 4. Remove anything in parentheses
    cleaned = cleaned.replace(/\(.*?\)/g, ' ');
    cleaned = cleaned.replace(/[\[\]\(\)]/g, ' ');

    // 5. The Blocklist (Removes the raw numbers if they didn't have "tek" written next to them)
    cleaned = cleaned.replace(/\b(rainbow|order|pair|of|pairs|embryo|male|female|egg|eggs|weight|name|booster|each|payment|price|cost|ceilings?|walls?|foundations?|100|150|200|250|300|350|400|450|500|550|600|650|700|750|800|850|900|950|1000|trader|datwista|extra|additional)\b/g, '');

    // 6. Clean up weird leftover characters
    cleaned = cleaned.replace(/[^\w\s\/&x\-\.]/g, ' ');

    // 7. Collapse spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

function extractQuantity(chunk) {
    const xMatch = chunk.match(/(\d+)\s*x|x\s*(\d+)/i);
    if (xMatch) return parseInt(xMatch[1] || xMatch[2]);
    const startMatch = chunk.match(/^(\d+)\s+/);
    if (startMatch) return parseInt(startMatch[1]);
    const endMatch = chunk.match(/\s+(\d+)$/);
    if (endMatch) return parseInt(endMatch[1]);
    return 1;
}

// =========================
// MAIN SCAN FUNCTION
// =========================
function scanOrderText() {
    const rawInput = document.getElementById("order-input");
    const rawText = rawInput.value;
    if (!rawText) return;

    extractCustomerName(rawText);

    if (typeof checkBoosterStatus === "function") {
        checkBoosterStatus();
    }

    const cleanedText = rawText.replace(/@([^\n\r]+)/g, '');
    const data = dinoItemsSource || [];
    dinoItems = [];
    totalRequestedInText = 0;

    let currentBaseName = null;

    const lines = cleanedText.split(/[\n,&]+|\band\b/i);

    lines.forEach(rawLine => {
        let chunk = cleanChunk(rawLine);
        const lowerRaw = rawLine.toLowerCase().trim();

        // 🔥 Detect extra female request BEFORE cleanChunk removes
        // "female", "egg", parentheses, etc.
        const wantsExtraFemale =
            /\+\s*1?\s*female\s*egg/i.test(lowerRaw) ||
            /extra\s*female/i.test(lowerRaw) ||
            /additional\s*female/i.test(lowerRaw);

        if (!chunk || lowerRaw.startsWith("name:") || lowerRaw.startsWith("payment:")) return;

        const quantity = extractQuantity(chunk);
        let processedChunk = chunk.replace(/\b\d+x?\b|x\d+\b/g, '').trim();
        const tokens = processedChunk.split(/\s+/);

        let dinoNameParts = [];
        let traitGroups = [];
        let currentGroup = null;
        
        // 🔥 NEW: Check if they used the word "all"
        let hasAll = false; 

        tokens.forEach(token => {
            const word = token.trim();
            if (!word) return;

            if (word === "all") {
                hasAll = true; // Flag triggered!
            } else if (COLORS.includes(word)) {
                currentGroup = { color: word, versions: [] };
                traitGroups.push(currentGroup);
            } else if (VERSION_REGEX.test(word)) {
                if (currentGroup) {
                    currentGroup.versions.push(word);
                } else {
                    traitGroups.push({ color: null, versions: [word] });
                }
            } else if (word.length > 1) {
                dinoNameParts.push(applySynonyms(word));
            }
        });

        let base = dinoNameParts.join(" ");
        if (!base && currentBaseName) {
            base = currentBaseName;
        } else if (base) {
            currentBaseName = base;
        }

        if (!base) return;

        if (traitGroups.length === 0) {
            traitGroups.push({ color: null, versions: [null] });
        }

        // 🔥 NEW: Multi-Select Logic for "All"
        if (hasAll) {
            traitGroups.forEach(group => {
                const versionsToLoop = group.versions.length > 0 ? group.versions : [null];
                
                versionsToLoop.forEach(v => {
                    // We ignore group.color because they want ALL colors
                    let searchStr = [base, v].filter(Boolean).join(" ");
                    
                    if (!searchStr) return;

                    let allMatched = findAllMatches(searchStr, data);
                    
                    if (allMatched.length > 0) {
                        // Increase the expected UI counter by the number of variants we found
                        totalRequestedInText += (quantity * allMatched.length);
                        
                        allMatched.forEach(match => {
                            for (let i = 0; i < quantity; i++) {
                                dinoItems.push({
                                    ...match,
                                    basePrice: Number(match.price),
                                    extraFemale: wantsExtraFemale ? Number(match.price) / 2 : 0,
                                    _isUnsure: false,
                                    _originalInput: rawLine,
                                    _alternatives: []
                                });
                            }
                        });
                    } else {
                        // If it found nothing, increment by 1 so the UI counter flashes red to warn you
                        totalRequestedInText += quantity;
                    }
                });
            });
        } else {
            // Existing Normal Logic
            traitGroups.forEach(group => {
                const versionsToLoop = group.versions.length > 0 ? group.versions : [null];

                versionsToLoop.forEach(v => {
                    totalRequestedInText += quantity;

                    let searchStr = [base, group.color, v].filter(Boolean).join(" ");
                    let matchData = findBestMatch(searchStr, data);

                    if (matchData) {
                        for (let i = 0; i < quantity; i++) {
                            dinoItems.push({
                                ...matchData.dino,
                                basePrice: Number(matchData.dino.price),
                                extraFemale: wantsExtraFemale ? Number(matchData.dino.price) / 2 : 0,
                                _isUnsure: matchData.isUnsure,
                                _originalInput: matchData.originalInput,
                                _alternatives: matchData.alternatives
                            });
                        }
                    }
                });
            });
        }
    });

    dinoItems.sort((a, b) => a.name.localeCompare(b.name));
    updateCounterUI();
    recalcFromDinos();
    lastDinoIndex = dinoItems.length - 1;

    if (typeof updateOrderSummary === "function") updateOrderSummary();

    autoSelectNextFridge();
    setDefaultPayment();
    generatePin();
}

// =========================
// TOKEN MATCH SCORING HELPER
// =========================
function scoreCandidate(input, dbName) {
    const inputWords = input.toLowerCase().split(/\s+/).filter(Boolean);
    const dbWords = dbName.toLowerCase().split(/\s+/).filter(Boolean);
    
    if (inputWords.length === 0 || dbWords.length === 0) {
        return { matchedCount: 0, totalScore: 0, penalty: 999 };
    }

    let totalScore = 0;
    let matchedCount = 0;
    const matchedDbIndices = new Set();

    for (const inputWord of inputWords) {
        let bestWordScore = 0;
        let bestDbIdx = -1;

        for (let i = 0; i < dbWords.length; i++) {
            if (matchedDbIndices.has(i)) continue;
            const dbWord = dbWords[i];
            const maxLen = Math.max(inputWord.length, dbWord.length);

            let wordScore = 0;
            
            // 1. Exact Match
            if (inputWord === dbWord) {
                wordScore = 1.0;
            } 
            // 2. Substring Match (e.g., if someone types "dread" for "dreadnoughtus")
            else if (dbWord.includes(inputWord) || inputWord.includes(dbWord)) {
                const commonLength = Math.min(inputWord.length, dbWord.length);
                // Prevent short words like "red" from falsely matching long words like "dreadnoughtus"
                if (commonLength > 2 || maxLen <= 3) {
                    wordScore = 0.8 * (commonLength / maxLen);
                }
            }

            // 3. Fuzzy Spelling Match (Converts typos to a Percentage)
            const dist = levenshtein(inputWord, dbWord);
            const similarity = 1 - (dist / maxLen); // 1.0 is perfect, 0.5 is half-wrong

            // If fuzzy spelling is better than the substring check, use it
            if (similarity > wordScore) {
                // If the word is at least 50% spelled correctly
                if (similarity >= 0.5) { 
                    wordScore = similarity * 0.9;
                } else if (dist === 1 && maxLen <= 3) { 
                    // Forgiving rule for tiny words (yo vs yi)
                    wordScore = 0.6;
                }
            }

            if (wordScore > bestWordScore) {
                bestWordScore = wordScore;
                bestDbIdx = i;
            }
        }

        // Lowered threshold: Now accepts words even if they are heavily misspelled
        // as long as the math proves they are the closest fit.
        if (bestWordScore >= 0.35) {
            totalScore += bestWordScore;
            matchedCount++;
            if (bestDbIdx !== -1) {
                matchedDbIndices.add(bestDbIdx);
            }
        }
    }

    const unmatchedInput = inputWords.length - matchedCount;
    const unmatchedDb = dbWords.length - matchedDbIndices.size;
    
    // Penalize leftovers
    const penalty = unmatchedInput * 2.0 + unmatchedDb * 0.5;

    return { matchedCount, totalScore, penalty };
}

// =========================
// FUZZY MATCH WITH MEMORY & CONFIDENCE
// =========================
function findBestMatch(input, data) {
    if (!input || input.length < 2) return null;
    const lowerInput = input.toLowerCase().trim();

    // 1. CHECK CUSTOM LEARNING DICTIONARY FIRST
    if (learnedSynonyms[lowerInput]) {
        const learnedName = learnedSynonyms[lowerInput];
        const exactMatch = data.find(d => d.name.toLowerCase() === learnedName.toLowerCase());
        if (exactMatch) {
            return { dino: exactMatch, isUnsure: false, originalInput: lowerInput, alternatives: [] };
        }
    }

    // 2. Score all candidates if not in dictionary
    let results = [];
    for (const d of data) {
        const name = d.name.toLowerCase();
        
        if (name === lowerInput) {
            return { dino: d, isUnsure: false, originalInput: lowerInput, alternatives: [] };
        }

        const scoreObj = scoreCandidate(lowerInput, name);
        results.push({ dino: d, score: scoreObj });
    }

    // 3. Sort by matched words, then score, then penalty
    results.sort((a, b) => {
        if (b.score.matchedCount !== a.score.matchedCount) return b.score.matchedCount - a.score.matchedCount;
        if (Math.abs(b.score.totalScore - a.score.totalScore) > 0.001) return b.score.totalScore - a.score.totalScore;
        return a.score.penalty - b.score.penalty;
    });

    const bestResult = results[0];
    const inputWordsCount = lowerInput.split(/\s+/).filter(Boolean).length;
    const minimumMatchesRequired = inputWordsCount <= 2 ? 1 : Math.ceil(inputWordsCount / 2);

    if (bestResult && bestResult.score.matchedCount >= minimumMatchesRequired) {
        
        let isUnsure = false;
        if (bestResult.score.penalty > 1.5 || bestResult.score.totalScore < inputWordsCount * 0.75) {
            isUnsure = true;
        }

        return { 
            dino: bestResult.dino, 
            isUnsure: isUnsure, 
            originalInput: lowerInput,
            // 🔥 FIX: Changed slice from (1,4) to (0,4)
            // This includes the system's #1 current guess in the dropdown so you can confirm it!
            alternatives: results.slice(0, 4).map(r => r.dino) 
        };
    }

    return null;
}

// =========================
// MULTI-MATCH FOR "ALL" COMMAND
// =========================
function findAllMatches(input, data) {
    if (!input || input.length < 2) return [];

    const inputWords = input.toLowerCase().trim().split(/\s+/).filter(Boolean);

    return data.filter(d => {
        const nameWords = d.name.toLowerCase().split(/\s+/).filter(Boolean);

        // Every requested word must exist as an EXACT word
        // somewhere in the dino's name.
        return inputWords.every(inputWord =>
            nameWords.includes(inputWord)
        );
    });
}

// =========================
// 🔥 NEW UI HELPERS FOR LEARNING
// =========================
function toggleSuggestions(index) {
    const el = document.getElementById(`suggestions-${index}`);
    if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

function learnDino(itemIndex, badInput, correctName) {
    // 1. Save it to our parsar.json file
    saveLearnedSynonym(badInput, correctName);

    // 2. Find the full database object for the correct dino
    const correctDinoData = dinoItemsSource.find(d => d.name === correctName);

    // 3. Update the item in your current cart
    if (correctDinoData) {
        let currentItem = dinoItems[itemIndex];
        
        // Overwrite the wrong data with the right data
        dinoItems[itemIndex] = {
            ...currentItem,
            ...correctDinoData,
            name: correctDinoData.name,
            basePrice: Number(correctDinoData.price),
            _isUnsure: false // Turn off the warning flag!
        };

        // 4. Recalculate everything and refresh the UI
        recalcFromDinos();
        if (typeof updateOrderSummary === "function") updateOrderSummary();
    }
}

// =========================
// LEVENSHTEIN HELPER
// =========================
function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// =========================
// SEARCH + UI
// =========================
function updateCounterUI() {
    const counterEl = document.getElementById("identified-count");
    const summaryBox = document.getElementById("order-summary");
    if (!counterEl) return;

    counterEl.textContent = `${dinoItems.length} / ${totalRequestedInText}`;

    if (totalRequestedInText > 0 && dinoItems.length < totalRequestedInText) {
        counterEl.style.color = "#ff4d6d";
        summaryBox?.classList.remove("scan-success-glow");
    } else if (totalRequestedInText > 0 && dinoItems.length === totalRequestedInText) {
        if (!summaryBox?.classList.contains("scan-success-glow")) {
            if (typeof launchConfetti === "function") launchConfetti(); 
            if (typeof playSuccessSound === "function") playSuccessSound();
        }

        counterEl.style.color = "#00ffcc";
        summaryBox?.classList.add("scan-success-glow");
    } else {
        counterEl.style.color = "#ffffff";
        summaryBox?.classList.remove("scan-success-glow");
    }
}

function filterDinos() {
    const query = document.getElementById("dino-search").value.toLowerCase();
    const container = document.getElementById("dino-buttons");
    const buttons = container.getElementsByTagName("button");
    const hasQuery = query.trim().length > 0;

    for (let btn of buttons) {
        const text = btn.textContent.toLowerCase();
        if (!hasQuery) {
            btn.style.display = "";
        } else if (text.includes(query)) {
            btn.style.display = "inline-block";
        } else {
            btn.style.display = "none";
        }
    }
    container.style.display = hasQuery ? "flex" : (typeof dinosVisible !== 'undefined' && dinosVisible ? "flex" : "none");
}

function clearSearch() {
    const searchInput = document.getElementById("dino-search");
    if (searchInput) searchInput.value = "";
    filterDinos();
}

function clearOrderInput() {
    const orderInput = document.getElementById("order-input");
    if (orderInput) orderInput.value = "";

    totalRequestedInText = 0;
    document.getElementById("order-summary")?.classList.remove("scan-success-glow");
    updateCounterUI();
}

// =========================
// HELPERS
// =========================
function extractCustomerName(text) {
    const atMatch = text.match(/@([^\n\r]+)/);
    
    if (atMatch) {
        const name = atMatch[1].trim(); 
        const input = document.getElementById("customer-name");
        if (input) input.value = name;
        return;
    }

    const nameMatch = text.match(/name\s*:?\s*([^\n\r]+)/i);
    if (nameMatch) {
        const name = nameMatch[1].trim();
        const input = document.getElementById("customer-name");
        if (input) input.value = name;
    }
}

function autoSelectNextFridge() {
    const tables = document.querySelectorAll("#regular-tables table");
    for (let table of tables) {
        const rows = table.querySelectorAll("tr");
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll("td");
            if (cells.length < 3) continue;

            const fridgeText = cells[0].textContent.trim();
            const nameCell = cells[1];
            const tekCell = cells[2];

            const isEmpty = !nameCell.textContent.trim() && !tekCell.textContent.trim();

            if (isEmpty) {
                const match = fridgeText.match(/(green|blue|red|yellow)\s*#(\d+)/i);
                if (match) {
                    const color = match[1].toUpperCase();
                    const number = match[2];
                    selectFridgeButton(color);
                    selectFridgeNumberButton(number);
                }
                return;
            }
        }
    }
}

function selectFridgeButton(color) {
    const btn = document.querySelector(`[data-fridge="${color}"]`);
    if (btn) btn.click();
}

function selectFridgeNumberButton(number) {
    const btn = document.querySelector(`[data-fridge-number="${number}"]`);
    if (btn) btn.click();
}

function setDefaultPayment() {
    const btn = document.querySelector(`[data-payment="Tek Ceilings"]`);
    if (btn) btn.click();
}