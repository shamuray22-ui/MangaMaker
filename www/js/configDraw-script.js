//#region ELEMENT INITIALIZATION
const CanvasSizeDiv = document.getElementById('setSizeDiv');
CanvasSizeDiv.style.display = 'none';

const widthInput = document.getElementById('canvasWidth');
const heightInput = document.getElementById('canvasHeight');

const textEditorDiv = document.getElementById('textEditorDiv');
textEditorDiv.style.visibility = 'hidden';
const editText = document.getElementById('editText');
const textScale = document.getElementById('textScale');
const autosizeBtn = document.getElementById('autoSizeBtn');
const selectBrushDiv = document.getElementById('selectBrushDiv');
selectBrushDiv.style.display = 'none';

const toolsdiv = document.getElementById('toolsdiv');
toolsdiv.style.display = 'none';

const layerListDiv = document.getElementById('layerListDiv');
layerListDiv.style.display = 'none';
//#endregion

//#region CANVAS CONFIGURATION
function callSetSizeDiv() {
    const setSizeDiv = document.getElementById('setSizeDiv');
    if (setSizeDiv.style.display === 'none' || setSizeDiv.style.display === '') {
        setSizeDiv.style.display = 'flex';
    } else {
        setSizeDiv.style.display = 'none';
    }
}

function applyCanvasSize() {
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
//#endregion

//#region TEXT EDITOR
function showDivText() {
    textEditorDiv.style.visibility = 'visible';
    if (!lastText) {
        return;
    }
}


textScale.addEventListener('input', function () {
    if (lastText == null) {
        return;
    }
    lastText.fontSize(parseInt(textScale.value));
    layer.draw();
});

editText.addEventListener('input', function () {
    if (lastText == null) {
        return;
    }
    const text = editText.value;
    lastText.text(text);
    layer.draw();
});


function saveText() {
    if (lastText == null) {
        return;
    }
    const text = editText.value;
    lastText.text(text);
    layer.draw();
    textEditorDiv.style.visibility = 'hidden';
    editText.value = '';
    lastText = null;


}

function cancelEdit() {
    textEditorDiv.style.visibility = 'hidden';
    undo();
    editText.value = '';

}
//#endregion

//#region UI TOGGLES
function toggleToolsDiv() {
    if (toolsdiv.style.display === 'none') {
        toolsdiv.style.display = 'grid';
    } else if (toolsdiv.style.display === 'grid') {
        toolsdiv.style.display = 'none';
    }
    else {
        toolsdiv.style.display = 'none';
    }
}


function showSelectBrushDiv() {
    if (selectBrushDiv.style.display === 'none') {
        selectBrushDiv.style.display = 'flex';
    } else if (selectBrushDiv.style.display === 'flex') {
        selectBrushDiv.style.display = 'none';
    }
    else {
        selectBrushDiv.style.display = 'none';
    }
}
//#endregion

//#region TOOL CONFIGURATION
function setAutoSize() {
    if (autosizeBtn.textContent == 'AUTO') {
        autosizeBtn.textContent = 'MANUAL';
        autosize = false;
    } else if (autosizeBtn.textContent == 'MANUAL') {
        autosizeBtn.textContent = 'AUTO';
        autosize = true;
    }
    else {
        autosizeBtn.textContent = 'MANUAL';
        autosize = false;
    }

}
//#endregion

//#region NAVIGATION
function toGallery() {
    if (!isSaved) {
        let quest = window.confirm('Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?');
        if (quest){
            window.location.href = "index.html";
        }
        else{
            return;
        }
    }
    let gettype = localStorage.getItem('type');

    if (gettype == 'manga') {
        window.location.href = "manga-screen.html?id=" + id;
    } else {
        window.location.href = "index.html";
    }

}
/// showLayerListDiv

function showLayerListDiv() {
    layerListDiv.classList.remove('enter');
    if (layerListDiv.style.display === 'none') {
        layerListDiv.style.display = 'flex';
        layerListDiv.classList.add('enter');

    } else if (layerListDiv.style.display === 'flex') {
        layerListDiv.style.display = 'none';
    }


}

const referenceInput = document.getElementById('referenceInput');

referenceInput.addEventListener('change', function(e) {
    const arquivo = e.target.files[0];
    
    addLayer(arquivo)
});


//#endregion

//#region reset rot
function resetRot() {
    stage.rotation(0);
    stage.batchDraw();
}


const definitionsscreen = document.getElementById('definitionsscreen');
const strongSimply = document.getElementById('strongSimply');
definitionsscreen.style.display = 'none';
simplifyStrenght = strongSimply.value;
strongSimply.addEventListener('change',function(){
    simplifyStrenght = strongSimply.value;
})
function calldefinitions(){
    if (definitionsscreen.style.display === 'none') {
        definitionsscreen.style.display = 'flex';

    } else if (definitionsscreen.style.display === 'flex') {
        definitionsscreen.style.display = 'none';
    }
}