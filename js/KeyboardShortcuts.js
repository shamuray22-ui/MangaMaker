document.addEventListener('keydown', function(event) {
    if(event.key === 'z' && (event.ctrlKey || event.metaKey)){
        undo();
        console.log('w');
        
    } else if(event.key === 'y' && (event.ctrlKey || event.metaKey)){
        redo();
    }
    
});