const fs = require("fs");
function generateFileListHTML(folder) {
    const files = fs.readdirSync(folder, { withFileTypes: true });
    const listItems = files.map(file => {
        const itemName = file.isDirectory() ? `${file.name}/` : file.name;
        return `<li><a href="${itemName}">${itemName}</a> (${file.size} bytes)</li>`;
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