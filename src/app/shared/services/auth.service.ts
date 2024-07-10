import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { User, getAuth, updateEmail } from "firebase/auth";
import { UserService } from './user.service';
import { confirmPasswordReset, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firestore: Firestore = inject(Firestore);
  verified: boolean = false;

  constructor(private userService: UserService) { }

  /**
   * Function to login into firebase auth
   * @param key string - key to login to firebase auth
   */
  async verifyChange(key: string) {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, this.userService.userInfo.email, key)
      .then(() => { })
      .catch((error) => {
        console.error(error.code, error.message);
      });
  }

  /**
   * Update email of the user in firebase auth
   * @param mail string - prvoided email
   */
  async updateUserMail(mail: string) {
    const auth = getAuth();
    updateEmail(auth.currentUser as User, mail).then(() => { })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Update Password of the user who forogt his password
   * @param code string - oobCode of the url
   * @param key string - changed password as a string
   */
  async confirmNewPassword(code: string, key: string) {
    const auth = getAuth();
    ;
    await confirmPasswordReset(auth, code, key)
      .then(() => { })
      .catch((error) => {
        console.error(error.code, '', error.message);
      })
  }
}
