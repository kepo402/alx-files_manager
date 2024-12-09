// Babel configuration file for transpiling JavaScript code
module.exports = {
  // Presets are used to define a set of transformations to apply to the code
  presets: [
    [
      "@babel/preset-env", // A preset that enables transformation of modern JavaScript into a backwards-compatible version
      {
        // Specify the environment in which the code will run (e.g., Node.js)
        targets: {
          node: "current", // Target the current version of Node.js for the environment
        },
      },
    ],
  ],
};

