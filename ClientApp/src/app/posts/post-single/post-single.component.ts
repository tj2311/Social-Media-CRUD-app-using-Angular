import { Component, input, Input } from '@angular/core';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post-service.service';
import { UserService } from '../../services/user-service.service';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-post-single',
  templateUrl: './post-single.component.html',
  styleUrl: './post-single.component.css'
})
export class PostSingleComponent {
  @Input() addMode: boolean = false;
  @Input() post: Post = {
      postId: 0,
      userId: 0,
      postContent: "",
      postDate: new Date(),
      updateDate: new Date()
      };
      
    datePipe: DatePipe = new DatePipe("en-us")

    editMode:boolean = false;
    postForEdit: Post = {
      postId: 0,
      userId: 0,
      postContent: "",
      postDate: new Date(),
      updateDate: new Date()
      };

  constructor(
    public postService: PostService,
    public userService: UserService,
    public authService: AuthService
  ){}

  setDateForDisplay(dateToConvert: Date | string){
    if(typeof dateToConvert === "string"){
      dateToConvert = new Date(Date.parse(dateToConvert))

    }

    return this.datePipe.transform(dateToConvert,"yyyy/MM/dd")
  }

  toggleEdit(editMode: boolean = false, postForEdit: Post = {...this.postService.emptyPost}){
    this.editMode  = editMode;
    this.postForEdit = postForEdit;
    this.postService.postsHaveChanged.next(true); // means we are cancelling
  }

  saveEdit(){
    this.postService.editPost(this.postForEdit)
    this.editMode = false;
  }
}
