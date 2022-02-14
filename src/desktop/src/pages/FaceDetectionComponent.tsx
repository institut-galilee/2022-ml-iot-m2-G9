/* tslint:disable */
import React, { useEffect, useRef, useState } from "react";
import "./FaceDetectionComponent.css";
import * as faceapi from "face-api.js";
import {
  FaceMatcher,
  ObjectDetection,
  resizeResults,
  SsdMobilenetv1Options,
} from "face-api.js";
import * as service from "../default-service";
import { match } from "assert";
import { debounce, delay, interval, Subject, throttleTime, timer } from "rxjs";
import Alert, { AlertType } from "../alert.interface";

class FaceDetectionComponent extends React.Component<any, any> {
  videoRef: any;
  canvasRef: any;
  session: any;

  detectionPerSecond = 10; // run 10 detection per second
  detectionInterval = interval(1000 / this.detectionPerSecond); // how many detections to run per second
  alertsPerMinute = 10; // how many alerts to report per minute
  onAlertsObserver = new Subject<Alert>();
  clearAlertObserver = new Subject<void>(); // used to toggle alert css class

  clearAlert() {
    this.setState({ hasAlert: false });
  }
  constructor(props: any) {
    super(props);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.session = service.getSession();
    this.state = { hasAlert: false };
  }

  async componentDidMount() {
    await Promise.all([
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    ]);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: 1200,
      },
    });

    const video = this.videoRef.current; // curent;
    video.srcObject = stream;
    video.play();

    this.initFaceMatcher();
    this.onAlertsObserver
      .pipe(throttleTime((60 * 1000) / this.alertsPerMinute))
      .subscribe(this.onAlert.bind(this));

    this.clearAlertObserver
      .pipe(delay(500))
      .subscribe(this.clearAlert.bind(this));
  }

  getScreenshot(): Promise<Blob> {
    const video = this.videoRef.current;
    const scale = 1;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = (video.clientHeight / video.clientWidth) * canvas.width;
    canvas
      .getContext("2d")
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((res, rej) => {
      canvas.toBlob((blob) => {
        if (blob === null) rej();
        else res(blob);
      }, "image/jpg");
    });
  }

  async onAlert(alert: Alert) {
    this.setState({ hasAlert: true });

    try {
      const img = await this.getScreenshot();
      await service.registerEvent(this.session.id, alert, img);
    } catch (ex) {}
  }

  async loadStudentFaceDescriptor() {
    const img = await faceapi.fetchImage(this.session.img);

    const detection = await faceapi
      .detectSingleFace(img, new SsdMobilenetv1Options({ minConfidence: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error(`no face detected for in the student image `);
    }
    return detection;
  }

  async detectFace(faceMatcher: FaceMatcher) {
    const video = this.videoRef.current;
    const canvas = this.canvasRef.current;

    const displaySize = {
      width: video.clientWidth,
      height: video.clientHeight,
    };

    const detections = await faceapi
      .detectAllFaces(video, new SsdMobilenetv1Options({ minConfidence: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    const results = resizedDetections.map(({ detection, descriptor }) => {
      const match = faceMatcher.findBestMatch(descriptor);
      return { detection, match };
    });

    results.forEach(({ detection, match }) => {
      const options = { label: match.toString() };
      const drawBox = new faceapi.draw.DrawBox(detection.box, options);
      drawBox.draw(canvas);
    });

    this.analyzeResults(results);
  }

  async initFaceMatcher() {
    const studentFaceDescriptor = await this.loadStudentFaceDescriptor();
    const faceMatcher = new faceapi.FaceMatcher(studentFaceDescriptor, 0.7); // if distance is more thatn 0.7 then it's considered unknown

    const video = this.videoRef.current;
    const canvas = this.canvasRef.current;

    const displaySize = {
      width: video.clientWidth,
      height: video.clientHeight,
    };
    faceapi.matchDimensions(canvas, displaySize);
    this.detectionInterval.subscribe(() => this.detectFace(faceMatcher));
  }

  analyzeResults(
    detections: { match: faceapi.FaceMatch; detection: faceapi.FaceDetection }[]
  ) {
    let alertDetected = false;
    if (detections.length > 1) {
      // multiple faces have been detected

      this.onAlertsObserver.next({
        type: AlertType.multipleFace,
        sessionId: this.session.id,
      });

      alertDetected = true;
    }
    for (const { match } of detections) {
      if (match.label === "unknown") {
        this.onAlertsObserver.next({
          type: AlertType.strangeFace,
          sessionId: this.session.id,
        });
        alertDetected = true;
      }
    }
    if (!alertDetected) {
      this.clearAlertObserver.next();
    }
  }

  async end() {
    this.onAlertsObserver.complete();
    try {
      await service.end(this.session.id);
    } catch (ex) {}
    this.setState({ ended: true });
    service.clearSession();
    window.location.href = "/";
  }
  render() {
    return (
      <div>
        <div
          className={"video-container" + (this.state.hasAlert ? " danger" : "")}
        >
          <video ref={this.videoRef}></video>
          <canvas ref={this.canvasRef} id="canvas"></canvas>
        </div>
        <div className="button-wrapper">
          <button className="input" onClick={() => this.end()}>
            Finir
          </button>
        </div>
      </div>
    );
  }
}

export default FaceDetectionComponent;
