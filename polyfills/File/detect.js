(function (global) {
	if (!('File' in global)) return false;

	try {
		new File(['a'], 'b.txt', {
			type: "text/plain"
		});
		return true;
	} catch (e) {
		return false;
	}
}(self))
