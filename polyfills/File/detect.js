/* This needs to be an expression which evaluates to true if the feature exists */
'File' in self && (function () {
	try {
		new File(['a'], 'b.txt', {
			type: "text/plain"
		});
		return true;
	} catch (e) {
		return false;
	}
}())
