// Estado da leitura
const search = new URLSearchParams(window.location.search);
const mangaId = Number(search.get("id"));

let currentManga = null;
let mangaDataList = null;
let currentChapterId = 0;
let currentPageIndex = 0;
let currentChapter = null;
let totalPages = 0;

// Elementos DOM
const mangaPreviewContainer = document.getElementById("manga-preview-container");
const chapterSelect = document.getElementById("chapterSelect");
const pageInfo = document.getElementById("page-info");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const chapterTitle = document.getElementById("chapterTitle");
const pageIndicator = document.getElementById("pageIndicator");

// DEBUG: Logger simples
function debugLog(msg, data) {
}

// Inicialização
async function boot() {
    withLoadScreen(async () => {
        try {
            debugLog('Iniciando boot...');
            mangaDataList = await getMangasList();
            debugLog('mangaDataList carregado:', mangaDataList);
            
            if (!mangaDataList || mangaDataList.length === 0) {
                alert('Nenhum mangá encontrado no armazenamento. (´；ω；`)');
                setTimeout(() => backToGallery(), 1000);
                return;
            }
            
            debugLog('Procurando mangá com ID:', mangaId);
            currentManga = mangaDataList.find(m => m && m.id === mangaId);
            
            if (!currentManga) {
                alert('Mangá não encontrado. Voltando... (´；ω；`)');
                setTimeout(() => backToGallery(), 1000);
                return;
            }
            
            if (!currentManga.chapters || currentManga.chapters.length === 0) {
                alert('Este mangá não tem capítulos. (´；ω；`)');
                setTimeout(() => backToGallery(), 1000);
                return;
            }
            
            debugLog('Mangá encontrado:', currentManga);
            debugLog('Total de capítulos:', currentManga.chapters.length);
            
            populateChapterSelect(currentManga.chapters);
            currentChapterId = 0;
            loadChapter(0);
        } catch (erro) {
            console.error('[MangaReader] Erro ao carregar:', erro);
            alert('Erro ao carregar mangá. Σ(っ °Д °;)っ\n' + erro.message);
            setTimeout(() => backToGallery(), 2000);
        }
    });
}

// Popula o seletor de capítulos
function populateChapterSelect(chapters) {
    chapterSelect.innerHTML = '';
    chapters.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${chapter.title} - ${chapter.pagesCount} páginas`;
        chapterSelect.appendChild(option);
    });
}

// Carrega um capítulo específico
function loadChapter(chapterId) {
    try {
        currentChapterId = chapterId;
        currentPageIndex = 0;
        
        if (!currentManga || !currentManga.chapters) {
            throw new Error('Mangá ou capítulos não encontrados');
        }
        
        currentChapter = currentManga.chapters[chapterId];
        
        if (!currentChapter) {
            throw new Error(`Capítulo ${chapterId} não encontrado`);
        }
        
        debugLog('Capítulo carregado:', currentChapter);
        
        // Define total de páginas
        totalPages = currentChapter.pagesCount || 0;
        debugLog('Total de páginas neste capítulo:', totalPages);
        
        chapterSelect.value = chapterId;
        chapterTitle.textContent = currentChapter.title || `Capítulo ${chapterId}`;
        
        displayPage();
    } catch (error) {
        console.error('[MangaReader] Erro ao carregar capítulo:', error);
        alert('Erro ao carregar capítulo: ' + error.message);
    }
}

// Exibe a página atual
function displayPage() {
    try {
        if (!currentChapter) {
            mangaPreviewContainer.innerHTML = '<div class="loading-placeholder">Capítulo não carregado</div>';
            return;
        }
        
        // Valida índice
        if (currentPageIndex < 0) currentPageIndex = 0;
        if (currentPageIndex >= totalPages) {
            currentPageIndex = totalPages - 1;
        }
        
        debugLog(`Exibindo página ${currentPageIndex + 1} de ${totalPages}`);
        
        mangaPreviewContainer.innerHTML = '';
        
        // Tenta encontrar os dados da página
        let pageData = null;
        let imageSrc = null;
        
        // Estrutura 1: pages array com layers (draw-script)
        if (currentChapter.pages && currentChapter.pages[currentPageIndex]) {
            pageData = currentChapter.pages[currentPageIndex];
            debugLog('pageData encontrado (estrutura pages[])', pageData);
            imageSrc = pageData.PageURL;
        }
        // Estrutura 2: drawImageBase64 direto
        else if (currentChapter.pages && currentChapter.pages[currentPageIndex]?.drawImageBase64) {
            imageSrc = currentChapter.pages[currentPageIndex].drawImageBase64;
        }
        // Estrutura 3: PageURL
        else if (currentChapter.pages && currentChapter.pages[currentPageIndex]?.PageURL) {
            imageSrc = currentChapter.pages[currentPageIndex].PageURL;
        }
        // Fallback: página ainda não desenhada
        else {
            debugLog('Nenhuma imagem encontrada para página', currentPageIndex);
            imageSrc = null;
        }
        
        const img = document.createElement('img');
        img.alt = `Página ${currentPageIndex + 1}`;
        img.className = 'manga-page-image';
        
        if (imageSrc) {
            img.src = imageSrc;
            img.onerror = () => {
                debugLog('Erro ao carregar imagem, usando placeholder');
                img.src = 'assets/drawing.png';
            };
        } else {
            img.src = 'assets/drawing.png';
        }
        
        mangaPreviewContainer.appendChild(img);
        
        // Atualiza indicadores
        updatePageInfo();
        updateNavigationButtons();
    } catch (error) {
        console.error('[MangaReader] Erro ao exibir página:', error);
        mangaPreviewContainer.innerHTML = '<div class="loading-placeholder">Erro ao carregar página</div>';
    }
}

// Atualiza informações de página
function updatePageInfo() {
    if (totalPages === 0) {
        pageInfo.textContent = '0 / 0';
        pageIndicator.style.width = '0%';
        return;
    }
    
    pageInfo.textContent = `${currentPageIndex + 1} / ${totalPages}`;
    pageIndicator.style.width = `${((currentPageIndex + 1) / totalPages) * 100}%`;
}

// Atualiza estado dos botões
function updateNavigationButtons() {
    prevBtn.disabled = currentPageIndex === 0;
    nextBtn.disabled = currentPageIndex >= currentChapter.pagesCount - 1;
}

// Navega para página anterior
function prevPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        displayPage();
        debugLog('Página anterior:', currentPageIndex + 1);
    }
}

// Navega para próxima página
function nextPage() {
    if (currentPageIndex < totalPages - 1) {
        currentPageIndex++;
        displayPage();
        debugLog('Próxima página:', currentPageIndex + 1);
    }
}

// Muda de capítulo
function changeChapter() {
    const selectedId = Number(chapterSelect.value);
    debugLog('Mudando para capítulo:', selectedId);
    loadChapter(selectedId);
}

// Voltar para galeria
function backToGallery() {
    window.location.href = "manga-screen.html?id=" + mangaId;
}

// Atalhos de teclado
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        prevPage();
    } else if (event.key === 'ArrowRight') {
        nextPage();
    }
});

// Inicia
boot();
