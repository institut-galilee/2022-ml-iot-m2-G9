import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DefaultService } from '../default.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  constructor(private defaultService: DefaultService, private router: Router, public alertController: AlertController) {

  }

  ngOnInit() { }

  async connect(sessionId: string) {

    try {
      const result = await this.defaultService.connect(sessionId);
      console.log(result);
      this.defaultService.saveSession(result);
      this.router.navigate(['/start']);
    } catch (ex) {
      console.log(ex);
      const alert = await this.alertController.create({
        cssClass: 'alert',
        header: 'Veuillez réessayer',
        subHeader: '',
        message: ex.message  +  ' La séance n\'existe pas.',
        buttons: ['OK']
      });

      await alert.present();

    }
  }
}
