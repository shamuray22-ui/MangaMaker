const chapter_list = document.getElementById('chapter-list');
const create_chapter = document.getElementById('create-chapter');
const emptyH1 = document.getElementById('emptyH1');
create_chapter.style.visibility = 'hidden';

const search = new URLSearchParams(window.location.search);
const id = search.get('id');
// Carrega a lista de TODOS os mangás
let mangaList = JSON.parse(localStorage.getItem('mangas')) || [];
// Encontra o mangá específico que foi selecionado na galeria
const selectedManga = mangaList.find(manga => manga.id === Number(id));

window.onload = function() {
    localStorage.setItem('type', 'manga');
    loadChapterList();
}

// Função que carrega a lista de capítulos (depois você conecta com localStorage)
function loadChapterList(){

    chapter_list.innerHTML = ''; // Limpa a lista para não duplicar ao recarregar

    if (selectedManga && selectedManga.chapters) {
        // Itera sobre os capítulos do mangá selecionado e os cria na tela
        selectedManga.chapters.forEach((chapter) => {
            createChapterUX(chapter.title, chapter.number,chapter.pagesCount, 'assets/drawing.png');
        });
    }

    if(chapter_list.children.length === 0){
        emptyH1.style.visibility = 'visible';
        return;
    } else {
        emptyH1.style.visibility = 'hidden';
    }
}

// Mostrar/ocultar o card de criação
function toggleCreateChapter() {
    if(create_chapter.style.visibility === 'hidden') {
        create_chapter.style.visibility = 'visible';
    } else {
        create_chapter.style.visibility = 'hidden';
    }
}

// Adiciona um capítulo novo
function addChapter() {
    const chapterName = document.getElementById('chapter-name').value || 'Novo Capítulo';
    const pagesNumber = document.getElementById('pages-number').value || 10;
    
    createChapterUX(chapterName,chapter_list.children.length,pagesNumber,'assets/drawing.png');

    if (selectedManga && selectedManga.chapters){
        const newChapterData = {
            title: chapterName,
            number: chapter_list.children.length - 1,
            pagesCount: pagesNumber,
            pages: []
        };
        // Adiciona o novo capítulo ao array de capítulos do mangá selecionado
        selectedManga.chapters.push(newChapterData); // Adiciona o novo capítulo ao mangá correto
        // Salva a lista de mangás COMPLETA (que foi modificada) de volta no localStorage
        localStorage.setItem('mangas', JSON.stringify(mangaList));
    }
}

function createChapterUX(title,number,numpages,imgPage){
    // Oculta o form
    create_chapter.style.visibility = 'hidden';
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

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.onclick = () => {
        window.location.href = "draw-screen.html?id=" + id + "&chapID=" + number + "&isManga=true";
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Deletar';
    deleteBtn.onclick = () => {
        newChaper.remove();
        loadChapterList(); // checa se ficou vazio
    }

    td.appendChild(editBtn);
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
function returnToGallery(){
    window.location.href = "index.html";
}

function enterPreview(){
    document.location = 'mangaPreviwe.html?id=' + id;
}