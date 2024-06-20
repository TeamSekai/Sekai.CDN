const dialog = document.getElementById('dialog') as HTMLDialogElement;
const dialogContent = document.getElementById('dialog-content') as HTMLParagraphElement;
const okButton = document.getElementById('dialog-ok') as HTMLButtonElement;
const cancelButton = document.getElementById('dialog-cancel') as HTMLButtonElement;

interface Resolvers {
    resolve: (value: boolean) => void;
    reject: (reason?: any) => void;
}

let resolvers: Resolvers | null = null;

function prepare(content: string): void {
    if (resolvers != null) {
        resolvers.reject(new Error('Another dialog has been opened'));
    }
    dialogContent.innerText = content;
    dialog.showModal();
}

function promise(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        resolvers = { resolve, reject };
    });
}

export function confirm(content: string): Promise<boolean> {
    dialog.classList.remove('info');
    prepare(content);
    return promise();
}

export async function info(content: string): Promise<void> {
    dialog.classList.add('info');
    prepare(content);
    await promise();
}

function close(value: boolean) {
    resolvers?.resolve(value);
    dialog.close();
}

okButton.addEventListener('click', () => close(true));

cancelButton.addEventListener('click', () => close(false));
