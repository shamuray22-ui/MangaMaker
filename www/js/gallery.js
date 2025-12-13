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
        const deletebtn = document.createElement('button');
        deletebtn.textContent = 'excluir';
        deletebtn.style.backgroundColor = '#ff6b6b';
        deletebtn.style.color = 'white';

        downloadbtn.onclick = () => {
            // Converte data URL para blob para funcionar em mobile
            if (draw.drawURL) {
                fetch(draw.drawURL)
                    .then(res => res.blob())
                    .then(blob => {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = draw.nameDraw + '.png';
                        link.click();
                        URL.revokeObjectURL(url);
                    })
                    .catch(() => {
                        alert('Erro ao baixar o desenho. Σ(っ °Д °;)っ');
                    });
            } else {
                alert('Este desenho ainda não foi salvo. Σ(っ °Д °;)っ');
            }
        }

        deletebtn.onclick = () => {
            if (confirm('Tem certeza que deseja excluir "' + draw.nameDraw + '"?')) {
                deleteDraw(draw.id);
            }
        }

        
        DrawCard.appendChild(newPicture);
        DrawCard.appendChild(nameDraw);
        DrawCard.appendChild(downloadbtn);
        DrawCard.appendChild(deletebtn);
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
        const deleteMangaBtn = document.createElement('button');
        deleteMangaBtn.textContent = 'excluir';
        deleteMangaBtn.style.backgroundColor = '#ff6b6b';
        deleteMangaBtn.style.color = 'white';
        const nameDraw = document.createElement('h1');
        newPicture.src = 'assets/HQIcon.png';
        nameDraw.textContent = manga.name;

        MangaCard.appendChild(newPicture);
        MangaCard.appendChild(nameDraw);
        MangaCard.append(downloadMangaBtn);
        MangaCard.append(deleteMangaBtn);
        drawlist.appendChild(MangaCard);

        newPicture.addEventListener('click', function () {
            localStorage.setItem('type', 'manga');
            window.location.href = "manga-screen.html?id=" + manga.id;
        });
        downloadMangaBtn.onclick = () =>{
            downloadManga(manga);
        }

        deleteMangaBtn.onclick = () => {
            if (confirm('Tem certeza que deseja excluir "' + manga.name + '"?')) {
                deleteManga(manga.id);
            }
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
    

    await addToDrawList(drawListData);




    DrawCard.addEventListener('click', () => {
        localStorage.setItem('type', 'draw');
        window.location.href = "draw-screen.html?id=" + newDraw.id;
    });
    window.location.href = "draw-screen.html?id=" + newDraw.id;
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

async function downloadManga(manga) {

    let getMangaList = await getMangasList() || [];
    let getrightmanga = getMangaList.find(current => current.id === manga.id);
    console.log(getrightmanga);
    if (getrightmanga) {
        
        getrightmanga.chapters.forEach(chap => {
            console.log(chap);
            
            // Itera sobre o número de páginas, não apenas as que têm PageURL
            for (let i = 0; i < chap.pagesCount; i++) {
                if (chap.pages && chap.pages[i] && chap.pages[i].PageURL) {
                    const link = document.createElement('a');
                    link.href = chap.pages[i].PageURL;
                    link.download = chap.title + ' - Página ' + (i + 1);
                    
                    // Usa fetch + blob para compatibilidade com mobile
                    fetch(link.href)
                        .then(res => res.blob())
                        .then(blob => {
                            const url = URL.createObjectURL(blob);
                            const downloadLink = document.createElement('a');
                            downloadLink.href = url;
                            downloadLink.download = link.download + '.png';
                            downloadLink.click();
                            URL.revokeObjectURL(url);
                        })
                        .catch(err => console.error('Erro ao baixar página:', err));
                }
            }
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

async function deleteDraw(drawId) {
    let drawList = await getDrawList() || [];
    const index = drawList.findIndex(d => d.id === drawId);
    
    if (index !== -1) {
        drawList.splice(index, 1);
        // Reajusta os IDs dos draws restantes
        drawList.forEach((draw, idx) => {
            draw.id = idx;
        });
        await addToDrawList(drawList);
        get_draws(); // Recarrega a galeria
    }
}

async function deleteManga(mangaId) {
    let mangaList = await getMangasList() || [];
    const index = mangaList.findIndex(m => m.id === mangaId);
    
    if (index !== -1) {
        mangaList.splice(index, 1);
        // Reajusta os IDs dos mangas restantes
        mangaList.forEach((manga, idx) => {
            manga.id = idx;
        });
        await addToMangasList(mangaList);
        get_draws(); // Recarrega a galeria
    }
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