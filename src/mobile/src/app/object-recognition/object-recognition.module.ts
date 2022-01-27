import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectRecognitionComponent } from './object-recognition.component';



@NgModule({
  declarations: [ObjectRecognitionComponent],
  imports: [
    CommonModule
  ],
  exports : [ObjectRecognitionComponent]
})
export class ObjectRecognitionModule { }
