// move-to-docs.js
const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, 'docs', 'browser'); // La carpeta 'browser' dentro de 'docs'
const destDir = path.join(__dirname, 'docs');            // La carpeta 'docs'

fs.readdir(sourceDir)
  .then(files => {
    const movePromises = files.map(file => {
      const srcPath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      return fs.move(srcPath, destPath, { overwrite: true });
    });
    return Promise.all(movePromises);
  })
  .then(() => {
    return fs.remove(sourceDir); // Eliminar la carpeta 'browser' vacía después de mover los archivos
  })
  .then(() => {
    console.log('Successfully moved contents from docs/browser to docs/');
  })
  .catch(err => {
    console.error('Error moving files:', err);
  });