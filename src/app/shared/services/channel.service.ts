import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, setDoc } from '@angular/fire/firestore';
import { ChannelData } from '../models/channels.class';
import { ChannelInfo } from '../interfaces/channelinfo';
@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);

  constructor() { }


  /**
   * Creates a new Channel in firestore
   */
  async createNewChannel(channelData:ChannelInfo) {
    await addDoc(collection(this.firestore, "Channels"), channelData);
  }


  /**
   * Firestore collection reference for Channels
   * @returns collection
   */
  refChannels() {
    return collection(this.firestore, "Channels")
  }
}
