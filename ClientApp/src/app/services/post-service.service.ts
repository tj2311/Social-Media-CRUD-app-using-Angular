import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { User } from "../models/user.model";
import { NonNullableFormBuilder } from "@angular/forms";
import { AuthService } from "./auth-service.service";
import { Post } from "../models/post.model";

@Injectable({providedIn: "root"})   
export class PostService {

   
    postsHaveChanged: Subject<boolean> = new Subject<boolean>();

    postList: Post[] = [];

    emptyPost: Post = {
    postId: 0,
    userId: 0,
    postContent: "",
    postDate: new Date(),
    updateDate: new Date()
    }


    constructor(
        public httpServ : HttpClient
    ){}

    getPosts(postId : number = 0){
        if(postId === 0){ // showing all posts
            return this.httpServ.get<Post[]>("http://localhost:3000/post/posts/false");
        }else{
            return this.httpServ.get<Post[]>("http://localhost:3000/post/posts/true/" + postId);
        }
    }

    removePost(postId: number){
        // this.userList.splice(index,1);
        if(confirm("are you sure you want to delete this post")){
            this.deletePost(postId).subscribe({
                next: () => {
                    alert("the post deletion was succesful")
                    this.postsHaveChanged.next(false) //changes have not been cancelled
                },
                error: (err) => {
                    console.log(err);
                    alert("post deletion has failed")
                }
            })
        }
      }

    editPost(post: Post){
        // this.userList[index] = user;
        let editType: string = "Adding "
        if (post.postId !== 0){
            editType = "Editing "
        }

        this.postPost(post).subscribe({
            next: () => {
                alert( editType + "was succesful")
                this.postsHaveChanged.next(false);
            },
            error: (err) => {
                console.log(err);
                alert("user edit failed");
            }
        })

    }  

    deletePost(postId: number){
        return this.httpServ.delete("http://localhost:3000/post/deletePost/" + postId)
    }

    postPost(postForEdit: Post){
        return this.httpServ.post("http://localhost:3000/post/editPost",postForEdit);
    }
    

    

    


}