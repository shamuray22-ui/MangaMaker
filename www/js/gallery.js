//#region INITIALIZATION
const drawlist = document.getElementById('drawlist');

window.onload = function () {
    localStorage.setItem('type', 'draw');
    get_draws();
    
}

async function get_draws() {

    drawlist.innerHTML = '';

    //////////////////////// aqui começa o load de draw
    let drawList = await getDrawList() || [];
    
    
    drawList.forEach((draw) => {
        const DrawCard = document.createElement('div');
        const newPicture = document.createElement('img');
        const nameDraw = document.createElement('h1');
        const downloadbtn = document.createElement('button');
        if (draw.drawURL != null) {
            newPicture.src = draw.drawURL;
        } else {
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

        
        DrawCard.appendChild(newPicture);
        DrawCard.appendChild(nameDraw);
        DrawCard.appendChild(downloadbtn);
        drawlist.appendChild(DrawCard);

        newPicture.addEventListener('click', () => {
            localStorage.setItem('type', 'draw');
            window.location.href = "draw-screen.html?id=" + draw.id;
        });

    });

    //////////////////////// aqui começa o load de manga

    let mangaList = await getMangasList() || [];

    mangaList.forEach((manga) => {

        const MangaCard = document.createElement('div');
        const newPicture = document.createElement('img');
        const downloadMangaBtn = document.createElement('button');
        downloadMangaBtn.textContent = 'Baixar Manga';
        const nameDraw = document.createElement('h1');
        newPicture.src = 'assets/HQIcon.png';
        nameDraw.textContent = manga.name;

        MangaCard.appendChild(newPicture);
        MangaCard.appendChild(nameDraw);
        MangaCard.append(downloadMangaBtn);
        drawlist.appendChild(MangaCard);

        newPicture.addEventListener('click', function () {
            localStorage.setItem('type', 'manga');
            window.location.href = "manga-screen.html?id=" + manga.id;
        });
        downloadMangaBtn.onclick = () =>{
            downloadManga(manga);
        }

        createMangaDiv.style.visibility = 'hidden';

    });

}
//#endregion

//#region DRAW MANAGEMENT
async function add_draw() {

    const DrawCard = document.createElement('div');
    const newPicture = document.createElement('img');
    const nameDraw = document.createElement('h1');
    
    let drawListData = await getDrawList() || [];
    
    newPicture.src = 'assets/drawing.png';
    nameDraw.textContent = 'novo desenho > ' + drawListData.length;

    DrawCard.appendChild(newPicture);
    DrawCard.appendChild(nameDraw);
    drawlist.appendChild(DrawCard);

    const newDraw = {
        id: drawListData.length,
        nameDraw: 'novo desenho ' + drawListData.length,
        drawURL: null,
        layers: [
        ],

        DRAWSIZE: {
            width: 600,
            height: 800
        }
    }

    drawListData.push(newDraw);
    

    addToDrawList(drawListData);




    DrawCard.addEventListener('click', () => {
        localStorage.setItem('type', 'draw');
        window.location.href = "draw-screen.html?id=" + newDraw.id;
    });


    //window.location.href = "draw-screen.html?id=" + newDraw.id;
}
//#endregion

//#region MANGA MANAGEMENT
const createMangaDiv = document.getElementById('createMangaDiv');
createMangaDiv.style.visibility = 'hidden';


function ShowCreateMangaDiv() {
    createMangaDiv.style.visibility = 'visible';
}
const sizeDrawCanvaPREV = document.getElementById('sizeDrawCanvaPREV');
const ABSOLUTE = { x: 100, y: 100 };

sizeDrawCanvaPREV.width = ABSOLUTE.x;
sizeDrawCanvaPREV.height = ABSOLUTE.y;

const resPagesX = document.getElementById('resPagesX');
const resPagesY = document.getElementById('resPagesY');

resPagesX.addEventListener('input', function () {
    sizeDrawCanvaPREV.width = ABSOLUTE.x + Number(resPagesX.value);
});

resPagesY.addEventListener('input', function () {
    sizeDrawCanvaPREV.height = ABSOLUTE.y + Number(resPagesY.value);
});


const nameManga = document.getElementById('nameManga');

async function createManga() {

    const MangaCard = document.createElement('div');
    const newPicture = document.createElement('img');
    const nameDraw = document.createElement('h1');
    const downloadManga = document.createElement('button');
    downloadManga.textContent = 'Baixar Manga';
    let mangaList = await getMangasList() || [];

    newPicture.src = 'assets/HQIcon.png'
    nameDraw.textContent = nameManga.value;

    MangaCard.appendChild(newPicture);
    MangaCard.appendChild(nameDraw);
    MangaCard.append(downloadManga);
    drawlist.appendChild(MangaCard);

    createMangaDiv.style.visibility = 'hidden';

    ////////// hora de criar um pacote de hq no local storage
    const newManga = {
        id: mangaList.length,
        name: nameManga.value,
        chapters: []
    }

    mangaList.push(newManga);

    await addToMangasList(mangaList);

    MangaCard.addEventListener('click', function () {
        window.location.href = "manga-screen.html?id=" + newManga.id;
    });

}

function downloadManga(manga) {

    let getMangaList = JSON.parse(localStorage.getItem('mangas')) || [];
    let getrightmanga = getMangaList.find(current => current.id === manga.id);

    if (getrightmanga) {
        getrightmanga.chapters.forEach(chap => {
            console.log(chap);
            
            chap.pages?.forEach(page => {
                const link = document.createElement('a');
                link.href = page.PageURL;
                link.download = chap.title + ' '+chap.pagesCount;
                link.click();

            });
        });
    }
}

function loadjson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async function(readerEvent) {
            const content = readerEvent.target.result;
            try {
                const data = JSON.parse(content);
                if (data.draws && data.mangas) {
                    await addToDrawList(data.draws);
                    await addToMangasList(data.mangas);
                    window.location.reload();
                } else {
                    alert('Arquivo JSON inválido.');
                }
            } catch (error) {
                alert('Erro ao carregar o arquivo JSON.');
                console.error(error);
            }
        }
        reader.readAsText(file);
    }
    input.click();
}

async function savejson() {
    const data = {
        draws: await getDrawList() || [],
        mangas: await getMangasList() || []
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'MangaMaker_backup.json';
    a.click();

    URL.revokeObjectURL(url);
}


function cancelCreateManga() {
    createMangaDiv.style.visibility = 'hidden';
}
//#endregion

//#region STORAGE MANAGEMENT
function clearStorage() {
    let confim = window.confirm('isso vai apagar todas as suas obra e desenhos ');
    if (confim == true) {
        localforage.clear();
        localStorage.clear();
        window.location.reload();
    } else {
        return;
    }
}
//#endregion