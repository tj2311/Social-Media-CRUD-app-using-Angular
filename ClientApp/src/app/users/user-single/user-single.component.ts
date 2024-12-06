import { Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { UserService } from '../../services/user-service.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-user-single',
  templateUrl: './user-single.component.html',
  styleUrl: './user-single.component.css'
})
export class UserSingleComponent implements OnInit, OnDestroy{
  // @Input() user: string = "";  // @Input allows you to recieve a value from a parent component into an object in the child component (user in this case)
  @Input() userIndex: number = -1;
  @Input() addMode: boolean = false;
  userId: number = -1;
  // @Output() deleteUser: EventEmitter<number> = new EventEmitter<number>();

  textColor: any = {
    color: "black",
  }

  toBeEdited: boolean = false;
  displayUser:boolean = false;
  isSingleUser: boolean = false;

  userForDisplay: User = {
    userId: 0,
    username: "",
    fullName: "",
    city:"",
    gender: "",
    favoriteColor: "",
    favoriteAnimal: ""
  };

  newUser: User = {
    userId: 0,
    username: "",
    fullName: "",
    city:"",
    gender: "",
    favoriteColor: "",
    favoriteAnimal: ""
  };
      
 constructor(
  public userService: UserService,
  private route: ActivatedRoute,
  private router: Router,
  public authService: AuthService
 ){}



  colorHasChangedSubscription : Subscription = new Subscription(); 
  
  
  

  ngOnInit(): void {
      this.colorHasChangedSubscription = this.userService.colorHasChanged.subscribe((newColor) =>{
      console.log(newColor);
      this.textColor.color = newColor;
    })
    this.subscribeParams();
    this.setUserForDisplay()
  }

  setUserForDisplay(){
    if (this.userIndex !== -1){
      this.userForDisplay = this.userService.userList[this.userIndex]
      this.displayUser = true;
    }
  }

  goToSingleUser(userId: number){
    this.router.navigate(["user",userId]); // navigates to user/userId
  }

  goToUserList(){
    this.router.navigate(["user"])
  }
  usersHaveChangedSubscription: Subscription = new Subscription();

  subscribeParams(){ // generates a single user
    this.route.params.subscribe(params => {
      if(params["userId"]){
        this.isSingleUser = true;
        this.userId = +params["userId"]  
        this.getUserById();
        this.userService.usersHaveChanged.subscribe(() => {
          this.getUserById();
        })     
      }
    })
  }

  getUserById(){
    if(this.userId > 0 ){
      this.userService.getsingleuser(this.userId).subscribe({
        next: (res) => {
          if (res){

            this.userForDisplay = res;
            this.displayUser = true
          }
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }

  toggleEdit(editMode: boolean, user: User = {...this.userService.emptyUser}){
    this.toBeEdited = editMode;
    this.newUser = {...user}
    if(!editMode){
      this.userService.usersHaveChanged.next(true);
    }
  }

  submitEdit(){
    if(this.addMode){
      this.userService.addUser(this.newUser)

    }else{
      this.toBeEdited = false;
      this.userService.editUser(this.newUser)
    }
   
  }

  ngOnDestroy(): void {
    this.colorHasChangedSubscription.unsubscribe();
    this.usersHaveChangedSubscription.unsubscribe();
  }
}
