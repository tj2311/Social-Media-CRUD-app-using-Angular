import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service.service';
import { Registration } from '../../models/registration.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  
  constructor(
    public authServ: AuthService,
    public router: Router
  ){ }

  registration: Registration = {
    username: "",
    password: "",
    passwordConfirm: "",
    fullName: "",
    city:"",
    gender: "",
    favoriteColor: "",
    favoriteAnimal: ""
  }

  submitRegistration(){
    console.log(this.registration)
    this.authServ.postRegistration(this.registration).subscribe({
      next: (res) => {
        alert("registration was succesful")
        this.router.navigate(['login'])
      },
      error: (err) => {
        console.log(err);
        if (err?.error?.message === "username is not unique"){
          alert(err.error.message)
        } else {
          alert("there was an error processing your registration")
        }
      }
    })
  }
}
