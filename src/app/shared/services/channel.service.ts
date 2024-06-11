import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { ChannelData } from '../models/channels.class';
import { ChannelInfo } from '../interfaces/channelinfo';
@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);
  newChannel?:ChannelInfo;

  constructor() { }


  /**
   * Creates a new Channel in firestore
   */
  async createNewChannel(channelData:ChannelInfo) {
    await addDoc(collection(this.firestore, "Channels"), channelData)
    .then((docRef)=>{
      channelData.users.forEach(async user => {
        const channelId= {channelid: docRef.id}
        await addDoc(collection(this.firestore, 'user', user, 'userchannels'), channelId)
      });
    });
  }


  /**
   * Firestore collection reference for Channels
   * @returns collection
   */
  refChannels() {
    return collection(this.firestore, "Channels")
  }
}
