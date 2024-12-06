import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Registration } from "../models/registration.model";
import { Login } from "../models/login.model";
import { TokenReponse } from "../models/tokenResponse.model";
import { jwtDecode } from "jwt-decode";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

@Injectable({providedIn: "root"})  

export class AuthService {

    emptyToken: Login = {
        username : "",
        password: "",
    }

    emptyRegistration: Registration = {
        username: "",
        password: "",
        passwordConfirm: "",
        fullName: "",
        city:"",
        gender: "",
        favoriteColor: "",
        favoriteAnimal: ""
    }

    authHasChanged: Subject<void> = new Subject<void>();

  favoriteColor: string = "";
  fullName: string = "";
  userId: number = 0;
  username: string = "";
  isAuthenticated: boolean = false;
  token: string = "";

    constructor(
        public httpServ : HttpClient,
        private router : Router
    ){}

    handleLogin(token: string){
        console.log("as")
        return new Promise<void>(resolve => {
           
            localStorage.setItem("token",token)   // local storage is small amount of storage we have in the users browsers. Used so token isnt reset everytime you refresh the page
            let tokenInfo: any = jwtDecode(token);
            // console.log(tokenInfo)
            this.favoriteColor = tokenInfo["favoriteColor"];
            this.fullName = tokenInfo['fullName'];
            this.userId = tokenInfo["userId"];
            this.username = tokenInfo["username"];
            this.isAuthenticated = true;
            this.token = token;
            this.authHasChanged.next();
            resolve();
        })
    }

    logout(){
                 
            localStorage.setItem("token","")   // local storage is small amount of storage we have in the users browsers. Used so token isnt reset everytime you refresh the page
            
            // console.log(tokenInfo)
            this.favoriteColor = "";
            this.fullName = "";
            this.userId = 0;
            this.username = "";
            this.isAuthenticated = false;
            this.token = "";
            this.router.navigate(["/login"])
            
        
    }

    postRegistration(userForRegistration: Registration){
        return this.httpServ.post("http://localhost:3000/auth/register",userForRegistration);
    }

    postLogin(userForLogin: Login){
        return this.httpServ.post<TokenReponse>("http://localhost:3000/auth/login",userForLogin)
    }

    getRefreshToken(){
        return this.httpServ.get<TokenReponse>("http://localhost:3000/auth/refreshToken")
    }



    

    

    


}