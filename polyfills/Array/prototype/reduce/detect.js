'reduce' in Array.prototype && (function () {
    try {
      Array.prototype.reduce.call(null, function () { /* empty */ }, 1);
    } catch (error) {
      return true;
    }
  }())
