import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-object-recognition',
  templateUrl: './object-recognition.component.html',
  styleUrls: ['./object-recognition.component.scss'],
})
export class ObjectRecognitionComponent implements OnInit {

  @ViewChild('video') video: ElementRef;
  constructor() { }

  ngOnInit() {

    console.log(this.video);

    const webCamPromise = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          aspectRatio: 1.5
        }
      })
      .then(stream => {
        const video = this.video.nativeElement;

        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };

      });
  }

}
