
window.onload = function() {
    get_draws();
}

function get_draws(){
    const drawlist = document.getElementById('drawlist');
    const draws = JSON.parse(localStorage.getItem('draws-saveds')) || [];
    drawlist.innerHTML = '';
    console.log(draws);
    
    draws.forEach((imageURL,index) => {

        const DrawCard = document.createElement('div');
        const newPicture = document.createElement('img');
        const nameDraw = document.createElement('h1');

        DrawCard.className = 'drawcard';
        
        newPicture.src = imageURL;
        nameDraw.textContent = 'novo desenho > ' + index;

        DrawCard.appendChild(newPicture);
        DrawCard.appendChild(nameDraw);
        drawlist.appendChild(DrawCard);

        console.log(localStorage);
            
    });
}

function add_draw(){
    window.location.href = "draw-screen.html";

}
const numpages = document.getElementById('numPages');
const pageslist = document.getElementById('pageslist');
let lasnum = Number(numpages.value);

numpages.addEventListener('input', function() {
    let newnum = Number(numpages.value);
    
    if (newnum > lasnum){

        const newimage = document.createElement('img');
        
        newimage.src = new Image();

        pageslist.appendChild(newimage);

        return;

    }else if (newnum < lasnum){
        pageslist.removeChild(pageslist.lastChild);

    }
    

});

function CallcreateMangaDiv(){

}