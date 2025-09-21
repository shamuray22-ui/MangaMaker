
const drawlist = document.getElementById('drawlist');

window.onload = function() {
    //this.localStorage.clear();
    get_draws();
}
 
function get_draws(){
    
    const draws = JSON.parse(localStorage.getItem('draws-saveds')) || [];
    drawlist.innerHTML = '';
    
    draws.forEach((imageURL,index) => {

        const DrawCard = document.createElement('div');
        const newPicture = document.createElement('img');
        const nameDraw = document.createElement('h1');
        
        newPicture.src = imageURL;
        nameDraw.textContent = 'novo desenho > ' + index;

        DrawCard.appendChild(newPicture);
        DrawCard.appendChild(nameDraw);
        drawlist.appendChild(DrawCard);
            
    });

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
            window.location.href = "manga-screen.html?id=" + manga.id;
        });
        createMangaDiv.style.visibility = 'hidden';

    });



}

function add_draw(){
    window.location.href = "draw-screen.html";
}

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
    
    newPicture.src = 'assets/HQIcon.png'
    nameDraw.textContent = nameManga.value;

    MangaCard.appendChild(newPicture);
    MangaCard.appendChild(nameDraw);
    drawlist.appendChild(MangaCard);

    createMangaDiv.style.visibility = 'hidden';

    ////////// hora de criar um pacote de hq no local storage
    const newManga = {
        id: drawlist.children.length,
        name: nameManga.value,
        chapters: []
    }
    let getMangaList = JSON.parse(localStorage.getItem('mangas')) || [];
    getMangaList.push(newManga);
    localStorage.setItem('mangas', JSON.stringify(getMangaList));

    MangaCard.addEventListener('click', function(){
        window.location.href = "manga-screen.html?id=" + newManga.id;;
    });
    console.log(localStorage);
    
}

function cancelCreateManga(){
    createMangaDiv.style.visibility = 'hidden';
}

function clearStorage(){
    let confim = window.confirm('isso vai apagar todas as suas obra e desenhos ');
    if (confim == true){
        localStorage.clear();
        window.location.reload();
    }else{
        return;
    }
}
