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
    message: "Ich habe die gleiche Frage. Ich habe gegoogelt und es scheint, dass die aktuelle Version Angular 13 ist. Vielleicht weiß Frederik, ob es wahr ist.",
    name: "Sofia Müller",
    profilePicture: "/assets/img/profile/testchar1.svg",
    timestamp: 1234567890,
   },
   {
     emoji: [{
      count:0,
      emoji: "😀",
      users: [{}],
    }], 
    id: "ich",
    message: "yoa läuft aller",
    name: "Ich",
    profilePicture: "/assets/img/profile/testchar1.svg",
    timestamp: 23234567890,
  }
  ];
  
  constructor() { }
}
