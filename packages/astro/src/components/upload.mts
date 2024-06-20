import { dialogConfirm } from "./dialog.mts";

export async function uploadFiles(files?: FileList | null): Promise<void> {
        if (files == null) {
            return;
        }
        const file = files[0];
        if (!await dialogConfirm(`${file.name} をアップロードしますか？`)) return;
        let formData = new FormData();
        formData.append("file", file);
        let params = new URLSearchParams({
            path: location.pathname
        });
        let res = await fetch("/api/upload?" + params, {
            method: "POST",
            body: formData
        });
        if (res.status == 200) {
            let json = await res.json();
            alert(`アップロードしました: ${json.fileName}`);
            return location.reload();
        }
        else if (res.status == 401)
            return alert("ログインに失敗しました");
        else
            return alert(`不明なエラー: ${res.status} ${res.statusText}`);
}
