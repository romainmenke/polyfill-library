"defineProperty" in Reflect &&
  (function() {
    try {
      return !Reflect.defineProperty(
        Object.defineProperty({}, 1, { value: 1 }),
        1,
        {
          value: 2
        }
      );
    } catch (e) {
      return false;
    }
  })();
