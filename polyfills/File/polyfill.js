/* global self, CreateMethodProperty */
// eslint-disable-next-line no-unused-vars
(function (global) {
    if (function () {
        try {
            new File([], "");
            return true;
        } catch (e) {
            return false;
        }
    }()) {
        return;
    }

    // File ()
    // https://w3c.github.io/FileAPI/#file-section
    var FilePolyfill = function File(fileBits, fileName) {
        // 1. If NewTarget is undefined, throw a TypeError exception.
        if (!(this instanceof global.File)) {
            throw new TypeError('Failed to construct \'File\': Please use the \'new\' operator, this DOM object constructor cannot be called as a function.');
        }

        if (arguments.length < 2) {
            throw new TypeError('Failed to construct \'File\': 2 arguments required, but only ' + arguments.length + ' present.');
        }

        var options;
        if (2 < arguments.length) {
            options = arguments[2];
        }

        // 4.1.1 https://w3c.github.io/FileAPI/#file-constructor
        // Let bytes be the result of processing blob parts given fileBits and options.
        // This is handled by using either NativeFile or Blob.
        // Not our concern here.

        // 4.1.2 https://w3c.github.io/FileAPI/#file-constructor
        // Let n be a new string of the same size as the fileName argument to the constructor.
        // 
        // Copy every character from fileName to n, replacing any "/" character (U+002F SOLIDUS) with a ":" (U+003A COLON).
        // WARNING : This part of the spec is still debated and UA's implement inconsistently. https://github.com/w3c/FileAPI/issues/41
        // When spec settles maybe add : .replace(/\//g, ':')
        var n = fileName.toString();

        // 4.1.3.3 https://w3c.github.io/FileAPI/#file-constructor
        // If the lastModified member is provided,
        // let d be set to the lastModified dictionary member.
        // If it is not provided, set d to the current date and time represented as the number of milliseconds since the Unix Epoch (which is the equivalent of Date.now()[ECMA - 262]).
        var lastModified;
        if (options && options.lastModified) {
            lastModified = options.lastModified;
        } else {
            lastModified = (new Date()).valueOf();
        }

        var file = new Blob(fileBits, options);

        file._name = n;
        file._lastModified = lastModified;

        return file;
    };

    FilePolyfill.prototype = Object.create(Blob.prototype);

    // Export the object
    try {
        CreateMethodProperty(global, 'File', FilePolyfill);
    } catch (e) {
        // IE8 throws an error here if we set enumerable to false.
        // More info on table 2: https://msdn.microsoft.com/en-us/library/dd229916(v=vs.85).aspx
        global.File = FilePolyfill;
    }

    CreateMethodProperty(global.File.prototype, 'constructor', FilePolyfill);

    try {
        Object.defineProperty(global.File, 'name', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: 'File'
        });
    } catch (e) {
        // noop
    }
}(self));
