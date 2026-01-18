//////////////
////////// talve ainda não ficou perceptvel que erros de digitção e gramatica são comuns por aqui.
////////////////////////

let DRAWSIZE = {
    width: 600,
    height: 800,
    PIXELQUALITY: 1
}
let isSaved = true;

const MAXLAYER = 10;
const getwidthInput = document.getElementById('canvasWidth');
const getheightInput = document.getElementById('canvasHeight');
const layerGrid = document.getElementById('layerGrid');
const pixelquality = document.getElementById('pixelquality');
DRAWSIZE.PIXELQUALITY = pixelquality.value;

pixelquality.addEventListener('change', () => {
    DRAWSIZE.PIXELQUALITY = pixelquality.value;
});


let Gettype = localStorage.getItem('type');

const drawContainer = document.getElementById('draw-canvas');
const pagesDiv = document.getElementById('pagesDiv');


const stage = new Konva.Stage({
    container: 'draw-canvas',   // id of container <div>
    width: drawContainer.offsetWidth,
    height: drawContainer.offsetHeight,
    listening:true
    
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
let getChapter;

async function startSavedData(){
    drawlist = await getDrawList();
    mangaList = await getMangasList();
    getManga = mangaList ? mangaList.find(manga => manga.id === Number(id)) : null;
    getChapter = getManga ? getManga.chapters.find(chap => chap.number === Number(chapID)) : null;
    foundDraw = drawlist ? drawlist.find(draw => draw.id === Number(id)) : null;
    
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
let realayers = [];
let currentreallayer = 0;
let layer = null;

function createRealLayerList(newlayer){
    realayers.push(newlayer);
    currentreallayer = realayers[realayers.length - 1];
    layer = currentreallayer;
    stage.add(layer);
}
function getRealLayer(index){
    currentreallayer = realayers[index];
    let layergetted = currentreallayer;
    return layergetted;

}

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

async function NewStartInitWithType(layer, bgLayer) {
    //#region modo manga
    if (Gettype === 'manga') {
        await typeManga(layer);
        
    }
    //#region modo draw
    else if (Gettype === 'draw') {
        await typeDraw(layer);
    }
    // cria o bg e nada mais
    // Um novo bgRect para o grupo de bg rect
    createBgRect(bgLayer);

    async function typeManga(layerReal){
        ///// zanzamos pela lista de chapters
        if (getChapter.pages.length > 0){
            let num = Number(getChapter.pagesCount);
            
            pagesDiv.innerHTML = '';
            for (let i = 0; i < num; i++){
                pages['page' + i] = {
                    background: null,
                    layers: [
                    ]
                }
                gerateUXpages(i);
            }
            getChapter.pages.forEach((page, pageindex) => {
                page.layers.forEach((layer, index) => {
                    let newRealLayer = new Konva.Layer();
                    createRealLayerList(newRealLayer)
                    ///////// precisamos aumentar paginas! de forma terrivel!
                    pages['page' + pageindex].layers.push({ 
                        draw: new Konva.Group({
                            clipFunc: function (ctx) {
                                ctx.beginPath();
                                ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
                                ctx.closePath();
                                ctx.clip();
                            }
                        }),
                        drawImageBase64:null,
                        hasimage:null 
                    });
                    let drawedImg = new Image();
                    drawedImg.src = layer.drawImageBase64;
                    drawedImg.onload = function(){
                        let konvaImage = new Konva.Image({
                            x: 0,
                            y: 0,
                            image: drawedImg,
                            width: DRAWSIZE.width,
                            height: DRAWSIZE.height,
                            draggable: false
                        });
                        pages['page' + pageindex].layers[index].draw.add(konvaImage);

                        let group = pages['page' + pageindex].layers[index].draw;
                        console.log("on load manga ",group);
                        
                        newRealLayer.add(group);
                        stage.batchDraw();

                    };
                })
                
                updateLayerList();
                updateLayerUI();
                
            });
        }
        else{
            createNewPageManga(0)
            
        }
        
    }

    async function typeDraw(layerReal){
        pages['page' + currentpage] = {
            background: null,
            layers: [
            ]

        }
        
        if (foundDraw && foundDraw.layers[0] != null) {
            DRAWSIZE.width = foundDraw.DRAWSIZE.width;
            DRAWSIZE.height = foundDraw.DRAWSIZE.height
            bgRect.width(DRAWSIZE.width);
            bgRect.height(DRAWSIZE.height);
            /// atualizando os numeros de resize da UX
            getwidthInput.value = DRAWSIZE.width;
            getheightInput.value = DRAWSIZE.height;

            for (let i = 0; i < foundDraw.layers.length; i++) {
                
                let layer = foundDraw.layers[i];
                pages['page' + currentpage].layers.push({ draw: null,drawImageBase64:null });
                let newRealLayer = new Konva.Layer();
                createRealLayerList(newRealLayer)
                
                ///pages['page' + currentpage].layers[i].draw = Konva.Node.create(layer.draw);
                pages['page' + currentpage].layers[i].draw = new Konva.Group({

                });
                pages['page' + currentpage].layers[i].draw.clipFunc(function (ctx) {
                    ctx.beginPath();
                    ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
                    ctx.closePath();
                    ctx.clip();
                });
                if (pages['page' + currentpage].layers[i].draw.children.length < 1) {
                    StartBrush('assets/brush/default.png', '#000');
                }
                
                /// criamos um elemento img 2seguindinhos sem perder a amizade
                let drawedImg = new Image();
                drawedImg.src = layer.drawImageBase64;
                drawedImg.onload = function(){
                    let konvaImage = new Konva.Image({
                        x: 0,
                        y: 0,
                        image: drawedImg,
                        width: DRAWSIZE.width,
                        height: DRAWSIZE.height,
                        draggable: false
                    })
                    pages['page' + currentpage].layers[i].draw.add(konvaImage);
                    stage.batchDraw();
                    let group = pages['page' + currentpage].layers[i].draw;
                    newRealLayer.add(group);
                }
                updateLayerList();
                updateLayerUI();
            }
            

        }
        else {
            createNewPage(0);

        }
        
    }
    
    function gerateUXpages(num){
        const button = document.createElement("button");
        button.textContent = "Página " + (num + 1);
        button.className = "Generalbutton";
        pagesDiv.appendChild(button);

        button.addEventListener("click", () => {
            set_current_page(num);
        });
        

    }

    function createBgRect(bgLayer) {
        //// pages é tao repetido no codigo porque toda func aqui é uma mulher ciumenta
        /// não me culpe
        
        pages['page' + currentpage].background = new Konva.Group({
        });

        ////////// adiciona os grupos a page atual
        pages['page' + currentpage].background.add(bgRect); // Adicione o novo retângulo ao grupo

        let groupBgRect = pages['page' + currentpage].background;
        bgLayer.add(groupBgRect);
    }

    function createNewPage(indexlayer){
        ///// aqui é copiando mesmo to nem ai
        let newLayer = new Konva.Layer();
        createRealLayerList(newLayer);
        StartBrush('assets/brush/default.png', '#000');
        pages['page' + currentpage].layers.push({ draw: null,hasimage:null });
        
        
        pages['page' + currentpage].layers[indexlayer].draw = new Konva.Group({
            clipFunc: function (ctx) {
                ctx.beginPath(); // Inicia um novo caminho
                ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
                ctx.closePath(); // Fecha o caminho
                ctx.clip(); // Aplica o recorte
            }
        });
        let group = pages['page' + currentpage].layers[indexlayer].draw;
        newLayer.add(group);
        updateLayerList();
        /////////// aqui populamos a lista de botoes de paginas
        /// premeiro lembe-se que bipolaridade em codigo existe e o numero era string e não interger
        if(getChapter != undefined){
            let num = Number(getChapter.pagesCount);
            pagesDiv.innerHTML = '';
            for (let i = 0; i < num; i++){
                gerateUXpages(i);
            }
        }

    }
    function createNewPageManga(indexlayer){
        /////////// aqui populamos a lista de botoes de paginas
        /// premeiro lembe-se que bipolaridade em codigo existe e o numero era string e não interger
        let num = Number(getChapter.pagesCount);
        pagesDiv.innerHTML = '';
        for (let i = 0; i < num; i++){
            pages['page' + i] = {
                background: null,
                layers: [
                ]
            }
            let newLayer = new Konva.Layer();
            createRealLayerList(newLayer);
            StartBrush('assets/brush/default.png', '#000');
            pages['page' + i].layers.push({ draw: null,drawImageBase64:null,hasimage:null });
            
            pages['page' + i].layers[indexlayer].draw = new Konva.Group({
                clipFunc: function (ctx) {
                    ctx.beginPath(); // Inicia um novo caminho
                    ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
                    ctx.closePath(); // Fecha o caminho
                    ctx.clip(); // Aplica o recorte
                }
            });
            let group = pages['page' + i].layers[indexlayer].draw;
            newLayer.add(group);
            updateLayerList();
            gerateUXpages(i);
        }




    }
}

stage.add(bgLayer);

let group;
function updateLayerUI() {
    layerGrid.innerHTML = ''; // Limpa a grid
    for (let i = 0; i < layerList.length; i++) {
        currentlayer = i; // Define o índice atual
        createUXlayer(); // Recria cada elemento
    }
}
//#region OutroBoot
async function OutroBootMuitoBemFeitoTestandoUmNovoTipoDeLoadDeDesenhoEmuitoMaisFuncionalEm2026AtualizadoVersao100porcetoFree(layer,bgLayer){
    await startSavedData();
    await StartBrush('assets/brush/default.png', '#000');
    NewStartInitWithType(layer, bgLayer);

    group = pages['page' + currentpage].layers[0].draw;
    set_current_page(0);
    updateLayerList();

    updateLayerUI();
}

//#region BOOT
withLoadScreen(async () => {
    ///await RealBoot100PocentoAtulizadoVersao2025melhorCodigoCustoBeneficionJaFeito(layer, bgLayer); (versao legada)
    await OutroBootMuitoBemFeitoTestandoUmNovoTipoDeLoadDeDesenhoEmuitoMaisFuncionalEm2026AtualizadoVersao100porcetoFree(layer, bgLayer);
});

//#region  VARIAVEIS
let mouseicon = document.getElementById("mouseicon");

let isDrawing = false;
let TexturedLine;
let linepreviwe;
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
    padding:4,
    borderWidth: 1,// Borda
    borderColor: "#000",
    handleRadius: 6,// Tamanho do cursor
    handleStrokeWidth: 2,
    handleStrokeColor: "#fff",
    layout: [
        { component: iro.ui.Wheel },
        { component: iro.ui.Slider, options: { sliderType: 'value' }, },
        { component: iro.ui.Slider, options: { sliderType: 'saturation' } },
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
    const validTools = ['pen', 'eraser', 'line', 'rectangle', 'circle', 'select', 'text', 'colorpicker'];
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
    
    currentpage = index;
    // dando hide em todas as layer
    setVisAllPages("hidden");
    pages['page' + currentpage].layers.forEach((layer) => {
        layer.draw.show();
        //layer.draw.opacity(1);
    });
    updateLayerList();
    updateLayerUI();
    console.log("on set page manga ",group);
}
function setVisAllPages(set) {
    let sizepages = Object.keys(pages).length;
    for(let pageNum = 0; pageNum < sizepages; pageNum++){
        /// pecado gravissimo for each em for legado
        pages['page' + pageNum].layers.forEach((layer) => {
            if (set === "hidden"){
                layer.draw.hide();
            }else if (set === "show"){
                layer.draw.show();
            }
            //layer.draw.opacity(0.1);
        });
        
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
    let toup = document.createElement('button');
    toup.className = 'Generalbutton';
    let todown = document.createElement('button');
    todown.className = 'Generalbutton';
    todown.innerHTML = '<img src="assets/icons/arrowdown.png" alt="Mover para baixo">';
    toup.innerHTML = '<img src="assets/icons/arrowup.png" alt="Mover para cima">';
    toup.onclick = () => {
        if (currentlayer > 0) {
            ///[realayers[currentlayer], realayers[currentlayer - 1]] = [realayers[currentlayer - 1], realayers[currentlayer]];
            
            ///// metodo antigo é 1000 melhor que essa sujeira ai de swap
            /////// real layer 0
            let templayer = pages['page' + currentpage].layers[currentlayer - 1];
            //// real layer zero recebe 1
            
            pages['page' + currentpage].layers[currentlayer - 1] = pages['page' + currentpage].layers[currentlayer];
            /// ou seja 0 virou 1 e agora o 1 vai vira o temp que e 0
            pages['page' + currentpage].layers[currentlayer] = templayer;
            /// 0 = 1
            realayers[currentlayer - 1] = realayers[currentlayer];
            /// 1 = é 0
            realayers[currentlayer] = getRealLayer(currentlayer - 1);
            /// agora 1 vai pra cima e 0 vai pra ... eu devia ler a documentaçao
            realayers[currentlayer].moveUp();
            realayers[currentlayer - 1].moveToTop()

            updateLayerUI();
            label.hidden = true;
            
            console.log(label.textContent);
            
            stage.batchDraw();
        }
        
    }
    todown.onclick = () => {
       
    }
    // cria os botões
    const hide = makeButton('hidden', 'Esconder');
    const del = makeButton('clear', 'Deletar');
    // joga tudo no layerCell
    layerCell.appendChild(toup);
    //layerCell.appendChild(todown);
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
        layer = getRealLayer(ratio.value);
        checkimage(num);
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
    
    if (pages['page' + currentpage].layers[number].hasimage != null){
        imgReference = pages['page' + currentpage].layers[number].hasimage;
        LastimgReferenceOnLastLayer = imgReference;
    }else{
        imgReference = null;
    }
    if (LastimgReferenceOnLastLayer != null){
        
    }
    

}
function addLayer(imagedata = '') {
    if (layerList.length > MAXLAYER){
        return;
    }

    let newRealLayer = new Konva.Layer();
    const newGroup = new Konva.Group();
    set_current_tool('pen')
    newGroup.clipFunc(function (ctx) {
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
            newRealLayer.add(konvaImage);
            
            pages['page' + currentpage].layers.push({ draw: newGroup, hasimage:konvaImage});
            newRealLayer.add(newGroup);
            createRealLayerList(newRealLayer);
            group = pages['page' + currentpage].layers[currentlayer].draw;
            updateLayerList();
            updateLayerUI();
        }

    } else{
        pages['page' + currentpage].layers.push({ draw: newGroup, hasimage:null});
        newRealLayer.add(newGroup);
        createRealLayerList(newRealLayer);
        
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
              
        //let scaletexture = autosize ? sizePicker.value / stage.scaleX() * autoSizeSensi : sizePicker.value;
        let scaletexture = sizePicker.value;
        
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
            pixelRatio:DRAWSIZE.PIXELQUALITY,
            sceneFunc: function (ctx, shape) {
                //////////// grande misterio, de onde vem essa função e de que serve
                strokenize(ctx,shape)

            }
        });
        linepreviwe = new Konva.Line({
            stroke: color,
            strokeWidth: scaletexture,
            points: [pos.x, pos.y],
            
        });
        
        TexturedLine.opacity(opacityPicker.value / 100);
        if (isDrawing === true){
            TexturedLine.attrs.points.push(startpos.x, startpos.y,startpos.x,startpos.y);
        }
        linepreviwe.opacity(opacityPicker.value / 100);
        group.add(linepreviwe);
        
        layer.draw();
        
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
            pixelRatio:DRAWSIZE.PIXELQUALITY
        });
        
        LineEraser.opacity(opacityPicker.value / 100);
        group.add(LineEraser);
        layer.draw();
        //LineEraser.points([startpos.x, startpos.y]);
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
            pixelRatio:DRAWSIZE.PIXELQUALITY,
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
    //ctx.stroke();
}
//#region coisanoTextura
let textureScale = 0;
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

    // // --- LÓGICA DE PRESSÃO FALSA (FAKE PRESSURE) ---
     const MAX_VELOCITY_FOR_PRESSURE = 20; 
     const MIN_SCALE_FACTOR = 2; 
    
     let speedNormalized = Math.min(result, MAX_VELOCITY_FOR_PRESSURE) / MAX_VELOCITY_FOR_PRESSURE;
     let fakePressure = 1 - speedNormalized;
    
      //Calcula o fator de escala (entre MIN_SCALE_FACTOR e 1)
     let pressureFactor = MIN_SCALE_FACTOR + (1 - MIN_SCALE_FACTOR) * fakePressure;
    
     // O tamanho da textura é ajustado pela pressão
    textureScale = baseTextureScale * pressureFactor;
    //--- FIM DA LÓGICA DE PRESSÃO FALSA ---
    //3. Desenhar o ponto de destino (com a nova escala)
    ctx.drawImage(currentBrush,
        points[i] - textureScale / 2,
        points[i + 1] - textureScale / 2,
        textureScale, textureScale
    );

     //4. Calcular e desenhar os passos intermediários (interpolação)
    
    let space = textureScale * Number(SpacingRange?.value); 
    let step = space; 

    let steps = Math.floor(result / step);
    steps = Math.min(steps, 130);
    
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
    mouseicon.style.top = pos.y;
    mouseicon.style.left = pos.x;
    
    const x = Math.min(startpos.x, pos.x);
    const y = Math.min(startpos.y, pos.y);
    const w = Math.abs(pos.x - startpos.x);
    const h = Math.abs(pos.y - startpos.y);
    
    if (current_tool == 'pen') {
        if (!some){
            some = {x:pos.x,y:pos.y}
        }
        some.x += (pos.x - some.x) * (1-strongStabilizador.value);
        some.y += (pos.y - some.y) * (1-strongStabilizador.value);
        if (TexturedLine){
            TexturedLine.attrs.points.push(some.x, some.y);
            linepreviwe.points(linepreviwe.points().concat([some.x, some.y]));
        }
        layer.draw();
    } else if (current_tool == 'eraser' && LineEraser){


        if (!some){
            some = {x:pos.x,y:pos.y}
        }
        
        some.x += (pos.x - some.x) * (1-strongStabilizador.value);
        some.y += (pos.y - some.y) * (1-strongStabilizador.value);
        
        
        LineEraser.points(LineEraser.points().concat([some.x, some.y]));
        layer.draw();
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
        if (!some){
            some = {x:pos.x,y:pos.y}
        }
        
        some.x += (pos.x - some.x) * (1-strongStabilizador.value);
        some.y += (pos.y - some.y) * (1-strongStabilizador.value);
        if (TexturedLine){
            TexturedLine.attrs.points.push(some.x, some.y);
            linepreviwe.points(linepreviwe.points().concat([some.x, some.y]));
        }
        layer.draw();
        console.log(lastLineTool);
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
    if (isDrawing === true && current_tool == 'pen' && linepreviwe){
        linepreviwe.remove();
        group.add(TexturedLine);
    }
    clearTimeout(touchTimer);
    touchTimer = null;
    e.evt.preventDefault();
    isDrawing = false;
    dragpos = null;
    lastDist = 0;
    lastMidPoint = null;
    lastAngle = 0;
    simplifyPoints();
    some = null;
    cacherize(TexturedLine);
    AddactionToHistory();
    layer.draw();

    
}
//#region cacherize que da otimização
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
                
                const lw = Math.round(textureScale) * 3;
                
                // 2. Aplica o cache com os limites calculados, adicionando margem igual à largura do stroke (lw)
                let finalwidth = (maxX - minX)+ lw;
                let finalheight = (maxY - minY)+ lw;
                let offsetx = (minX - lw / 2) ;
                let offsety = (minY- lw/ 2);
                Line.cache({
                    // O cache precisa começar um pouco antes do X/Y mínimo para incluir metade do stroke
                    x: offsetx, 
                    y: offsety, 
                    // A largura/altura precisa ser a distância total (max - min) + a largura do stroke (lw)
                    width: finalwidth, 
                    height: finalheight,
                    pixelRatio:DRAWSIZE.PIXELQUALITY,
                    hitGraphEnabled: false,
                    drawBorder:false,
                    imageSmoothingEnabled:false
                });
            }
        }
}
//#region simplifyPoints
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

//#region clearCanvas

function clearCanvas() {
    undoHistory = [];
    redoHistory = [];
    group.destroyChildren();
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
        //await saveAsImage();
        await NewsaveAsImage();
    });
    

    //////// resturando as cordenadas da tela
    stage.position(laspos);
    stage.scale({ x: lascale, y: lascale });
    stage.draw();
    stage.rotation(lasrotation);
    bgRect.stroke('black')
    bgLayer.draw();
}
async function NewsaveAsImage() {
    if (Gettype == 'draw') {
        // ... (lógica de draw permanece igual)
        if (foundDraw) {
            foundDraw.drawURL = stage.toDataURL({
                mimeType: "image/png",
                pixelRatio: DRAWSIZE.PIXELQUALITY,
                width: DRAWSIZE.width,
                height: DRAWSIZE.height
            });
            foundDraw.layers = [];
            for (let i = 0; i <= layerList.length - 1; i++) {
                let layerbase64 = pages['page' + currentpage].layers[i].draw.toDataURL({
                    mimeType: "image/png",
                    pixelRatio: DRAWSIZE.PIXELQUALITY,
                    width: DRAWSIZE.width,
                    height: DRAWSIZE.height
                });
                pages['page' + currentpage].layers[i].drawImageBase64 = layerbase64;
                foundDraw.layers.push(pages['page' + currentpage].layers[i]);
            }
            foundDraw.DRAWSIZE.width = DRAWSIZE.width;
            foundDraw.DRAWSIZE.height = DRAWSIZE.height;
            await updateDrawById(foundDraw.id, foundDraw);
        }

    } else if (Gettype == 'manga') {
        // RESOLUÇÃO: Percorrer todas as páginas carregadas no objeto 'pages'
        const allPagesData = [];
        const pageKeys = Object.keys(pages); // Pega 'page0', 'page1', etc.
        pageKeys.forEach((pageKey) => {
            const targetpage = pages[pageKey];
            // Para cada camada desta página, gera o Base64
            targetpage.layers.forEach((layer) => {
                setVisAllPages("show");
                console.log(layer);

                const layerbase64 = layer.draw.toDataURL({
                    mimeType: "image/png",
                    pixelRatio: DRAWSIZE.PIXELQUALITY,
                    width: DRAWSIZE.width,
                    height: DRAWSIZE.height
                });
                layer.drawImageBase64 = layerbase64;
            });
            
            allPagesData.push(targetpage);
            //

        });

        // Localiza o capítulo específico e atualiza a lista de páginas completa
        const targetChapter = getManga.chapters.find(chap => chap.number == chapID);
        if (targetChapter) {
            targetChapter.pages = allPagesData;
        }

        // Atualiza o banco de dados/localStorage
        await updateMangaById(getManga.id, getManga);
        setVisAllPages("hidden");
        set_current_page(currentpage);
    }
}
//#region ADD TO HISTORY
function AddactionToHistory() {
    if (TexturedLine) {
        undoHistory.push(TexturedLine);
        linepreviwe = null;
        TexturedLine = null;
    } else if(LineEraser){
        undoHistory.push(LineEraser);
        LineEraser = null;
    } else if (lastRect) {
        undoHistory.push(lastRect);
        lastRect = null;
    } else if (lastCicle) {
        undoHistory.push(lastCicle);
        lastCicle = null;
    } else if (lastLineTool) {
        undoHistory.push(lastLineTool);
        lastLineTool = null;
    } else if (lastText) {
        undoHistory.push(lastText);
        // lastText não é resetado aqui, pois o editor pode continuar ativo
    }
}

//#region UNDO
//#region UNDO INTELIGENTE
function undo() {
    if (undoHistory.length === 0) return; // Evita erros se o histórico estiver vazio

    const lastAction = undoHistory.pop();
    
    if (lastAction) {
        // 2. Remove o elemento do Konva (palco)
        lastAction.remove();

        // 3. Gerencia o Redo (limita para não estourar memória, ex: 50 ações)
        redoHistory.push(lastAction);
        if (redoHistory.length > 50) {
            redoHistory.shift(); 
        }

        // 4. Redesenha apenas a layer necessária (mais performance que stage.draw)
        if (layer) {
            layer.batchDraw();
        } else {
            stage.batchDraw();
        }

        // 5. Marca como não salvo
        isSaved = false;
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
//#region SAVE AUTO
function autosave() {
    saveCanvas();
    iniciarTimer(); // reinicia o timer automaticamente
}

function iniciarTimer() {
    const umMinutos = 1 * 60 * 1000;
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