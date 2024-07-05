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

  startListenerChannel() {
    if (this.isSubscribed)
      this.unsub();
    console.log('ich bin der fehler');
    
    this.unsub = onSnapshot(query(this.refThreadMessages()), (querySnapshot) => {
      this.messages = [];
      this.messagesTimestamp = [];
      querySnapshot.forEach(async (doc) => {
        this.messages.unshift(doc.data())
        this.isSubscribed = true;
      });
      console.log(this.messages);
      this.messages.sort((a, b) => a.timestamp - b.timestamp);
    });
  }

  async createThreadMessage(obj: any) {
    await addDoc(this.refThreadMessages(), obj)
      .then(async (docRef) => {
        console.log('werde ausgeführt');
        
        await updateDoc(this.refUpdateThread(), {
          repliesCount: this.messages.length,
          lastReply: obj.timestamp
        });
        console.log('ich auch');
        
        if (this.storageService.filesTextareaThread && this.storageService.filesTextareaThread.length > 0) {
          this.fileData.src = this.storageService.downloadUrlThread;
          this.fileData.name = this.storageService.fileNameTextareaThread;
          this.fileData.type = this.storageService.uploadedFileTypeThread;

          await updateDoc(this.refUpdateFilePath(docRef.id), {
            uploadedFile: this.fileData
          });
          this.clearFileData();
        }
      });
  }

  refUpdateFilePath(id: string) {
    return doc(this.firestore, "Channels", this.channelService.channelMsgData.collection, 'messages', this.originMessage.msgId, 'thread', id)
  }


  clearFileData() {
    this.fileData = { src: '', name: '', type: '' };
    this.storageService.downloadUrlThread = '';
    this.storageService.fileNameTextareaThread = '';
    this.storageService.uploadedFileTypeThread = '';
  }

  /**
   * The `stopListener` function checks if a subscription is active and unsubscribes if it is.
   */
  stopListener() {
    if (this.isSubscribed) {
      this.unsub();
      this.isSubscribed = false;
      console.log("Listener Unsubscribed");
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
