import { Injectable, inject } from '@angular/core';
import { User, user } from '@angular/fire/auth';
import { Firestore, Unsubscribe, addDoc, collection, doc, getDoc, getDocs, onSnapshot, updateDoc, where } from '@angular/fire/firestore';
import { UserInfo } from '../interfaces/userinfo';
import { UserData } from '../models/userdata.class';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  firestore: Firestore = inject(Firestore);

  currentUser: string = "JfMpAjRa0E0O3X2p1AbH";
  userInfo: UserInfo = new UserData();

  unsubUser;

  constructor() {
    this.unsubUser = this.retrieveUserProfile();
  }

  retrieveUserProfile() {
    return onSnapshot(doc(this.refUserProfile(), this.currentUser), (doc) => {
      this.userInfo = new UserData(doc.data())
      console.log(this.userInfo);
      
    });
  }

  refUserProfile() {
    return collection(this.firestore, "user")
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unsubUser();
  }
}
