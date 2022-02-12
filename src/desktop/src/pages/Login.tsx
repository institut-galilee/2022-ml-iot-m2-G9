import "./Login.css";
import React, { useState } from "react";

import * as service from "../default-service";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";

function Login() {
  const TITLE = "Exam monitoring System";
  
  const [ne, setNe] = useState(""); // '' is the initial state value
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 
  async function login() {
    try {
      const response = await service.login({ NE: ne, password: password });
      service.saveSession(response.data);
      
      navigate("/init"); 
    } catch (ex) {
      swal(
        "Essayer à nouveau",
        "Le NE ou le mot de passe est incorrect",
        "error"
      );
    }
  }
  return (
    <div className="home">
      <div className="form">
        <div>
          <img
            src="homme-robot.png"
            alt="MDN logo"
            width="100"
            height="100"
          ></img>
          <input
            className="input"
            placeholder="Numero Etudiant"
            type="text"
            name="NE"
            value={ne}
            onChange={(e) => setNe(e.target.value)}
          />
          <input
            className="input"
            placeholder="Mot de Passe"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="input" onClick={() => login()}>
            Se Connecter
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
