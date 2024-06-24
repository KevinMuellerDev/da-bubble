import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  originMessage!:any
  isActive: boolean = false;


 testResponse = [
  {
     emoji: [{
      count:0,
      emoji: "😀",
      users: [{}],
    }], 
    id: "NzDi09mxAgQdoCtGwanHA0KjMOC3",
    message: "moin aus dem dummy array",
    name: "Hans Werner Olm",
    profilePicture: "/assets/img/profile/testchar1.svg",
    timestamp: 1234567890,
   },
   {
     emoji: [{
      count:0,
      emoji: "😀",
      users: [{}],
    }], 
    id: "NzDi09mxAgQdoCtGwanHA0KjMOC3",
    message: "yoa läuft aller",
    name: "Hans Werner Olm",
    profilePicture: "/assets/img/profile/testchar1.svg",
    timestamp: 1234567890,
  }
  ];
  
  constructor() { }
}
