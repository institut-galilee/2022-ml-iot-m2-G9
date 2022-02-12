import "./App.css";
import Login from "./pages/Login";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FaceDetectionComponent from "./pages/FaceDetectionComponent";
import InitViewCamera from "./pages/InitViewCamera";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/init" element={<InitViewCamera />}></Route>
          <Route path="/supervision" element={<FaceDetectionComponent />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
