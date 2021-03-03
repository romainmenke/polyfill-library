(function (global) {
	if ('isSameNode' in self.document) {
		return;
	}

	function isSameNode(otherNode) {
		return this === otherNode;
	}

	if ('Node' in global) {
		global.Node.prototype.isSameNode = isSameNode;
	} else {
		global.document.isSameNode = isSameNode;

		var fragmentProto = document.createDocumentFragment().constructor.prototype;
		fragmentProto.isSameNode = isSameNode;

		global.Attr.prototype.isSameNode = isSameNode;
		global.DocumentFragment.prototype.isSameNode = isSameNode;
		global.Element.prototype.isSameNode = isSameNode;
		global.Text.prototype.isSameNode = isSameNode;
	}
}(self));
