let notes = [];
let selectedPriority = "green"; 
let dragStartIndex = null; 
let editingResponseId = null; 

async function initNotes() {
    try {
        const data = await window.api.getNotes();
        notes = data || [];
        
        renderNotes();
        renderCannedResponses();
    } catch (err) {
        console.error("Failed to load notes from file:", err);
    }
}

// Helper to show a warning using your existing custom App Alert Modal
function showWarning(msg) {
    const modal = document.getElementById("app-alert-modal");
    const text = document.getElementById("app-alert-text");
    const okBtn = document.getElementById("app-alert-ok-btn");
    
    if (modal && text && okBtn) {
        text.innerText = msg;
        modal.style.display = "flex";
        okBtn.onclick = () => modal.style.display = "none";
    } else {
        alert(msg); // Fallback
    }
}

function setNotePriority(color, element) {
    selectedPriority = color;
    document.querySelectorAll('.priority-selector .dot').forEach(dot => {
        dot.classList.remove('active');
    });
    element.classList.add('active');
}

// ---------------------------------------------------------
//  NORMAL NOTES LOGIC
// ---------------------------------------------------------

async function saveNote() {
    const input = document.getElementById("note-input");
    const nameInput = document.getElementById("response-name-input");
    const text = input.value.trim();

    if (text === "") {
        showWarning("Please type a note first!");
        return;
    }

    const newNote = {
        id: Date.now(),
        content: text,
        priority: selectedPriority
    };

    notes.push(newNote);
    window.api.setNotes(notes);
    
    if (typeof triggerButtonSuccess === "function") {
        triggerButtonSuccess("btn-save-note", "Note Saved!");
    }
    if (typeof launchConfetti === "function") {
        launchConfetti();
    }
    
    input.value = ""; 
    if (nameInput) nameInput.value = ""; // Clear the title box just in case
    renderNotes();
}

async function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    window.api.setNotes(notes);
    renderNotes();
}

async function saveEdit(id, newText) {
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex !== -1) {
        notes[noteIndex].content = newText;
        window.api.setNotes(notes);
    }
}

function renderNotes() {
    const container = document.getElementById("notes-display-container");
    if (!container) return;

    container.innerHTML = "";

    // Filter out canned responses so only normal notes show up here
    const normalNotes = notes.filter(n => n.type !== "canned-response");

    normalNotes.forEach((note, index) => {
        const block = document.createElement("div");
        block.className = `note-block priority-${note.priority || 'green'}`;
        block.style.animationDelay = `${index * 0.03}s`;
        
        block.draggable = true;

        block.addEventListener("dragstart", (e) => {
            dragStartIndex = index;
            e.dataTransfer.effectAllowed = "move";
            setTimeout(() => block.classList.add("dragging"), 0);
        });

        block.addEventListener("dragover", (e) => {
            e.preventDefault(); 
            e.dataTransfer.dropEffect = "move";
        });

        block.addEventListener("dragenter", (e) => {
            e.preventDefault();
            block.classList.add("drag-over"); 
        });

        block.addEventListener("dragleave", () => {
            block.classList.remove("drag-over");
        });

        block.addEventListener("dragend", () => {
            block.classList.remove("dragging");
            dragStartIndex = null;
        });

        block.addEventListener("drop", (e) => {
            e.preventDefault();
            block.classList.remove("drag-over");
            
            const dropIndex = index; 

            if (dragStartIndex !== null && dragStartIndex !== dropIndex) {
                const draggedNoteId = normalNotes[dragStartIndex].id;
                const dropNoteId = normalNotes[dropIndex].id;

                const actualDragIndex = notes.findIndex(n => n.id === draggedNoteId);
                const draggedNote = notes.splice(actualDragIndex, 1)[0];

                const actualDropIndex = notes.findIndex(n => n.id === dropNoteId);
                notes.splice(actualDropIndex, 0, draggedNote);

                window.api.setNotes(notes);
                renderNotes();
            }
        });
        
        const delBtn = document.createElement("button");
        delBtn.className = "note-delete-btn";
        delBtn.innerHTML = "×";
        delBtn.onclick = (e) => {
            e.stopPropagation(); 
            deleteNote(note.id);
        };
        
        const content = document.createElement("div");
        content.className = "note-content";
        content.contentEditable = "true"; 
        content.innerText = note.content;
        
        content.onblur = () => saveEdit(note.id, content.innerText);
        content.onkeydown = (e) => {
            if (e.ctrlKey && e.key === 'Enter') content.blur(); 
        };
        
        block.addEventListener("mousedown", (e) => {
            if (content.contains(e.target)) {
                block.draggable = false;
            } else {
                block.draggable = true;
            }
        });

        block.addEventListener("mouseup", () => {
            block.draggable = true;
        });

        block.appendChild(delBtn);
        block.appendChild(content);
        container.appendChild(block);
    });
}

// ---------------------------------------------------------
//  CANNED RESPONSES LOGIC 
// ---------------------------------------------------------

async function saveResponse() {
    const input = document.getElementById("note-input");
    const nameInput = document.getElementById("response-name-input");
    
    const text = input.value.trim();
    const name = nameInput ? nameInput.value.trim() : "";

    if (text === "") {
        showWarning("Please type the message in the large text box first!");
        return;
    }

    if (name === "") {
        showWarning("Please enter a Button Title in the top box for this response!");
        return;
    }

    const newResponse = {
        id: Date.now(),
        type: "canned-response",
        name: name,
        content: text
    };

    notes.push(newResponse);
    window.api.setNotes(notes);

    if (typeof triggerButtonSuccess === "function") {
        triggerButtonSuccess("btn-save-response", "Saved!");
    }

    input.value = "";
    if (nameInput) nameInput.value = "";
    
    renderCannedResponses();
}

function editResponse(id) {
    const response = notes.find(n => n.id === id);
    if (!response) return;

    const input = document.getElementById("note-input");
    const nameInput = document.getElementById("response-name-input");
    
    input.value = response.content;
    if (nameInput) nameInput.value = response.name;
    
    editingResponseId = id;

    // Toggle Buttons
    document.getElementById("btn-save-note").style.display = "none";
    document.getElementById("btn-save-response").style.display = "none";
    document.getElementById("btn-update-response").style.display = "inline-block";
}

async function updateResponse() {
    if (!editingResponseId) return;

    const input = document.getElementById("note-input");
    const nameInput = document.getElementById("response-name-input");
    
    const text = input.value.trim();
    const name = nameInput ? nameInput.value.trim() : "";

    if (text === "") {
        showWarning("The message cannot be empty!");
        return;
    }
    if (name === "") {
        showWarning("The Button Title cannot be empty!");
        return;
    }

    const response = notes.find(n => n.id === editingResponseId);
    if (!response) return;

    response.name = name;
    response.content = text;

    window.api.setNotes(notes);
    
    input.value = "";
    if (nameInput) nameInput.value = "";
    editingResponseId = null;

    // Restore Default Buttons
    document.getElementById("btn-save-note").style.display = "inline-block";
    document.getElementById("btn-save-response").style.display = "inline-block";
    document.getElementById("btn-update-response").style.display = "none";

    renderCannedResponses();
}

async function deleteResponse(id) {
    const response = notes.find(n => n.id === id);
    if (!response) return;

    const modal = document.getElementById("app-alert-modal");
    const text = document.getElementById("app-alert-text");
    const okBtn = document.getElementById("app-alert-ok-btn");

    if (modal && text && okBtn) {
        text.innerText = `Are you sure you want to delete "${response.name}"?`;

        modal.style.display = "flex";

        okBtn.innerText = "Yes, Delete";
        okBtn.className = "button red";

        let cancelBtn = document.getElementById("app-alert-cancel-btn");

        if (!cancelBtn) {
            cancelBtn = document.createElement("button");
            cancelBtn.id = "app-alert-cancel-btn";
            cancelBtn.className = "button";
            cancelBtn.innerText = "Cancel";

            okBtn.parentElement.appendChild(cancelBtn);
        }

        cancelBtn.style.display = "inline-block";

        // YES - DELETE
        okBtn.onclick = () => {
            notes = notes.filter(n => n.id !== id);
            window.api.setNotes(notes);

            // If the response being deleted was currently being edited,
            // cancel the edit mode and restore the normal buttons.
            if (editingResponseId === id) {
                editingResponseId = null;

                const input = document.getElementById("note-input");
                const nameInput = document.getElementById("response-name-input");

                if (input) input.value = "";
                if (nameInput) nameInput.value = "";

                document.getElementById("btn-save-note").style.display = "inline-block";
                document.getElementById("btn-save-response").style.display = "inline-block";
                document.getElementById("btn-update-response").style.display = "none";
            }

            renderCannedResponses();

            modal.style.display = "none";

            // Restore normal warning-modal button
            okBtn.innerText = "OK";
            okBtn.className = "button";
            cancelBtn.style.display = "none";
        };

        // CANCEL
        cancelBtn.onclick = () => {
            modal.style.display = "none";

            // Restore normal warning-modal button
            okBtn.innerText = "OK";
            okBtn.className = "button";
            cancelBtn.style.display = "none";
        };

    } else {
        // Fallback if the custom modal does not exist
        if (confirm(`Are you sure you want to delete "${response.name}"?`)) {
            notes = notes.filter(n => n.id !== id);
            window.api.setNotes(notes);

            if (editingResponseId === id) {
                editingResponseId = null;

                const input = document.getElementById("note-input");
                const nameInput = document.getElementById("response-name-input");

                if (input) input.value = "";
                if (nameInput) nameInput.value = "";

                document.getElementById("btn-save-note").style.display = "inline-block";
                document.getElementById("btn-save-response").style.display = "inline-block";
                document.getElementById("btn-update-response").style.display = "none";
            }

            renderCannedResponses();
        }
    }
}

function renderCannedResponses() {
    const container = document.getElementById("canned-responses-container");
    if (!container) return;

    // Find the Canned Responses card that contains the container
    const card = container.closest(".card");

    const canned = notes.filter(n => n.type === "canned-response");

    // Hide the entire Canned Responses section if there are no responses
    if (canned.length === 0) {
        if (card) card.style.display = "none";
        container.innerHTML = "";
        return;
    }

    // Show the section when at least one response exists
    if (card) card.style.display = "flex";

    container.innerHTML = "";

    canned.forEach(response => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "5px";
        row.style.width = "100%";
        row.style.alignItems = "stretch";

        // 1. Copy Text Button
        const copyBtn = document.createElement("button");
        copyBtn.className = "button rainbow-btn";
        copyBtn.style.flex = "1";
        copyBtn.style.margin = "0";
        copyBtn.style.textAlign = "center";
        copyBtn.style.justifyContent = "center";
        copyBtn.innerText = response.name;
        copyBtn.title = "Click to copy response";

        copyBtn.onclick = () => {
            navigator.clipboard.writeText(response.content);

            const originalText = copyBtn.innerText;
            copyBtn.innerText = "Copied!";

            setTimeout(() => {
                copyBtn.innerText = originalText;
            }, 1500);
        };

        // 2. Edit Button
        const editBtn = document.createElement("button");
        editBtn.className = "button";
        editBtn.style.margin = "0";
        editBtn.style.textAlign = "center";
        editBtn.innerText = "Edit";
        editBtn.onclick = () => editResponse(response.id);

        // 3. Delete Button
        const delBtn = document.createElement("button");
        delBtn.className = "button red";
        delBtn.style.margin = "0";
        delBtn.style.textAlign = "center";
        delBtn.style.display = "flex";
        delBtn.style.justifyContent = "center";
        delBtn.style.alignItems = "center";
        delBtn.innerText = "×";
        delBtn.title = "Delete Response";
        delBtn.onclick = () => deleteResponse(response.id);

        row.appendChild(copyBtn);
        row.appendChild(editBtn);
        row.appendChild(delBtn);

        container.appendChild(row);
    });
}