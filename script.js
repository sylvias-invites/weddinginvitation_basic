const canvas = document.getElementById('scratch-canvas');
const ctx = canvas.getContext('2d');
const instruction = document.getElementById('instruction');
const nextBtn = document.getElementById('next-btn');

let isDrawing = false;
let isFinished = false;

// 1. Načtení vlastní fotografie / obrázku
const heartImage = new Image();
heartImage.src = 'srdce.jpg'; // <-- název obrázku

heartImage.onload = function() {
    drawHeart();
};

// Funkce, která ořízne fotografii do tvaru srdíčka
function drawHeart() {
    ctx.save();

    // Vytvoření masky ve tvaru srdíčka
    ctx.beginPath();
    ctx.moveTo(140, 230);
    ctx.bezierCurveTo(140, 230, 10, 150, 10, 75);
    ctx.bezierCurveTo(10, 25, 60, 10, 100, 45);
    ctx.bezierCurveTo(120, 65, 140, 85, 140, 85);
    ctx.bezierCurveTo(140, 85, 160, 65, 180, 45);
    ctx.bezierCurveTo(220, 10, 270, 25, 270, 75);
    ctx.bezierCurveTo(270, 150, 140, 230, 140, 230);
    ctx.closePath();
    ctx.clip(); // Aplikuje tvar srdíčka jako masku

    // Vykreslení fotografie přes celé plátno
    ctx.drawImage(heartImage, 0, 0, canvas.width, canvas.height);
    
    ctx.restore();

    // Přepnutí do režimu gumování/stírání
    ctx.globalCompositeOperation = 'destination-out';
}



function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function scratch(e) {
    if (!isDrawing || isFinished) return;
    e.preventDefault();
    const pos = getPos(e);
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2); // Velikost štětce
    ctx.fill();

    checkScratchPercentage();
}

// Výpočet procenta setření
function checkScratchPercentage() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Procházíme alfa kanál (každý 4. bajt)
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
            transparentPixels++;
        }
    }

    // Celková plocha srdíčka je cca 35 000 px z celkových 70 000 px plátna
    const totalHeartArea = 35000; 
    const percentage = (transparentPixels / totalHeartArea) * 100;

    // Jakmile je setřeno z 50 %
    if (percentage >= 50 && !isFinished) {
        isFinished = true;
        finishScratching();
    }
}

// Akce po dosažení 50 %
function finishScratching() {
    // 1. Plynule dotřeme srdíčko (mizení plátna)
    canvas.style.opacity = '0';
    setTimeout(() => {
        canvas.style.display = 'none';
    }, 600);

    // 2. Skryjeme nápis "Setři srdíčko" a zobrazíme tlačítko
    instruction.style.opacity = '0';
    nextBtn.classList.add('visible');

    // 3. Vypustíme konfety!
    launchConfetti();
}

// Slavnostní efekt konfet
function launchConfetti() {
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ffffff', '#ffb6c1'] // Zlatá, bílá, růžová
    });
}

// Události myši a dotyku
canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
canvas.addEventListener('mousemove', scratch);
canvas.addEventListener('mouseup', () => isDrawing = false);

canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
canvas.addEventListener('touchmove', scratch);
canvas.addEventListener('touchend', () => isDrawing = false);

// Přechod na vnitřní stránku
function openDetails() {
    document.getElementById('scratch-screen').style.display = 'none';
    const contentScreen = document.getElementById('content-screen');
    contentScreen.classList.add('active');
}
