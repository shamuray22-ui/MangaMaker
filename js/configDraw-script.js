const CanvasSizeDiv = document.getElementById('setSizeDiv');
CanvasSizeDiv.style.display = 'none';

const widthInput = document.getElementById('canvasWidth');
const heightInput = document.getElementById('canvasHeight');

const textEditorDiv = document.getElementById('textEditorDiv');
textEditorDiv.style.visibility = 'hidden';
const editText = document.getElementById('editText');
const textScale = document.getElementById('textScale');
const textPosX = document.getElementById('textX');
const textPosY = document.getElementById('textY');
const autosizeBtn = document.getElementById('autoSizeBtn');



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

function showDivText(){
    textEditorDiv.style.visibility = 'visible';
    if (!lastText){
        return;
    }
}

textPosX.addEventListener('input', function() {
    if (!lastText) return;
    
});

textPosY.addEventListener('input', function() {
    if (!lastText) return;
    
});

textScale.addEventListener('input', function() {
    if(lastText == null){
        return;
    }
    lastText.fontSize(parseInt(textScale.value));
    layer.draw();
});

editText.addEventListener('input', function() {
    if(lastText == null){
        return;
    }
    const text = editText.value;
    lastText.text(text);
    layer.draw();
});


function saveText(){
    if(lastText == null){
        return;
    }
    const text = editText.value;
    lastText.text(text);
    layer.draw();
    textEditorDiv.style.visibility = 'hidden';
    editText.value = '';
    lastText = null;


}


function cancelEdit(){
    textEditorDiv.style.visibility = 'hidden';
    undo();
    editText.value = '';

}

function toGallery(){
    let gettype = localStorage.getItem('type');
    
    if(gettype == 'manga'){
        window.location.href = "manga-screen.html?id=" + id;
    } else{
        window.location.href = "index.html";
    }
    
}


function setAutoSize(){
    if (autosizeBtn.textContent == 'AUTO') {
        autosizeBtn.textContent = 'MANUAL';
        autosize = false;
    }else if (autosizeBtn.textContent == 'MANUAL') {
        autosizeBtn.textContent = 'AUTO';
        autosize = true;
    }
    else {
        autosizeBtn.textContent = 'MANUAL';
        autosize = false;
    }

}