//////////////
////////// talve ainda não ficou perceptvel que erros de digitção e gramatica são comuns por aqui.
////////////////////////

let DRAWSIZE = {
    width: 600,
    height: 800
}

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

const bgLayer = new Konva.Layer();

const bgRect = new Konva.Rect({
    height: DRAWSIZE.height,
    width: DRAWSIZE.width,
    stroke: 'black',
    strokeWidth: 1,
    fill: '#ffff'
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
function StartInitWithType(layer,bgLayer){
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
                const clip = new Konva.Group({
                    clipFunc: function(ctx) {
                        ctx.beginPath(); // Inicia um novo caminho
                        ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
                        ctx.closePath(); // Fecha o caminho
                        ctx.clip(); // Aplica o recorte
                    }
                })
                clip.add(PagesJson);
                PagesJson = clip;

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

            console.log(PagesJson);
            
            pages['page' + pagenumbers] = {
                    background : null,
                    draw : null
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

    } else if (Gettype === 'draw'){
        pages['page0'] = {
            background : null,
            draw : null
        }

        pages['page' + currentpage].draw = new Konva.Group({
            clipFunc: function(ctx) {
                ctx.beginPath(); // Inicia um novo caminho
                ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
                ctx.closePath(); // Fecha o caminho
                ctx.clip(); // Aplica o recorte
            }
        });

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

const layer = new Konva.Layer();


stage.add(bgLayer);
stage.add(layer);

StartInitWithType(layer,bgLayer);

let group = pages['page' + currentpage].draw;

////////////////// Variaveis


let isDrawing = false;
let lastLine;
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

const colorPicker = document.getElementById('colorPicker');
const sizePicker = document.getElementById('sizePicker');

function getGlobalMousePos() {
    const mousePos = stage.getPointerPosition();
    const scale = stage.scaleX(); // Assuming uniform scaling
    const pos = stage.position();
    return {
        x: (mousePos.x - pos.x) / scale,
        y: (mousePos.y - pos.y) / scale
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
    currentpage = index;

    for (let i = 0; i < pagesDiv.children.length; i++){
        pagesDiv.children[i].style.color = 'black';
        if (i != currentpage){
            pagesDiv.children[i].style.color = 'blue';
            pages['page' + i].draw.hide();
            pages['page' + i].background.hide();
            console.log(pages);
            
        }else{
            pagesDiv.children[i].style.color = 'green';
            pages['page' + i].draw.show();
            pages['page' + i].background.show();
            group = pages['page' + i].draw;
        }
        
    }

}

function undo(){
    const lastAction = undoHistory.pop();
    if (lastAction) {
        lastAction.remove(); // Remove a última linha do grupo
        redoHistory.push(lastAction); // Adiciona a ação removida ao histórico de refazer
        layer.draw();
    }
}

function redo(){
    const actionToRedo = redoHistory.pop();
    if (actionToRedo) {
        group.add(actionToRedo); // Adiciona a ação de volta ao grupo
        undoHistory.push(actionToRedo); // Adiciona a ação de volta ao histórico de desfazer
        layer.draw();
    }
}

function clearCanvas() {
    group.destroyChildren(); // Remove todas as linhas do grupo
}

function saveCanvas() {
    ////// salvando as coordenadas da tela
    const laspos = stage.position();
    const lascale = stage.scaleX();

    ////// resetando as coordenadas da tela pra pos inicial

    stage.position({x:0,y:0});
    stage.scale({x:1,y:1});
    layer.draw();
    bgLayer.draw();
    group.draw();
    
    if(Gettype == 'draw'){
        // Obtém a URL dos dados da imagem com alta resolução
        const dataURL = stage.toDataURL({pixelRatio: 3,height:DRAWSIZE.height,width:DRAWSIZE.width});
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = dataURL;
        link.click();
        //////// salvando a tela de desenho no store
        let getDrawsURL = JSON.parse(localStorage.getItem('draws-saveds')) || [];
        getDrawsURL.push(dataURL);
        /////////// passando a lista de url pro draws
        localStorage.setItem('draws-saveds', JSON.stringify(getDrawsURL));

    } else if (Gettype == 'manga'){

        for (let i = 0; i <= pagenumbers; i++){
            const getPages = getManga.chapters.find(chap => chap.number == chapID).pages || [];

            if (getPages[i]){
                getPages[i] = pages['page' + i].draw.toJSON();
            }else{
                getPages.push(pages['page' + i].draw.toJSON());
            }
            
            localStorage.setItem('mangas', JSON.stringify(getMangaList));
            
        }

    }
    //////// resturando as cordenadas da tela
    stage.position(laspos);
    stage.scale({x:lascale,y:lascale});
    layer.draw();
    bgLayer.draw();
    group.draw();




}

function AddactionToHistory() {
    if (lastLine) {
        undoHistory.push(lastLine);
        lastLine = null;
    }
    if (lastRect) {
        undoHistory.push(lastRect);
        lastRect = null;
    }
    if (lastCicle) {
        undoHistory.push(lastCicle);
        lastCicle = null;
    }
    if (lastLineTool){
        undoHistory.push(lastLineTool);
        lastLineTool = null;
    }
    if (lastText){
        undoHistory.push(lastText);
    }
}

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


let lastDist = 0;
let lastMidPoint = null;

stage.container().addEventListener('touchmove', function(e) {
    if (e.touches.length === 2) {
        isDrawing = false;
        e.preventDefault();

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // distância atual entre os dois dedos
        const dist = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
        );

        // ponto médio entre os dedos
        const midPoint = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };

        if (!lastDist) {
            lastDist = dist;
            lastMidPoint = midPoint;
            return;
        }

        const oldScale = stage.scaleX();
        const scaleBy = dist / lastDist;

        // Interpolação suave do zoom
        const newScale = Math.max(0.1, Math.min(60, oldScale * scaleBy));

        // Converte o ponto médio para coordenadas relativas da stage
        const stagePoint = {
            x: (midPoint.x - stage.x()) / oldScale,
            y: (midPoint.y - stage.y()) / oldScale
        };

        stage.scale({ x: newScale, y: newScale });

        // Ajusta a posição da stage para manter o zoom centrado no ponto médio
        stage.position({
            x: midPoint.x - stagePoint.x * newScale,
            y: midPoint.y - stagePoint.y * newScale
        });

        stage.batchDraw();

        lastDist = dist;
        lastMidPoint = midPoint;

        console.log("Zoom pinch:", newScale);
    }
}, { passive: false });


window.addEventListener('resize', () => {
    if (drawContainer) {
        stage.width(drawContainer.offsetWidth);
        stage.height(drawContainer.offsetHeight);
        stage.batchDraw();
    }
});

stage.on('mousedown touchstart', function(e) {
    if (e.target.className === 'Text') {
        return; // só deixa o Konva lidar com o drag
    }
    isDrawing = true;
    const pos = getGlobalMousePos();
    startpos = pos;

    if (current_tool == 'pen' || current_tool == 'eraser'){
        lastLine = new Konva.Line({
            stroke: colorPicker.value,
            strokeWidth: autosize ? sizePicker.value / stage.scaleX() * autoSizeSensi : sizePicker.value,
            globalCompositeOperation: composite,
            points: [pos.x, pos.y],
            lineCap: 'round',
            lineJoin: 'round'
        });
        
        group.add(lastLine);
        
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

stage.on('mousemove touchmove', function() {
    if (!isDrawing) {
        return;
    }
    const pos = getGlobalMousePos();

    const x = Math.min(startpos.x, pos.x);
    const y = Math.min(startpos.y, pos.y);
    const w = Math.abs(pos.x - startpos.x);
    const h = Math.abs(pos.y - startpos.y);

    if (current_tool == 'pen' || current_tool == 'eraser' && lastLine){
        const newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
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
        group.children.forEach(element => {
            if (element === lastSelectBox) return;
            
            if (element instanceof Konva.Line) {
                if (Konva.Util.haveIntersection(lastSelectBox.getClientRect(), element.getClientRect())) {
                    element.stroke('red');
                } else {
                    element.stroke('black');
                }
            }
        });
    }
    else if (current_tool == 'line' && lastLineTool){
        lastLineTool.points([startpos.x, startpos.y,pos.x,pos.y]);

    }

});
stage.on('mouseup touchend', function() {
    isDrawing = false;
    dragpos = null;
    
    AddactionToHistory();
    
    if (lastSelectBox) {
        lastSelectBox.destroy();
        lastSelectBox = null;
    }
    lastDist = 0; // reseta quando os dedos soltam

    layer.batchDraw();
});

stage.on('mouseleave touchcancel', function() {
    lastLine = null;
    isDrawing = false;

    AddactionToHistory();

    if (lastSelectBox) {
        lastSelectBox.destroy();
        lastSelectBox = null;

    }
    lastDist = 0; // reseta quando os dedos soltam
});
