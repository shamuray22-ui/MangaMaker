let DRAWSIZE = {
    width: 600,
    height: 800
}

const drawContainer = document.getElementById('draw-canvas');

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

let startpos = {x: 0,y:0};
let dragpos = null;

let lastRect = null;


let selectBox;
let posing = false;

const layer = new Konva.Layer();

const group = new Konva.Group({
    clipFunc: function(ctx) {
        ctx.beginPath(); // Inicia um novo caminho
        ctx.rect(0, 0, DRAWSIZE.width, DRAWSIZE.height); // Define o retângulo de recorte
        ctx.closePath(); // Fecha o caminho
        ctx.clip(); // Aplica o recorte
    }
});

// Crie um novo bgRect para o grupo de bg rect
const groupBgRect = new Konva.Group({
});

groupBgRect.add(bgRect); // Adicione o novo retângulo ao grupo

bgLayer.add(groupBgRect);

stage.add(bgLayer);
stage.add(layer);

layer.add(group);

let isDrawing = false;
let lastLine;

let current_tool = 'pen';

let composite = 'source-over';

let undoHistory = [];
let redoHistory = [];

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
    const validTools = ['pen', 'eraser', 'line', 'rectangle', 'circle','select'];
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
    const laspos = stage.position();
    const lascale = stage.scaleX();
    stage.position({x:0,y:0});
    stage.scale({x:1,y:1});
    layer.draw();
    bgLayer.draw();
    group.draw();
    // Obtém a URL dos dados da imagem com alta resolução
    const dataURL = stage.toDataURL({pixelRatio: 3,height:DRAWSIZE.height,width:DRAWSIZE.width});
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataURL;
    link.click();
    stage.position(laspos);
    stage.scale({x:lascale,y:lascale});
    layer.draw();
    bgLayer.draw();
    group.draw();

}


stage.container().addEventListener('wheel', function(e) {
    e.preventDefault();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    // Calcula o novo scale
    let scaleBy = 1.1;
    let newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

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

window.addEventListener('resize', () => {
    if (drawContainer) {
        stage.width(drawContainer.offsetWidth);
        stage.height(drawContainer.offsetHeight);
        stage.batchDraw();
    }
});

stage.on('mousedown touchstart', function() {
    isDrawing = true;
    const pos = getGlobalMousePos();
    startpos = pos;

    if (current_tool == 'pen' || current_tool == 'eraser'){
        lastLine = new Konva.Line({
            stroke: colorPicker.value,
            strokeWidth: sizePicker.value,
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
    }
    else if (current_tool == 'select'){
        selectBox = new Konva.Rect({
            x: startpos.x,
            y: startpos.y,
            width: 0,
            height: 0,
            fill: 'rgba(0,0,255,0.1)',
            stroke: 'blue',
            dash: [4, 4],
            listening: false
        });
        dragpos = pos;
        group.add(selectBox); // Adiciona ao mesmo grupo dos desenhos
        selectBox.moveToTop();
    }
});

stage.on('mousemove touchmove', function() {
    if (!isDrawing) {
        return;
    }
    const pos = getGlobalMousePos();

    if (current_tool == 'pen' || current_tool == 'eraser' && lastLine){
        const newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
    } else if (current_tool == 'rectangle' && lastRect){
        // atualizar posição e tamanho dinamicamente usando pos (não pos)
        const x = Math.min(startpos.x, pos.x);
        const y = Math.min(startpos.y, pos.y);
        const w = Math.abs(pos.x - startpos.x);
        const h = Math.abs(pos.y - startpos.y);
        lastRect.x(x);
        lastRect.y(y);
        lastRect.width(w);
        lastRect.height(h);


    } 
    else if (current_tool == 'select' && selectBox){

        if (posing == false) {
            const x = Math.min(startpos.x, pos.x);
            const y = Math.min(startpos.y, pos.y);
            const w = Math.abs(pos.x - startpos.x);
            const h = Math.abs(pos.y - startpos.y);
            selectBox.x(x);
            selectBox.y(y);
            selectBox.width(w);
            selectBox.height(h);
        }
    }

});
stage.on('mouseup touchend', function() {
    isDrawing = false;
        dragpos = null;

    if (lastLine) {
        undoHistory.push(lastLine);
        lastLine = null;
    }

    if (lastRect) {
        undoHistory.push(lastRect);
        lastRect = null;
    }

    if (selectBox) {
        selectBox.destroy();
        selectBox = null;
    }



    layer.batchDraw();
});

stage.on('mouseleave touchcancel', function() {
    lastLine = null;
    isDrawing = false;

    if (selectBox) {
        selectBox.destroy();
        selectBox = null;

    }

});
