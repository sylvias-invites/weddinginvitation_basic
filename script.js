const canvas = document.getElementById("scratch-canvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".heart-container");
const instruction = document.getElementById("instruction");
const nextBtn = document.getElementById("next-btn");

// Zabránění nechtěnému označování nebo přetahování plátna
canvas.addEventListener('dragstart', (e) => e.preventDefault());
canvas.addEventListener('selectstart', (e) => e.preventDefault());

let scratching = false;

// 1. Načtení obrázku srdíčka
const heartImg = new Image();
heartImg.src = "heart.png";

// 2. Inicializace až po načtení obrázku
heartImg.onload = () => {
    initCanvas();
};

// Pokud se obrázek nenačte (např. špatný název nebo cesta), použije se zlaté srdce
heartImg.onerror = () => {
    console.error("Obrázek heart.png se nepodařilo načíst! Používám záložní barvu.");
    initCanvas();
};

function initCanvas() {
    const w = container ? (container.offsetWidth || 280) : 280;
    const h = container ? (container.offsetHeight || 250) : 250;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.scale(dpr, dpr);

    // Vykreslíme růžové srdíčko přímo jako stírací vrstvu
    if (heartImg.complete && heartImg.naturalWidth !== 0) {
        ctx.drawImage(heartImg, 0, 0, w, h);
    }
}

// Události pro stírání (myš i dotykové displeje)
["mousedown", "touchstart"].forEach(evt =>
    canvas.addEventListener(evt, (e) => {
        scratching = true;
        scratch(e);
    }, { passive: false })
);

["mouseup", "touchend"].forEach(evt =>
    canvas.addEventListener(evt, () => scratching = false)
);

["mousemove", "touchmove"].forEach(evt =>
    canvas.addEventListener(evt, scratch, { passive: false })
);

function scratch(e) {
    if (!scratching) return;

    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Přepnutí do režimu gumování
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2); // Velikost stíracího štětce
    ctx.fill();

    checkReveal();
}

function checkReveal() {
    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let cleared = 0;

        // Kontrola průhledných pixelů
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) cleared++;
        }

        const percentage = (cleared / (pixels.length / 4)) * 100;

        // Pokud je setřeno více než 25 %, odhalí se tlačítko dál
        if (percentage > 25) {
            revealEverything();
        }
    } catch (e) {
        // Pojistka pro případ CORS blokace při lokálním otevírání
        if (!window.backupTimer) {
            window.backupTimer = setTimeout(revealEverything, 2000);
        }
    }
}

function revealEverything() {
    // Postupné schování stírací vrstvy a instrukce
    canvas.style.transition = "opacity 0.8s ease";
    canvas.style.opacity = "0";

    if (instruction) {
        instruction.style.transition = "opacity 0.5s ease";
        instruction.style.opacity = "0";
    }

    setTimeout(() => {
        canvas.style.display = "none";
        
        // Zobrazení tlačítka pro vstup na detail pozvánky
        if (nextBtn) {
            nextBtn.classList.add("visible");
        }
    }, 800);
}

// Funkce pro otevření detailů pozvánky po kliknutí na tlačítko
function openDetails() {
    const scratchScreen = document.getElementById("scratch-screen");
    const contentScreen = document.getElementById("content-screen");

    if (scratchScreen) scratchScreen.style.display = "none";
    if (contentScreen) {
        contentScreen.classList.add("active");
    }
}
