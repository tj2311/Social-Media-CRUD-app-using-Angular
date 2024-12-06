import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';
import { Login } from '../../models/login.model';
import { TokenReponse } from '../../models/tokenResponse.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  constructor(
    public router: Router,
    public authServ: AuthService
  ){}

  login: Login = {
    username : "",
    password: "",
}


  goToRegistration(event: Event){
    event.preventDefault(); // Prevent href from navigating us to the default "" url
    this.router.navigate(["register"])
  }

  submitLogin(){
    this.authServ.postLogin(this.login).subscribe({
      next: (res: TokenReponse) => {
        // console.log(res)
        this.authServ.handleLogin(res.token).then(() => {
          this.router.navigate(["user"])
        });
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
}
