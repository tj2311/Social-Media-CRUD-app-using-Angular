import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { User } from "../models/user.model";
import { NonNullableFormBuilder } from "@angular/forms";
import { AuthService } from "./auth-service.service";

@Injectable({providedIn: "root"})   
export class UserService {

    colorHasChanged: Subject<string> = new Subject<string>();
    usersHaveChanged: Subject<boolean> = new Subject<boolean>();

    userList: User[] = [];
    userMapping: any = {};

    emptyUser: User = {
        userId: 0,
        username: "",
        fullName: "",
        city:"",
        gender: "",
        favoriteColor: "",
        favoriteAnimal: ""
      };

    constructor(
        public httpServ : HttpClient,
        private authServ: AuthService
    ){}

    getUsers(searchText: string = ""){
        if(searchText === ""){
                        
            return this.httpServ.get<User[]>("http://localhost:3000/user/users");
            
        }else{
            console.log("userserv getUser")
            return this.httpServ.get<User[]>("http://localhost:3000/user/userSearch/" + searchText);
        }
        
    }

    getsingleuser(userId: number){
        return this.httpServ.get<User>("http://localhost:3000/user/userSingle/" + userId)
    }

    removeUser(userId: number){
        // this.userList.splice(index,1);
        if(confirm("are you sure you want to delete this user")){
            this.deleteUser(userId).subscribe({
                next: () => {
                    alert("the deletion was succesful")
                    this.usersHaveChanged.next(false) //changes have not been cancelled
                },
                error: (err) => {
                    console.log(err);
                    alert("user deletion has failed")
                }
            })
        }
      }

    editUser(user: User){
        // this.userList[index] = user;
        this.putUser(user).subscribe({
            next: () => {
                alert("edit was succesful")
                this.usersHaveChanged.next(false);
            },
            error: (err) => {
                console.log(err);
                alert("user edit failed");
            }
        })

    }  
    addUser(user: User){
        this.postUser(user).subscribe({
            next: () => {
                alert("adding a user was succesful")
                this.usersHaveChanged.next(false);
            },
            error: (err) => {
                console.log(err);
                alert("adding a user failed");
            }
        })

    }
    deleteUser(userId: number){
        return this.httpServ.delete("http://localhost:3000/user/deleteUser/" + userId)
    }

    putUser(userForEdit: User){
        return this.httpServ.put("http://localhost:3000/user/editUser",userForEdit);
    }
    postUser(userForEdit: User){
        return this.httpServ.post("http://localhost:3000/user/addUser",userForEdit);
    }
    

    

    


}