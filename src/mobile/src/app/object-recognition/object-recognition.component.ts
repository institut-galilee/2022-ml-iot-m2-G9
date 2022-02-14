import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs';
import { interval, Subject, timer } from 'rxjs';
import Alert, { AlertType } from './alert.interface';
import { delay, debounce, throttleTime, distinctUntilChanged } from 'rxjs/operators';
import { DefaultService } from '../default.service';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@awesome-cordova-plugins/camera-preview/ngx';


interface Prediction {
  class: string;
  bbox: number[];
  score: number;

}
interface PredictionResult {
  image: string,
  predictions: Prediction[]
}


@Component({
  selector: 'app-object-recognition',
  templateUrl: './object-recognition.component.html',
  styleUrls: ['./object-recognition.component.scss'],
})
export class ObjectRecognitionComponent implements AfterViewInit {

  //ViewChild('video') video: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('alertImage') alertImage: ElementRef;

  hasAlert = false;
  alertsPerMinute = 10; // how many alerts to report per minute
  detectionPerSecond = 15; // run 10 detection per second
  detectionInterval = interval(1000 / this.detectionPerSecond); // how many detections to run per second
  onPredicitionsObserver = new Subject<PredictionResult>();
  onAlertsObserver = new Subject<Alert>();
  isScreenInView = new Subject<boolean>(); // track if screen in view
  clearAlertObserver = new Subject<void>(); // used to toggle alert css class

  session: any;
  constructor(private defaultService: DefaultService, private cameraPreview: CameraPreview) {
    this.session = this.defaultService.getSession();
  }
  ngAfterViewInit(): void {


    const cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'rear',
      tapPhoto: false,
      previewDrag: true,
      toBack: true,
      alpha: 1,
      storeToFile: false
    }

    const webCamPromise = this.cameraPreview.startCamera(cameraPreviewOpts);


    const modelPromise = cocoSsd.load();


    Promise.all([modelPromise, webCamPromise]).then(values => {
      // model and camera are both ready

      this.initDetection(values[0]);

    });


  }

  analyzePredictions(predictionResult: PredictionResult) {

    // analyze how many screen in the view
    const screenClasses = ['cell phone', 'tv', 'laptop', 'mobile', 'screen'];

    const predictions = predictionResult.predictions;
    const screenInView = predictions.filter(e => screenClasses.includes(e.class)).length;

    if (screenInView === 0) { // no screen in the view
      this.isScreenInView.next(false);
    } else if (screenInView === 1) { // only one screen in the view
      this.isScreenInView.next(true);
    } else {  // multiple screen in the view
      this.isScreenInView.next(true);
      this.onAlertsObserver.next({ type: AlertType.multipleScreen, sessionId: this.session.id, meta: { image: predictionResult.image } });
    }


    // analyze how many person in the view

    const personClasses = ['person'];

    const personInView = predictions.filter(e => personClasses.includes(e.class)).length;
    if (personInView > 0) {
      this.onAlertsObserver.next({ type: AlertType.person, sessionId: this.session.id, meta: { image: predictionResult.image } });
    }


  }




  onPredictions(predictionResult: PredictionResult) {
    this.renderPredictions(predictionResult.predictions);
    this.analyzePredictions(predictionResult);

  }
  clearAlert() {
    this.hasAlert = false;
  }
  async onAlert(alert: Alert) {

    this.hasAlert = true;
    this.clearAlertObserver.next();

    try {
      console.log("take screenshot")
      const img = alert.meta.image;
      delete alert.meta.image;
      console.log("screenshot taken");
      await this.defaultService.registerEvent(this.session.id, alert, img);
    } catch (ex) { }


  }

  async updateScreenInView(isScreenInView: boolean) {
    try {
      await this.defaultService.updateScreenInView(this.session.id, isScreenInView);
    } catch (ex) { }
  }
  initDetection(model) {

    this.detectionInterval.subscribe(() => {
      this.detectFrame(model);
    });
    this.onPredicitionsObserver.subscribe(this.onPredictions.bind(this));
    this.onAlertsObserver
      .pipe(throttleTime((60 * 1000) / this.alertsPerMinute))
      .subscribe(this.onAlert.bind(this));
    this.clearAlertObserver.pipe(debounce(() => timer(200)), delay(500)).subscribe(this.clearAlert.bind(this));
    this.isScreenInView.pipe(distinctUntilChanged()).subscribe(this.updateScreenInView.bind(this));
  }

  getImage(): Promise<HTMLImageElement> {

    return new Promise((res, rej) => {

      this.cameraPreview.takePicture({ width: 256, height: 0, quality: 35 }).then((base64PictureData: string) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = 'data:image/jpeg;base64,' + base64PictureData;

        image.width = window.screen.width;
        image.height = window.screen.height;
        image.onload = () => {
          res(image);
        }


        this.alertImage.nativeElement.src = image.src;

      });

    });

  }

  async detectFrame(model: cocoSsd.ObjectDetection) {
    const img = await this.getImage();
    model.detect(tf.browser.fromPixels(img)).then(predictions => {
      this.onPredicitionsObserver.next({ image: img.src, predictions: predictions });
    });
  };

  renderPredictions(predictions: Prediction[]) {
    const c = this.canvas.nativeElement;
    c.width = window.screen.width;
    c.height = window.screen.height;

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
