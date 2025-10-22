//#region INITIALIZATION
const drawlist = document.getElementById('drawlist');

window.onload = function() {
    localStorage.setItem('type', 'draw');
    get_draws();
}

function get_draws(){

    drawlist.innerHTML = '';

    //////////////////////// aqui começa o load de draw

    let getDrawList = JSON.parse(localStorage.getItem('draws-saveds')) || [];

    getDrawList.forEach((draw) => {
        const DrawCard = document.createElement('div');
        const newPicture = document.createElement('img');
        const nameDraw = document.createElement('h1');
        const downloadbtn = document.createElement('button');
        if (draw.drawURL != null){
            newPicture.src = draw.drawURL;
        }else{
            newPicture.src = 'assets/drawing.png';
        }
        
        nameDraw.textContent = draw.nameDraw;
        
        downloadbtn.textContent = 'baixar';

        downloadbtn.onclick = () => {
            const link = document.createElement('a');
            link.href = draw.drawURL;
            link.download = draw.nameDraw;
            link.click();
        }

        DrawCard.appendChild(downloadbtn);
        DrawCard.appendChild(newPicture);
        DrawCard.appendChild(nameDraw);
        drawlist.appendChild(DrawCard);

        newPicture.addEventListener('click', () =>{
            localStorage.setItem('type', 'draw');
            window.location.href = "draw-screen.html?id=" + draw.id;
        });

    });




    //////////////////////// aqui começa o load de manga

    let getMangaList = JSON.parse(localStorage.getItem('mangas')) || [];

    getMangaList.forEach((manga) => {

        const MangaCard = document.createElement('div');
        const newPicture = document.createElement('img');
        const nameDraw = document.createElement('h1');
        newPicture.src = 'assets/HQIcon.png';
        nameDraw.textContent = manga.name;

        MangaCard.appendChild(newPicture);
        MangaCard.appendChild(nameDraw);
        drawlist.appendChild(MangaCard);

        MangaCard.addEventListener('click', function(){
            localStorage.setItem('type', 'manga');
            window.location.href = "manga-screen.html?id=" + manga.id;
        });
        createMangaDiv.style.visibility = 'hidden';

    });

}
//#endregion

//#region DRAW MANAGEMENT
function add_draw(){

    const DrawCard = document.createElement('div');
    const newPicture = document.createElement('img');
    const nameDraw = document.createElement('h1');

    let getDrawList = JSON.parse(localStorage.getItem('draws-saveds')) || [];
    
    newPicture.src = 'assets/drawing.png';
    nameDraw.textContent = 'novo desenho > ' + getDrawList.length;

    DrawCard.appendChild(newPicture);
    DrawCard.appendChild(nameDraw);
    drawlist.appendChild(DrawCard);

    const newDraw = {
        id: getDrawList.length,
        nameDraw: 'novo desenho ' + getDrawList.length,
        drawURL: null,
        drawGroup: null,
        DRAWSIZE: {
            width: 600,
            height: 800
        }
    }

    getDrawList.push(newDraw);
    
    
    localStorage.setItem('draws-saveds',JSON.stringify(getDrawList));

    
    

    DrawCard.addEventListener('click', () =>{
        localStorage.setItem('type', 'draw');
        window.location.href = "draw-screen.html?id=" + newDraw.id;
    });
    

    window.location.href = "draw-screen.html?id=" + newDraw.id;
}
//#endregion

//#region MANGA MANAGEMENT
const createMangaDiv = document.getElementById('createMangaDiv');
createMangaDiv.style.visibility = 'hidden';


function ShowCreateMangaDiv(){
    createMangaDiv.style.visibility = 'visible';
}
const sizeDrawCanvaPREV = document.getElementById('sizeDrawCanvaPREV');
const ABSOLUTE = {x: 100, y: 100};

sizeDrawCanvaPREV.width = ABSOLUTE.x;
sizeDrawCanvaPREV.height = ABSOLUTE.y;

const resPagesX = document.getElementById('resPagesX');
const resPagesY = document.getElementById('resPagesY');

resPagesX.addEventListener('input', function() {
    sizeDrawCanvaPREV.width = ABSOLUTE.x + Number(resPagesX.value);
});

resPagesY.addEventListener('input', function() {
    sizeDrawCanvaPREV.height = ABSOLUTE.y + Number(resPagesY.value);
});


const nameManga = document.getElementById('nameManga');

function createManga(){

    const MangaCard = document.createElement('div');
    const newPicture = document.createElement('img');
    const nameDraw = document.createElement('h1');
    let getMangaList = JSON.parse(localStorage.getItem('mangas')) || [];

    newPicture.src = 'assets/HQIcon.png'
    nameDraw.textContent = nameManga.value;

    MangaCard.appendChild(newPicture);
    MangaCard.appendChild(nameDraw);
    drawlist.appendChild(MangaCard);

    createMangaDiv.style.visibility = 'hidden';

    ////////// hora de criar um pacote de hq no local storage
    const newManga = {
        id: getMangaList.length,
        name: nameManga.value,
        chapters: []
    }
    
    getMangaList.push(newManga);
    localStorage.setItem('mangas', JSON.stringify(getMangaList));

    MangaCard.addEventListener('click', function(){
        window.location.href = "manga-screen.html?id=" + newManga.id;
    });
    
}

function cancelCreateManga(){
    createMangaDiv.style.visibility = 'hidden';
}
//#endregion

//#region STORAGE MANAGEMENT
function clearStorage(){
    let confim = window.confirm('isso vai apagar todas as suas obra e desenhos ');
    if (confim == true){
        localStorage.clear();
        window.location.reload();
    }else{
        return;
    }
}
//#endregion