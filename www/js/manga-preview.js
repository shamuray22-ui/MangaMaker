let mangaPages = [];
let currentPage = 0;
let selectedManga = null;
let selectedChapter = null;
let allMangaList = [];
let allDrawList = [];

const container = document.getElementById("manga-preview-container");
const pageInfo = document.getElementById("page-info");
const chapterSelect = document.getElementById("chapter-select");
const search = new URLSearchParams(window.location.search);
const id = search.get('id');

async function loadAllData() {
    try {
        allMangaList = await getMangasList();
        console.log(allMangaList);
        
        if (!allMangaList) allMangaList = [];
        
        selectedManga = allMangaList.find(m => m.id === Number(id));
        
        if (selectedManga && selectedManga.chapters) {
            populateChapterSelect();
            if (selectedManga.chapters.length > 0) {
                selectChapter(0);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function populateChapterSelect() {
    chapterSelect.innerHTML = '';
    
    if (!selectedManga || !selectedManga.chapters) {
        chapterSelect.innerHTML = '<option>Nenhum capítulo disponível</option>';
        return;
    }
    
    selectedManga.chapters.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Capítulo ${chapter.number} - ${chapter.title}`;
        chapterSelect.appendChild(option);
    });
}

function changeChapter() {
    const selectedIndex = parseInt(chapterSelect.value);
    selectChapter(selectedIndex);
}

function selectChapter(chapterIndex) {
    if (!selectedManga || !selectedManga.chapters[chapterIndex]) return;
    
    selectedChapter = selectedManga.chapters[chapterIndex];
    mangaPages = [];
    
    if (selectedChapter.pages && selectedChapter.pages.length > 0) {
        selectedChapter.pages.forEach(page => {
            if (page.drawId) {
                const draw = allDrawList.find(d => d.id === page.drawId);
                if (draw && draw.thumbnail) {
                    mangaPages.push(draw.thumbnail);
                } else if (draw && draw.PageURL) {
                    mangaPages.push(draw.PageURL);
                }
            }
        });
    }
    
    currentPage = 0;
    renderPage();
}

function renderPage() {
    container.innerHTML = "";
    
    if (mangaPages.length === 0) {
        container.innerHTML = "<p>Nenhuma página disponível neste capítulo</p>";
        pageInfo.textContent = "Sem páginas";
        return;
    }
    
    const img = document.createElement("img");
    img.src = mangaPages[currentPage];
    img.alt = `Página ${currentPage + 1}`;
    img.style.width = "100%";
    img.style.maxHeight = "600px";
    img.style.objectFit = "contain";
    
    container.appendChild(img);
    pageInfo.textContent = `Página ${currentPage + 1} de ${mangaPages.length}`;
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        renderPage();
    }
}

function nextPage() {
    if (currentPage < mangaPages.length - 1) {
        currentPage++;
        renderPage();
    }
}

function backToGallery() {
    window.location.href = "index.html";
}

window.onload = async function() {
    await loadAllData();
};
