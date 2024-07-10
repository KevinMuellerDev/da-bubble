import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';
import { StorageService } from '../../shared/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  firestore: Firestore = inject(Firestore);
  storageService: StorageService = inject(StorageService);
  originMessage!: any;
  isActive: boolean = false;
  private dataSubject = new BehaviorSubject<string>('');
  data$ = this.dataSubject.asObservable();
  private hideThreadSubject = new Subject<void>();
  hideThread$ = this.hideThreadSubject.asObservable();
  isSubscribed: boolean = false;
  unsub!: Unsubscribe;
  messages: any[] = [];
  messagesTimestamp: any[] = [];
  startMutationObserver: boolean = false;
  fileData: any = { src: '', name: '', type: '' };

  constructor() { }

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
   * The `startListenerChannel` function sets up a listener for changes in a Firestore query and updates
   * the messages array accordingly.
   */
  startListenerChannel() {
    if (this.isSubscribed)
      this.unsub();
    if (this.channelService.channelMsg) {
      this.unsub = onSnapshot(query(this.refThreadMessages()), (querySnapshot) => {
        this.messages = [];
        this.messagesTimestamp = [];
        querySnapshot.forEach(async (doc) => {
          this.messages.unshift(doc.data())
          this.isSubscribed = true;
        });
        this.messages.sort((a, b) => a.timestamp - b.timestamp);
      });
    } else if (this.channelService.privateMsg) {
      this.unsub = onSnapshot(query(this.refThreadMessagesDm()), (querySnapshot) => {
        this.messages = [];
        this.messagesTimestamp = [];
        querySnapshot.forEach(async (doc) => {
          this.messages.unshift(doc.data())
          this.isSubscribed = true;
        });
        this.messages.sort((a, b) => a.timestamp - b.timestamp);
      });
    }
  }

  /**
   * The `createThreadMessage` function asynchronously creates a new message in a thread, updates the
   * thread information, and handles file uploads if present.
   * @param {any} obj - The `createThreadMessage` function is an asynchronous function that creates a new
   * message thread. It takes an `obj` parameter which contains the data for the new message being
   * created. The function first adds the new message document to a collection using `addDoc`, then
   * updates the thread with the new message
   */
  async createThreadMessage(obj: any) {
    let channelRef;
    let updateChannelRef;
    if (this.channelService.channelMsg) {
      channelRef = this.refThreadMessages();
      updateChannelRef = this.refUpdateThread();
    } else if (this.channelService.privateMsg) {
      channelRef = this.refThreadMessagesDm();
      updateChannelRef = this.refUpdateThreadMessagesDm();
    }
    await addDoc(channelRef!, obj)
      .then(async (docRef) => {
        await updateDoc(updateChannelRef!, {
          repliesCount: this.messages.length,
          lastReply: obj.timestamp
        });
        if (this.storageService.filesTextareaThread && this.storageService.filesTextareaThread.length > 0) {
          this.fileData.src = this.storageService.downloadUrlThread;
          this.fileData.name = this.storageService.fileNameTextareaThread;
          this.fileData.type = this.storageService.uploadedFileTypeThread;
          if (this.channelService.channelMsg) {
            await updateDoc(this.refUpdateFilePath(docRef.id), {
              uploadedFile: this.fileData
            });
          } else {
            await updateDoc(this.refUpdateFilePathDm(docRef.id), {
              uploadedFile: this.fileData
            });
          }
          this.clearFileData();
        }
      });
  }

  /**
   * A description of the entire function.
   * @param {string} id - The ID used to update the file path
   */
  refUpdateFilePath(id: string) {
    return doc(this.firestore, "Channels", this.channelService.channelMsgData.collection, 'messages', this.originMessage.msgId, 'thread', id)
  }

  /**
   * A description of the entire function.
   * @param {string} id - The ID used to update the file path
   */
  refUpdateFilePathDm(id: string) {
    return doc(this.firestore, "user", this.userService.currentUser!, 'directmessages', this.channelService.currentMessagesId, 'messages', this.originMessage.msgId, 'thread', id)
  }

  /**
   * The clearFileData function resets file data and aborts any ongoing file upload for a thread.
   */
  clearFileData() {
    this.fileData = { src: '', name: '', type: '' };
    this.storageService.abortUploadForThread();
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
    this.startListenerChannel();
  }

  /**
   * The `updateChannelMessage` function asynchronously updates a specific message in a channel based on
   * a matching timestamp.
   * @param {any} data - The `data` parameter in the `updateChannelMessage` contains
   * information related to updating a channel message. It likely includes properties such as
   * `timestamp`, `emoji`, and `message` that are used to identify and update a specific message in a
   * channel.
   */
  async updateChannelMessage(data: any) {
    const querySnapshot = await getDocs(query(this.refThreadMessages()));
    querySnapshot.forEach(async (dataset) => {
      if (data.timestamp == dataset.data()['timestamp']) {
        await updateDoc(doc(this.firestore, "Channels", this.channelService.channelMsgData.collection, 'messages', this.originMessage.msgId, 'thread', dataset.id), {
          emoji: data.emoji,
          message: data.message
        });
      }
    });
  }

  refThreadMessages() {
    return collection(this.firestore, "Channels", this.channelService.channelMsgData.collection, 'messages', this.originMessage.msgId, 'thread')
  }

  refThreadMessagesDm() {
    return collection(this.firestore, "user", this.userService.currentUser!, 'directmessages', this.channelService.currentMessagesId, 'messages', this.originMessage.msgId, 'thread')
  }

  refUpdateThreadMessagesDm() {
    return doc(this.firestore, "user", this.userService.currentUser!, 'directmessages', this.channelService.currentMessagesId, 'messages', this.originMessage.msgId)
  }

  refUpdateThread() {
    return doc(this.firestore, "Channels", this.channelService.channelMsgData.collection, "messages", this.originMessage.msgId)
  }

  /**
   * Triggers the hiding of the thread by emitting a value through the hideThreadSubject.
   */
  triggerHideThread() {
    this.hideThreadSubject.next();
  }
}
