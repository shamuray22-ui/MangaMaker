
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