(function(){
    console.log('ie is begin');
    
    try {
        getComputedStyle(undefined);
    }
    catch(e) {
        var nativeGetComputedStyle = getComputedStyle;
        window.getComputedStyle = function(element, pseudoElement) {
            try {
                return nativeGetComputedStyle(element, pseudoElement);
            }
            catch(e) {
                return null;
            }
        }
    }

    console.log('ie is over');
})();