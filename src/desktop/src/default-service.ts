import axios from "axios";

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