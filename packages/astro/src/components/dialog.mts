const dialog = document.getElementById('dialog') as HTMLDialogElement;
const dialogContent = document.getElementById('dialog-content') as HTMLParagraphElement;
const okButton = document.getElementById('dialog-ok') as HTMLButtonElement;
const cancelButton = document.getElementById('dialog-cancel') as HTMLButtonElement;

interface Resolvers {
    resolve: (value: boolean) => void;
    reject: (reason?: any) => void;
}

let resolvers: Resolvers | null = null;

export function dialogConfirm(content: string): Promise<boolean> {
    dialogContent.innerText = content;
    dialog.showModal();
    if (resolvers != null) {
        resolvers.reject(new Error('Another dialog has been opened'));
    }
    return new Promise((resolve, reject) => {
        resolvers = { resolve, reject };
    });
}

function close(value: boolean) {
    resolvers?.resolve(value);
    dialog.close();
}

okButton.addEventListener('click', () => close(true));

cancelButton.addEventListener('click', () => close(false));
