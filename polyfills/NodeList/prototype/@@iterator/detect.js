'Symbol' in self && 'iterator' in self.Symbol && (function () {
	var fragment = document.createDocumentFragment();
	fragment.appendChild(document.createElement('div'));
	return !!fragment.childNodes[Symbol.iterator];
})()
