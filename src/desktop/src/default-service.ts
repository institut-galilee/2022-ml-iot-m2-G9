import axios from "axios";
import Alert from "./alert.interface";

const host = "http://localhost:5000";


export function login(payload: { NE: string, password: string }) {
    return axios.post(host + "/login", payload);
}

export function saveSession(session: any) {
    localStorage.setItem('session', JSON.stringify(session));
}
export function getSession() {
    return JSON.parse(localStorage.getItem('session') || '');
}

export function clearSession() {
    localStorage.removeItem('session');
}

export function start(sessionId: string) {
    return axios.post(host + "/start/" + sessionId);
}
export function end(sessionId: string) {
    return axios.post(host + "/end/" + sessionId);
}


function blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}
export async function registerEvent(sessionId: string, alert: Alert, image?: Blob) {
    console.log(image);
    let data: any = { ...alert };

    if (image) {
        data.photo = await blobToBase64(image);
    }

    return axios.post(host + "/register/" + sessionId, data);

}