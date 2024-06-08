import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, addDoc, collection, doc, query, getDoc, getDocs, setDoc, onSnapshot, updateDoc, where, FieldValue, arrayRemove } from '@angular/fire/firestore';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService)
  channels:string[] = [];

  constructor() { }

  //TODO: snapshot implementieren der auf die user channels schaut, wenn sich diese ändern wird
  //      der user aus dem jeweiligen channel array gelöscht.

  retrieveChannels(){
    const unsubscribe = onSnapshot(query(this.refChannels()), (querySnapshot) => {
      this.channels = [];
      querySnapshot.forEach(channel => {
        if (this.userService.userChannels.includes(channel.id)) {
          this.channels.push(channel.data()['title'])
        }
      });
    });
    return unsubscribe
  }

  retrieveCurrentChannels(){
    const unsubscribe = onSnapshot(query(this.userService.refUserChannels()), async (querySnapshot) => {
      let channelCounter = 0;
      querySnapshot.forEach(() => {
        channelCounter++;
      });
      if (channelCounter != this.channels.length) {
        const querySnapshot = await getDocs(query(this.refChannels()));
        this.channels = [],
        querySnapshot.forEach(channel => {
          if (this.userService.userChannels.includes(channel.id)) {
            this.channels.push(channel.data()['title'])
          }
        });
      }
    });
    return unsubscribe
  }

  removeChannelUser(){

  }

  refChannels(){
    return collection(this.firestore, "Channels")
  }
}
