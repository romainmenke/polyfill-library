var supportsGetters = (function() {
  try {
    var a = {};
    Object.defineProperty(a, "t", {
      configurable: true,
      enumerable: false,
      get: function() {
        return true;
      },
      set: undefined
    });
    return !!a.t;
  } catch (e) {
    return false;
  }
})();

// Some old engines do not support ES5 getters/setters.
if (supportsGetters) {
  // Minimal polyfill for Edge 15's lack of `isIntersecting`

  // See: https://github.com/w3c/IntersectionObserver/issues/211
  Object.defineProperty(IntersectionObserverEntry.prototype, "isIntersecting", {
    get: function() {
      return this.intersectionRatio > 0;
    }
  });
}
