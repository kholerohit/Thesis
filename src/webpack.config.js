const path = require('path');

module.exports = {
  // Your existing webpack configuration settings
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify")
    }
  }
};
