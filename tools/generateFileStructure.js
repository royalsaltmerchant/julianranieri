const fs = require('fs');
const path = require('path');

function createDirectoryModel(directoryPath) {
  const model = {
    name: path.basename(directoryPath),
    type: 'directory',
    children: []
  };

  const files = fs.readdirSync(directoryPath);

  files.forEach(file => {
    if (file.startsWith('.git')) {
      return; // Ignore files starting with ".git"
    }

    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    const child = {
      name: file,
      type: stats.isDirectory() ? 'directory' : 'file'
    };

    if (stats.isDirectory()) {
      child.children = createDirectoryModel(filePath).children;
    }

    model.children.push(child);
  });

  return model;
}

// Get the home directory
const homeDir = path.dirname(__dirname);

// Create the directory model
const directoryModel = createDirectoryModel(homeDir);

// Convert the model to JSON
const jsonModel = JSON.stringify(directoryModel, null, 2);

// Write the JSON model to a file
const outputFile = path.join(homeDir, 'fileStructure.json');
fs.writeFileSync(outputFile, jsonModel);

console.log(`File structure saved to ${outputFile}`);
