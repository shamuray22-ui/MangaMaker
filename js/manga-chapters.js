const chaper_list = document.getElementById('chaper-list');
const create_chapter = document.getElementById('create-chapter');
const emptyH1 = document.getElementById('emptyH1');
create_chapter.style.visibility = 'hidden';

window.onload = function() {
    loadChaperList();
}

// Função que carrega a lista de capítulos (depois você conecta com localStorage)
function loadChaperList(){
    if(chaper_list.children.length === 0){
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
function addChaper() {
    const chapterNumber = document.getElementById('chapter-number').value || 1;
    const pagesNumber = document.getElementById('pages-number').value || 10;

    // Oculta o form
    create_chapter.style.visibility = 'hidden';
    emptyH1.style.visibility = 'hidden';

    // Cria a div do capítulo
    const newChaper = document.createElement('div');
    newChaper.className = 'chaper';

    // Cria a imagem
    const img = document.createElement('img');
    img.src = 'assets/drawing.png';
    img.alt = `Capítulo ${chapterNumber}`;

    // Cria o título
    const h1 = document.createElement('h1');
    h1.textContent = `Capítulo ${chapterNumber}`;

    // Cria os botões
    const table = document.createElement('table');
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.onclick = () => alert(`Editar Capítulo ${chapterNumber}`);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Deletar';
    deleteBtn.onclick = () => {
        newChaper.remove();
        loadChaperList(); // checa se ficou vazio
    }

    td.appendChild(editBtn);
    td.appendChild(deleteBtn);
    tr.appendChild(td);
    table.appendChild(tr);

    // Monta o card
    newChaper.appendChild(img);
    newChaper.appendChild(h1);
    newChaper.appendChild(table);

    // Adiciona na lista
    chaper_list.appendChild(newChaper);
}
