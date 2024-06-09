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


  /**
   * Starts snapshot on Channels Collection
   * 
   * @returns Unsubscribe
   */
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


  /**
   * Starts snapshot on userchannels and rearranges the channels in the sidebar when a user left or has been
   * added to a channel.
   * 
   * @returns Unsubscribe
   */
  retrieveCurrentChannels(){
    const unsubscribe = onSnapshot(query(this.userService.refUserChannels()), async (querySnapshot) => {
      let channelCounter = 0;
      querySnapshot.forEach(() => {
        channelCounter++;
      });
      if (channelCounter != this.channels.length) {
        await this.removeChannelUser();
      }
    });
    return unsubscribe
  }


  /**
   * Pushes the actual channels of the user into the channel array
   */
  async removeChannelUser(){
    const querySnapshot = await getDocs(query(this.refChannels()));
    this.channels = [],
    querySnapshot.forEach(channel => {
      if (this.userService.userChannels.includes(channel.id)) {
        this.channels.push(channel.data()['title'])
      }
    });
  }


  /**
   * Firestore collection reference for Channels
   * 
   * @returns collection
   */
  refChannels(){
    return collection(this.firestore, "Channels")
  }
}
