import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ObjectRecognitionComponent } from './object-recognition/object-recognition.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  }, {
    path: 'start',
    component: ObjectRecognitionComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
