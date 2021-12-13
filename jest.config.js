// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  maxConcurrency: 6,
  verbose: false,
  haste: {
    enableSymlinks: true
  }
};

module.exports = config;
