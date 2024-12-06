import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { UsersComponent } from "./users/users.component";
import { UserSingleComponent } from "./users/user-single/user-single.component";
import { RegisterComponent } from "./auth/register/register.component";
import { authGuard } from "./architecture/auth-guard.guard";
import { PostsComponent } from "./posts/posts.component";


// Routes are evaulated from top to bottom
// When this is a match on more than one route, we will go to the one higher on the list
const routes: Routes = [
    {path: "", redirectTo:"user", pathMatch: "full"}, // pathmatch full means url has to match exactly to path
    {path: "login", component: LoginComponent},
    {path: "register", component: RegisterComponent},
    {path: "", canActivate:[authGuard], children:[ // if you are logged in
        {path:"user", children:[
            {path: "", component: UsersComponent, pathMatch: "full"},
            {path: ":userId", component: UserSingleComponent}
        ]},
        {path: "posts", component: PostsComponent},
        {path: "**", redirectTo:"user"} 
    ]},
    {path: "**", redirectTo:"login"} // "**" means the route of nothing
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}