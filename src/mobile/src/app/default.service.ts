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
    return this.httpClient.post(this.base + '/alerts', alert).toPromise();
  }
  connect(sessionId: string) {
    return this.httpClient.post(this.base + '/connect/' + sessionId, {}).toPromise();
  }

  updateScreenInView(sessionId: string, isScreenInView: boolean) {
    console.log('post update screen in view')
    return this.httpClient.post(this.base + '/update-screen-in-view/' + sessionId, { isScreenInView }).toPromise();
  }
  hasStarted(sessionId: string) {
    return this.httpClient.get(this.base + '/started/' + sessionId).toPromise();
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


  blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async registerEvent(sessionId: string, alert: Alert, image?: Blob) {
    const data: any = { ...alert };

    if (image) {
      data.photo = await this.blobToBase64(image);

    }

    return this.httpClient.post(this.base + '/register/' + sessionId, data).toPromise();

  }

}
