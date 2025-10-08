document.addEventListener('keydown', function(event) {
    event.preventDefault();
    if(event.key === 'z' && (event.ctrlKey || event.metaKey)){
        undo();
    } else if(event.key === 'y' && (event.ctrlKey || event.metaKey)){
        redo();
    }else if (event.key === 's' && (event.ctrlKey || event.metaKey)){
        saveCanvas();
    }else if (event.key === 'c' && (event.ctrlKey || event.metaKey)){
        clearCanvas();
    }else if (event.key === 'e'){
        set_current_tool('eraser');
    } else if (event.key === 'q'){
        set_current_tool('pen');
    }

    
});