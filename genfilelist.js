const fs = require("fs");
const path = require("path");
function formatFileSize(bytes) {
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;

    if (bytes < kilobyte) {
        return bytes + ' bytes';
    } else if (bytes < megabyte) {
        return (bytes / kilobyte).toFixed(2) + ' KB';
    } else if (bytes < gigabyte) {
        return (bytes / megabyte).toFixed(2) + ' MB';
    } else {
        return (bytes / gigabyte).toFixed(2) + ' GB';
    }
}
function generateFileListHTML(folder) {
    let files = fs.readdirSync(folder);
    files = files.map(x => { return {name:x,...fs.statSync(path.join(folder,x))} });
    const listItems = files.map(file => {
        const itemName = file.isDirectory ? `${file.name}/` : file.name;
        return `<li><a href="${itemName}">${itemName}</a> (${formatFileSize(file.size)})</li>`;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>File List</title>
      </head>
      <body>
        <h1>File List</h1>
        <ul>
          ${listItems.join('')}
        </ul>
      </body>
      </html>
    `;
}
module.exports = generateFileListHTML;