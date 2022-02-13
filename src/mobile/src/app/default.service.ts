import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Alert from './object-recognition/alert.interface';

@Injectable({
  providedIn: 'root'
})
export class DefaultService {


  base = 'http://localhost:5000';
  constructor(private httpClient: HttpClient) { }


  post(alert: Alert) {
    return this.httpClient.post(this.base + '/alerts', alert);
  }
  connect(sessionId: string) {
    return this.httpClient.post(this.base + '/connect/' + sessionId, {});
  }

  updateScreenInView(sessionId: string, isScreenInView: boolean) {
    return this.httpClient.post(this.base + '/update-screen-in-view/' + sessionId, { isScreenInView });
  }
  hasStarted(sessionId: string) {
    return this.httpClient.get(this.base + '/started/' + sessionId);
  }

  saveSession(session: any) {
    localStorage.setItem('session', JSON.stringify(session));
  }

  getSession() {
    return JSON.parse(localStorage.getItem('session') || '');
  }

  clearSession() {
    localStorage.removeItem('session');
  }

}
