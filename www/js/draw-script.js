//////////////
////////// talve ainda não ficou perceptvel que erros de digitção e gramatica são comuns por aqui.
////////////////////////

let DRAWSIZE = {
    width: 600,
    height: 800
}


const getwidthInput = document.getElementById('canvasWidth');
const getheightInput = document.getElementById('canvasHeight');

let Gettype = localStorage.getItem('type');

const drawContainer = document.getElementById('draw-canvas');
const pagesDiv = document.getElementById('pagesDiv');

let currentpage = 0;

const stage = new Konva.Stage({
    container: 'draw-canvas',   // id of container <div>
    width: drawContainer.offsetWidth,
    height: drawContainer.offsetHeight
});

stage.container().style.background = '#868686ff';
const bgLayer = new Konva.Layer({listening:false});

const bgRect = new Konva.Rect({
    height: DRAWSIZE.height,
    width: DRAWSIZE.width,
    stroke: 'black',
    strokeWidth: 1,
    fill: '#ffff',
    shadowBlur:12,
    cornerRadius: 3,
});

//////// agora a gente pega as paginas
const pages = {
    
};

let getMangaList = JSON.parse(localStorage.getItem('mangas')) || [];
const search = new URLSearchParams(window.location.search);
const id = search.get('id');
const chapID = search.get('chapID');

const getManga = getMangaList.find(manga => manga.id === Number(id));

let forgeratePageButton = null;
let pagenumbers = -1;

let getDrawList = JSON.parse(localStorage.getItem('draws-saveds'));
const foundDraw = getDrawList ? getDrawList.find(draw => draw.id === Number(id)) : null;

//#region StartBrush
let currentBrush = null;
let brushpath = null;
let scaleTexture = 1;
// Cache de brushes - array de objetos {path, canvas}
const brushCache = [];

function StartBrush(path,color) {
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


StartBrush('assets/brush/default.png','#000');
//#region STARTYPE
function StartInitWithType(layer,bgLayer){
    //#region modo manga
    if(Gettype === 'manga'){
        let PagesJson
        getManga.chapters.forEach((page) => {
            if (chapID == page.number){
                forgeratePageButton = page.pagesCount;
            }
            
        });
        for(let i = 0; i < forgeratePageButton; i++){
            pagenumbers += 1;

            const getPages = getManga.chapters.find(chap => chap.number == chapID).pages || [];
            PagesJson = getPages[pagenumbers]
            
            
            if (PagesJson != undefined){
                PagesJson = Konva.Node.create(PagesJson);
                // Adiciona clipFunc direto no node do grupo
                PagesJson.clipFunc(function(ctx) {
                    ctx.beginPath();
                    ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
                    ctx.closePath();
                    ctx.clip();
                });

                ////////////// pegando as linhas salvas e recriando
                if (PagesJson.children.length < 1){
                    StartBrush('assets/brush/default.png','#000');
                }
                PagesJson.children.forEach(child => {
                    StartBrush(child.attrs.texturepath,child.attrs.strokeColor).then(response => {
                        currentBrush = response;
                        if (child.attrs.customClassName === 'ShapeLine'){
                            
                            child.setAttr('customTexture', currentBrush);
                            
                            child.sceneFunc(function(ctx) {
                                ctx.beginPath();
                                
                                const points = child.attrs.points;
                                
                                if (points != null && points.length >= 2){
                                    ctx.moveTo(points[0], points[1]);
                                    for(let i = 2; i < points.length; i += 2){
                                        ctx.lineTo(points[i], points[i + 1]);
                                    }
                                }
                                ctx.strokeStyle = child.attrs.strokeColor;
                                ctx.lineWidth = child.attrs.lineWidth;
                                ctx.lineCap = child.attrs.lineCap;
                                ctx.lineJoin = child.attrs.lineJoin;
                                ctx.globalCompositeOperation = child.attrs.globalCompositeOperation;
                                let brushct = child.attrs.customTexture.getContext('2d');
                                
                                brushct.globalCompositeOperation = 'source-in';
                                brushct.fillStyle = child.attrs.strokeColor;
                                brushct.fillRect(0,0,child.attrs.customTexture.width,child.attrs.customTexture.height);
                                brushct.globalCompositeOperation = 'source-over';
                                const space = Math.max(0.1, child.attrs.lineWidth * 0.5);
                                
                                for (let i = 2; i < points.length - 2; i+= 2){
                                    
                                    const x1 = points[i];
                                    const y1 = points[i + 1];
                                    const x2 = points[i + 2];
                                    const y2 = points[i + 3];

                                    const dx = x2 - x1;
                                    const dy = y2 - y1;
                                    const distance = Math.hypot(dx,dy);
                                    const angle = Math.atan2(dy, dx);
                                    //////// math cell e max > max compara o primeiro valor e retorna o maior
                                    // math cell arredonda pra cima 0.1 vira 1.
                                    const steps = Math.max(1, Math.ceil(distance / space));

                                    //for (let j = 0; j < steps; j++){
                                   //     const t = j / steps;
                                    //    const xlerp = x1 + dx * t;
                                    //    const ylerp = y1 + dy * t;

                                   //     ctx.save();
                                  //      ctx.translate(xlerp, ylerp);
                                   //     ctx.rotate(angle);

                                   //     ctx.drawImage(child.attrs.customTexture,
                                   //         -child.attrs.lineWidth / 2,
                                   //         -child.attrs.lineWidth / 2,
                                   //         child.attrs.lineWidth,
                                   //         child.attrs.lineWidth
                                      //  );
                                     //   ctx.restore();
                                    //}
                                }

                                ctx.fillStrokeShape(child);
                                ctx.stroke();
                            });
                            
                        }

                    });
                });
            }else{
                PagesJson = new Konva.Group({
                    clipFunc: function(ctx) {
                        ctx.beginPath(); // Inicia um novo caminho
                        ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
                        ctx.closePath(); // Fecha o caminho
                        ctx.clip(); // Aplica o recorte
                    }
                });
            }
            
            pages['page' + pagenumbers] = {
                    background : null,
                    draw : null,
                    layers: {
                        layer:{
                            draw : null
                        }
                    }
            }
            const buttonPage = document.createElement('button');
            buttonPage.textContent = 'page ' + i;
            pagesDiv.appendChild(buttonPage);
            buttonPage.onclick = function() {
                set_current_page(i);
                
                
            }

            //////////////populando as paginas ///////////////// 

            if (PagesJson){
                pages['page' + i].draw = PagesJson;

            }else{
                console.log('criando nova pagina vazia');
                StartBrush('assets/brush/default.png','#000');
                pages['page' + i].draw = new Konva.Group({
                    clipFunc: function(ctx) {
                        ctx.beginPath(); // Inicia um novo caminho
                        ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
                        ctx.closePath(); // Fecha o caminho
                        ctx.clip(); // Aplica o recorte
                    }
                });
            }
            // Crie um novo bgRect para o grupo de bg rect
            pages['page' + i].background = new Konva.Group({
            });

            ////////// adiciona os grupos a page atual
            let groupBgRect = bgRect.clone();
            pages['page' + i].background.add(groupBgRect);
            let group = pages['page' + i].draw;


            bgLayer.add(pages['page'+ i].background);
            layer.add(group);
            
            
        }
        
    }  
    //#region modo draw
    else if (Gettype === 'draw'){
        pages['page0'] = {
            background : null,
            draw : null,
            layers: {
            }
        
        }
        
        if(foundDraw && foundDraw.drawGroup != null){
            
            pages['page' + currentpage].draw = Konva.Node.create(foundDraw.drawGroup);
            pages['page' + currentpage].layers.layer = foundDraw.drawGroup;
            console.log(pages['page' + currentpage].layers);
            
            DRAWSIZE.width = foundDraw.DRAWSIZE.width;
            DRAWSIZE.height = foundDraw.DRAWSIZE.height
            bgRect.width(DRAWSIZE.width);
            bgRect.height(DRAWSIZE.height);

            /// atualizando os numeros de resize da UX
            getwidthInput.value = DRAWSIZE.width;
            getheightInput.value = DRAWSIZE.height;
            pages['page' + currentpage].draw.clipFunc(function(ctx) {
                    ctx.beginPath();
                    ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
                    ctx.closePath();
                    ctx.clip();
            });
            
            ////////////// pegando as linhas salvas e recriando
            if (pages['page' + currentpage].draw.children.length < 1){
                StartBrush('assets/brush/default.png','#000');
            }
            pages['page' + currentpage].draw.children.forEach(child => {
                
                
                StartBrush(child.attrs.texturepath).then(response => {
                    currentBrush = response
                    
                    if (child.attrs.customClassName === 'ShapeLine'){
                        
                        child.setAttr('customTexture', currentBrush);
                        
                        child.sceneFunc(function(ctx) {
                            ctx.beginPath();
                            
                            const points = child.attrs.points;
                            
                            if (points != null && points.length >= 2){
                                ctx.moveTo(points[0], points[1]);
                                for(let i = 2; i < points.length; i += 2){
                                    ctx.lineTo(points[i], points[i + 1]);
                                }
                            }
                            ctx.strokeStyle = child.attrs.strokeColor;
                            ctx.lineWidth = child.attrs.lineWidth;
                            ctx.lineCap = child.attrs.lineCap;
                            ctx.lineJoin = child.attrs.lineJoin;
                            ctx.globalCompositeOperation = child.attrs.globalCompositeOperation;
                            let brushct = child.attrs.customTexture.getContext('2d');
                            
                            brushct.globalCompositeOperation = 'source-in';
                            brushct.fillStyle = child.attrs.strokeColor;
                            brushct.fillRect(0,0,child.attrs.customTexture.width,child.attrs.customTexture.height);
                            brushct.globalCompositeOperation = 'source-over';
                            
                            const space = Math.max(0.1, child.attrs.lineWidth * 0.5);
                            
                            for (let i = 2; i < points.length - 2; i+= 2){
                                
                                const x1 = points[i];
                                const y1 = points[i + 1];
                                const x2 = points[i + 2];
                                const y2 = points[i + 3];

                                const dx = x2 - x1;
                                const dy = y2 - y1;
                                const distance = Math.hypot(dx,dy);
                                const angle = Math.atan2(dy, dx);
                                //////// math cell e max > max compara o primeiro valor e retorna o maior
                                // math cell arredonda pra cima 0.1 vira 1.
                                const steps = Math.max(1, Math.ceil(distance / space));8
                                
                                //for (let j = 0; j < steps; j++){
                                    //const t = j / steps;
                                    //const xlerp = x1 + dx * t;
                                    //const ylerp = y1 + dy * t;
                                    //
                                    //
                                    //ctx.save();
                                    ////ctx.setTransform(1,0,0,1,0,0);

                                    //ctx.translate(xlerp, ylerp);
                                    //ctx.rotate(angle);

                                    //ctx.drawImage(child.attrs.customTexture,
                                    //    -child.attrs.lineWidth / 2,
                                    //    -child.attrs.lineWidth / 2,
                                    //    child.attrs.lineWidth,
                                    //    child.attrs.lineWidth
                                    //);
                                    //ctx.restore();
                                
                                //}
                            }

                            ctx.fillStrokeShape(child);
                            ctx.stroke();
                        });
                        
                    }
                });
            });
            
        }
        else{
            StartBrush('assets/brush/default.png','#000');
            
            pages['page' + currentpage].draw = new Konva.Group({
                clipFunc: function(ctx) {
                    ctx.beginPath(); // Inicia um novo caminho
                    ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
                    ctx.closePath(); // Fecha o caminho
                    ctx.clip(); // Aplica o recorte
                }
            });
        }
        

        // Crie um novo bgRect para o grupo de bg rect
        pages['page' + currentpage].background = new Konva.Group({
        });

        ////////// adiciona os grupos a page atual
        let groupBgRect = pages['page' + currentpage].background;
        let group = pages['page' + currentpage].draw;

        pages['page' + currentpage].background.add(bgRect); // Adicione o novo retângulo ao grupo


        bgLayer.add(groupBgRect);
        layer.add(group);

    }
}

let layer = new Konva.Layer();

stage.add(bgLayer);
stage.add(layer);

StartInitWithType(layer,bgLayer);
console.log(stage.getLayers());
let group = pages['page' + currentpage].draw;

//#region  VARIAVEIS

let isDrawing = false;
let TexturedLine;

let autosize = true;
let autoSizeSensi = 3;

let current_tool = 'pen';

let composite = 'source-over';

let undoHistory = [];
let redoHistory = [];

let startpos = {x: 0,y:0};
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
const sizePicker = document.getElementById('sizePicker');

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
function set_current_tool(tool) {
    // Lista de ferramentas válidas
    const validTools = ['pen', 'eraser', 'line', 'rectangle', 'circle','select','text'];
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

function set_current_page(index){

    for (let i = 0; i < pagesDiv.children.length; i++){
        currentpage = index;
        pagesDiv.children[i].style.color = 'black';
        if (i != currentpage){
            pagesDiv.children[i].style.color = 'blue';
            pages['page' + i].draw.hide();
            pages['page' + i].background.hide();
            
        }else{
            pagesDiv.children[i].style.color = 'green';
            pages['page' + i].draw.show();
            pages['page' + i].background.show();
            group = pages['page' + i].draw;
        }
        
    }

}

//#region ADD LAYER
let layerList = stage.getLayers();
let currentlayer = 0;
function createUXlayer() {
    const layerGrid = document.getElementById('layerGrid');
    if (!layerGrid) {
        console.error('Elemento #layerGrid não encontrado.');
        return;
    }

    const layerCell = document.createElement('div');
    layerCell.id = 'layerCell'; // usa class, id é pra ser único
    // label
    const ratio = document.createElement('input');
    ratio.type = 'radio';
    ratio.value = currentlayer;
    ratio.name = 'layers';

    const label = document.createElement('label');
    label.textContent = currentlayer;
    // preview
    const preview = document.createElement('img');
    preview.src = 'assets/drawing.png';
    preview.id = 'previewLayer';

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
    const move = makeButton('move', 'Reposicionar');
    const hide = makeButton('hidden', 'Esconder');
    const clip = makeButton('inkmaker', 'Clip');
    const del = makeButton('clear', 'Deletar');
    // joga tudo no layerCell
    layerCell.appendChild(ratio);
    layerCell.appendChild(label);
    layerCell.appendChild(preview);
    layerCell.appendChild(move);
    layerCell.appendChild(hide);
    layerCell.appendChild(clip);
    layerCell.appendChild(del);
    ratio.checked = true;
    group = pages['page' + currentpage].draw;
    // e finalmente coloca no grid
    layerGrid.appendChild(layerCell);
    layerCell.addEventListener('click', (event) => {
        ratio.checked = true;
    });
    ratio.addEventListener('change', (event) => {
        if (event.target.checked){
            console.log(event.target.value);
            
        }
    });
    

    del.onclick = () => {

        if (label.textContent === '0' || ratio.checked === false) {
            return;
        }
        layerList[currentlayer].remove();
        currentlayer -= 1
        layerList = stage.getLayers();
        console.log(currentlayer);
        layerGrid.removeChild(layerCell);
        layerGrid.children[currentlayer].children[0].checked = true
        console.log('deletado > ',layerList);
        
    }

}

for (let i = 0; i < layerList.length; i++) {
    currentlayer = i;
    createUXlayer();
}

function addLayer(imagedata = ''){
    const newLayer = new Konva.Layer();
    
    
    if(imagedata === ''){

    }
    newLayer.clipFunc(function(ctx){
        ctx.beginPath();
        ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height);
        ctx.closePath();
        ctx.clip();
        
    });
    pages['page' + currentpage].draw = newLayer;

    stage.add(newLayer);
    layerList = stage.getLayers();
    console.log(layerList);
    currentlayer = layerList.length - 1;
    group = pages['page' + currentpage].draw;
    createUXlayer();

}


//#region ZOOM
stage.container().addEventListener('wheel', function(e) {
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

stage.container().addEventListener('touchmove', function(e) {
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

        // Aplica escala e rotação
        stage.scale({ x: newScale, y: newScale });
        stage.rotation(newRotation);

        // CORREÇÃO: Rotaciona o ponto de referência pelo ângulo aplicado
        const rad = angleDiff;
        const rotatedPoint = {
            x: stagePoint.x * Math.cos(rad) - stagePoint.y * Math.sin(rad),
            y: stagePoint.x * Math.sin(rad) + stagePoint.y * Math.cos(rad)
        };

        // Calcula a nova posição considerando a rotação do ponto de referência
        stage.position({
            x: midPoint.x - rotatedPoint.x * newScale + dxMid,
            y: midPoint.y - rotatedPoint.y * newScale + dyMid
        });

        stage.batchDraw();

        lastDist = dist;
        lastMidPoint = midPoint;
        lastAngle = angle;
    }
}, { passive: false });


window.addEventListener('resize', () => {
    if (drawContainer) {
        stage.width(drawContainer.offsetWidth);
        stage.height(drawContainer.offsetHeight);
        stage.batchDraw();
    }
});
//#region START TOUCH OR MOUSE
stage.on('mousedown touchstart', function(e) {
    if (e.target.className === 'Text') {
        return; // só deixa o Konva lidar com o drag
    }
    // Verifica se é um evento de toque e se há mais de um dedo na tela
    if (e.evt.touches && e.evt.touches.length > 1) {
        return; // Não inicia o desenho se for um gesto de múltiplos toques (como pinch-to-zoom)
    }

    isDrawing = true;
    const pos = getGlobalMousePos();
    startpos = pos;
    

    if (current_tool == 'pen' || current_tool == 'eraser'){



        TexturedLine = new Konva.Shape({
            strokeColor: colorPicker.value,
            lineWidth: autosize ? sizePicker.value / stage.scaleX() * autoSizeSensi : sizePicker.value,
            globalCompositeOperation: composite,
            lineCap: 'round',
            lineJoin: 'round',
            customTexture: currentBrush,
            texturepath: brushpath,
            points: [],
            customClassName: 'ShapeLine',
            listening: false,
            sceneFunc: function(ctx, shape){
                ctx.beginPath();
                const points = shape.attrs.points;
                
                ///////// math max compara o valor 0.1 (ou qualquer outro) e retorna o maior numero.
                const space = Math.max(0.1, shape.attrs.lineWidth * 0.5);

                if (points.length >= 2){ // precisa de pelo menos x,y
                    ctx.moveTo(points[0], points[1]); // primeiro ponto
                    for (let i = 2; i < points.length; i += 2){ // pula de 2 em 2
                        ctx.lineTo(points[i], points[i + 1]);
                        
                    }
                }
                ctx.lineWidth = shape.attrs.lineWidth;
                ctx.lineCap = shape.attrs.lineCap;
                ctx.lineJoin = shape.attrs.lineJoin;
                ctx.globalCompositeOperation = shape.attrs.globalCompositeOperation;
                let brushct = shape.attrs.customTexture.getContext('2d');
                
                brushct.globalCompositeOperation = 'source-in';
                brushct.fillStyle = shape.attrs.strokeColor;
                brushct.fillRect(0,0,shape.attrs.customTexture.width,shape.attrs.customTexture.height);
                brushct.globalCompositeOperation = 'source-over';
                ////// gerando a textura na linha
                for (let i = 2; i < points.length - 2; i+= 2){
                    const x1 = points[i];
                    const y1 = points[i + 1];
                    const x2 = points[i + 2];
                    const y2 = points[i + 3];

                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const distance = Math.hypot(dx,dy);
                    const angle = Math.atan2(dy, dx);
                    //////// math cell e max > max compara o primeiro valor e retorna o maior
                    // math cell arredonda pra cima 0.1 vira 1.
                    const steps = Math.max(1, Math.ceil(distance / space));

                    //for (let j = 0; j < steps; j++){
                        //const t = j / steps;
                        //const xlerp = x1 + dx * t;
                        //const ylerp = y1 + dy * t;

                        //ctx.save();
                        ////ctx.setTransform(1,0,0,1,0,0);
                        //ctx.translate(xlerp, ylerp);
                        //ctx.rotate(angle);
                        //ctx.drawImage(shape.attrs.customTexture,
                        //    -shape.attrs.lineWidth / 2,
                        //    -shape.attrs.lineWidth / 2,
                        //    shape.attrs.lineWidth,
                        //    shape.attrs.lineWidth
                        //);
                        //ctx.restore();
                    
                    //}

                }
                ctx.fillStrokeShape(shape);
                ctx.stroke();
                
            }

        });
        group.add(TexturedLine);
    }

    else if (current_tool == 'rectangle'){
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
    else if (current_tool == 'select'){
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
    else if (current_tool == 'line'){
        lastLineTool = new Konva.Line({
            stroke: colorPicker.value,
            strokeWidth: autosize ? sizePicker.value / stage.scaleX() * autoSizeSensi : sizePicker.value,
            globalCompositeOperation: composite,
            points: [startpos.x, startpos.y,startpos.x,startpos.y],
            lineCap: 'round',
            lineJoin: 'round'
        });
        group.add(lastLineTool);
    }
    else if (current_tool == 'text' && draggingText === false){
        lastText = new Konva.Text({
            x: startpos.x,
            y: startpos.y,
            text: 'New text',
            fontSize: 12,
            draggable: true
        });
        group.add(lastText);
        lastText.moveToTop();
        showDivText();

        // Adiciona os eventos de drag aqui
        lastText.on('dragstart', function() {
            draggingText = true;
        });
        lastText.on('dragend', function() {
            draggingText = false;
        });
    }
});
//#region MOUSE TOUCH MOVE AGAIN
stage.on('mousemove touchmove', function(e) {
    if (!isDrawing) {
        return;
    }
    const pos = getGlobalMousePos();

    const x = Math.min(startpos.x, pos.x);
    const y = Math.min(startpos.y, pos.y);
    const w = Math.abs(pos.x - startpos.x);
    const h = Math.abs(pos.y - startpos.y);

    if (current_tool == 'pen' || current_tool == 'eraser' && TexturedLine){
        // Verifica se é um evento de toque e se há mais de um dedo na tela
        if (e.evt.touches && e.evt.touches.length > 1) {
            return; // Não inicia o desenho se for um gesto de múltiplos toques (como pinch-to-zoom)
        }
        TexturedLine.attrs.points.push(pos.x, pos.y);
        
        stage.batchDraw();
    } 
    else if (current_tool == 'circle' && lastCicle){
        lastCicle.x(x);
        lastCicle.y(y);
        lastCicle.radiusX(w);
        lastCicle.radiusY(h);
    }
    else if (current_tool == 'rectangle' && lastRect){
        // atualizar posição e tamanho dinamicamente usando pos (não pos)

        lastRect.x(x);
        lastRect.y(y);
        lastRect.width(w);
        lastRect.height(h);


    } 
    else if (current_tool == 'select' && lastSelectBox){

        if (posing == false) {
            lastSelectBox.x(x);
            lastSelectBox.y(y);
            lastSelectBox.width(w);
            lastSelectBox.height(h);
        }
    }
    else if (current_tool == 'line' && lastLineTool){
        lastLineTool.points([startpos.x, startpos.y,pos.x,pos.y]);

    }

});

//#region MOUSE UP
stage.on('touchend', function(e){
    isDrawing = false;
    dragpos = null;
    if (e.evt.touches.length < 2) {
        lastDist = 0;
        lastMidPoint = null;
    }
    AddactionToHistory();

    
    
});
stage.on('mouseup', function(e) {
    isDrawing = false;
    dragpos = null;
    if (lastSelectBox) {
        const selectionRect = lastSelectBox.getClientRect();
        const selectedNodes = [];

        group.children.forEach(element => {
            if (element === lastSelectBox) return;

            // Verifica se o elemento está dentro da área de seleção
            if (Konva.Util.haveIntersection(selectionRect, element.getClientRect())) {
                selectedNodes.push(element);
            }
        });

        // Agora você tem os 'selectedNodes' para fazer o que precisar (ex: mover, deletar, etc)
        // Por enquanto, vamos apenas pintá-los de vermelho para confirmar
        selectedNodes.forEach(node => {
            node.stroke('red');
        });

        console.log('Itens selecionados:', selectedNodes.length);

        lastSelectBox.destroy();
        lastSelectBox = null;
    }

    AddactionToHistory();

    stage.batchDraw();
});


function clearCanvas() {
    group.destroyChildren(); // Remove todas as linhas do grupo
}


//#region SAVE
function saveCanvas() {
    ////// salvando as coordenadas da tela
    const laspos = stage.position();
    const lascale = stage.scaleX();
    const lasrotation = stage.rotation();


    ////// resetando as coordenadas da tela pra pos inicial

    stage.position({x:0,y:0});
    stage.scale({x:1,y:1});
    layer.draw();
    stage.rotation(0);
    bgLayer.draw();
    group.draw();
    
    if(Gettype == 'draw'){

        if (foundDraw){
            //// guardamos a url pra mera vizualização na galeria;
            foundDraw.drawURL = stage.toDataURL({
                mimeType: "image/png",
                pixelRatio: 3,   // 3x mais nítido
                width: DRAWSIZE.width,
                height: DRAWSIZE.height
            });
            //// aqui que guardamos grupos
            
            foundDraw.drawGroup = pages['page0'].draw.toJSON();

            foundDraw.DRAWSIZE.width = DRAWSIZE.width;
            foundDraw.DRAWSIZE.height = DRAWSIZE.height;
        
        }
        
        
        localStorage.setItem('draws-saveds',JSON.stringify(getDrawList));

    } else if (Gettype == 'manga') {
        alert('manga salvo com exito');
        const getPages = getManga.chapters.find(chap => chap.number == chapID).pages || [];

        for (let i = 0; i <= pagenumbers; i++) {
            getPages[i] = pages['page' + i].draw.toJSON(); 
        }
        
        getManga.chapters.find(chap => chap.number == chapID).pages = getPages;

        localStorage.setItem('mangas', JSON.stringify(getMangaList));
    }
    //////// resturando as cordenadas da tela
    stage.position(laspos);
    stage.scale({x:lascale,y:lascale});
    layer.draw();
    stage.rotation(lasrotation);
    bgLayer.draw();
    group.draw();
}
//#region ADD TO HISTORY
function AddactionToHistory() {
    if (TexturedLine){
        undoHistory.push(TexturedLine);
        TexturedLine = null;
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
function undo(){
    const lastAction = undoHistory.pop();
    

    if (lastAction) {
        lastAction.remove(); // Remove a última linha do grupo
        redoHistory.push(lastAction); // Adiciona a ação removida ao histórico de refazer
        stage.batchDraw();

        
    }
    
}

//#region REDO
function redo(){
    const actionToRedo = redoHistory.pop();
    if (actionToRedo) {
        group.add(actionToRedo); // Adiciona a ação de volta ao grupo
        undoHistory.push(actionToRedo); // Adiciona a ação de volta ao histórico de desfazer
        stage.batchDraw();
    }
}


//#region MOUSE LEAVE
stage.on('touchcancel', function(e) {
    if (e.evt.touches.length < 2) {
        lastDist = 0;
        lastMidPoint = null;
    }
});
stage.on('mouseleave ', function(e) {
    lastLine = null;
    isDrawing = false;

    AddactionToHistory();

    if (lastSelectBox) {
        lastSelectBox.destroy();
        lastSelectBox = null;

    }
});
