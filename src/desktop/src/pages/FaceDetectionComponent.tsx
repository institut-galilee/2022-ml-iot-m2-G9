
/* tslint:disable */
import React, { useEffect, useRef, useState } from 'react';
import './FaceDetectionComponent.css';
import * as faceapi from 'face-api.js';
import { resizeResults } from 'face-api.js';


class FaceDetectionComponent extends React.Component {

  videoRef: any;
  canvasRef: any;
  constructor(props: any) {
    super(props)
    this.videoRef = React.createRef()
    this.canvasRef = React.createRef()
  }

  async componentDidMount() {




    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ])



    const stream = await navigator.mediaDevices.getUserMedia(
      {
        video: {
          facingMode: 'user',
          width: 2000
        }
      })

    console.log("video")

    const video = this.videoRef.current // curent;
    //@ts-ignore
    video.srcObject = stream
    console.log("aimen")
    //@ts-ignore
    video.play()
    console.log("recong")

    this.recognizeFaces()


  }

  //const video = document.querySelector('video')




  loadLabeledImages() {
    console.log("label image")
    //const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
    const labels = ['chaima' , 'chaima2','leo'] // for WebCam
    return Promise.all(

      labels.map(async (label) => {
        console.log('map');

        const descriptions = []
        for (let i = 1; i <= 1; i++) {
          const img = await faceapi.fetchImage(`Etudiant/${label}.jpg`)
          console.log('img');

          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          if (!detections) {
            throw new Error(`no faces detected for ${label}`)
          }
          console.log("hey");

          console.log(label + i + JSON.stringify(detections))
          descriptions.push(detections.descriptor)
       
        console.log('Faces Loaded |');
        document.body.append(label+' Faces Loaded | ')
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      }
      })
    )
  }

  async recognizeFaces() {
    console.log(" recognizeFaces() ")
    const labeledDescriptors = await this.loadLabeledImages()
    console.log("labeledDescriptors")
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5)

    console.log(labeledDescriptors.values.toString)
    console.log("addacitionlisteneer")
    const video = this.videoRef.current
    console.log(video)
    //@ts-ignore
    const canvas = this.canvasRef.current

    //@ts-ignore
    const displaySize = { width: video.clientWidth, height: video.clientHeight }
    //faceapi.matchDimensions(canvas, displaySize)
    


    setInterval(async () => {
      //@ts-ignore
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
      //number of persons
      // we will send this information each 10 seconde 
      console.log(detections.length);
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      //@ts-ignore
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

      const results = resizedDetections.map((d) => {
        return faceMatcher.matchDescriptor(d.descriptor)
    })
    //CHAIMA

  
    
      
      console.log("starting drawing")
      results.forEach((result, i) => {
        console.log("drawing")
        console.log('result ==>',results );
        
        const box = resizedDetections[i].detection.box

        const drawBox = new faceapi.draw.DrawBox(box , {label: results.toString()})
      
        drawBox.draw(canvas)
        
        

      })

    }, 100)





  }



  render() {
    return (


      <div className="video-container" >

        <video ref={this.videoRef}></video>
        <canvas ref={this.canvasRef} id="canvas"></canvas>


      </div>

    );
  }



}


export default FaceDetectionComponent;