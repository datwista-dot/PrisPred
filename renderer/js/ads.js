/**
 * PRISMATIC PREDATORS - AD CREATOR LOGIC
 */

let isDraggingAd = false;
let startX, startY, currentImg;
let activeNudgeImg = null; 
const workspaceZoom = 0.35; 

// Price Logic State
let currentPriceValue = "000";
let currentPriceType = "egg"; // Changed to lowercase default

/**
 * Update Breeder Text with Prefix
 */
function updateBreederText(type, val) {
    const el = document.getElementById(`ad-text-${type}`);
    if (!el) return;
    
    // Determine prefix based on the ID
    const prefix = (type === 'stat-breeder') ? "Stats: " : "Color: ";
    el.innerText = prefix + val;
}

/**
 * Handles the Price and the Toggle
 */
function updatePriceValue(val) {
    currentPriceValue = val || "000";
    refreshPriceText();
}

function setPriceType(type) {
    currentPriceType = type.toLowerCase();
    
    // Update active button state
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    // Note: event.target works here if called from onclick
    if (window.event) window.event.target.classList.add('active');
    
    refreshPriceText();
}

/**
 * Refresh Price Sentence and Horizontal Position
 */
function refreshPriceText() {
    const el = document.getElementById('ad-text-price-block');
    if (!el) return;

    let suffix = "";
    
    if (currentPriceType === "egg") {
        // --- EGG SETTINGS ---
        suffix = "per pair eggs";
        el.style.left = "1173.43px"; // Original center point
    } else {
        // --- EMBRYO SETTINGS ---
        suffix = "per pair embryo";
        el.style.left = "1130.74px"; // New shifted position for embryos
    }

    el.innerHTML = `
        ${currentPriceValue} Tek
        <span class="price-suffix">${suffix}</span>
    `;
}

/**
 * Image Loaders and Zoom (Same as before)
 */
function loadAdImage(event, targetId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById(targetId);
        const container = img.parentElement;
        const tempImg = new Image();
        tempImg.onload = function() {
            const containerWidth = container.clientWidth;
            const initialScale = (containerWidth / tempImg.width).toFixed(2);
            img.src = e.target.result;
            img.style.left = "50%";
            img.style.top = "50%";
            img.dataset.offsetX = 0;
            img.dataset.offsetY = 0;
            img.style.transform = `translate(-50%, -50%) scale(${initialScale})`;
            const slider = document.getElementById(targetId === 'ad-dino-img' ? 'dino-zoom-slider' : 'stats-zoom-slider');
            if (slider) slider.value = initialScale;
            selectImageForNudge(img);
        };
        tempImg.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

/**
 * SYNC GUIDE BOX: Draws a box exactly where the image sits on the 2k canvas
 */
function updateSelectionGuide() {
    const guide = document.getElementById('image-selection-guide');
    if (!activeNudgeImg || !guide) {
        if(guide) guide.style.display = 'none';
        return;
    }

    const wrapper = document.getElementById('ad-canvas-wrapper');
    const imgRect = activeNudgeImg.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();

    // Convert Screen Pixels back to 2202x1245 Canvas Pixels
    guide.style.display = 'block';
    guide.style.left = (imgRect.left - wrapRect.left) / workspaceZoom + 'px';
    guide.style.top = (imgRect.top - wrapRect.top) / workspaceZoom + 'px';
    guide.style.width = imgRect.width / workspaceZoom + 'px';
    guide.style.height = imgRect.height / workspaceZoom + 'px';
}

function selectImageForNudge(imgEl) {
    activeNudgeImg = imgEl;
    updateSelectionGuide();
}

function updateAdText(type, val) {
    const el = document.getElementById(`ad-text-${type}`);
    if (el) el.innerText = val;
}

function zoomAdImage(id, val) {
    const img = document.getElementById(id);
    if (img) {
        img.style.transform = `translate(-50%, -50%) scale(${val})`;
        updateSelectionGuide();
    }
}

/**
 * MOUSE DRAGGING & FOCUS
 */
document.addEventListener('mousedown', e => {
    if (e.target.classList.contains('draggable-img')) {
        isDraggingAd = true;
        currentImg = e.target;
        selectImageForNudge(currentImg);

        const rect = currentImg.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        e.preventDefault();
    } 
    // Clear selection if clicking workspace but NOT an image
    else if (e.target.id === 'ad-canvas-wrapper' || e.target.classList.contains('ads-canvas-area')) {
        activeNudgeImg = null;
        updateSelectionGuide();
    }
    // Note: Clicking a slider (INPUT) happens naturally, 
    // the browser will focus it and keyboard arrows will work.
});

document.addEventListener('mousemove', e => {
    if (!isDraggingAd || !currentImg) return;

    const parentRect = currentImg.parentElement.getBoundingClientRect();
    let newX = (e.clientX - parentRect.left - startX) / workspaceZoom;
    let newY = (e.clientY - parentRect.top - startY) / workspaceZoom;

    currentImg.dataset.offsetX = newX;
    currentImg.dataset.offsetY = newY;
    
    applyImagePosition(currentImg);
    updateSelectionGuide();
});

document.addEventListener('mouseup', () => {
    isDraggingAd = false;
});

window.addEventListener('keydown', (e) => {
    // Don't delete/nudge images while typing in an input or textarea
    const active = document.activeElement;

    if (
        active &&
        (
            active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.isContentEditable
        )
    ) {
        return;
    }

    // Nothing selected = nothing to do
    if (!activeNudgeImg) return;

    // =========================
    // DELETE SELECTED IMAGE
    // =========================
    if (e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();

        const img = activeNudgeImg;
        const targetId = img.id;

        // Remove the image
        img.removeAttribute('src');

        // Reset position
        img.dataset.offsetX = "0";
        img.dataset.offsetY = "0";
        img.style.left = "50%";
        img.style.top = "50%";
        img.style.transform = "translate(-50%, -50%) scale(1)";

        // Reset the correct zoom slider
        const sliderId =
            targetId === 'ad-dino-img'
                ? 'dino-zoom-slider'
                : 'stats-zoom-slider';

        const slider = document.getElementById(sliderId);

        if (slider) {
            slider.value = 1;
        }

        // Clear selection
        activeNudgeImg = null;
        updateSelectionGuide();

        if (typeof showToast === 'function') {
            const type =
                targetId === 'ad-dino-img'
                    ? "Dino"
                    : "Stats";

            showToast(`${type} Image Deleted!`);
        }

        return;
    }

    // =========================
    // ARROW NUDGE
    // =========================
    const isArrow = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight'
    ].includes(e.key);

    if (!isArrow) return;

    e.preventDefault();

    const amt = e.shiftKey ? 10 : 1;

    let curX = parseFloat(activeNudgeImg.dataset.offsetX) || 0;
    let curY = parseFloat(activeNudgeImg.dataset.offsetY) || 0;

    if (e.key === 'ArrowUp') curY -= amt;
    if (e.key === 'ArrowDown') curY += amt;
    if (e.key === 'ArrowLeft') curX -= amt;
    if (e.key === 'ArrowRight') curX += amt;

    activeNudgeImg.dataset.offsetX = curX;
    activeNudgeImg.dataset.offsetY = curY;

    applyImagePosition(activeNudgeImg);
    updateSelectionGuide();
});

function applyImagePosition(img) {
    const x = img.dataset.offsetX;
    const y = img.dataset.offsetY;
    const transformStr = img.style.transform || "";
    const match = transformStr.match(/scale\(([^)]+)\)/);
    const scale = match ? match[1] : 1;
    
    img.style.left = `calc(50% + ${x}px)`;
    img.style.top = `calc(50% + ${y}px)`;
    img.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

/**
 * BOOTSTRAP: Create the guide element if missing
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('image-selection-guide')) {
        const wrapper = document.getElementById('ad-canvas-wrapper');
        if (wrapper) {
            const guide = document.createElement('div');
            guide.id = 'image-selection-guide';
            wrapper.appendChild(guide);
        }
    }
});

async function exportAdAsPNG() {
    if (typeof showToast === 'function') showToast("Generating High-Res Ad...");

    // 1. Create a hidden canvas at the exact high-res size
    const canvas = document.createElement('canvas');
    canvas.width = 2202;
    canvas.height = 1245;
    const ctx = canvas.getContext('2d');

    try {
        // --- LAYER 1: BASE BACKGROUND ---
        const bgImg = document.getElementById('layer-bg');
        if (bgImg.src) ctx.drawImage(bgImg, 0, 0, 2202, 1245);

        // --- LAYER 2: DINO IMAGE ---
        const dinoImg = document.getElementById('ad-dino-img');
        if (dinoImg.src && dinoImg.src.length > 10) {
            drawClippedImage(ctx, dinoImg, 5, 1245 - 765 - 5, 1382, 765);
        }

        // --- LAYER 3: STATS IMAGE ---
        const statsImg = document.getElementById('ad-stats-img');
        if (statsImg.src && statsImg.src.length > 10) {
            drawClippedImage(ctx, statsImg, 2202 - 807 - 5, 5, 807, 1233);
        }

        // --- LAYER 4: OVERLAY (BORDER) ---
        const overlayImg = document.getElementById('layer-overlay');
        if (overlayImg.src) ctx.drawImage(overlayImg, 0, 0, 2202, 1245);

        // --- LAYER 5: TEXT (WITH FOUNTAIN COLORS) ---
        drawBreederText(ctx);
        drawPriceText(ctx);

        // --- SAVE TO DESKTOP ---
        const base64Data = canvas.toDataURL('image/png');
        const success = await window.api.saveAdImage(base64Data);

        if (success && typeof triggerButtonSuccess === 'function') {
            triggerButtonSuccess('btn-save-ad', "AD SAVED TO DESKTOP!");
        }

    } catch (err) {
        console.error("Export Error:", err);
        if (typeof showAppAlert === 'function') showAppAlert("Export failed: " + err.message);
    }
}

/**
 * HELPER: Draws an image inside a window with its specific zoom and pan
 */
function drawClippedImage(ctx, imgEl, winX, winY, winW, winH) {
    ctx.save();
    // Create the clipping window
    ctx.beginPath();
    ctx.rect(winX, winY, winW, winH);
    ctx.clip();

    // Get current zoom and offsets from the UI
    const transformStr = imgEl.style.transform || "";
    const match = transformStr.match(/scale\(([^)]+)\)/);
    const scale = match ? parseFloat(match[1]) : 1;
    const offX = parseFloat(imgEl.dataset.offsetX) || 0;
    const offY = parseFloat(imgEl.dataset.offsetY) || 0;

    // Calculate centering + manual offsets
    const drawW = imgEl.naturalWidth * scale;
    const drawH = imgEl.naturalHeight * scale;
    const x = winX + (winW / 2) - (drawW / 2) + offX;
    const y = winY + (winH / 2) - (drawH / 2) + offY;

    ctx.drawImage(imgEl, x, y, drawW, drawH);
    ctx.restore();
}

/**
 * HELPER: Draws the Stats: and Color: lines with gradients
 */
function drawBreederText(ctx) {
    const statText = document.getElementById('ad-text-stat-breeder').innerText;
    const colorText = document.getElementById('ad-text-color-breeder').innerText;
    
    ctx.font = "bold 61px 'CenturyGothic'"; // Matches your font and size
    ctx.textBaseline = "alphabetic";

    // Setup Fountain: Yellow to Red
    const gradient = ctx.createLinearGradient(57, 0, 500, 0); // Horizontal gradient
    gradient.addColorStop(0, "#fff200");
    gradient.addColorStop(1, "#ed1c24");
    ctx.fillStyle = gradient;

    // Draw Stats (Y is calculated from bottom anchor 1245 - 884.194)
    ctx.fillText(statText, 57.13, 1245 - 884.194);
    // Draw Color (Y is calculated from bottom anchor 1245 - 815.504)
    ctx.fillText(colorText, 57.13, 1245 - 815.504);
}

/**
 * HELPER: Draws the Price sentence with gradients and dynamic shift
 * Calibrated to match CSS bottom: 797.004px and margin-top: -5px
 */
function drawPriceText(ctx) {
    ctx.font = "bold 70px 'BritannicBold'";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic"; // Precise control over the font line

    // Detect center point and text based on mode
    const centerX = (currentPriceType === "egg") ? 1173.43 : 1130.74;
    const suffix = (currentPriceType === "egg") ? "per pair eggs" : "per pair embryo";
    const line1 = `${currentPriceValue} Tek`;

    // Setup Fountain: Cyan to Red
    const gradient = ctx.createLinearGradient(centerX - 350, 0, centerX + 350, 0);
    gradient.addColorStop(0, "#00aee9");
    gradient.addColorStop(0.3, "#00c0f0");
    gradient.addColorStop(0.7, "#ed1c24");
	gradient.addColorStop(1, "#ed1c24");
    ctx.fillStyle = gradient;

    // Line 1: (000 Tek)
    // Adjusted from 813.5 to 875 to match the higher CSS positioning
    const firstLineY = 1245 - 875; 
    ctx.fillText(line1, centerX, firstLineY); 

    // Line 2: (per pair eggs)
    // Reduced the gap from 80 to 65 to simulate your CSS "margin-top: -5px"
    const gap = 65; 
    ctx.fillText(suffix, centerX, firstLineY + gap); 
}

/**
 * MAGIC PASTE LOGIC (Ctrl+V)
 */
window.addEventListener('paste', async (e) => {
    // 1. Only run if we are on the Ads template
    if (!document.body.classList.contains('template-ads')) return;

    // 2. Don't run if the user is typing in a text input (Price/Breeder name)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const imgData = event.target.result;
                
                // Create a temporary image to check dimensions
                const tempImg = new Image();
                tempImg.onload = function() {
                    let targetId = "";
                    
                    // 3. DIRECTION LOGIC
                    if (tempImg.width > tempImg.height) {
                        // Landscape -> Dino Window
                        targetId = "ad-dino-img";
                        console.log("Detected Landscape: Sending to Dino Window");
                    } else {
                        // Portrait -> Stats Window
                        targetId = "ad-stats-img";
                        console.log("Detected Portrait: Sending to Stats Window");
                    }
                    
                    // 4. TRIGGER LOAD LOGIC
                    // We reuse your centering/scaling math
                    processPastedImage(imgData, targetId, tempImg.width);
                };
                tempImg.src = imgData;
            };
            reader.readAsDataURL(blob);
        }
    }
});

/**
 * Helper to process the pasted image into the windows
 */
function processPastedImage(src, targetId, originalWidth) {
    const img = document.getElementById(targetId);
    const container = img.parentElement;
    
    // Calculate scale to fit width
    const containerWidth = container.clientWidth;
    const initialScale = (containerWidth / originalWidth).toFixed(2);
    
    // Apply data
    img.src = src;
    img.style.left = "50%";
    img.style.top = "50%";
    img.dataset.offsetX = 0;
    img.dataset.offsetY = 0;
    img.style.transform = `translate(-50%, -50%) scale(${initialScale})`;

    // Update the correct slider UI
    const sliderId = targetId === 'ad-dino-img' ? 'dino-zoom-slider' : 'stats-zoom-slider';
    const slider = document.getElementById(sliderId);
    if (slider) slider.value = initialScale;
    
    // Select it so user can nudge with arrows immediately
    selectImageForNudge(img);
    
    if (typeof showToast === 'function') {
        const type = targetId === 'ad-dino-img' ? "Dino" : "Stats";
        showToast(`${type} Image Pasted!`);
    }
}