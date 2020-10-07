/* global CreateMethodProperty */
(function (global) {
    var supportsGetters = (function () {
        try {
            var a = {};
            Object.defineProperty(a, 't', {
                configurable: true,
                enumerable: false,
                get: function () {
                    return true;
                },
                set: undefined
            });
            return !!a.t;
        } catch (e) {
            return false;
        }
    }());

    var _hasNativeFile = ('File' in global);

    var _hasNativeFileWithWorkingConstructor = (function () {
        if (!_hasNativeFile) {
            return false;
        }
        try {
            new File(['a'], 'b.txt', {
                type: "text/plain"
            });
            return true;
        } catch (e) {
            return false;
        }
    }());

    var NativeFile = global.File;
    var _nativeFileProto = _hasNativeFile ? NativeFile.prototype : null;

    // File ()
    // https://w3c.github.io/FileAPI/#file-section
    var File = function File(fileBits, fileName) {
        var file;

        // 1. If NewTarget is undefined, throw a TypeError exception.
        if (!(this instanceof File)) {
            throw new TypeError('Failed to construct \'File\': Please use the \'new\' operator, this DOM object constructor cannot be called as a function.');
        }

        if (arguments.length < 2) {
            throw new TypeError('Failed to construct \'File\': 2 arguments required, but only ' + arguments.length + ' present.');
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

        var options;
        if (arguments.length > 2) {
            options = arguments[2];
        }

        if (_hasNativeFileWithWorkingConstructor) {
            file = new NativeFile(fileBits, n, options);
        } else {
            file = new Blob(fileBits, options || {});
        }

        // 4.1.2 continues
        if (!('name' in file)) {
            if (supportsGetters) {
                Object.defineProperty(file, 'name', {
                    configurable: true,
                    enumerable: false,
                    get: function () {
                        return n;
                    },
                    set: undefined
                });
            } else {
                Object.defineProperty(file, 'name', {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: n
                });
            }
        }

        // 4.1.3.3 https://w3c.github.io/FileAPI/#file-constructor
        // If the lastModified member is provided,
        // let d be set to the lastModified dictionary member.
        // If it is not provided, set d to the current date and time represented as the number of milliseconds since the Unix Epoch (which is the equivalent of Date.now()[ECMA - 262]).
        if (!('lastModified' in file)) {
            var lastModified;
            if (options && options.lastModified) {
                lastModified = options.lastModified;
            } else {
                lastModified = (new Date()).getTime();
            }

            if (supportsGetters) {
                Object.defineProperty(file, 'lastModified', {
                    configurable: true,
                    enumerable: false,
                    get: function () {
                        return lastModified;
                    },
                    set: undefined
                });
            } else {
                Object.defineProperty(file, 'lastModified', {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: lastModified
                });
            }
        }

        return file;
    };

    if (_hasNativeFile) {
        File.prototype = Object.create(_nativeFileProto);
    } else {
        File.prototype = Object.create(Blob.prototype);
    }

    // Export the object
    try {
        CreateMethodProperty(global, 'File', File);
    } catch (e) {
        // IE8 throws an error here if we set enumerable to false.
        // More info on table 2: https://msdn.microsoft.com/en-us/library/dd229916(v=vs.85).aspx
        global.File = File;
    }

    CreateMethodProperty(global.File.prototype, 'constructor', File);

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
