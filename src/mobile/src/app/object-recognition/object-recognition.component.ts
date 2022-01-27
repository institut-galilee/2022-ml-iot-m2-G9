import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { interval, Subject } from 'rxjs';


interface Prediction {
  class: string;
  bbox: number[];
  score: number;

}

@Component({
  selector: 'app-object-recognition',
  templateUrl: './object-recognition.component.html',
  styleUrls: ['./object-recognition.component.scss'],
})
export class ObjectRecognitionComponent implements AfterViewInit {

  @ViewChild('video') video: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;




  detectionRate = 25;
  detectionInterval = interval(1000 / this.detectionRate);
  onPredicitionsObserver = new Subject<any>();
  onAlertsObserver = new Subject<any>();

  constructor() { }
  ngAfterViewInit(): void {



    const webCamPromise = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          aspectRatio: 1.7,
          frameRate: 25
        }
      })
      .then(stream => {
        const video = this.video.nativeElement;

        video.srcObject = stream;

        return new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            video.play();
            resolve(undefined);
          };
        });

      });

    const modelPromise = cocoSsd.load();


    Promise.all([modelPromise, webCamPromise]).then(values => {
      // model and camera are both ready

      this.initDetection(values[0]);

    });


  }

  analyzePredictions(predictions: Prediction[]) {
    predictions.forEach(prediction => this.onAlertsObserver.next(prediction));
  }
  onPredictions(predictions: Prediction[]) {
    this.renderPredictions(predictions);
    this.analyzePredictions(predictions);

  }
  onAlert(predictionMeta: Prediction) {

    console.log('@alert ', predictionMeta);
  }
  initDetection(model) {

    this.detectionInterval.subscribe(() => {
      this.detectFrame(this.video.nativeElement, model);
    });
    this.onPredicitionsObserver.subscribe(this.onPredictions.bind(this));
    this.onAlertsObserver.subscribe(this.onAlert.bind(this));
  }


  detectFrame(video, model) {

    model.detect(video).then(predictions => {
      this.onPredicitionsObserver.next(predictions);
    });
  };

  renderPredictions(predictions: Prediction[]) {
    const c = this.canvas.nativeElement;
    c.width = this.video.nativeElement.clientWidth;
    c.height = this.video.nativeElement.clientHeight;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = '16px sans-serif';
    ctx.font = font;
    ctx.textBaseline = 'top';
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = '#00FFFF';
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = '#000000';
      ctx.fillText(prediction.class, x, y);
    });
  };


}
