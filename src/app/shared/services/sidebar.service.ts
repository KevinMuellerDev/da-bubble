import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, addDoc, collection, doc, query, getDoc, getDocs, setDoc, onSnapshot, updateDoc, where, FieldValue, arrayRemove, DocumentData } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { UserData } from '../models/userdata.class';
import { ChannelService } from './channel.service';
@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  channelService:ChannelService = inject(ChannelService);
  channels: any[] = [];
  channelUsers: any[] = [];
  userDmIds: string[] = [];
  userDmData: any[] = [];

  constructor() { }


  /**
   * Starts snapshot on Channels Collection
   * 
   * @returns Unsubscribe
   */
  retrieveChannels() {
    const unsubscribe = onSnapshot(query(this.refChannels()), (querySnapshot) => {
      this.channels = [];
      querySnapshot.forEach(channel => {
        if (this.userService.userChannels.includes(channel.id))
          this.channels.push(channel.data())
      });
      console.log(this.channels);
      
    });
    return unsubscribe
  }


  /**
   * Starts snapshot on userchannels and rearranges the channels in the sidebar when a user left or has been
   * added to a channel.
   * 
   * @returns Unsubscribe
   */
  retrieveCurrentChannels() {
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

  retrieveCurrentDirectMsgs() {
    const unsubscribe = onSnapshot(query(this.refUserDirectMsgs()), (querySnapshot) => {
      this.userDmIds = [];
      querySnapshot.forEach((userDm) => {
        this.userDmIds.push(userDm.data()['dmUserId'])
      });
    });

    return unsubscribe
  }

  retrieveDmUserData() {
    const unsubscribe = onSnapshot(query(this.userService.refUserProfile()), (querySnapshot) => {
      setTimeout(() => {
        this.userDmData=[];
        querySnapshot.forEach((userDm) => {
          if (this.userDmIds.includes(userDm.id)) {
            const data: any = userDm.data();
            this.userDmData.push(data)
            console.log(this.userDmData);
          }
        });
      }, 25);
    });

    return unsubscribe
  }


  getDmStatus(isLoggedIn:boolean){
    const loggedIn = isLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }


  /**
   * Pushes the actual channels of the user into the channel array
   */
  async removeChannelUser() {
    const querySnapshot = await getDocs(query(this.refChannels()));
    this.channels = [],
    this.channelService.currentChannelUsers = [];
      querySnapshot.forEach(channel => {
        if (this.userService.userChannels.includes(channel.id)) {
          this.channels.push(channel.data())
        }
      });
  }


  /**
   * Firestore collection reference for Channels
   * @returns collection
   */
  refChannels() {
    return collection(this.firestore, "Channels")
  }

  async getUsersFromChannel() {
    const docRef = doc(this.firestore, "Channels", "eGATth4XDS0ztUbhnYsR");
    const docSnap = await getDoc(docRef);
    const channel: any = docSnap.data();
    channel.users.forEach((element: any) => {
      this.channelUsers.push(element);
      console.log(this.channelUsers);
    });
  }


  refUserDirectMsgs() {
    return collection(this.firestore, 'user', sessionStorage.getItem("uid") as string, 'directmessages')
  }

}
