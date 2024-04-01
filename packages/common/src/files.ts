import fs from "fs/promises";
import path from "path";

function formatFileSize(bytes: number) {
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;

    if (bytes < kilobyte) {
        return bytes + " bytes";
    } else if (bytes < megabyte) {
        return (bytes / kilobyte).toFixed(2) + " KB";
    } else if (bytes < gigabyte) {
        return (bytes / megabyte).toFixed(2) + " MB";
    } else {
        return (bytes / gigabyte).toFixed(2) + " GB";
    }
}

export async function getDirectoryEntries(dir: string) {
    let stat = await fs.stat(dir)
    if (!stat.isDirectory()) {
        throw new TypeError(`'${dir}' is not a directory`);
    }
    const files = await fs.readdir(dir);
    return await Promise.all(files.map(async (file) => {
        let stat = await fs.stat(path.join(dir, file));
        return {
            directory: stat.isDirectory(),
            file: stat.isFile(),
            name: file,
            size: stat.size,
            sizeStr: formatFileSize(stat.size)
        }
    }));
}
