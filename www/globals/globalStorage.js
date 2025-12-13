
async function getMangasList(){
    try{
        let json = await localforage.getItem('mangas');
        let readjson = JSON.parse(json);
        return readjson;
    }catch (erro) {
        alert('Erro ao pegar draw list Σ(っ °Д °;)っ error >', erro);
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

async function removeFromMangasList(){

}
async function removeFromDrawList(){

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