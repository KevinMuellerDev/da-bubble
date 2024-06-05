import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, addDoc, collection, doc, getDoc, getDocs, setDoc, onSnapshot, updateDoc, where } from '@angular/fire/firestore';
import { UserInfo } from '../interfaces/userinfo';
import { UserData } from '../models/userdata.class';
import { LoginComponent } from '../../login/login.component';
import { RouterLink, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class UserService{
  firestore: Firestore = inject(Firestore);
  currentUser?: string | null;
  userInfo: UserInfo = new UserData();
  createUserInfo: UserInfo ={
    name:"",
    email:"",
    id:"",
    isLoggedIn:false,
    profilePicture:"",
  };
  key!:string;

  constructor(private router: Router) {
    console.log('bin da');
    if (sessionStorage.getItem("uid") === null && this.router.url !== '/register')
      this.router.navigate(['/']);
    console.log(this.currentUser);
    
  }

  //TODO: Daten holen nach der Profil bearbeitung

  /**
   * listens to changes to referenced collection and stores the data
   * in userInfo
   * @returns Unsubscribe from snapshot
   */
  async retrieveUserProfile() {
    const data = sessionStorage.getItem("uid");
    
    this.currentUser = data;
    const docRef = doc(this.refUserProfile(), this.currentUser as string);
    const docSnap = await getDoc(docRef);

    this.userInfo =new UserData(docSnap.data())   
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
    await setDoc(doc(this.firestore, "user", this.createUserInfo.id), this.createUserInfo);
  }


  /**
   * Return the collection to which should be referenced to in a snapshot for example
   * @returns collection reference - firestore
   */
  refUserProfile() {
    return collection(this.firestore, "user")
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
    console.log(this.createUserInfo);
    
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


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    console.log('bin da');
    
  }
}
