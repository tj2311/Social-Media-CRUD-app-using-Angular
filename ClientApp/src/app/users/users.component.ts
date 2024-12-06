import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../services/user-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observer, PartialObserver, Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css','../app.component.css']
})
export class UsersComponent implements OnInit,OnDestroy {
  

  userHasChangedSubscription : Subscription = new Subscription();
  addingNewUser: boolean = false;
  userSearch: string = "";

  constructor(
    public userService: UserService
  ){}
  
  ngOnInit(): void {
    console.log('users component has been initalized');
    this.getUsers()
    this.userHasChangedSubscription = this.userService.usersHaveChanged.subscribe((changesCancelled: boolean) => {
      if(!changesCancelled){
        this.getUsers()
      }
      this.addingNewUser = false
    })
    
    }

  ngOnDestroy(): void {
    console.log('user component has been destroyed');
    this.userHasChangedSubscription.unsubscribe();
  }

  addNewUser(){
    this.addingNewUser = true;
  }

  getUsers(){
    let responseObject: Partial<Observer<User[]>> = { // subscribe method call expects partial observer type of array of users
      next: (res: User[])  => {
        this.userService.userList = res;
        // this.userService.usersHaveChanged.subscribe(() => {
        //   this.userService.getUsers()
        // })
        // res.forEach((row: User) => {
        //   console.log(row.username +" " + row.city)
        // })
        // console.log(res);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    }

    if (!this.userSearch){
      this.userService.getUsers().subscribe(responseObject)
    } else {
      this.userService.getUsers(this.userSearch).subscribe(responseObject)
    }
  }
}
