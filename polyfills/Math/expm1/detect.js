'expm1' in Math && // Old FF bug
    Math.expm1(10) <= 22025.465794806719 && Math.expm1(10) >= 22025.4657948067165168 &&
    // Tor Browser bug
    Math.expm1(-2e-17) == -2e-17