const canvas = document.getElementById('scratch-canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let scratchedPixels = 0;

// Vykreslení stíracího srdíčka
function drawHeart() {
    ctx.fillStyle = '#dcd6cd';

    ctx.beginPath();
    ctx.moveTo(140, 230);
    ctx.bezierCurveTo(140, 230, 10, 150, 10, 75);
    ctx.bezierCurveTo(10, 25, 60, 10, 100, 45);
    ctx.bezierCurveTo(120, 65, 140, 85, 140, 85);
    ctx.bezierCurveTo(140, 85, 160, 65, 180, 45);
    ctx.bezierCurveTo(220, 10, 270, 25, 270, 75);
    ctx.bezierCurveTo(270, 150, 140, 230, 140, 230);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '16px Montserrat';
    ctx.fillText('✨', 130, 130);
}

drawHeart();

// Nastavení režimu mazání (stírání)
ctx.globalCompositeOperation = 'destination-out';

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
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
}

function checkScratchPercentage() {
    scratchedPixels++;
    if (scratchedPixels > 30) {
        document.getElementById('next-btn').classList.add('visible');
    }
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
