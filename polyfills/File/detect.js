'File' in self && (function () {
	try {
		new File(['a'], 'b.txt', {
			type: "text/plain"
		});
		return false;
	} catch (e) {
		return false;
	}
}())
