import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, addDoc, collection, doc, query, getDoc, getDocs, setDoc, onSnapshot, updateDoc, where, DocumentData, arrayUnion } from '@angular/fire/firestore';
import { UserInfo } from '../interfaces/userinfo';
import { UserData } from '../models/userdata.class';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  firestore: Firestore = inject(Firestore);
  currentUser?: string | null;
  userInfo: UserInfo = new UserData();
  userChannels: string[] = [];
  allUsers: DocumentData[] = [];
  createUserInfo: UserInfo = {
    name: "",
    email: "",
    id: "",
    isLoggedIn: false,
    profilePicture: "",
  };
  key!: string;

  constructor(private router: Router) {
    console.log('bin da');
    if (sessionStorage.getItem("uid") === null && (this.router.url !== '/register' && !this.router.url.includes('confirmpassword')))
      this.router.navigate(['/']);
  }


  /**
   * listens to changes to referenced collection and stores the data
   * in userInfo
   * @returns Unsubscribe from snapshot
   */
  retrieveUserProfile() {
    const unsubscribe = onSnapshot(doc(this.refUserProfile(), sessionStorage.getItem("uid") as string), async (user) => {
      this.userInfo = new UserData(user.data())
      this.currentUser = sessionStorage.getItem("uid");
    });
    return unsubscribe
  }

  async userLoggedIn(){
    await updateDoc(doc(this.refUserProfile(), sessionStorage.getItem('uid') as string), {
      isLoggedIn: true
    });
  }

  async userLoggedOut(){
    await updateDoc(doc(this.refUserProfile(), sessionStorage.getItem('uid') as string), {
      isLoggedIn: false
    });
  }


  /**
   * listens to changes to referenced collection and stores the data
   * in userChannels
   * @returns Unsubscribe from snapshot
   */
  retrieveUserChannels() {
    const unsubscribe = onSnapshot(query(this.refUserChannels()), (querySnapshot) => {
      this.userChannels = [];
      querySnapshot.forEach(element => {
        this.userChannels.unshift(element.data()['channelid']);
      });
    });
    return unsubscribe
  }


/**
 * The function `retrieveAllUsers` retrieves all user data from a Firestore collection
 * @returns The `unsubscribe` function is being returned from the `retrieveAllUsers` function.
 */
  retrieveAllUsers() {
    const unsubscribe = onSnapshot(query(this.refUserProfile()), (querySnapshot) => {
      this.allUsers = [];
      querySnapshot.forEach((doc) => {
        this.allUsers.push(doc.data())
      });
    });
    return unsubscribe
  }


  /**
   * Gets the Data from input parameter and updates it in the firestore of the current user
   * 
   * @param ngForm Objectdata provided by the form in show-profile component
   */
  async updateUserProfile(ngForm: any) {
    const userProfileData = ngForm.value

    await updateDoc(doc(this.refUserProfile(), this.currentUser as string), {
      name: userProfileData.name,
      email: userProfileData.email
    });

  }

  /**
   * Creates a new user in firestore
   */
  async createUserProfile() {
    await setDoc(doc(this.firestore, "user", this.createUserInfo.id), this.createUserInfo)
      .then(async () => {
        const channelId= {channelid: 'eGATth4XDS0ztUbhnYsR'};
        await addDoc(collection(this.firestore, 'user', this.createUserInfo.id, 'userchannels'), channelId);
        await updateDoc(doc(this.firestore, "Channels", channelId.channelid), {users: arrayUnion(this.createUserInfo.id)});
      });
  }


  /**
   * Return the collection to which should be referenced to in a snapshot for example
   * @returns collection reference - firestore
   */
  refUserProfile() {
    return collection(this.firestore, "user")
  }


/**
 * The `refUserChannels` function returns a reference to the user channels collection in Firestore
 * based on the current user's ID stored in sessionStorage.
 * @returns The `refUserChannels()` function is returning a reference to the 'userchannels' collection
 * within the 'user' document corresponding to the user ID stored in the session storage.
 */
  refUserChannels() {
    return collection(this.firestore, 'user', sessionStorage.getItem("uid") as string, 'userchannels')
  }


  /**
   * Function to assign incoming data to createUserInfo
   * 
   * @param obj - FormGroup which contains data from the register form 
   * @param uid - user ID from authentification
   */
  prepareDataNewUser(obj: any) {
    this.createUserInfo.name = obj.name;
    this.createUserInfo.email = obj.email;
    this.createUserInfo.isLoggedIn = false;
  }

  /**
 * Function to assign incoming data to createUserInfo
 * 
 * @param obj - FormGroup which contains data from the register form 
 * @param uid - user ID from authentification
 */
  prepareDataNewUserGoogle(obj: any) {
    this.createUserInfo.name = obj.displayName;
    this.createUserInfo.email = obj.email;
    this.createUserInfo.isLoggedIn = false;
    this.createUserInfo.id = obj.uid;
    this.createUserInfo.profilePicture = obj.photoURL;
  }


  /**
   * Function to assign Profile picture url to createUserInfo
   * 
   * @param url - URL of the img uploaded to the firestore
   */
  newUserAvatar(url: any, uid: string) {
    this.createUserInfo.id = uid;
    this.createUserInfo.profilePicture = url;
  }

}
