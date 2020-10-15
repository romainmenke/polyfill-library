(function () {
	try {
		// test for scope support
		document.createElement('DIV').querySelector(':scope *');
		return true;
	} catch (_) {
		return false;
	}
}());
