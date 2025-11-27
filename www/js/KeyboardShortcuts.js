document.addEventListener('keydown', function(event) {
    
    if(event.key === 'z' && (event.ctrlKey || event.metaKey)){
        event.preventDefault();
        undo();
    } else if(event.key === 'y' && (event.ctrlKey || event.metaKey)){
        event.preventDefault();
        redo();
    }else if (event.key === 's' && (event.ctrlKey || event.metaKey)){
        event.preventDefault();
        saveCanvas();
    }else if (event.key === 'c' && (event.ctrlKey || event.metaKey)){
        event.preventDefault();
        clearCanvas();
    }else if (event.key === 'e'){
        set_current_tool('eraser');
    } else if (event.key === 'q'){
        set_current_tool('pen');
    } else if (event.key === 'ArrowLeft'){
        let rotfactor = 0;
        rotfactor += 0.5;
        stage.rotate(rotfactor);
    }else if (event.key === 'ArrowRight'){
        let newfactor = 0;
        newfactor -= 0.5;
        stage.rotate(newfactor);
    }

    
});