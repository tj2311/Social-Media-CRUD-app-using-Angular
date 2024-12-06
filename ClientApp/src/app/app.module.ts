import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { UserSingleComponent } from './users/user-single/user-single.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthInterceptor } from './architecture/AuthInterceptor.interceptor';
import { PostsComponent } from './posts/posts.component';
import { PostSingleComponent } from './posts/post-single/post-single.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    UserSingleComponent,
    LoginComponent,
    RegisterComponent,
    PostsComponent,
    PostSingleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
},provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
