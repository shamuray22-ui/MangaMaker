const CanvasSizeDiv = document.getElementById('setSizeDiv');
CanvasSizeDiv.style.display = 'none';

const widthInput = document.getElementById('canvasWidth');
const heightInput = document.getElementById('canvasHeight');

function callSetSizeDiv(){
    const setSizeDiv = document.getElementById('setSizeDiv');
    if (setSizeDiv.style.display === 'none' || setSizeDiv.style.display === '') {
        setSizeDiv.style.display = 'flex';
    } else {
        setSizeDiv.style.display = 'none';
    }
}

function applyCanvasSize(){
    let newWidth = parseInt(widthInput.value);
    let newHeight = parseInt(heightInput.value);

    DRAWSIZE = {
        width: newWidth,
        height: newHeight
    };
    bgRect.width(DRAWSIZE.width);
    bgRect.height(DRAWSIZE.height);

    stage.batchDraw();
}