const CanvasSizeDiv = document.getElementById('setSizeDiv');
CanvasSizeDiv.style.visibility = 'hidden';

const widthInput = document.getElementById('canvasWidth');
const heightInput = document.getElementById('canvasHeight');

function callSetSizeDiv(){
    const setSizeDiv = document.getElementById('setSizeDiv');
    if (setSizeDiv.style.visibility === 'none'){
        setSizeDiv.style.visibility = 'visible';
    }else if (setSizeDiv.style.visibility === 'visible'){
        setSizeDiv.style.visibility = 'none';
    }else{
        setSizeDiv.style.visibility = 'visible';
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