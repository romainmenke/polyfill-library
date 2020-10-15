'sort' in Array.prototype && (function () {
    // Check it does a stable sort.
    // Some browsers have a different sorting algorithm based on array length.
    // To be accurate this would need to test an array of length > 512
    var obj = {
        length: 5,
        0: { k: 'A', v: 5 },
        1: { k: 'B', v: 2 },
        2: { k: 'C', v: 2 },
        3: { k: 'D', v: 1 },
        4: { k: 'E', v: 1 }
    };

    Array.prototype.sort.call(obj, function (a, b) { return a.v - b.v });

    return (
        obj[0].k === 'D' &&
        obj[1].k === 'E' &&
        obj[2].k === 'B' &&
        obj[3].k === 'C' &&
        obj[4].k === 'A'
    );
}())
