// --- DOM Elements ---
const board = document.getElementById('board');
const imageUpload = document.getElementById('imageUpload');
const addNoteBtn = document.getElementById('addNoteBtn');
const saveBtn = document.getElementById('saveBtn');
const themeBtn = document.getElementById('themeBtn');
const nightAudio = document.getElementById('nightAudio');
const instructionText = document.getElementById('instructionText');
const controlBar = document.getElementById('controlBar');

// --- State Variables ---
let zIndexCounter = 1;

// --- 1. Handle Image Upload ---
imageUpload.addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length === 0) return;

    // Hide instructions once user starts
    instructionText.style.display = 'none';

    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(event) {
            createPolaroid(event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// --- 2. Handle Sticky Note Creation ---
addNoteBtn.addEventListener('click', () => {
    // Hide instructions if starting with a note
    instructionText.style.display = 'none';
    createStickyNote();
});

// --- 3. Function: Create Polaroid ---
function createPolaroid(imageSrc) {
    const div = document.createElement('div');
    div.classList.add('polaroid');
    
    // Random Position & Rotation
    const x = Math.random() * (window.innerWidth - 250);
    const y = Math.random() * (window.innerHeight - 300);
    const rotation = Math.random() * 30 - 15; // -15 to +15 deg

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.transform = `rotate(${rotation}deg)`;
    div.style.zIndex = zIndexCounter++;

    // Image Element
    const img = document.createElement('img');
    img.src = imageSrc;

    // Editable Caption
    const caption = document.createElement('div');
    caption.classList.add('caption');
    caption.contentEditable = true; 
    caption.spellcheck = false;     

    div.appendChild(img);
    div.appendChild(caption);
    board.appendChild(div);

    makeDraggable(div);
    addDeleteListener(div, 'caption');
}

// --- 4. Function: Create Sticky Note ---
function createStickyNote() {
    const div = document.createElement('div');
    div.classList.add('sticky-note');

    // Random Position & Rotation
    const x = Math.random() * (window.innerWidth - 250);
    const y = Math.random() * (window.innerHeight - 300);
    const rotation = Math.random() * 10 - 5; // Slight tilt

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.transform = `rotate(${rotation}deg)`;
    div.style.zIndex = zIndexCounter++;

    // Text Area inside Note
    const noteText = document.createElement('div');
    noteText.classList.add('note-text');
    noteText.contentEditable = true;
    noteText.spellcheck = false;

    div.appendChild(noteText);
    board.appendChild(div);

    makeDraggable(div);
    addDeleteListener(div, 'note-text');
}

// --- 5. Shared Drag Logic ---
function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    element.addEventListener('mousedown', (e) => {
        // CRITICAL: Stop drag if user clicks inside a text box (caption or note)
        // This allows them to highlight/type text without moving the element
        if (e.target.classList.contains('caption') || e.target.classList.contains('note-text')) return;

        isDragging = true;
        
        // Bring to front
        element.style.zIndex = zIndexCounter++;

        startX = e.clientX;
        startY = e.clientY;
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        
        // Disable transition for instant follow
        element.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        element.style.left = `${initialLeft + dx}px`;
        element.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            // Restore smooth transition
            element.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        }
    });
}

// --- 6. Helper: Double Click to Delete ---
function addDeleteListener(element, ignoreClass) {
    element.addEventListener('dblclick', (e) => {
        // Don't delete if double clicking inside text area
        if(e.target.classList.contains(ignoreClass)) return; 
        
        // Shrink animation then remove
        element.style.transform = 'scale(0)';
        setTimeout(() => element.remove(), 200);
    });
}

// --- 7. Save Screenshot Logic ---
saveBtn.addEventListener('click', () => {
    // Temporarily hide controls so they aren't in the picture
    controlBar.style.display = 'none';

    html2canvas(board, {
        backgroundColor: null, // Preserve gradient
        scale: 2, // High resolution
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my-mood-board.png';
        link.href = canvas.toDataURL();
        link.click();

        // Show controls again
        controlBar.style.display = 'flex';
    });
});

// --- 8. Theme & Audio Logic ---
nightAudio.volume = 0.4; // Initial volume

themeBtn.addEventListener('click', () => {
    const body = document.body;
    
    if (body.getAttribute('data-theme') === 'dark') {
        // Switch to Light
        body.removeAttribute('data-theme');
        themeBtn.textContent = '🌙'; 
        fadeOutAudio(nightAudio);
    } else {
        // Switch to Dark
        body.setAttribute('data-theme', 'dark');
        themeBtn.textContent = '☀️'; 
        
        // Try to play audio (catch user interaction errors)
        nightAudio.play().catch(e => console.log("Audio needed user interaction first", e));
        fadeInAudio(nightAudio);
    }
});

// Audio Faders
function fadeInAudio(audio) {
    audio.volume = 0;
    const fade = setInterval(() => {
        if (audio.volume < 0.4) {
            audio.volume += 0.05;
        } else {
            clearInterval(fade);
        }
    }, 200);
}

function fadeOutAudio(audio) {
    const fade = setInterval(() => {
        if (audio.volume > 0.05) {
            audio.volume -= 0.05;
        } else {
            audio.pause();
            audio.currentTime = 0;
            clearInterval(fade);
        }
    }, 200);
}