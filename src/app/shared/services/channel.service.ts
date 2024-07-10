import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, addDoc, collection, doc, docData, getDoc, getDocs, onSnapshot, query, updateDoc } from '@angular/fire/firestore';
import { ChannelInfo } from '../interfaces/channelinfo';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserService } from './user.service';
import { EmojiService } from './emoji.service';
import { StorageService } from '../../shared/services/storage.service';
@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  storageService: StorageService = inject(StorageService);
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
  currentChannel!: string;
  fileData: any = { src: '', name: '', type: '' };
  constructor() {
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
    this.channelChangedSource.next();
  }

  public closeAndFocusChannelTextarea = new Subject<void>();
  threadClosed$ = this.closeAndFocusChannelTextarea.asObservable();

  private channelChangedSource = new Subject<void>();
  channelChanged$ = this.channelChangedSource.asObservable();

  /**
   * The `startListener` function subscribes to real-time updates and sorts the
   * received messages by timestamp.
   * @param {string} data -  the `startListener` function is used to subscribe to real-time
   * updates for direct messages based on the provided `data`.
   */
  startListenerDm(data: string) {
    if (this.isSubscribed)
      this.unsub();
    this.unsub = onSnapshot(query(this.refDirectMessageData(data)), (querySnapshot) => {
      this.messages = [];
      this.messagesTimestamp = [];
      querySnapshot.forEach(async (doc) => {
        this.messages.unshift(doc.data())
        this.isSubscribed = true;
      });
      this.messages.sort((a, b) => a.timestamp - b.timestamp);
    });
    setTimeout(() => { this.messagesLoaded = true; }, 200);
  }

  /**
   * The function `startListenerChannel` sets up a listener for real-time updates on a Firestore query
   * and populates an array with the retrieved data.
   * @param {string} data - the `startListenerChannel` function is used to set up a
   * listener for changes in a Firestore collection.
   */
  startListenerChannel(data: string) {
    if (this.isSubscribed)
      this.unsub();
    this.unsub = onSnapshot(query(this.refChannelMessage()), (querySnapshot) => {
      this.messages = [];
      this.messagesTimestamp = [];
      querySnapshot.forEach(async (doc) => {
        this.messages.unshift(doc.data())
        this.isSubscribed = true;
      });
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
    if (this.privateMsg) {
      this.startListenerDm(data);
    } else if (this.channelMsg) {
      this.startListenerChannel(data);
    }
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
          creator: this.userService.userInfo.name,
          users: channelData.users
        });
      });
  }

  /**
   * The function `chooseChannelType` sets a boolean flag based on whether the message is a direct
   * message or a channel message, and assigns user data if it is a direct message.
   * @param {boolean} dm - The `dm` parameter is a boolean value that indicates whether the message
   * should be sent as a direct message (private message) or not.
   * @param {DocumentData} [data] - The `user` parameter is of type `DocumentData` and is optional in the
   * `chooseChannelType` function. It is used to pass user data when the `dm` parameter is set to true,
   * indicating that a private message channel should be used.
   */
  async chooseChannelType(dm: boolean, data?: any) {
    this.resetMessageType();
    dm ? this.privateMsg = true : this.channelMsg = true;
    this.currentChannel = data.collection
    if (this.privateMsg) {
      this.privateMsgData = data;
      this.messagesLoaded = false;
      await this.getDmId();
      this.changeData(this.currentMessagesId);
    } else if (this.channelMsg) {
      this.channelMsgData = data;
      this.messagesLoaded = false;
      this.retrieveCurrentChannelUsers();
      this.getChannelId();
    }
  }

  /**
   * The function `resetMessageType` resets various message-related properties to their default values.
   */
  resetMessageType() {
    this.messagesLoaded = false;
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
      if (element.data()['dmUserId'] == this.privateMsgData.id) {
        this.currentMessagesId = element.id
      }
    });
  }

  /**
   * The `getChannelId` function asynchronously retrieves the ID of a channel message and then calls
   * another function to update the data based on that ID.
   */
  async getChannelId() {
    const querySnapshot = await getDocs(query(this.refChannelMessage()));
    querySnapshot.forEach(element => {
      this.currentMessagesId = element.id
    });
    this.changeData(this.currentMessagesId)
  }

  /**
   * The function `getDmId` asynchronously retrieves a document ID based on a specific condition from a
   * Firestore collection.
   */
  async getOppositeDmId() {
    const querySnapshot = await getDocs(query(this.refOppositeDirectMessage(this.privateMsgData.id)));
    querySnapshot.forEach(element => {
      if (element.data()['dmUserId'] == localStorage.getItem('uid')) {
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
    if (this.storageService.filesTextarea) {
      this.fileData.src = this.storageService.downloadUrl;
      this.fileData.name = this.storageService.fileNameTextarea;
      this.fileData.type = this.storageService.uploadedFileType;
    }
    obj.uploadedFile = this.fileData;
    await addDoc(this.refCreateDM(localStorage.getItem('uid') as string, this.currentMessagesId), obj)
      .then(async (docRef) => {
        await updateDoc(this.refUpdateDM(localStorage.getItem('uid') as string, this.currentMessagesId, docRef.id),
          { msgId: docRef.id })
      });
    await this.getOppositeDmId();
    if (this.currentMessagesId != this.oppositeMessagesId) {
      await addDoc(this.refCreateDM(this.privateMsgData.id, this.oppositeMessagesId), obj)
        .then(async (docRef) => {
          await updateDoc(this.refUpdateDM(this.privateMsgData.id, this.oppositeMessagesId, docRef.id),
            { msgId: docRef.id })
        });
    }
    this.clearFileData();
  }

  /**
   * The `createChannelMessage` function asynchronously adds a document to a Firestore collection and
   * updates another document with the generated ID.
   * @param {any} obj - The `obj` parameter in the `createChannelMessage` function is an object that
   * contains the data to be added to a Firestore document. This object will be passed to the `addDoc`
   * function to create a new document in the Firestore database.
   */
  async createChannelMessage(obj: any) {
    await addDoc(this.refCreateChannelMsg(), obj)
      .then(async (docRef) => {
        if (this.storageService.filesTextarea ) {
          this.fileData.src = this.storageService.downloadUrl;
          this.fileData.name = this.storageService.fileNameTextarea;
          this.fileData.type = this.storageService.uploadedFileType;
          await updateDoc(doc(this.firestore, "Channels", this.channelMsgData.collection, "messages", docRef.id),
            { uploadedFile: this.fileData });
        }
        await updateDoc(doc(this.firestore, "Channels", this.channelMsgData.collection, "messages", docRef.id),
          { msgId: docRef.id })
      });
    this.clearFileData();
  }

  /**
   * The clearFileData function resets file data and aborts any ongoing upload process.
   */
  clearFileData() {
    this.fileData = { src: '', name: '', type: '' };
    this.storageService.abortUpload();
  }

  /**
   * The function `updateDirectMessage` asynchronously updates direct messages based on timestamp and
   * user IDs.
   * @param {any} data - The `updateDirectMessage` function is an asynchronous function that updates a
   * direct message in a chat application. It first retrieves the IDs for the current user's direct
   * messages and the opposite user's direct messages. Then, it queries the Firestore database to find
   * the specific message based on the timestamp provided.
   */
  async updateDirectMessage(data: any) {
    await this.getDmId();
    await this.getOppositeDmId();
    const querySnapshotSelf = await getDocs(this.refQuerySelf());
    const querySnapshotOpposite = await getDocs(this.refQueryOpposite());
    querySnapshotSelf.forEach(async (dataset) => {
      if (data.timestamp == dataset.data()['timestamp']) {
        await updateDoc(doc(this.firestore, "user", localStorage.getItem('uid') as string, 'directmessages', this.currentMessagesId, 'messages', dataset.id), {
          emoji: data.emoji,
          message: data.message
        });
      }
    });
    querySnapshotOpposite.forEach(async (dataset) => {
      if (data.timestamp == dataset.data()['timestamp']) {
        await updateDoc(doc(this.firestore, "user", this.privateMsgData.id, 'directmessages', this.oppositeMessagesId, 'messages', dataset.id), {
          emoji: data.emoji,
          message: data.message,
        });
      }
    });
    this.stopListener();
  }

  /**
   * The `updateChannelMessage` function asynchronously updates a channel message in a Firestore database
   * based on a matching timestamp.
   * @param {any} data - The `data` parameter in the `updateChannelMessage` function likely contains
   * information related to a message that needs to be updated in a channel. This information may include
   * the timestamp of the message, the new emoji to be added or updated, and the new message content.
   */
  async updateChannelMessage(data: any) {
    const querySnapshot = await getDocs(this.refQueryChannelMsg());
    querySnapshot.forEach(async (dataset) => {
      if (data.timestamp == dataset.data()['timestamp']) {
        await updateDoc(doc(this.firestore, "Channels", this.channelMsgData.collection, 'messages', dataset.id), {
          emoji: data.emoji,
          message: data.message
        });
      }
    });
  }

  /**
   * The `updateChannelTitle` function updates the title of a channel in a Firestore database and then
   * refreshes the channel data.
   * @param {string} title - The `title` parameter in the `updateChannelTitle` function is a string that
   * represents the new title that you want to set for a channel.
   */
  async updateChannelTitle(title: string) {
    await updateDoc(doc(this.firestore, "Channels", this.channelMsgData.collection), {
      title: title
    });
    this.refreshChannelData();
  }

  /**
   * The function `updateChannelDescription` updates the description of a channel in a Firestore database
   * and then refreshes the channel data.
   * @param {string} description - a string that represents the new description that will be set for a channel
   * in the Firestore database.
   */
  async updateChannelDescription(description: string) {
    await updateDoc(doc(this.firestore, "Channels", this.channelMsgData.collection), {
      description: description
    });
    this.refreshChannelData();
  }

  /**
   * This function updates direct messages between users if they do not already exist.
   * @param {any} userInfo - The `updateUserDm` function you provided is an asynchronous function that
   * updates direct messages between users in a Firestore database. It checks if a direct message entry
   * already exists between the current user and the target user. If it doesn't exist, it adds entries
   * for both users to establish a direct message
   */
  async updateUserDm(userInfo: any) {
    let alreadyExists = false;
    const docSnap = await getDocs(collection(this.firestore, "user", this.userService.userInfo.id, "directmessages"));
    docSnap.forEach(element => {
      if (element.data()['dmUserId'] == userInfo.id)
        alreadyExists = true
    });
    if (!alreadyExists) {
      await addDoc(collection(this.firestore, "user", userInfo.id, "directmessages"), { dmUserId: this.userService.currentUser });
      await addDoc(collection(this.firestore, "user", this.userService.userInfo.id, "directmessages"), { dmUserId: userInfo.id });
    }
  }

  /**
   * The function `retrieveCurrentChannelUsers` asynchronously retrieves user data for the current
   * channel from a Firestore collection.
   */
  async retrieveCurrentChannelUsers() {
    const docSnap = await getDocs(collection(this.firestore, "user"));
    this.currentChannelUsers = [];
    docSnap.forEach((element: any) => {
      if (this.channelMsgData.users.includes(element.id))
        this.currentChannelUsers.push(element.data())
    });
  }

  /**
   * The function `refreshChannelData` asynchronously retrieves channel data from Firestore and updates
   * the current channel users.
   */
  async refreshChannelData() {
    const docSnap = await getDoc(doc(this.firestore, "Channels", this.channelMsgData.collection));
    this.channelMsgData = docSnap.data();
    this.retrieveCurrentChannelUsers();
  }

  /**
   * Firestore collection reference for Channels
   * @returns collection
   */
  refChannels() {
    return collection(this.firestore, "Channels")
  }

  refDirectMessage() {
    return collection(this.firestore, "user", localStorage.getItem('uid') as string, 'directmessages')
  }

  refOppositeDirectMessage(id: string) {
    return collection(this.firestore, "user", id, 'directmessages')
  }

  refDirectMessageData(id: string) {
    return collection(this.firestore, "user", localStorage.getItem('uid') as string, 'directmessages', id, 'messages')
  }

  refCreateDM(sender: string, receiver: string) {
    return collection(this.firestore, "user", sender, 'directmessages', receiver, 'messages')
  }

  refUpdateDM(sender: string, receiver: string, id: string) {
    return doc(this.firestore, "user", sender, 'directmessages', receiver, 'messages', id)
  }

  refQuerySelf() {
    return query(this.refCreateDM(localStorage.getItem('uid')!, this.currentMessagesId));
  }

  refQueryOpposite() {
    return query(this.refCreateDM(this.privateMsgData.id, this.oppositeMessagesId));
  }

  refCreateChannelMsg() {
    return collection(this.firestore, "Channels", this.channelMsgData.collection, "messages")
  }

  refChannelMessage() {
    return collection(this.firestore, "Channels", this.channelMsgData.collection, 'messages')
  }

  refQueryChannelMsg() {
    return query(this.refChannelMessage())
  }
}
