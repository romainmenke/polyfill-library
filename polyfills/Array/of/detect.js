'of' in Array && (function () {
    function Test() {}
    return Array.of.call(Test) instanceof Test;
}())