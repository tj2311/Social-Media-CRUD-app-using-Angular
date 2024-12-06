import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PostService } from '../services/post-service.service';
import { Post } from '../models/post.model';
import { UserService } from '../services/user-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit, OnDestroy{

  @Input() userId: number = 0;
  addMode: boolean = false;
  
  constructor(
    public postService: PostService,
    public userService: UserService
  ){}
  
  
  postsHaveChangedSubscription = new Subscription();
  
  ngOnInit(): void {
    this.postService.postList = [];
    this.getPosts();
    this.subscribePostsHaveChanged(); 
  }
  ngOnDestroy(): void {
    this.postsHaveChangedSubscription.unsubscribe()
  }

  subscribePostsHaveChanged(){
    this.postsHaveChangedSubscription = this.postService.postsHaveChanged.subscribe((cancelled:boolean) => {
      
      this.addMode = false;
      if (!cancelled){
        this.getPosts()
      }
    })
  }

  addNewPost(){
    this.addMode = true;
  }

  getPosts(){
    this.postService.getPosts(this.userId).subscribe({
      next: (res: Post[]) => {
        this.postService.postList = res;
        this.postService.postList.sort((first: Post, second: Post) => {
          return Date.parse(first.postDate as string) > Date.parse(second.postDate as string) ? -1 : 1
        })
      }
    })
  }
}
