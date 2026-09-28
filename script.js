const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d");
const instruction = document.getElementById("instruction");
const container = document.querySelector(".heart-wrapper");

// Zabránění nechtěnému chování v prohlížeči (přetahování, výběr)
canvas.addEventListener('dragstart', (e) => e.preventDefault());
canvas.addEventListener('selectstart', (e) => e.preventDefault());

let scratching = false;

// 1. Deklarace obrázku
const heartImg = new Image();
heartImg.src = "srdce.png"; 

// 2. Počkáme na načtení obrázku a až pak inicializujeme plátno
heartImg.onload = () => {
    initCanvas();
};

// Pokud se obrázek nenačte, spustíme inicializaci se záložní zlatou barvou
heartImg.onerror = () => {
    console.error("Obrázek heart.png se nepodařilo načíst! Používám záložní barvu.");
    initCanvas();
};

function initCanvas() {
    // Pokud container ještě nemá rozměry, dáme záložní 300x300
    const w = container ? (container.offsetWidth || 300) : 300;
    const h = container ? (container.offsetHeight || 300) : 300;

    const dpr = window.devicePixelRatio || 1;

    // Nastavení fyzického rozlišení vs CSS rozměrů
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.scale(dpr, dpr);

    // 1. ZÁKLAD: Vyplníme zlatou barvou (působí jako podklad stírací vrstvy)
    ctx.fillStyle = "#b8860b";
    ctx.fillRect(0, 0, w, h);

    // 2. OBRÁZEK: Pokud je obrázek v pořádku načten, vykreslíme ho přes zlatou vrstvu
    if (heartImg.complete && heartImg.naturalWidth !== 0) {
        ctx.drawImage(heartImg, 0, 0, w, h);
    }

    // 3. Odhalení pozadí a textu
    const bg = document.getElementById('heart-background');
    if (bg) {
        bg.style.opacity = "1";
        bg.style.visibility = "visible";
    }

    const invite = document.querySelector('.invite-container');
    if (invite) {
        invite.classList.remove('hidden-at-start');
        invite.style.display = 'flex';
        invite.style.opacity = '1';
    }

    if (container) {
        container.classList.add('ready');
    }
}

// Události pro stírání (myš i dotyková zařízení)
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

    // Přepnutí do režimu guma (odmazávání obsahu)
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2); // Poloměr gumy (40px)
    ctx.fill();

    checkReveal();
}

function checkReveal() {
    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let cleared = 0;

        // Kontrola průhlednosti (každý 4. bajt v poli reprezentuje Alpha kanál)
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) cleared++;
        }

        const percentage = (cleared / (pixels.length / 4)) * 100;

        // Pokud je setřeno více než 20 %, odhalí se vše
        if (percentage > 20) {
            revealEverything();
        }
    } catch (e) {
        // Pokud selže getImageData (např. u CORS blokace lokálních souborů), nastavíme časovač jako pojistku
        if (!window.backupTimer) {
            window.backupTimer = setTimeout(revealEverything, 2500);
        }
    }
}

function revealEverything() {
    createConfetti();

    if (instruction) {
        instruction.style.transition = "opacity 1s ease";
        instruction.style.opacity = "0";
        setTimeout(() => { instruction.style.visibility = "hidden"; }, 1000);
    }

    canvas.style.transition = "opacity 1s ease";
    canvas.style.opacity = "0";

    setTimeout(() => {
        canvas.style.display = "none";

        const calWrapper = document.getElementById("calendar-wrapper");
        if (calWrapper) {
            calWrapper.classList.add("visible");
        }
    }, 1000);
}

function createConfetti() {
    const confContainer = document.getElementById("confetti-container");
    if (!confContainer) return;

    const colors = ["#ffffff", "#fce4ec", "#f06292", "#ffffff", "#fce4ec"];
    const shapes = ["circle", "square", "diamond"];

    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";

        confetti.style.left = "50vw";
        confetti.style.top = "50vh";

        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        confetti.style.backgroundColor = color;

        const size = Math.random() * 8 + 8 + "px";
        confetti.style.width = size;
        confetti.style.height = size;

        if (shape === "circle") {
            confetti.style.borderRadius = "50%";
        } else if (shape === "diamond") {
            confetti.style.transform = "rotate(45deg)";
        }

        confContainer.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 600 + 200;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity;
        const randomRotation = Math.random() * 1080 - 540;

        confetti.animate([
            {
                transform: `translate(-50%, -50%) scale(0) rotate(0deg)`,
                opacity: 1
            },
            {
                transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY + 250}px)) scale(1) rotate(${randomRotation}deg)`,
                opacity: 0
            }
        ], {
            duration: Math.random() * 3000 + 5000,
            easing: "cubic-bezier(0.1, 0.5, 0.2, 1)",
            fill: "forwards"
        }).onfinish = () => confetti.remove();
    }
}

function addSparklesToText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    setInterval(() => {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";

        const rect = element.getBoundingClientRect();
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;

        sparkle.style.left = (rect.left + window.scrollX + x) + "px";
        sparkle.style.top = (rect.top + window.scrollY + y) + "px";
        sparkle.style.animation = `sparkleAnim ${Math.random() * 0.5 + 0.5}s linear forwards`;

        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }, 150);
}

function startCountdown() {
    const targetDate = new Date(2026, 5, 6, 10, 0, 0).getTime();

    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff < 0) {
            clearInterval(timerInterval);
            document.querySelectorAll("#countdown, .countdown-container").forEach(el => {
                el.innerHTML = "<span style='color:#b8860b; font-size:1.2rem;'>Dnes je náš den! 💕</span>";
            });
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const d1 = document.getElementById("days");
        const h1 = document.getElementById("hours");
        const m1 = document.getElementById("minutes");
        const s1 = document.getElementById("seconds");

        if (d1) d1.innerText = d;
        if (h1) h1.innerText = h.toString().padStart(2, '0');
        if (m1) m1.innerText = m.toString().padStart(2, '0');
        if (s1) s1.innerText = s.toString().padStart(2, '0');

        const d2 = document.querySelector(".days-val");
        const h2 = document.querySelector(".hours-val");
        const m2 = document.querySelector(".minutes-val");
        const s2 = document.querySelector(".seconds-val");

        if (d2) d2.innerText = d;
        if (h2) h2.innerText = h.toString().padStart(2, '0');
        if (m2) m2.innerText = m.toString().padStart(2, '0');
        if (s2) s2.innerText = s.toString().padStart(2, '0');

    }, 1000);
}

startCountdown();
