const mangaPages = [
    'assets/drawing.png',
    'assets/drawing.png',
    'assets/drawing.png'
    // adicione quantas quiser
];

let currentPage = 0; // índice da página atual
const container = document.getElementById("manga-preview-container");
const pageInfo = document.getElementById("page-info");

const search = new URLSearchParams(window.location.search);
const id = search.get('id');


// Renderiza a página atual
function renderPage() {
    container.innerHTML = ""; // limpa

    const img = document.createElement("img");
    img.src = mangaPages[currentPage];
    img.alt = `Página ${currentPage + 1}`;

    container.appendChild(img);

    pageInfo.textContent = `Página ${currentPage + 1} de ${mangaPages.length}`;
}

// Vai para a página anterior
function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        renderPage();
    }
}

// Vai para a próxima página
function nextPage() {
    if (currentPage < mangaPages.length - 1) {
        currentPage++;
        renderPage();
    }
}

// Voltar para a galeria (pode ser um link ou só voltar no histórico)
function backToGallery() {
    window.location.href = "manga-screen.html?id=" + id;
}


// Inicializa ao carregar
window.onload = function() {
    renderPage();
};
