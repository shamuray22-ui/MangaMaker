let currentChap = 0;
const search = new URLSearchParams(window.location.search);
let id = search.get("id");
let mangapreviewcontainer = document.getElementById("manga-preview-container");
let chapterSelect = document.getElementById("chapterSelect");
async function renderPage(){
    let mangalist = await getMangasList();
    let Locakmanga = mangalist.find(manga => manga.id === Number(id));
    chapterSelect.innerHTML = '';
    mangapreviewcontainer.innerHTML = '';
    Locakmanga.chapters.forEach(element => {
        let option = document.createElement("option");
        option.value = element.number;
        option.text = element.title;
        currentChap = element.number;
        chapterSelect.appendChild(option);
        element.pages.forEach(page => {
            let img = new Image();
            img.alt = 'Manga Page';
            img.src = page.PageURL || 'assets/drawing.png';
            
            mangapreviewcontainer.appendChild(img);
            
        });
        
    });
    
    

}

async function boot(){
    withLoadScreen(async () =>{
        await renderPage();
    });
    
}

boot();

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

function changeChapter(){

}

function backToGallery() {
    window.location.href = "manga-screen.html?id=" + id;
}
