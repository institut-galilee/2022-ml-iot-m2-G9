import logo from './logo.svg';
import './App.css';
import Home from './pages/Home';
import React from "react";
import {BrowserRouter as Router, Route ,  Routes} from 'react-router-dom'
import FaceDetectionComponent from './pages/FaceDetectionComponent';






function App() {
  return (
    <div className="App">
      
    <Router>

     <Routes>
     <Route path="/"  element={<Home/>} ></Route>
     <Route path="/face"  element={<FaceDetectionComponent/>}></Route>

     
     </Routes>

      
    </Router>
    
    

  
  </div>
  );
}

export default App;
