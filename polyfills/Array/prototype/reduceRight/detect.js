'reduceRight' in Array.prototype && (function () {
    try {
      Array.prototype.reduceRight.call(null, function () { /* empty */ }, 1);
    } catch (error) {
      return true;
    }
  })
