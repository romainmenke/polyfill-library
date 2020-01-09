'some' in Array.prototype && (function () {
    try {
      Array.prototype.some.call(null, function () { /* empty */ });
    } catch (error) {
      return true;
    }
  }())
