(async function () {
    try {
        let files = await (await fetch("/api/files" + location.pathname)).json();
        let filesElem = document.getElementById("files");
        let path = location.pathname.slice(1).split("/").filter(x => !!x);
        if (path.length > 0) {
            let elem = document.createElement("li");
            elem.innerHTML = `<a href="/${path.slice(1).join("/")}">../</a>`;
            filesElem.appendChild(elem);
        }
        files.forEach(file => {
            let elem = document.createElement("li");
            elem.innerHTML = `<a href="${file.name}">${file.name}</a> (${file.directory ? "ディレクトリ" : file.sizeStr})`;
            filesElem.appendChild(elem);
        });
        document.getElementById("loading").remove();
    } catch {
        document.getElementById("loading").innerText = "404 Not Found";
    }
})();