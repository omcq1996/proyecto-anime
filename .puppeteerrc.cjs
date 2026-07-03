const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Obliga a Puppeteer a descargar Chrome dentro de la carpeta del proyecto en Render
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
