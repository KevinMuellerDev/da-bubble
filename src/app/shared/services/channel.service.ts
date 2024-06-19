import { Injectable, inject } from '@angular/core';
import { DocumentData, Firestore, Unsubscribe, addDoc, collection, doc, docData, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { ChannelData } from '../models/channels.class';
import { ChannelInfo } from '../interfaces/channelinfo';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);

  private dataSubject = new BehaviorSubject<string>('');
  data$ = this.dataSubject.asObservable();
  isSubscribed: boolean = false;

  unsub!: Unsubscribe;
  channelMsg?: boolean;
  privateMsg?: boolean;
  newChannel?: ChannelInfo
  privateMsgData: any;
  channelMsgData: any;
  currentMessagesId!: string;
  oppositeMessagesId!: string;
  messages: any[] = [];
  messagesTimestamp: any[] = [];
  messagesLoaded: boolean = false;
  privateMsgIds: string[] = [];
  currentChannelUsers: any[] = [];

  constructor() {
    //turn on for test in messages:
    this.channelMsg = false;
  }


  /**
   * The `changeData` function in TypeScript updates the data and restarts the listener.
   * @param {string} data - The `data` parameter is a string that is passed to the `changeData` method.
   * This string is then used to update the data subject using `this.dataSubject.next(data)` and to
   * restart a listener using `this.restartListener(data)`.
   */
  changeData(data: string) {
    this.dataSubject.next(data);
    this.restartListener(data);
  }


  /**
   * The `startListener` function subscribes to real-time updates and sorts the
   * received messages by timestamp.
   * @param {string} data -  the `startListener` function is used to subscribe to real-time
   * updates for direct messages based on the provided `data`. 
   */
  startListener(data: string) {
    if (this.isSubscribed)
      this.unsub();

    this.unsub = onSnapshot(query(this.refDirectMessageData(data)), (querySnapshot) => {
      this.messages = [];
      this.messagesTimestamp = [];
      querySnapshot.forEach(async (doc) => {
        this.messages.unshift(doc.data())
        this.isSubscribed = true;
      });
      console.log(this.messages);
      this.messages.sort((a, b) => a.timestamp - b.timestamp);
      this.messagesLoaded = true;
    });

  }


  /**
   * The `stopListener` function checks if a subscription is active and unsubscribes if it is.
   */
  stopListener() {
    if (this.isSubscribed) {
      this.unsub();
      this.isSubscribed = false;
    }
  }


  /**
   * The `restartListener` function stops the current listener and then starts a new listener with the
   * provided data.
   * @param {string} data - The `restartListener` function takes a `data` parameter of type string. This
   * parameter is used to restart the listener by stopping it and then starting it again with the new
   * data provided.
   */
  restartListener(data: string) {
    this.stopListener();
    this.startListener(data);
  }


  /**
   * The function creates a new channel in Firestore and adds the channel ID to the user's list of
   * channels.
   * @param {ChannelInfo} channelData - The `channelData` parameter is an object containing information
   * about a new channel that needs to be created. It likely includes details such as the channel name,
   * description, creator, and list of users who will be part of the channel.
   */
  async createNewChannel(channelData: ChannelInfo) {
    await addDoc(collection(this.firestore, "Channels"), channelData)
      .then(async (docRef) => {
        channelData.users.forEach(async user => {
          const channelId = { channelid: docRef.id }
          await addDoc(collection(this.firestore, 'user', user, 'userchannels'), channelId)
        });
        await updateDoc(doc(this.firestore, "Channels", docRef.id), {
          collection: docRef.id,
        });
      });
  }

  /**
   * The function `chooseChannelType` sets a boolean flag based on whether the message is a direct
   * message or a channel message, and assigns user data if it is a direct message.
   * @param {boolean} dm - The `dm` parameter is a boolean value that indicates whether the message
   * should be sent as a direct message (private message) or not.
   * @param {DocumentData} [user] - The `user` parameter is of type `DocumentData` and is optional in the
   * `chooseChannelType` function. It is used to pass user data when the `dm` parameter is set to true,
   * indicating that a private message channel should be used.
   */
  chooseChannelType(dm: boolean, data?: any) {
    this.resetMessageType();
    dm ? this.privateMsg = true : this.channelMsg = true;
    console.log(data);

    if (this.privateMsg) {
      this.privateMsgData = data;
      this.messagesLoaded = false;
      this.getDmId();
    } else if (this.channelMsg) {
      this.channelMsgData = data;
      this.messagesLoaded = false;
      this.retrieveCurrentChannelUsers();
    }
  }


  resetMessageType() {
    this.privateMsg = false;
    this.channelMsg = false;
    this.currentMessagesId = '';
    this.oppositeMessagesId = '';
    this.privateMsgData = [];
    this.messages = [];
  }


  /**
   * The function `getDmId` asynchronously retrieves a document ID based on a specific condition from a
   * Firestore collection.
   */
  async getDmId() {
    const querySnapshot = await getDocs(query(this.refDirectMessage()));
    querySnapshot.forEach(element => {
      console.log(element.data());
      console.log(element.data()['dmUserID']);
      if (element.data()['dmUserId'] == this.privateMsgData.id) {
        this.currentMessagesId = element.id
        console.log(this.currentMessagesId);
        this.changeData(this.currentMessagesId)
      }
    });
  }

  /**
 * The function `getDmId` asynchronously retrieves a document ID based on a specific condition from a
 * Firestore collection.
 */
  async getOppositeDmId() {
    const querySnapshot = await getDocs(query(this.refOppositeDirectMessage(this.privateMsgData.id)));
    querySnapshot.forEach(element => {
      console.log(element.data()['dmUserId']);
      if (element.data()['dmUserId'] == sessionStorage.getItem('uid')) {
        this.oppositeMessagesId = element.id
      }
    });
  }


  /**
   * The `createDirectMessage` function asynchronously creates a direct message between two users.
   * @param {any} obj - The `obj` parameter in the `createDirectMessage` function likely represents the
   * data or message object that you want to add to a direct message conversation. This object could
   * contain information such as the message content, sender details, timestamp, etc.
   */
  async createDirectMessage(obj: any) {
    await addDoc(this.refCreateDM(sessionStorage.getItem('uid') as string, this.currentMessagesId), obj);
    await this.getOppositeDmId();
    if (this.currentMessagesId != this.oppositeMessagesId) {
      await addDoc(this.refCreateDM(this.privateMsgData.id, this.oppositeMessagesId), obj);
    }
  }


  async updateDirectMessage(data: any) {
    await this.getDmId();
    await this.getOppositeDmId();
    const querySnapshotSelf = await getDocs(this.refQuerySelf());
    const querySnapshotOpposite = await getDocs(this.refQueryOpposite());

    querySnapshotSelf.forEach(async (dataset) => {
      if (data.timestamp == dataset.data()['timestamp']) {
        console.log('gefunden => ', dataset.data());
        console.log('gefunden => ', data);
      }
    });

    querySnapshotOpposite.forEach(async (dataset) => {
      if (data.timestamp == dataset.data()['timestamp']) {
        console.log('gefunden => ', dataset.data());
        console.log('gefunden => ', data);

        await updateDoc(doc(this.firestore, "user", this.privateMsgData.id, 'directmessages', this.oppositeMessagesId, 'messages', dataset.id), {
          emoji: data.emoji,
        });
      }
    });
  }

  async retrieveCurrentChannelUsers() {
    const docRef = collection(this.firestore, "user");
    const docSnap = await getDocs(docRef);
    this.currentChannelUsers = [];
    docSnap.forEach((element: any) => {   
      if (this.channelMsgData.users.includes(element.id)) {
        this.currentChannelUsers.push(element.data())
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

  refDirectMessage() {
    return collection(this.firestore, "user", sessionStorage.getItem('uid') as string, 'directmessages')
  }

  refOppositeDirectMessage(id: string) {
    return collection(this.firestore, "user", id, 'directmessages')
  }

  refDirectMessageData(id: string) {
    return collection(this.firestore, "user", sessionStorage.getItem('uid') as string, 'directmessages', id, 'messages')
  }

  refCreateDM(sender: string, receiver: string) {
    return collection(this.firestore, "user", sender, 'directmessages', receiver, 'messages')
  }
  refQuerySelf() {
    return query(this.refCreateDM(sessionStorage.getItem('uid')!, this.currentMessagesId));
  }

  refQueryOpposite() {
    return query(this.refCreateDM(this.privateMsgData.id, this.oppositeMessagesId));
  }

}
