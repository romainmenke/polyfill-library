'Symbol' in self && 'iterator' in self.Symbol && (function(){
    try {
        var div = document.createElement('div');
        return div.classList && div.classList[Symbol.iterator];
    } catch (err) {
        return false;
    }
}())
