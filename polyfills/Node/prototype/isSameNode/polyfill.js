(function (global) {
    global.Node.prototype.isSameNode = function isSameNode(otherNode) {
        return this === otherNode;
    };
}(self));
