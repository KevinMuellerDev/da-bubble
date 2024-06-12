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
 * The function creates a new channel in Firestore and adds the channel ID to the user's list of
 * channels.
 * @param {ChannelInfo} channelData - The `channelData` parameter is an object containing information
 * about a new channel that needs to be created. It likely includes details such as the channel name,
 * description, creator, and list of users who will be part of the channel.
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
