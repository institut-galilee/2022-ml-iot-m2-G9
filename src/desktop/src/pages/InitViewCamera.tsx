import "./InitViewCamera.css";
import React, { useState } from "react";

import * as service from "../default-service";
import swal from "sweetalert";
import { NavigateFunction, useNavigate } from "react-router-dom";
function InitViewCamera() {
  const session = service.getSession();
  const navigate = useNavigate();

  async function verifyCamera() {
    try {
      await service.start(session.id);
      navigate("/supervision");
    } catch (ex) {
      swal(
        "Essayer à nouveau",
        "Le Caméra n'est pas connecté ou n'est pas bien positionné",
        "error"
      );
    }
  }

  return (
    <div className="init">
      <div className="wrapper">
        <img
          src="homme-robot.png"
          alt="MDN logo"
          width="100"
          height="100"
        ></img>
        <h3>
          Veuillez entrer l'identifiant de session suivant dans votre caméra de
          vue.
          <br />
          Ensuite, assurez-vous que la caméra est face à votre écran.
          <br />
          Appuyez sur Démarrer.
          <br />
        </h3>
        <div className="session-id">
          <h1>{session.id}</h1>
        </div>
        <button className="input" onClick={() => verifyCamera()}>
          Démarrer
        </button>
      </div>
    </div>
  );
}

export default InitViewCamera;
