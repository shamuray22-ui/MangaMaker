//#region INITIALIZATION
const chapter_list = document.getElementById('chapter-list');
const create_chapter = document.getElementById('create-chapter');
const emptyH1 = document.getElementById('emptyH1');
create_chapter.style.display = 'none';

let MAXPAGES = 30

const search = new URLSearchParams(window.location.search);
const id = search.get('id');
// Carrega a lista de TODOS os mangás
let selectedManga;

async function startSavedData(){
    mangaList = await getMangasList();
    selectedManga = mangaList ? mangaList.find(manga => manga.id === Number(id)) : null;
}

async function boot(){
    localStorage.setItem('type', 'manga');
    await startSavedData();
    loadChapterList();
}
withLoadScreen(async () =>{
    await boot();
});

// Função que carrega a lista de capítulos (depois você conecta com localStorage)
function loadChapterList(){

    chapter_list.innerHTML = ''; // Limpa a lista para não duplicar ao recarregar

    if (selectedManga && selectedManga.chapters) {
        // Itera sobre os capítulos do mangá selecionado e os cria na tela
        selectedManga.chapters.forEach((chapter, idx) => {
            // use current index for ordering in case chapters were removed/renumbered
            createChapterUX(chapter.title, idx, chapter.pagesCount, 'assets/drawing.png');
        });
    }

    if(chapter_list.children.length === 0){
        emptyH1.style.visibility = 'visible';
        return;
    } else {
        emptyH1.style.visibility = 'hidden';
    }
}
//#endregion

//#region CHAPTER MANAGEMENT
// Mostrar/ocultar o card de criação
function toggleCreateChapter() {
    if(create_chapter.style.display === 'none') {
        create_chapter.style.display = 'flex';
    } else {
        create_chapter.style.display = 'none';
    }
}

// Adiciona um capítulo novo
async function addChapter() {
    const chapterName = document.getElementById('chapter-name').value || 'Novo Capítulo';
    const pagesNumber = document.getElementById('pages-number').value || 10;
    if (pagesNumber > MAXPAGES){
        alert("Desculpe... Mas ainda não é possivel fazer mais de 30 paginas no mesmo capitulo")
        return
    }
    createChapterUX(chapterName,chapter_list.children.length,pagesNumber,'assets/drawing.png');

    if (selectedManga && selectedManga.chapters){
        const newChapterData = {
            title: chapterName,
            // number will be recalculated when rendering; set to length before push for consistency
            number: selectedManga.chapters.length,
            pagesCount: pagesNumber,
            pages: []
        };
        // Adiciona o novo capítulo ao array de capítulos do mangá selecionado
        selectedManga.chapters.push(newChapterData);
        addToMangasList(mangaList);
        
    }
}

function createChapterUX(title,number,numpages,imgPage){
    // Oculta o form
    create_chapter.style.display = 'none';
    emptyH1.style.visibility = 'hidden';

    // Cria a div do capítulo
    const newChaper = document.createElement('div');
    newChaper.className = 'chapter';
    ///// cria o texto pra saber quantas paginas tem la dentro
    const newTextPages = document.createElement('h1');
    newTextPages.textContent = 'paginas > ' + numpages;


    // Cria a imagem
    const img = document.createElement('img');
    img.src = imgPage;
    img.alt = `Capítulo ${number}`;

    // Cria o título
    const h1 = document.createElement('h1');
    h1.textContent = number + ' - ' + title;

    // Cria os botões
    const table = document.createElement('table');
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    h1.onclick = () => {
        window.location.href = "draw-screen.html?id=" + id + "&chapID=" + number + "&isManga=true";
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Deletar';
    deleteBtn.onclick = () => {
            // find index of this chapter element in the list
            const index = Array.from(chapter_list.children).indexOf(newChaper);
            if (index > -1 && selectedManga && selectedManga.chapters) {
                // remove from data array
                selectedManga.chapters.splice(index, 1);
                addToMangasList(mangaList);
            }
            // reload the visual list which will renumber chapters and check empty state
            loadChapterList(); // checa se ficou vazio
        }
    
    ////td.appendChild(editBtn);
    td.appendChild(deleteBtn);
    tr.appendChild(td);
    table.appendChild(tr);

    // Monta o card
    newChaper.appendChild(img);
    newChaper.appendChild(h1);
    newChaper.appendChild(newTextPages);
    newChaper.appendChild(table);

    // Adiciona na lista
    chapter_list.appendChild(newChaper);


}
//#endregion

//#region NAVIGATION
function returnToGallery(){
    window.location.href = "index.html";
}

function enterPreview(){
    window.location.href = 'mangaPreviwe.html?id=' + id;
}
//#endregion
