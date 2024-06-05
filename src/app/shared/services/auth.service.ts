import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { User, getAuth, updateEmail } from "firebase/auth";
import { UserService } from './user.service';
import { signInWithEmailAndPassword, verifyBeforeUpdateEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  verified: boolean = false;
  constructor() { }

  async verifyChange(key: string) {
    const auth = getAuth();
    console.log(this.userService.userInfo.email);
    await signInWithEmailAndPassword(auth, this.userService.userInfo.email, key)
      .then(() => {
        console.log('succesfull');
        
      }).catch((error) => {
        console.error(error);

      });


  }

  // TODO: vorherige erneute passwortabfrage
  async updateUserMail(mail: string) {
    const auth = getAuth();
    updateEmail(auth.currentUser as User, mail).then(() => {
      console.log(auth.currentUser);
    }).catch((error) => {
      console.error(error);
    });
  }

}
