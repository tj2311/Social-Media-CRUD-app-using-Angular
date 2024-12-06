import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { AuthService } from "../services/auth-service.service";
import { EMPTY } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authServ: AuthService
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
       if(this.authServ.token !== ""){
            const authenticatedReq = req.clone({
                headers: req.headers.append("Authorization", "Bearer " + this.authServ.token)  // this allows us to intercept the http requests to attach our token to it  
            });
            
            return next.handle(authenticatedReq);

       } else if(req.url.toLowerCase().includes("login") || req.url.toLowerCase().includes("register")){

            return next.handle(req);

       } else {

            return EMPTY
       }

      
    }
}