//////////////
////////// talve ainda não ficou perceptvel que erros de digitção e gramatica são comuns por aqui.
////////////////////////


let DRAWSIZE = {
    width: 600,
    height: 800
}
let isSaved = true;

const MAXLAYER = 10;
const getwidthInput = document.getElementById('canvasWidth');
const getheightInput = document.getElementById('canvasHeight');
const layerGrid = document.getElementById('layerGrid');
    
let Gettype = localStorage.getItem('type');

const drawContainer = document.getElementById('draw-canvas');
const pagesDiv = document.getElementById('pagesDiv');


const stage = new Konva.Stage({
    container: 'draw-canvas',   // id of container <div>
    width: drawContainer.offsetWidth,
    height: drawContainer.offsetHeight
});

stage.container().style.background = '#868686ff';
const bgLayer = new Konva.Layer({ listening: false });

const bgRect = new Konva.Rect({
    height: DRAWSIZE.height,
    width: DRAWSIZE.width,
    fill: '#ffff',
    cornerRadius: 3,
});

//////// agora a gente pega as paginas
const pages = {

};
function removebg(){
    bgRect.fill(null);
    bgRect.stroke('stroke');
}


let forgeratePageButton = null;
let pagenumbers = -1;
let drawlist;
let foundDraw;
let mangaList;
const search = new URLSearchParams(window.location.search);
const id = search.get('id');
const chapID = search.get('chapID');

let getManga;
async function startSavedData(){
    drawlist = await getDrawList();
    console.log(drawlist);
    mangaList = await getMangasList();
    getManga = mangaList ? mangaList.find(manga => manga.id === Number(id)) : null;
    foundDraw = drawlist ? drawlist.find(draw => draw.id === Number(id)) : null;
    console.log(foundDraw);
}


//#region StartBrush
let currentBrush = null;
let brushpath = null;
let scaleTexture = 1;
// Cache de brushes - array de objetos {path, canvas}
const brushCache = [];


//#region updateLayerList
let currentpage = 0;

let layerList = [];
let currentlayer = 0;

function updateLayerList() {
    if (!pages['page' + currentpage]) return;
    layerList = [];
    layerList = pages['page' + currentpage].layers; 
}


function StartBrush(path, color) {
    brushpath = path;
    // Procura se já existe um canvas para esse path
    return new Promise((resolve) => {
        const cached = brushCache.find(item => item.path === path);
        if (cached) {
            // Reutiliza o canvas existente
            currentBrush = cached.canvas;
            resolve(currentBrush);
            return;
        }

        // Se não existe, cria um novo
        const tempCanvas = document.createElement('canvas');

        const tempCtx = tempCanvas.getContext('2d');
        const myImageObj = new Image();
        myImageObj.src = path;

        myImageObj.onload = () => {
            tempCanvas.width = myImageObj.width;
            tempCanvas.height = myImageObj.height;
            tempCtx.drawImage(myImageObj, 0, 0, myImageObj.width * scaleTexture, myImageObj.height * scaleTexture);
            tempCtx.fillStyle = color;
            tempCtx.globalCompositeOperation = 'source-in';
            tempCtx.fillRect(0, 0, myImageObj.width, myImageObj.height);
            tempCtx.globalCompositeOperation = 'source-over';
            // Salva no cache e define como brush atual
            brushCache.push({ path: path, canvas: tempCanvas });
            currentBrush = tempCanvas;
            resolve(currentBrush);
        };
    });
}

//#region STARTYPE

function StartInitWithType(layer, bgLayer) {
    //#region modo manga
    if (Gettype === 'manga') {

        getManga.chapters.forEach((page) => {
            if (chapID == page.number) {
                forgeratePageButton = page.pagesCount;
            }

        });
        for (let i = 0; i < forgeratePageButton; i++) {
            pagenumbers += 1;
            /////////// o trabalho do i é enemurar as paginas não as layers
            pages['page' + i] = {
                background: null,
                PageURL: null,
                layers: [
                ]
            }
            const hasDrawInPage = getManga.chapters.find(chap => chap.number == chapID).pages[i] || null;
            let lengthArr = -1;
            if (hasDrawInPage != null){
                hasDrawInPage.layers.forEach(layer =>{
                    pages['page' + i].layers.push({draw:Konva.Node.create(layer.draw)});
                    pages['page' + i].background = null;
                    pages['page' + i].PageURL = null;
                    lengthArr += 1;
                    console.log(pages['page' + i].layers);
                    
                    pages['page' + i].layers[lengthArr].draw.children.forEach(child => {
                        if (child.attrs.customClassName === 'ShapeLine') {
                            StartBrush(child.attrs.texturepath).then(response => {
                                currentBrush = response
                                child.setAttr('customTexture', currentBrush);

                                child.sceneFunc(function (ctx) {
                                    strokenize(ctx,child);
                                });
                                cacherize(child);

                                
                            });
                        }
                    });
                    pages['page' + i].layers[lengthArr].draw.clipFunc(function (ctx) {
                            ctx.beginPath();
                            ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
                            ctx.closePath();
                            ctx.clip();
                    });
                });

            }
            else{
                pages['page' + i].layers.push({draw:new Konva.Group({})});
                pages['page' + i].background = null;
                pages['page' + i].layers[0].draw.clipFunc(function (ctx) {
                        ctx.beginPath();
                        ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
                        ctx.closePath();
                        ctx.clip();
                });
            }
            
            pages['page' + i].background = new Konva.Group({
            });

            ////////// adiciona os grupos a page atual
            let bgclone = bgRect.clone();
            
            pages['page' + i].background.add(bgclone); // Adicione o novo retângulo ao grupo
            /////////// talvez eu use muito for e foreach desnecessariamente
            let groupBgRect = pages['page' + i].background;
            pages['page' + i].layers.forEach(layercell =>{
                layercell.draw.hide();
                
                layer.add(layercell.draw);
                
                
            });
            
            bgLayer.add(groupBgRect);

            groupBgRect.hide();

            currentpage = i;
            updateLayerList()
            ////////// criando a UX 😎😎😎😎
            const buttonPage = document.createElement('button');
            buttonPage.className = 'Generalbutton';
            buttonPage.textContent = i + 1;
            buttonPage.style.margin = '2px';

            buttonPage.onclick = () => {
                set_current_page(i);
            };
            pagesDiv.appendChild(buttonPage);
        }
        
    }
    //#region modo draw
    else if (Gettype === 'draw') {
        pages['page' + currentpage] = {
            background: null,
            layers: [

            ]

        }
        console.log('antes > ', foundDraw);
        
        if (foundDraw && foundDraw.layers[0] != null) {

            for (let i = 0; i < foundDraw.layers.length; i++) {
                if (foundDraw.layers[i].draw == null) {
                    foundDraw.layers.slice(i, 1);
                    //pages['page' + currentpage].layers.slice(i, 1); // reseta as layers

                }
                let layer = foundDraw.layers[i];
                pages['page' + currentpage].layers.push({ draw: null });
                pages['page' + currentpage].layers[i].draw = Konva.Node.create(layer);


                pages['page' + currentpage].layers[i].draw.children.forEach(child => {

                    if (child.attrs.customClassName === 'ShapeLine'){
                        StartBrush(child.attrs.texturepath).then(response => {
                            currentBrush = response
                            child.setAttr('customTexture', currentBrush);
                            
                            child.sceneFunc(function (ctx) {
                                strokenize(ctx,child);
                                
                            });
                            cacherize(child)
                        });
                    }

                });
            }

            DRAWSIZE.width = foundDraw.DRAWSIZE.width;
            DRAWSIZE.height = foundDraw.DRAWSIZE.height
            bgRect.width(DRAWSIZE.width);
            bgRect.height(DRAWSIZE.height);
            /// atualizando os numeros de resize da UX
            getwidthInput.value = DRAWSIZE.width;
            getheightInput.value = DRAWSIZE.height;
            for (let i = 0; i < pages['page' + currentpage].layers.length; i++) {
                pages['page' + currentpage].layers[i].draw.clipFunc(function (ctx) {
                    ctx.beginPath();
                    ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
                    ctx.closePath();
                    ctx.clip();
                });
                ////////////// pegando as linhas salvas e recriando
                if (pages['page' + currentpage].layers[i].draw.children.length < 1) {
                    StartBrush('assets/brush/default.png', '#000');
                }
            }



        }
        else {
            StartBrush('assets/brush/default.png', '#000');
            pages['page' + currentpage].layers.push({ draw: null,hasimage:null });

            pages['page' + currentpage].layers[0].draw = new Konva.Group({
                clipFunc: function (ctx) {
                    ctx.beginPath(); // Inicia um novo caminho
                    ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
                    ctx.closePath(); // Fecha o caminho
                    ctx.clip(); // Aplica o recorte
                }
            });



        }


        // Um novo bgRect para o grupo de bg rect
        pages['page' + currentpage].background = new Konva.Group({
        });

        ////////// adiciona os grupos a page atual
        pages['page' + currentpage].background.add(bgRect); // Adicione o novo retângulo ao grupo

        let groupBgRect = pages['page' + currentpage].background;
        bgLayer.add(groupBgRect);
        for (let i = 0; i < pages['page' + currentpage].layers.length; i++) {
            let group = pages['page' + currentpage].layers[i].draw;

            layer.add(group);

            updateLayerList();

        }

    }
}
let startlayer = new Konva.Layer();
let realayers = [];
realayers.push(startlayer);
currentlayer = realayers[0];
let layer = currentlayer;


stage.add(bgLayer);
stage.add(layer);

let group;

let trans = null;

function updateLayerUI() {
    layerGrid.innerHTML = ''; // Limpa a grid
    for (let i = 0; i < layerList.length; i++) {
        currentlayer = i; // Define o índice atual
        createUXlayer(); // Recria cada elemento
    }
}

async function RealBoot100PocentoAtulizadoVersao2025melhorCodigoCustoBeneficionJaFeito(layer, bgLayer){
    
    await startSavedData();
    await StartBrush('assets/brush/default.png', '#000');
    StartInitWithType(layer, bgLayer);

    group = pages['page' + currentpage].layers[0].draw;
    set_current_page(0);
    updateLayerList();
    trans = new Konva.Transformer();
    group.add(trans);
    updateLayerUI();

}


//#region BOOT
withLoadScreen(async () => {
    await RealBoot100PocentoAtulizadoVersao2025melhorCodigoCustoBeneficionJaFeito(layer, bgLayer);
});

//#region  VARIAVEIS
let isDrawing = false;
let TexturedLine;
let LineEraser;

let simplifyStrenght = 2;
let autosize = true;
let autoSizeSensi = 3;

let current_tool = 'pen';

let composite = 'source-over';

let undoHistory = [];
let redoHistory = [];

let startpos = { x: 0, y: 0 };
let dragpos = null;

let lastRect = null;
let lastCicle = null;
let lastSelectBox = null;
let lastLineTool = null;
let lastText = null;

// ===== VARIÁVEIS PARA O SISTEMA DE SELEÇÃO =====
// Array que armazena todos os nós (elementos) atualmente selecionados
let selectedNodes = [];
// Transformer que permite manipular múltiplos nós selecionados simultaneamente
let selectionTransformer = null;
// Cores para destacar os nós selecionados
const SELECTION_STROKE_COLOR = '#00AAFF';
const SELECTION_STROKE_WIDTH = 2;

let draggingText = false;
let endline = 0;

let posing = false;

const opacityPicker = document.getElementById('opacityPicker');
const colorPicker = document.getElementById('colorPicker');
const colorPickerPanel = document.getElementById('pickerContainer');
colorPickerPanel.style.display = 'none'
const colorPickerLib = new iro.ColorPicker("#pickerContainer", {
    width: 132,
    color: "#000000ff", // Puxa o valor inicial do seu input antigo
    layout: [
        { component: iro.ui.Wheel },
        { component: iro.ui.Slider, options: { sliderType: 'value' } }
    ]
});

colorPickerLib.on('color:change',(e) =>{
    colorPicker.style.background = e.hexString;
});

colorPicker.addEventListener('click',() =>{
    if (colorPickerPanel.style.display == 'flex'){
        colorPickerPanel.style.display = 'none'
    }else{
        colorPickerPanel.style.display = 'flex'
    }
})
colorPickerPanel.addEventListener("mouseleave",() =>{
    colorPickerPanel.style.display = 'none'
})
let colopickpanelSize = {
    width: colorPickerPanel.style.width,
    height: colorPickerPanel.style.height
};

function getGlobalMousePos() {
    const mousePos = stage.getPointerPosition();
    const scale = stage.scaleX(); // assumindo escala uniforme
    const rotation = stage.rotation() * Math.PI / 180; // converte pra radianos
    const pos = stage.position();

    // coordenadas relativas ao stage
    const x = (mousePos.x - pos.x) / scale;
    const y = (mousePos.y - pos.y) / scale;

    // aplica rotação inversa
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);

    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

//#region SET CURRENT TOOL
function set_current_tool(tool) {
    // Lista de ferramentas válidas
    const validTools = ['pen', 'eraser', 'line', 'rectangle', 'circle', 'select', 'text','transform'];
    if (validTools.includes(tool)) {
        current_tool = tool;
        // Ajusta o modo de composição para a borracha
        if (tool === 'eraser') {
            composite = 'destination-out';

        } else {
            composite = 'source-over';
        }
    }
}

//#region SET CURRENT PAGE
function set_current_page(index) {
    
    currentlayer = 0;
    currentpage = index;
    
    for (let i = 0; i < pagesDiv.children.length - 1; i++) {
        //////// escodende geral antes de mostrar a page selecionada
        
        if (pages['page' + i].background){
            pages['page' + i].background.hide();
        }
        pages['page' + i].layers.forEach(layer => {
            layer.draw.hide();
            
        });
    }
    if (pages['page' + currentpage].background){
        pages['page' + currentpage].background.show();
    }
    pages['page' + currentpage].layers.forEach(layer => {
        layer.draw.show();
        group = layer.draw;
    });
    stage.batchDraw();
    updateLayerList();
    layerGrid.innerHTML = '';
    for(let w = 0; w < realayers.length - 1; w++){
        realayers[w].hide();
    }
    for (let i = 0; i < layerList.length - 1; i++) {
        currentlayer = i;
        createUXlayer();
        console.log(realayers);
        
        realayers[i].show();

    }
}

//#region ADD LAYER
function createUXlayer() {
    
    const layerCell = document.createElement('div');
    layerCell.id = 'layerCell'; // usa class, id é pra ser único
    // label
    const ratio = document.createElement('input');
    ratio.type = 'radio';
    ratio.value = (currentlayer);
    
    ratio.name = 'layers';
    const label = document.createElement('label');
    
    label.textContent = currentlayer;

    // preview
    const preview = document.createElement('img');
    preview.src = 'assets/drawing.png';
    preview.id = 'previewLayer';
    const rangevis = document.createElement('input');
    rangevis.value = 100;
    rangevis.type = 'range';

    // função pra criar botão com ícone e alt
    const makeButton = (icon, alt) => {
        const btn = document.createElement('button');
        btn.className = 'Generalbutton';
        const img = document.createElement('img');
        img.src = `assets/icons/${icon}.png`;
        img.alt = alt;
        btn.appendChild(img);
        return btn;
    };

    // cria os botões
    const hide = makeButton('hidden', 'Esconder');
    const del = makeButton('clear', 'Deletar');
    // joga tudo no layerCell
    layerCell.appendChild(label);
    layerCell.appendChild(ratio);
    layerCell.appendChild(preview);
    layerCell.appendChild(rangevis);
    layerCell.appendChild(hide);
    layerCell.appendChild(del);

    layerGrid.appendChild(layerCell);
    
    layerCell.addEventListener('click', (event) => {
        ratio.checked = true;
        const num = Number(ratio.value);
        group = pages['page' + currentpage].layers[num].draw;
        console.log('pressionado o radio da layer ',num);
        
        checkimage(num);
        ratio.dispatchEvent(new Event('change'));
        console.log('Arrisco a dizer que clicou na layer ', currentlayer);
        
    });
    layerCell.click();

    hide.onclick = () => {
        if (group.attrs.visible){
            group.hide();
        }
        else{
            group.show();
        }
        
    }

    rangevis.addEventListener('change', (p) => {
        group.opacity(p.target.value / 100);
    });

    del.onclick = () => {
        if (label.textContent === '0' || ratio.checked === false) {
            return;
        }

        pages['page' + currentpage].layers[currentlayer].draw.remove();
        layerList.splice(currentlayer,1);
        updateLayerList();
        if (currentlayer >= layerList.length) {
            currentlayer = layerList.length - 1; // Garante índice válido
        }
        if (layerList.length > 0) {
            group = pages['page' + currentpage].layers[currentlayer].draw;
        }
        updateLayerUI();
    }

}
//#region CHECK IMAGE
let imgReference = null;
let LastimgReferenceOnLastLayer = null;
function checkimage(number){
    console.log('rapaiz o negoço começou e tava desse jeito aqui, se vira ai pra descobrir > ',imgReference);

    console.log(LastimgReferenceOnLastLayer);
    
    if (pages['page' + currentpage].layers[number].hasimage != null){
        imgReference = pages['page' + currentpage].layers[number].hasimage;
        LastimgReferenceOnLastLayer = imgReference;
    }else{
        imgReference = null;
    }
    console.log('img reference', 'local >>',);
    
    if(imgReference != null){
        LastimgReferenceOnLastLayer.draggable(true)
        trans.nodes([LastimgReferenceOnLastLayer]);
        set_current_tool('transform');
    }else{
        console.log('no has porra nenhuma!');
        set_current_tool('pen');
        LastimgReferenceOnLastLayer.draggable(false);
        LastimgReferenceOnLastLayer = null;

        trans.nodes([]);
    }
    

}
function addLayer(imagedata = '') {
    if (layerList.length > MAXLAYER){
        return;
    }
    trans.nodes([]);

    let newRealLayer = new Konva.Layer();
    const newLayer = new Konva.Group();
    set_current_tool('pen')
    newLayer.clipFunc(function (ctx) {
        ctx.beginPath();
        ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
        ctx.closePath();
        ctx.clip();

    });
    
    if (imagedata != ''){
        const url = URL.createObjectURL(imagedata);

        const img = new Image();
        img.src = url;
        img.onload = function() {
            let konvaImage = new Konva.Image({
                x: 50,
                y: 50,
                image: img,
                width: 200,
                height: 200,
                draggable: false
            });
            set_current_tool('transform')
            newLayer.add(konvaImage);
            
            pages['page' + currentpage].layers.push({ draw: newLayer, hasimage:konvaImage});
            newRealLayer.add(newLayer);
            stage.add(newRealLayer);
            realayers.push(newRealLayer);
            group = pages['page' + currentpage].layers[currentlayer].draw;
            updateLayerList();
            updateLayerUI();
        }

    } else{
        pages['page' + currentpage].layers.push({ draw: newLayer, hasimage:null});
        newRealLayer.add(newLayer);
        stage.add(newRealLayer);
        realayers.push(newRealLayer);
        group = pages['page' + currentpage].layers[currentlayer].draw;
        updateLayerList();
        createUXlayer();
        updateLayerUI();
    }
}


//#region ZOOM
stage.container().addEventListener('wheel', function (e) {
    e.preventDefault();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    // Fator de zoom
    const scaleBy = 1.1;
    let newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limita o zoom entre 0.1 e 60
    newScale = Math.max(0.1, Math.min(21, newScale));

    // Posição do ponteiro relativa ao stage antes do zoom
    const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
    };

    // Atualiza o scale
    stage.scale({ x: newScale, y: newScale });

    // Calcula nova posição do stage para manter o ponteiro fixo
    const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);

    stage.batchDraw();

}, { passive: false });

//#region TOUCHZOOM
let lastDist = 0;
let lastMidPoint = null;
let lastAngle = 0;

stage.container().addEventListener('touchmove', function (e) {
    if (e.touches.length === 2) {
        isDrawing = false;
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const dist = Math.hypot(dx, dy);
        const midPoint = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
        const angle = Math.atan2(dy, dx);
        if (!lastDist) {
            lastDist = dist;
            lastMidPoint = midPoint;
            lastAngle = angle;
            return;
        }
        const oldScale = stage.scaleX();
        const scaleBy = dist / lastDist;
        const newScale = Math.max(0.1, Math.min(60, oldScale * scaleBy));
        const angleDiff = angle - lastAngle;
        const newRotation = stage.rotation() + (angleDiff * 180 / Math.PI);
        
        // movimento do ponto médio (pan)
        const dxMid = midPoint.x - lastMidPoint.x;
        const dyMid = midPoint.y - lastMidPoint.y;
        
        // CORREÇÃO: Calcula o ponto no espaço do stage ANTES das transformações
        const stagePoint = {
            x: (midPoint.x - stage.x()) / oldScale,
            y: (midPoint.y - stage.y()) / oldScale
        };
        
        // CORREÇÃO 1: Rotação do ponto de referência usando radianos (consistente com angleDiff)
        const rotatedPoint = {
            x: stagePoint.x * Math.cos(angleDiff) - stagePoint.y * Math.sin(angleDiff),
            y: stagePoint.x * Math.sin(angleDiff) + stagePoint.y * Math.cos(angleDiff)
        };
        
        // CORREÇÃO 2: Rotaciona também o vetor de pan para acompanhar a rotação do stage
        const panRotated = {
            x: dxMid * Math.cos(angleDiff) - dyMid * Math.sin(angleDiff),
            y: dxMid * Math.sin(angleDiff) + dyMid * Math.cos(angleDiff)
        };
        
        // CORREÇÃO 3: Aplica todas as transformações de uma vez, na ordem correta
        stage.scale({ x: newScale, y: newScale });
        stage.rotation(newRotation);
        stage.position({
            x: midPoint.x - rotatedPoint.x * newScale + panRotated.x,
            y: midPoint.y - rotatedPoint.y * newScale + panRotated.y
        });
        stage.batchDraw();
        
        lastDist = dist;
        lastMidPoint = midPoint;
        lastAngle = angle;
    }
}, { passive: false });
//#endregion

window.addEventListener('resize', () => {
    if (drawContainer) {
        stage.width(drawContainer.offsetWidth);
        stage.height(drawContainer.offsetHeight);
        stage.batchDraw();
    }
});
//#region START TOUCH OR MOUSE
let touchTimer = null;
stage.on('touchstart', function(e){
    e.evt.preventDefault();
    if (e.target.className === 'Text') {
        return; // só deixa o Konva lidar com o drag
    }
    // Verifica se é um evento de toque e se há mais de um dedo na tela
    if (e.evt.touches && e.evt.touches.length > 1) {
        isDrawing = false; // Reseta o flag de desenho para zoom
        lastDist = 0; // Reseta também a distância do zoom anterior
        lastMidPoint = null;
        
        return; // Não inicia o desenho se for um gesto de múltiplos toques (como pinch-to-zoom)
    }
    isDrawing = false;

    touchTimer = setTimeout(() => {
        // se ainda for 1 dedo depois do delay, aí sim desenha
        if (e.evt.touches && e.evt.touches.length === 1) {
            isDrawing = true;
        }
    }, 40); // 30–50ms já resolve
    
    firstStartTools()
});
stage.on('mousedown', function (e) {
    e.evt.preventDefault();
    if (e.target.className === 'Text') {
        return; // só deixa o Konva lidar com o drag
    }
    isDrawing = true;
    firstStartTools()
});
//#region FIRST START TOOLS
function firstStartTools(e){
    const pos = getGlobalMousePos();
    startpos = pos;
    if (current_tool == 'pen') {
        isSaved = false
        let scaletexture = autosize ? sizePicker.value / stage.scaleX() * autoSizeSensi : sizePicker.value;
        
        let color = colorPickerLib.color.hexString;
        TexturedLine = new Konva.Shape({
            strokeColor: color,
            lineWidth: scaletexture,
            globalCompositeOperation: composite,
            lineCap: 'round',
            lineJoin: 'round',
            customTexture: currentBrush,
            texturepath: brushpath,
            points: [],
            customClassName: 'ShapeLine',
            listening: false,
            pixelRatio:1,
            sceneFunc: function (ctx, shape) {
                //////////// grande misterio, de onde vem essa função e de que serve
                strokenize(ctx,shape)

            }

        });
        TexturedLine.opacity(opacityPicker.value / 100);
        if (isDrawing === true){
            TexturedLine.attrs.points.push(startpos.x, startpos.y,startpos.x,startpos.y);
        }
        
        group.add(TexturedLine);
        
        stage.batchDraw();
        
    }else if (current_tool == 'eraser'){
        // Cria o traço de borracha (LineEraser)
        let scaletexture = autosize ? sizePicker.value / stage.scaleX() * autoSizeSensi : sizePicker.value;

        LineEraser = new Konva.Line({
            stroke: '#000000', // A cor não importa, mas precisa ser opaca
            strokeWidth: scaletexture,
            globalCompositeOperation: composite, // 'destination-out'
            lineCap: 'round',
            lineJoin: 'round',
            points: [pos.x, pos.y],
            listening: false,
            customClassName: 'LineEraser',
            pixelRatio:1
        });
        
        LineEraser.opacity(opacityPicker.value / 100);
        group.add(LineEraser);
        stage.batchDraw();
        LineEraser.points([startpos.x, startpos.y]);
    }
    else if (current_tool == 'rectangle') {
        // iniciar com x/y no ponto de início e tamanho 0
        lastRect = new Konva.Rect({
            x: startpos.x,
            y: startpos.y,
            width: 0,
            height: 0,
            fill: '#ffff', // transparente por padrão
            stroke: 'black'
        });
        group.add(lastRect);
        // não adicionar ao undoHistory aqui — só no mouseup quando finalizar
    } else if (current_tool == 'circle') {
        lastCicle = new Konva.Ellipse({
            x: startpos.x,
            y: startpos.y,
            radiusX: 0,
            radiusY: 0,
            fill: '#ffff',
            stroke: 'black'
            
        });
        group.add(lastCicle);


    }
    else if (current_tool == 'select') {
        lastSelectBox = new Konva.Rect({
            x: startpos.x,
            y: startpos.y,
            width: 0,
            height: 0,
            fill: 'rgba(0, 0, 255, 0.5)',
            stroke: 'blue',
            dash: [4, 4],
            listening: false
        });
        dragpos = pos;
        group.add(lastSelectBox); // Adiciona ao mesmo grupo dos desenhos
        lastSelectBox.moveToTop();
    }
    else if (current_tool == 'line') {
        lastLineTool = new Konva.Line({
            stroke: colorPicker.value,
            strokeWidth: autosize ? sizePicker.value / stage.scaleX() * autoSizeSensi : sizePicker.value,
            globalCompositeOperation: composite,
            points: [startpos.x, startpos.y, startpos.x, startpos.y],
            lineCap: 'round',
            lineJoin: 'round',
            pixelRatio:1,
            listening: false
        });
        group.add(lastLineTool);
    }
    else if (current_tool == 'text' && draggingText === false) {
        lastText = new Konva.Text({
            x: startpos.x,
            y: startpos.y,
            text: 'New text',
            width: 200,
            height: 100,
            fill: colorPicker.value,
            align:'center',
            fontSize: 12,
            draggable: true
        });
        group.add(lastText);
        lastText.moveToTop();
        showDivText();

        // Adiciona os eventos de drag aqui
        lastText.on('dragstart', function () {
            console.log("oxente!");
            trans.nodes([lastText]);
            
        });
        lastText.on('dragend', function () {
            if (!trans){
                trans.nodes([]);
            }
            
        });
        
        draggingText = true;
    }
    
}
//#region strokenize
function strokenize(ctx,shape){
    ctx.beginPath();
    // Aplica a opacidade do shape ao contexto do canvas
    ctx.globalAlpha = shape.attrs.opacity;
    ctx.strokeStyle = shape.attrs.strokeColor;
    ctx.lineWidth = shape.attrs.lineWidth;
    ctx.lineCap = shape.attrs.lineCap;
    ctx.lineJoin = shape.attrs.lineJoin;
    ctx.globalCompositeOperation = shape.attrs.globalCompositeOperation;
    let brushct = shape.attrs.customTexture.getContext('2d');

    brushct.globalCompositeOperation = 'source-in';
    brushct.fillStyle = shape.attrs.strokeColor;
    brushct.fillRect(0, 0, shape.attrs.customTexture.width, shape.attrs.customTexture.height);
    brushct.globalCompositeOperation = 'source-over';

    const points = shape.attrs.points;

    if (points.length >= 2) { // precisa de pelo menos x,y
        //ctx.moveTo(points[0], points[1]); // primeiro ponto
        for (let i = 2; i < points.length; i += 2) { // pula de 2 em 2
            coisanoTextura(points,i,ctx);
            ///ctx.lineTo(points[i], points[i + 1]);

        }
    }

    //ctx.fillStrokeShape(shape);
    ctx.stroke();
}
//#region coisanoTextura
const SpacingRange = document.getElementById('SpacingRange'); // Assume-se que esta variável existe e funciona
function coisanoTextura(points, i, ctx) {
    const baseTextureScale = ctx.lineWidth;

    // 1. Obter os pontos e calcular a distância (velocidade)
    let x = points[i - 2];
    let y = points[i - 1];
    let x1 = points[i];
    let y1 = points[i + 1];

    let hyp1 = x1 - x;
    let hyp2 = y1 - y;
    let result = Math.sqrt(hyp1 * hyp1 + hyp2 * hyp2);

    if (result === 0) {
        ctx.drawImage(currentBrush,
            points[i] - baseTextureScale / 2,
            points[i + 1] - baseTextureScale / 2,
            baseTextureScale, baseTextureScale
        );
        return;
    }

    // --- LÓGICA DE PRESSÃO FALSA (FAKE PRESSURE) ---
    const MAX_VELOCITY_FOR_PRESSURE = 20; 
    const MIN_SCALE_FACTOR = 0.5; 
    
    let speedNormalized = Math.min(result, MAX_VELOCITY_FOR_PRESSURE) / MAX_VELOCITY_FOR_PRESSURE;
    let fakePressure = 1 - speedNormalized;
    
    // Calcula o fator de escala (entre MIN_SCALE_FACTOR e 1)
    let pressureFactor = MIN_SCALE_FACTOR + (1 - MIN_SCALE_FACTOR) * fakePressure;
    
    // O tamanho da textura é ajustado pela pressão
    const textureScale = baseTextureScale * pressureFactor;
    // --- FIM DA LÓGICA DE PRESSÃO FALSA ---

    // 3. Desenhar o ponto de destino (com a nova escala)
    ctx.drawImage(currentBrush,
        points[i] - textureScale / 2,
        points[i + 1] - textureScale / 2,
        textureScale, textureScale
    );

    // 4. Calcular e desenhar os passos intermediários (interpolação)
    
    let space = textureScale * Number(SpacingRange?.value); 
    let step = space; 

    let steps = Math.floor(result / step);
    steps = Math.min(steps, 30);
    
    for (let st = 0; st <= steps; st++) {
        let initInter = x + (hyp1 * st / steps);
        let endInter = y + (hyp2 * st / steps);

        // Desenhar carimbo intermediário com a 'textureScale' calculada
        ctx.drawImage(currentBrush,
            initInter - textureScale / 2,
            endInter - textureScale / 2,
            textureScale, textureScale
        );
    }
}

//#region MOUSE TOUCH MOVE AGAIN
let some = null
let strongStabilizador = document.getElementById('strongStabilizador');

stage.on('mousemove touchmove', function (e) {
    e.evt.preventDefault();
    if (e.evt.touches && e.evt.touches.length > 1){
        return;
    }
    
    if (!isDrawing) {
        return;
    }
    const pos = getGlobalMousePos();
    const x = Math.min(startpos.x, pos.x);
    const y = Math.min(startpos.y, pos.y);
    const w = Math.abs(pos.x - startpos.x);
    const h = Math.abs(pos.y - startpos.y);
    if (current_tool == 'transform'){

    }
    if (current_tool == 'pen' && TexturedLine) {
        if (!some){
            some = {x:pos.x,y:pos.y}
        }
        
        some.x += (pos.x - some.x) * (1-strongStabilizador.value);
        some.y += (pos.y - some.y) * (1-strongStabilizador.value);
        
        
        TexturedLine.attrs.points.push(some.x, some.y);
        stage.batchDraw();
    } else if (current_tool == 'eraser' && LineEraser){


        if (!some){
            some = {x:pos.x,y:pos.y}
        }
        
        some.x += (pos.x - some.x) * (1-strongStabilizador.value);
        some.y += (pos.y - some.y) * (1-strongStabilizador.value);
        
        
        LineEraser.points(LineEraser.points().concat([some.x, some.y]));
        stage.batchDraw();
    }
    else if (current_tool == 'circle' && lastCicle) {
        lastCicle.x(x);
        lastCicle.y(y);
        lastCicle.radiusX(w);
        lastCicle.radiusY(h);
    }
    else if (current_tool == 'rectangle' && lastRect) {
        // atualizar posição e tamanho dinamicamente usando pos (não pos)

        lastRect.x(x);
        lastRect.y(y);
        lastRect.width(w);
        lastRect.height(h);
        

    }
    else if (current_tool == 'select' && lastSelectBox) {

        if (posing == false) {
            lastSelectBox.x(x);
            lastSelectBox.y(y);
            lastSelectBox.width(w);
            lastSelectBox.height(h);
        }
    }
    else if (current_tool == 'line' && lastLineTool) {
        lastLineTool.points([startpos.x, startpos.y, pos.x, pos.y]);

    }
    
});

//#region MOUSE UP
stage.on('touchend', function (e) {
    onUpKillWhatNeed(e);
});
stage.on('mouseup', function (e) {
    onUpKillWhatNeed(e);
});

//#region onUpKillWhatNeed

function onUpKillWhatNeed(e){
    clearTimeout(touchTimer);
    touchTimer = null;
    e.evt.preventDefault();
    isDrawing = false;
    dragpos = null;
    lastDist = 0;
    lastMidPoint = null;
    lastAngle = 0;
    console.log(undoHistory.length);
    
    simplifyPoints();
    some = null;
    // ===== PROCESSAMENTO DA SELEÇÃO =====
    if (lastSelectBox) {
        // Obter o retângulo de seleção em coordenadas de tela
        const selectionRect = lastSelectBox.getClientRect();
        // Array local para armazenar nós detectados nesta seleção
        const detectedNodes = [];

        // Iterar sobre todos os filhos do grupo de desenho
        group.children.forEach(element => {
            // Ignorar o próprio retângulo de seleção
            if (element === lastSelectBox) return;
            // Ignorar o transformer (se existir)
            if (element === selectionTransformer) return;

            // Verificar se o elemento tem interseção com a área de seleção
            // haveIntersection retorna true se os dois retângulos se sobrepõem
            if (Konva.Util.haveIntersection(selectionRect, element.getClientRect())) {
                detectedNodes.push(element);
            }
        });

        // ===== ATUALIZAR OS NÓS SELECIONADOS =====
        // Remover destaque dos nós que NÃO estão mais selecionados
        selectedNodes.forEach(node => {
            if (!detectedNodes.includes(node)) {
                // Se tinha stroke azul (de seleção), remover
                if (node.attrs.oldStroke === undefined) {
                    node.stroke(null);
                } else {
                    // Restaurar stroke original
                    node.stroke(node.attrs.oldStroke);
                }
                node.strokeWidth(node.attrs.oldStrokeWidth || 1);
            }
        });

        // Adicionar destaque aos novos nós selecionados
        detectedNodes.forEach(node => {
            // Armazenar stroke original para poder restaurar depois
            if (node.attrs.oldStroke === undefined) {
                node.attrs.oldStroke = node.stroke();
                node.attrs.oldStrokeWidth = node.strokeWidth() || 1;
            }
            // Aplicar destaque com cor azul
            node.stroke(SELECTION_STROKE_COLOR);
            node.strokeWidth(SELECTION_STROKE_WIDTH);
        });

        // Atualizar a lista global de nós selecionados
        selectedNodes = detectedNodes;

        // ===== ATUALIZAR O TRANSFORMER =====
        // Se houver nós selecionados, adicionar transformer para manipulá-los
        if (selectedNodes.length > 0) {
            // Remover transformer anterior se existir
            if (selectionTransformer) {
                selectionTransformer.detach();
                selectionTransformer.destroy();
            }
            // Criar novo transformer attachado aos nós selecionados
            selectionTransformer = new Konva.Transformer({
                enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'],
                rotateEnabled: true,
                borderStroke: SELECTION_STROKE_COLOR,
                borderStrokeWidth: 2,
                anchorSize: 8,
                anchorCornerRadius: 4,
                padding: 5
            });
            group.add(selectionTransformer);
            selectionTransformer.nodes(selectedNodes);
        } else {
            // Se nenhum nó foi selecionado, remover transformer
            if (selectionTransformer) {
                selectionTransformer.detach();
                selectionTransformer.destroy();
                selectionTransformer = null;
            }
        }

        // ===== LIMPAR O RETÂNGULO DE SELEÇÃO =====
        // Destruir o retângulo de seleção após processar
        lastSelectBox.destroy();
        lastSelectBox = null;
    }
    cacherize(TexturedLine);
    AddactionToHistory();
    
    stage.batchDraw();

    
}

function cacherize(Line){
    if (Line) {
            const points = Line.attrs.points;
            
            // Garante que a linha tenha pelo menos 1 ponto (2 coordenadas)
            if (points.length >= 2) {
                let minX = points[0];
                let maxX = points[0];
                let minY = points[1];
                let maxY = points[1];

                // 1. Calcula o menor e maior X e Y em todos os pontos
                for (let i = 2; i < points.length; i += 2) {
                    minX = Math.min(minX, points[i]);
                    maxX = Math.max(maxX, points[i]);
                    minY = Math.min(minY, points[i + 1]);
                    maxY = Math.max(maxY, points[i + 1]);
                }
                
                const lw = Line.attrs.lineWidth;
                
                // 2. Aplica o cache com os limites calculados, adicionando margem igual à largura do stroke (lw)
                Line.cache({
                    // O cache precisa começar um pouco antes do X/Y mínimo para incluir metade do stroke
                    x: minX - lw / 2, 
                    y: minY - lw / 2, 
                    // A largura/altura precisa ser a distância total (max - min) + a largura do stroke (lw)
                    width: maxX - minX + lw, 
                    height: maxY - minY + lw,
                    pixelRatio:1,
                    hitGraphEnabled: false
                });
            }
        }
}

function simplifyPoints(custom = null){
    ///////// log do atts > (18) [395, 140.25, 380, 148.25, 357, 162.25, 318, 193.25, 270, 231.25, 222, 270.25, 189, 
    // 296.25, 172, 307.25, 167, 311.25]
    if (!TexturedLine){return;}
    for(let i = 0; i < TexturedLine.attrs.points.length - 1; i+=2){
        ///////// aplicando o teoromema do piltaguras
        let mypoint ={x:TexturedLine.attrs.points[i],y:TexturedLine.attrs.points[i + 1]};
        let nextpoint = {x:TexturedLine.attrs.points[i + 2],y:TexturedLine.attrs.points[i + 3]};
        let finalx1 = mypoint.x - nextpoint.x;
        let finalx2 = mypoint.y - nextpoint.y;
        let result = (finalx1 * finalx1) + (finalx2 * finalx2)
        if (result < 20){
            
            if (i > 2){
                if (custom){
                    TexturedLine.attrs.points.splice(i,custom);
                }else{
                    TexturedLine.attrs.points.splice(i,simplifyStrenght);
                }
                
            }
            
        }
        
        
    }
}

function clearCanvas() {
    undoHistory = [];
    redoHistory = [];
    group.destroyChildren(); // Remove todas as linhas do grupo
}

//#region SAVE
async function saveCanvas() {
    isDrawing = false;
    isSaved = true;
    ////// salvando as coordenadas da tela
    const laspos = stage.position();
    const lascale = stage.scaleX();
    const lasrotation = stage.rotation();


    ////// resetando as coordenadas da tela pra pos inicial

    stage.position({ x: 0, y: 0 });
    stage.scale({ x: 1, y: 1 });
    stage.rotation(0);
    bgLayer.draw();
    stage.draw();
    bgRect.stroke(null);
    withLoadScreen(async () =>{
        await saveAsImage();
    });
    

    //////// resturando as cordenadas da tela
    stage.position(laspos);
    stage.scale({ x: lascale, y: lascale });
    layer.draw();
    stage.rotation(lasrotation);
    bgRect.stroke('black')
    bgLayer.draw();
    group.draw();
}
async function saveAsImage(){
    if (Gettype == 'draw') {
        
        if (foundDraw) {
            //// guardamos a url pra mera vizualização na galeria;
            foundDraw.drawURL = stage.toDataURL({
                mimeType: "image/png",
                pixelRatio: 3,    //3x mais nítido
                width: DRAWSIZE.width,
                height: DRAWSIZE.height
            });
            // aqui que guardamos grupos
            foundDraw.layers = [];
            for (let i = 0; i <= layerList.length - 1; i++) {
                foundDraw.layers.push(pages['page' + currentpage].layers[i].draw.toJSON());
            }
            foundDraw.DRAWSIZE.width = DRAWSIZE.width;
            foundDraw.DRAWSIZE.height = DRAWSIZE.height;
            
            // Atualiza apenas o draw específico ao invés da lista toda
            await updateDrawById(foundDraw.id, foundDraw);
        }

    } else if (Gettype == 'manga') {
        const getPages = [];
        const originalPage = currentpage; // Salva a página atual para restaurar depois

        for (let i = 0; i <= pagenumbers; i++) {
            // Mostra apenas a página i no stage
            set_current_page(i);
            stage.batchDraw();
            
            // Captura a imagem da página i
            pages['page' + i].PageURL = stage.toDataURL({
                mimeType: "image/png",
                pixelRatio: 3,   // 3x mais nítido
                width: DRAWSIZE.width,
                height: DRAWSIZE.height
            });
            
            getPages.push(pages['page' + i]);
        }
        
        // Restaura a página que estava sendo exibida
        set_current_page(originalPage);

        getManga.chapters.find(chap => chap.number == chapID).pages = getPages;
        
        // Atualiza apenas o manga específico ao invés da lista toda
        await updateMangaById(getManga.id, getManga);
    }
}

//#region ADD TO HISTORY
function AddactionToHistory() {
    if (TexturedLine) {
        undoHistory.push(TexturedLine);
        TexturedLine = null;
    } else if(LineEraser){
        undoHistory.push(LineEraser);
        LineEraser = null;
    } else if (lastRect) {
        undoHistory.push(lastRect);
        selectorDeNodes(lastRect);
        set_current_tool('transform')
        ///lastRect = null;
    } else if (lastCicle) {
        undoHistory.push(lastCicle);
        selectorDeNodes(lastCicle);
        set_current_tool('transform')
        //lastCicle = null;
    } else if (lastLineTool) {
        undoHistory.push(lastLineTool);

        //lastLineTool = null;
    } else if (lastText) {
        undoHistory.push(lastText);
        // lastText não é resetado aqui, pois o editor pode continuar ativo
    }
}

//#region UNDO
function undo() {
    const lastAction = undoHistory.pop();
    if (lastAction) {
        lastAction.remove(); // Remove a última linha do grupo
        redoHistory.push(lastAction); // Adiciona a ação removida ao histórico de refazer
        stage.batchDraw();


    }

}

//#region REDO
function redo() {
    const actionToRedo = redoHistory.pop();
    if (actionToRedo) {
        group.add(actionToRedo); // Adiciona a ação de volta ao grupo
        undoHistory.push(actionToRedo); // Adiciona a ação de volta ao histórico de desfazer
        stage.batchDraw();
    }
}
//#region SelectDeNodes


function selectorDeNodes(node){
    //node.draggable(true);
    trans.nodes([]);
    trans.moveToTop();
    trans.on("click tap", (e) =>{
        trans.nodes([node]);
        node.draggable(true);
    })
    trans.on("dragend",(e) => {
        node.draggable(false);
        trans.nodes([]);
    })
    stage.on('click tap', (e) => {
    if (e.target === stage) {
        trans.nodes([]);
    }
    });
    trans.nodes([node]);
    console.log("Tinha uma porra aqui");
    layer.draw();

}

//#region SAVE AUTO
function autosave() {
    saveCanvas();
    console.log("O tempo acabou! Função chamada! (✿◕‿◕)");
    iniciarTimer(); // reinicia o timer automaticamente
}

function iniciarTimer() {
    const umMinutos = 1 * 60 * 1000;
    console.log("Timer iniciado! Mais 1 minutos de agonia... (⁄ ⁄•⁄ω⁄•⁄ ⁄)");
    setTimeout(autosave, umMinutos);
}

// Começa a tortura
//iniciarTimer();

//#region MOUSE LEAVE
stage.on('touchcancel', function (e) {
    onUpKillWhatNeed(e);
});
stage.on('mouseleave ', function (e) {
    onUpKillWhatNeed(e);
});
//#region END OF SCRIPT










//#region  DEBUG 
(function () {
    const fpsDisplay = document.createElement('div');
    fpsDisplay.style.position = 'fixed';
    fpsDisplay.style.top = '10px';
    fpsDisplay.style.left = '10px';
    fpsDisplay.style.padding = '5px';
    fpsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    fpsDisplay.style.color = '#00FF00'; // Cor verde para destacar
    fpsDisplay.style.fontFamily = 'monospace';
    fpsDisplay.style.fontSize = '14px';
    fpsDisplay.style.zIndex = '9999';
    fpsDisplay.textContent = 'FPS: --';
    
    // Adiciona o elemento ao corpo do documento
    document.body.appendChild(fpsDisplay);

    let lastTime = 0;
    let frameCount = 0;
    let fps = 0;
    
    /**
     * Loop principal de medição.
     * @param {number} currentTime - Timestamp fornecido pelo requestAnimationFrame.
     */
    function calculateFPS(currentTime) {
        // Incrementa o contador de frames
        frameCount++;

        // Calcula a diferença de tempo desde a última atualização de FPS
        const elapsed = currentTime - lastTime;

        // Atualiza o FPS a cada 1000ms (1 segundo)
        if (elapsed > 1000) {
            // Calcula o FPS: frames contados / segundos decorridos
            fps = Math.round((frameCount * 1000) / elapsed);
            
            // Atualiza o display
            fpsDisplay.textContent = `FPS: ${fps}`;
            
            // Reseta contadores
            frameCount = 0;
            lastTime = currentTime;
        }

        // Chama a função novamente no próximo quadro de redesenho
        requestAnimationFrame(calculateFPS);
    }

    // Inicia o loop de cálculo de FPS
    requestAnimationFrame(calculateFPS);
})();
/**
 * Cria um painel flutuante no canto inferior direito para exibir logs do console
 * em tempo real, interceptando as funções originais do console.
 */
(function () {
    // 1. Criação e Estilização do Painel de Log
    const logContainer = document.createElement('div');
    logContainer.id = 'browser-log-display';
    logContainer.style.position = 'fixed';
    logContainer.style.top = '40px';
    logContainer.style.left = '10px';
    logContainer.style.width = '200px';
    logContainer.style.maxHeight = '200px';
    logContainer.style.overflowY = 'auto'; // Habilita scroll
    logContainer.style.padding = '5px';
    logContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.52)'; // Fundo escuro
    logContainer.style.color = '#4ec62dff';
    logContainer.style.fontFamily = 'monospace';
    logContainer.style.fontSize = '10px';
    logContainer.style.zIndex = '10000';
    logContainer.style.borderRadius = '4px';
    logContainer.style.border = '1px solid #285718ff';

    document.body.appendChild(logContainer);

    // 2. Armazena as funções originais do console
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error
    };

    /**
     * Função auxiliar para formatar a mensagem e adicionar ao painel.
     * @param {string} type - Tipo de log ('LOG', 'WARN', 'ERROR').
     * @param {Array} args - Argumentos passados para a função console original.
     */
    function appendLog(type, args) {
        // Converte os argumentos (objetos, strings, etc.) para uma string legível
        const message = Array.from(args).map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg);
                } catch {
                    return String(arg); // fallback para objetos complexos
                }
            }
            return String(arg);
        }).join(' ');
        
        // Cria o elemento da mensagem
        const logEntry = document.createElement('div');
        logEntry.style.wordBreak = 'break-all'; // Quebra linhas longas
        logEntry.style.padding = '2px 0';
        
        let color = '#FFFFFF'; // Cor padrão (LOG)
        if (type === 'WARN') {
            color = '#FFD700'; // Amarelo para warning
        } else if (type === 'ERROR') {
            color = '#FF4500'; // Vermelho/Laranja para erro
        }
        
        // Aplica a cor e o prefixo
        logEntry.innerHTML = `<span style="color:${color};">[${type}]</span>: ${message}`;

        // Adiciona ao topo do contêiner (para ver o mais recente primeiro)
        logContainer.prepend(logEntry);

        // Limita o número de logs para evitar sobrecarga (ex: 50 mensagens)
        if (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }

    // 3. Sobrescreve as funções do console
    console.log = function(...args) {
        originalConsole.log.apply(console, args); // Chama a função original (para o console devtools)
        appendLog('LOG', args); // Adiciona ao painel personalizado
    };

    console.warn = function(...args) {
        originalConsole.warn.apply(console, args);
        appendLog('WARN', args);
    };

    console.error = function(...args) {
        originalConsole.error.apply(console, args);
        appendLog('ERROR', args);
    };

    // Mensagem de confirmação no painel
    appendLog('INFO', ['Live Browser Log iniciado com sucesso.']);
})();