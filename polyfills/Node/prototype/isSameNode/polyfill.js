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
        global.Element.prototype.isSameNode = isSameNode;
    }
}(self));
