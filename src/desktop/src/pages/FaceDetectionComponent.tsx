/* tslint:disable */
import React, { useEffect, useRef, useState } from "react";
import "./FaceDetectionComponent.css";
import * as faceapi from "face-api.js";
import { FaceMatcher, resizeResults, SsdMobilenetv1Options } from "face-api.js";
import * as service from "../default-service";

class FaceDetectionComponent extends React.Component {
  videoRef: any;
  canvasRef: any;
  session: any;
  constructor(props: any) {
    super(props);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.session = service.getSession();

    //this.image = 'http://localhost:5000/static/images/rami.jpeg';
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
    console.log("recong");

    this.initFaceMatcher();
  }

  //const video = document.querySelector('video')

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

    resizedDetections.forEach(({ detection, descriptor }) => {
      const label = faceMatcher.findBestMatch(descriptor).toString();
      const options = { label };
      const drawBox = new faceapi.draw.DrawBox(detection.box, options);
      drawBox.draw(canvas);
    });
  }

  async initFaceMatcher() {
    const studentFaceDescriptor = await this.loadStudentFaceDescriptor();
    const faceMatcher = new faceapi.FaceMatcher(studentFaceDescriptor, 0.6);

    const video = this.videoRef.current;
    const canvas = this.canvasRef.current;

    const displaySize = {
      width: video.clientWidth,
      height: video.clientHeight,
    };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(() => this.detectFace(faceMatcher), 100);
  }

  render() {
    return (
      <div className="video-container">
        <video ref={this.videoRef}></video>
        <canvas ref={this.canvasRef} id="canvas"></canvas>
      </div>
    );
  }
}

export default FaceDetectionComponent;
