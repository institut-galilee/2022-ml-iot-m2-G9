import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ObjectRecognitionComponent } from './object-recognition/object-recognition.component';
import { CameraPreview } from '@awesome-cordova-plugins/camera-preview/ngx';

@NgModule({
  declarations: [AppComponent, ObjectRecognitionComponent, LoginComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, CameraPreview],
  bootstrap: [AppComponent],
})
export class AppModule { }
