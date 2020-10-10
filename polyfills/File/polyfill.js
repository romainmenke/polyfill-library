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
        var n;
        if (fileName === null) {
            n = 'null';
        } else if (typeof fileName.toString === 'function') {
            n = fileName.toString();
        }

        // ensure we propagate throwing toString methods.
        // Blob polyfill doesn't do this.
        (function () {
            if (fileBits.length) {
                for (var i = 0; i < fileBits.length; i++) {
                    var bit = fileBits[i];
                    if ((bit.toString) && (typeof bit.toString === 'function')) {
                        bit.toString();
                    }
                }
            }
        }());

        var options;
        if (arguments.length > 2) {
            options = arguments[2];
        }

        if (options && options.type) {
            options.type = mimeTypeParse(options.type);
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

    if (_hasNativeFile && _nativeFileProto) {
        File.prototype = Object.create(_nativeFileProto);
    } else if (Blob.prototype) {
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

    function asciiLowercase(string) {
        return string.replace(/[A-Z]/g, function (l) {
            return l.toLowerCase();
        });
    }

    // This variant only implements it with the extract-value flag set.
    function collectAnHTTPQuotedString(input, position) {
        var value = "";

        position++;

        while (true) {
            while (position < input.length && input[position] !== "\"" && input[position] !== "\\") {
                value += input[position];
                ++position;
            }

            if (position >= input.length) {
                break;
            }

            var quoteOrBackslash = input[position];
            ++position;

            if (quoteOrBackslash === "\\") {
                if (position >= input.length) {
                    value += "\\";
                    break;
                }

                value += input[position];
                ++position;
            } else {
                break;
            }
        }

        return [value, position];
    }

    function mimeTypeParse(input) {
        input = input.replace(/^[ \t\n\r]+/, "").replace(/[ \t\n\r]+$/, "");

        var position = 0;
        var type = "";
        while (position < input.length && input[position] !== "/") {
            type += input[position];
            ++position;
        }

        if (type.length === 0 || !(/^[-!#$%&'*+.^_`|~A-Za-z0-9]*$/.test(type))) {
            return '';
        }

        if (position >= input.length) {
            return mimeTypeSerializer({
                type: asciiLowercase(type),
                subtype: '',
                parameters: {}
            });
        }

        // Skips past "/"
        ++position;

        var subtype = "";
        while (position < input.length && input[position] !== ";") {
            subtype += input[position];
            ++position;
        }

        subtype = subtype.replace(/[ \t\n\r]+$/, "");

        if (subtype.length === 0 || !(/^[-!#$%&'*+.^_`|~A-Za-z0-9]*$/.test(subtype))) {
            return '';
        }

        var mimeType = {
            type: asciiLowercase(type),
            subtype: asciiLowercase(subtype),
            parameters: {}
        };

        while (position < input.length) {
            // Skip past ";"
            ++position;

            while (input[position] === " " || input[position] === "\t" || input[position] === "\n" || input[position] === "\r") {
                ++position;
            }

            var parameterName = "";
            while (position < input.length && input[position] !== ";" && input[position] !== "=") {
                parameterName += input[position];
                ++position;
            }
            parameterName = asciiLowercase(parameterName);

            if (position < input.length) {
                if (input[position] === ";") {
                    continue;
                }

                // Skip past "="
                ++position;
            }

            var parameterValue = null;
            if (input[position] === "\"") {
                var httpQuotedString = collectAnHTTPQuotedString(input, position);
                parameterValue = httpQuotedString[0];
                position = httpQuotedString[1];

                while (position < input.length && input[position] !== ";") {
                    ++position;
                }
            } else {
                parameterValue = "";
                while (position < input.length && input[position] !== ";") {
                    parameterValue += input[position];
                    ++position;
                }

                parameterValue = parameterValue.replace(/[ \t\n\r]+$/, "");

                if (parameterValue === "") {
                    continue;
                }
            }

            if (parameterName.length > 0 &&
                (/^[-!#$%&'*+.^_`|~A-Za-z0-9]*$/.test(parameterName)) &&
                /^[\t\u0020-\u007E\u0080-\u00FF]*$/.test(parameterValue) &&
                !mimeType.parameters[parameterName]) {
                mimeType.parameters[parameterName] = asciiLowercase(parameterValue);
            }
        }

        return mimeTypeSerializer(mimeType);
    }

    function mimeTypeSerializer(mimeType) {
        if (!mimeType) {
            return '';
        }

        if (!mimeType.subtype) {
            return mimeType.type;
        }
        
        var serialization = mimeType.type + '/' + mimeType.subtype;

        if (mimeType.parameters.size === 0) {
            return serialization;
        }

        for (var name in mimeType.parameters) {
            var value = mimeType.parameters[name];
            serialization += ";";
            serialization += name;
            serialization += "=";

            if (!(/^[-!#$%&'*+.^_`|~A-Za-z0-9]*$/.test(value)) || value.length === 0) {
                value = value.replace(/(["\\])/g, "\\$1");
                value = '"' + value + '"';
            }

            serialization += value;
        }

        return serialization;
    }
}(self));
