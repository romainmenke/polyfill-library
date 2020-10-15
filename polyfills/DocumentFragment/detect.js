'DocumentFragment' in self && self.DocumentFragment === document.createDocumentFragment().constructor && (function () {
	try {
		new self.DocumentFragment();
		return true;
	} catch (_) {
		return false;	
	}
}())
