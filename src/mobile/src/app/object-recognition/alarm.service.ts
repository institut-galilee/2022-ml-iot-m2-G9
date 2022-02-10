import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Alert from './alert.interface';

@Injectable({
  providedIn: 'root'
})
export class AlertService {


  base = 'http://localhost:3000';
  constructor(private httpClient: HttpClient) { }


  post(alert: Alert) {
    return this.httpClient.post(this.base + '/alerts', alert);
  }


}
