const displayCanvas = document.getElementById('displayCanvas');
const ctx = displayCanvas.getContext("2d");

let currentRectangle;
let paused = false;

function drawBorder(x, y) {
    if(currentRectangle) {
        if(x == currentRectangle.x && y == currentRectangle.y) return;
        ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    }
    console.log(x, y, currentRectangle);

    ctx.beginPath();
    ctx.rect(x*10, y*10, 10, 10);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'skyblue';
    ctx.stroke();
    ctx.closePath();

    currentRectangle = { x, y };
}

function updateSelectedPixel(e) {
    let canvasX = e.clientX - displayCanvas.offsetLeft;
    let canvasY = e.clientY - displayCanvas.offsetTop;

    let pixelX = Math.floor(canvasX / 10);
    let pixelY = Math.floor(canvasY / 10);

    drawBorder(pixelX, pixelY);

    document.getElementById('tester').innerText = `${pixelX}, ${pixelY}`;

}

displayCanvas.addEventListener('mousemove', e => {
    if(!paused) updateSelectedPixel(e); 

});

displayCanvas.addEventListener('click', e => {
    paused = true;
    updateSelectedPixel(e);
});