
import './Home.css';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import React from 'react';
function Home( ) {
    
  const TITLE = 'Exam monitoring System'
   return (
     <div className="home">

        <div className="form">
          <div >
    
          <img src="homme-robot.png" alt="MDN logo"  width="100" height="100"></img>

        
            <input className="sessionKey" placeholder="Session ID" type="text" name="username"/>
             <br/>
             <br/>
             <br/>
             <br/>
            <abbr title="required"></abbr>
            <br/>
    <button className="Session" title="Submit"> Submit </button>
          </div>
        </div>


    </div>

   );
 }
 
 export default Home;