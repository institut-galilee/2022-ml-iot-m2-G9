import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { interval, Subject, timer } from 'rxjs';
import Alert, { AlertType } from './alert.interface';
import { delay, debounce, throttleTime, distinctUntilChanged } from 'rxjs/operators';
import { DefaultService } from '../default.service';
import { unique } from '@tensorflow/tfjs';


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
  @ViewChild('alertImage') alertImage: ElementRef;

  hasAlert = false;
  alertsPerMinute = 10; // how many alerts to report per minute
  detectionPerSecond = 10; // run 10 detection per second
  detectionInterval = interval(1000 / this.detectionPerSecond); // how many detections to run per second
  onPredicitionsObserver = new Subject<Prediction>();
  onAlertsObserver = new Subject<Alert>();
  isScreenInView = new Subject<boolean>(); // track if screen in view
  clearAlertObserver = new Subject<void>(); // used to toggle alert css class

  session: any;
  constructor(private defaultService: DefaultService) {
    this.session = this.defaultService.getSession();
  }
  ngAfterViewInit(): void {



    const webCamPromise = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
          width: window.innerWidth,
          frameRate: 30
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

    // analyze how many screen in the view
    const screenClasses = ['cell phone', 'tv', 'laptop', 'mobile', 'screen'];


    const screenInView = predictions.filter(e => screenClasses.includes(e.class)).length;

    if (screenInView === 0) { // no screen in the view
      this.isScreenInView.next(false);
    } else if (screenInView === 1) { // only one screen in the view
      this.isScreenInView.next(true);
    } else {  // multiple screen in the view
      this.isScreenInView.next(true);
      this.onAlertsObserver.next({ type: AlertType.multipleScreen, sessionId: '' });
    }


    // analyze how many person in the view

    const personClasses = ['person'];

    const personInView = predictions.filter(e => personClasses.includes(e.class)).length;
    if (personInView > 0) {
      this.onAlertsObserver.next({ type: AlertType.person, sessionId: '' });
    }


  }

  getScreenshot(): Promise<Blob> {
    const video = this.video.nativeElement;
    const scale = 1;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = (video.clientHeight / video.clientWidth) * canvas.width;
    canvas
      .getContext('2d')
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((res, rej) => {
      canvas.toBlob((blob) => {
        if (blob === null) { rej(); }
        else { res(blob); }
      }, 'image/jpg');
    });
  }


  onPredictions(predictions: Prediction[]) {
    this.renderPredictions(predictions);
    this.analyzePredictions(predictions);

  }
  clearAlert() {
    this.hasAlert = false;
  }
  async onAlert(alert: Alert) {

    this.hasAlert = true;
    this.clearAlertObserver.next();

    try {
      const img = await this.getScreenshot();
      await this.defaultService.registerEvent(this.session.id, alert, img);
    } catch (ex) { }


  }

  async updateScreenInView(isScreenInView: boolean) {
    console.log("update screen", isScreenInView);
    try {
      console.log("update screen2", isScreenInView);

      await this.defaultService.updateScreenInView(this.session.id, isScreenInView);
      console.log("update screen3", isScreenInView);

    } catch (ex) { }
  }
  initDetection(model) {

    this.detectionInterval.subscribe(() => {
      this.detectFrame(this.video.nativeElement, model);
    });
    this.onPredicitionsObserver.subscribe(this.onPredictions.bind(this));
    this.onAlertsObserver
      .pipe(throttleTime((60 * 1000) / this.alertsPerMinute))
      .subscribe(this.onAlert.bind(this));
    this.clearAlertObserver.pipe(debounce(() => timer(200)), delay(500)).subscribe(this.clearAlert.bind(this));
    this.isScreenInView.pipe(distinctUntilChanged()).subscribe(this.updateScreenInView.bind(this));
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
