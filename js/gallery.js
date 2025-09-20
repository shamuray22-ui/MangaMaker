
window.onload = function() {
    get_draws();
}

function get_draws(){
    const drawlist = document.getElementById('drawlist');
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
}

function add_draw(){
    window.location.href = "draw-screen.html";
}

const createMangaDiv = document.getElementById('createMangaDiv');

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
    nameDraw.textContent = 'Nova HQ';

    MangaCard.appendChild(newPicture);
    MangaCard.appendChild(nameDraw);
    drawlist.appendChild(MangaCard);

    MangaCard.addEventListener('click', function(){
        window.location.href = "manga-screen.html";
    });

    createMangaDiv.style.visibility = 'hidden';
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
