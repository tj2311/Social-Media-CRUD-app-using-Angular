import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from './services/user-service.service';
import { AuthService } from './services/auth-service.service';
import { TokenReponse } from './models/tokenResponse.model';
import { Router } from '@angular/router';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  
  willShowUser:boolean = true;
  
  
  
  title = 'ClientApp';
  helloWorld: string = "hello World!!!";
  clicked: number = 0;

  willShowBlock: boolean = true;
  
  contextClicked: boolean = false;  // checks if context menu is clicked or not

  contextMenuInfo: any = {
    clientX: 0,
    clientY: 0,
    willContextMenuShow: false
  }

  toolTipInfo: any = {
    clientX: 0,
    clientY: 0,
    willToolTipShow: false
  }

  textColorForChange:string = "purple"

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.checkAuth();
    this.subscribeAuthHasChanged();
  }

  subscribeAuthHasChanged(){ // when handle login is called then getUsersForMap will be called
    this.authService.authHasChanged.subscribe(() => {
      this.getUsersForMap();
    })
  }

  getUsersForMap(){
    this.userService.getUsers().subscribe({
      next: (res: User[]) => {
        this.userService.userMapping = {}
        res.forEach((row,i) => {
          this.userService.userMapping[row.userId] = row.username;
        })
      }
    })
  }

  checkAuth(){
    console.log("checkin auth")
    let token = localStorage.getItem("token")
    if (token){
      this.authService.token = token;
      this.authService.isAuthenticated = true;
      this.authService.getRefreshToken().subscribe({
        next: (res: TokenReponse) => {
          console.log("going to handle login")
          this.authService.handleLogin(res.token);
        },
        error: (err) => {
          console.log(err);
          this.authService.logout();
        }
      })
    }
  }

  goToMyProfile(){
    let userId = this.authService.userId;
    this.router.navigate(["/user/" + userId])
  }

  goToPosts(){
    
    this.router.navigate(["posts"])
  }
  goToUser(){
    this.router.navigate(["user"])
  }

  triggerColorChange(){
    this.userService.colorHasChanged.next(this.textColorForChange);
  }

  incrementClicked(){
    this.clicked += 1;
  }
  toggleContextMenu(showContextMenu:boolean, event : MouseEvent | null = null){
    console.log(event);
    if (event !== null){
      event.preventDefault();   //prevents default context menu from showing up
      this.contextMenuInfo.clientX = event.pageX;
      this.contextMenuInfo.clientY = event.pageY;
    }
    this.contextMenuInfo.willContextMenuShow = showContextMenu;
  }

  @HostListener("document: click")
  closeContextMenu(){
    setTimeout(() => { // if the click is not a context click then we want to toggle off of our context menu
      if(!this.contextClicked){
        this.toggleContextMenu(false);
      }
    }, 10); // 10 ms later it checks if click is in context menu if it is then does nothing is not then sets to false
  }

  contextClick(){
    this.contextClicked = true;  // if clicked in the context menu sets context clicked to true
    setTimeout(() => {
      this.contextClicked = false;
    }, 20);
  }

  setShowUser(showUsers: boolean){
    this.willShowUser = showUsers;
  }

}
