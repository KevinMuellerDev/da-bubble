import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, addDoc, collection, doc, getDoc, getDocs, onSnapshot, updateDoc, where } from '@angular/fire/firestore';
import { UserInfo } from '../interfaces/userinfo';
import { UserData } from '../models/userdata.class';
import { LoginComponent } from '../../login/login.component';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  firestore: Firestore = inject(Firestore);
  authService:AuthService = inject(AuthService);
  currentUser: string | null = "JfMpAjRa0E0O3X2p1AbH";
  userInfo: UserInfo = new UserData();

  unsubUser;

  constructor() {
    let data = sessionStorage.getItem("uid");
    this.currentUser = data;
    console.log(this.currentUser);
    
    this.unsubUser = this.retrieveUserProfile();
  }

  /**
   * listens to changes to referenced collection and stores the data
   * in userInfo
   * @returns Unsubscribe from snapshot
   */
  retrieveUserProfile() {
    return onSnapshot(doc(this.refUserProfile(), this.currentUser as string), (doc) => {
      this.userInfo = new UserData(doc.data())
    });
  }

  async updateUserProfile(ngForm: any) {
    const userProfileData = ngForm.value

    await updateDoc(doc(this.refUserProfile(), this.currentUser as string), {
      name: userProfileData.name,
      email: userProfileData.email
    });

  }


  /**
   * Return the collection to which should be referenced to in a snapshot for example
   * @returns collection reference - firestore
   */
  refUserProfile() {
    return collection(this.firestore, "user")
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unsubUser();
  }
}
