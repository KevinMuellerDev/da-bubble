import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firestore: Firestore = inject(Firestore);
  constructor() { }

  updateUserMail(){
    
  }
}
