// Cria a tela de load imediatamente quando o script carrega
(function() {
    if (!document.getElementById('loadScreenOverlay')) {
        const loadScreen = document.createElement('div');
        loadScreen.id = 'loadScreenOverlay';
        loadScreen.style.position = 'fixed';
        loadScreen.style.top = '0';
        loadScreen.style.left = '0';
        loadScreen.style.width = '100%';
        loadScreen.style.height = '100%';
        loadScreen.style.background = '#1111116f';
        loadScreen.style.display = 'none';
        loadScreen.style.flexDirection = 'column';
        loadScreen.style.alignItems = 'center';
        loadScreen.style.justifyContent = 'center';
        loadScreen.style.zIndex = '9999';
        loadScreen.style.fontFamily = 'Arial, sans-serif';
        loadScreen.innerHTML = '<h1 style="color: #eee; margin: 0; font-family: Arial, sans-serif; font-size: 24px;">Carregando...</h1><h1 style="color: #eee; margin: 0; font-family: Arial, sans-serif; font-size: 12px">desculpe a demora (～￣▽￣)～</h1>';
        document.body.appendChild(loadScreen);
    }
})();

async function getMangasList(){
    try{
        let json = await localforage.getItem('mangas');
        let readjson = JSON.parse(json);
        return readjson;
    }catch (erro) {
        alert('Erro ao pegar manga list Σ(っ °Д °;)っ error >', erro);
        return null;
    }
}
async function getDrawList(){
    try{
        let json = await localforage.getItem('draws-saveds');
        
        let readjson = JSON.parse(json);
        return readjson;
    }catch (erro) {
        alert('Erro ao pegar draw list Σ(っ °Д °;)っ error >', erro);
        return null;
    }
}


async function addToMangasList(whatNeedReWrite){
    try{
        await localforage.setItem('mangas',JSON.stringify(whatNeedReWrite));
    }catch(erro){
        alert('Erro ao pegar draw list ╰(*°▽°*)╯ error >', erro);
    }
    
}
async function addToDrawList(whatNeedReWrite){
    try{
        await localforage.setItem('draws-saveds',JSON.stringify(whatNeedReWrite));
    }catch(erro){
        alert('Erro ao pegar draw list (┬┬﹏┬┬) error >', erro);
    }
}

// Atualiza apenas um draw específico pelo ID (mais eficiente)
async function updateDrawById(drawId, updatedDraw){
    try{
        let json = await localforage.getItem('draws-saveds');
        let drawsList = JSON.parse(json);
        const index = drawsList.findIndex(d => d.id === drawId);
        if (index !== -1) {
            drawsList[index] = updatedDraw;
            await localforage.setItem('draws-saveds', JSON.stringify(drawsList));
        }
    }catch(erro){
        alert('Erro ao atualizar draw (┬┬﹏┬┬) error >', erro);
    }
}

// Atualiza apenas um manga específico pelo ID (mais eficiente)
async function updateMangaById(mangaId, updatedManga){
    try{
        let json = await localforage.getItem('mangas');
        let mangasList = JSON.parse(json);
        const index = mangasList.findIndex(m => m.id === mangaId);
        if (index !== -1) {
            mangasList[index] = updatedManga;
            await localforage.setItem('mangas', JSON.stringify(mangasList));
        }
    }catch(erro){
        alert('Erro ao atualizar manga (┬┬﹏┬┬) error >', erro);
    }
}

// Funções para controlar a tela de load
function showLoadScreen() {
    let loadScreen = document.getElementById('loadScreenOverlay');
    if (loadScreen) {
        loadScreen.style.display = 'flex';
    }
}

function hideLoadScreen() {
    let loadScreen = document.getElementById('loadScreenOverlay');
    if (loadScreen) {
        loadScreen.style.display = 'none';
    }
}

// Função auxiliar que mostra load, executa uma ação e esconde
async function withLoadScreen(asyncFunction) {
    showLoadScreen();
    try {
        const result = await asyncFunction();
        hideLoadScreen();
        return result;
    } catch (error) {
        hideLoadScreen();
        throw error;
    }
}