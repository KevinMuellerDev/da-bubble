import { Injectable, inject } from '@angular/core';
import { DocumentData, Firestore, Unsubscribe, addDoc, collection, doc, getDocs, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { ChannelData } from '../models/channels.class';
import { ChannelInfo } from '../interfaces/channelinfo';
@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);
  channelMsg?: boolean;
  privateMsg?: boolean;
  newChannel?: ChannelInfo
  privateMsgData: any;
  currentMessagesId!:string;


  constructor() { }



  /**
   * The function creates a new channel in Firestore and adds the channel ID to the user's list of
   * channels.
   * @param {ChannelInfo} channelData - The `channelData` parameter is an object containing information
   * about a new channel that needs to be created. It likely includes details such as the channel name,
   * description, creator, and list of users who will be part of the channel.
   */
  async createNewChannel(channelData: ChannelInfo) {
    await addDoc(collection(this.firestore, "Channels"), channelData)
      .then((docRef) => {
        channelData.users.forEach(async user => {
          const channelId = { channelid: docRef.id }
          await addDoc(collection(this.firestore, 'user', user, 'userchannels'), channelId)
        });
      });
  }

  chooseChannelType(dm: boolean, user?: DocumentData) {
    dm ? this.privateMsg = true : this.channelMsg = true;
    if (this.privateMsg) {
      this.privateMsgData = user;
    }

  }

/**
 * The function `getDmId` asynchronously retrieves a document ID based on a specific condition from a
 * Firestore collection.
 */
  async getDmId(){
    const querySnapshot = await getDocs(query(this.refDirectMessage()));
    querySnapshot.forEach(element => {
      console.log(element.data());
      if (element.data()['dmUserId'] == this.privateMsgData.id) {
        this.currentMessagesId = element.id
      }
    });
  }

/**
 * The function `retrieveDirectMessage` retrieves direct messages using Firestore and returns an
 * unsubscribe function.
 * @returns The `unsubscribe` function is being returned from the `retrieveDirectMessage()` function.
 */
  retrieveDirectMessage() {
    let unsubscribe!: Unsubscribe;
    setTimeout(() => {
      unsubscribe = onSnapshot(query(this.refDirectMessageData(this.currentMessagesId)), (querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          console.log(doc.data());
        });
      });
    }, 10);

    return unsubscribe
  }

  /**
   * Firestore collection reference for Channels
   * @returns collection
   */
  refChannels() {
    return collection(this.firestore, "Channels")
  }

  refDirectMessage(){
    return collection(this.firestore, "user" ,sessionStorage.getItem('uid') as string , 'directmessages')
  }

  refDirectMessageData(id:string){
    return collection(this.firestore, "user" ,sessionStorage.getItem('uid') as string , 'directmessages',id, 'messages')
  }

}
