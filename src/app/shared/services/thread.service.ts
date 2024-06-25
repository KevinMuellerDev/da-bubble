import { Injectable, inject } from '@angular/core';
import { Firestore, Unsubscribe, collection, onSnapshot, query } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  channelService:ChannelService = inject(ChannelService);
  firestore:Firestore = inject(Firestore);
  originMessage!:any
  isActive: boolean = false;
  private dataSubject = new BehaviorSubject<string>('');
  data$ = this.dataSubject.asObservable();
  isSubscribed: boolean = false;
  unsub!: Unsubscribe;
  messages: any[] = [];
  messagesTimestamp: any[] = [];
  
  
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

  refThreadMessages(){
    return collection(this.firestore, "Channels", this.channelService.channelMsgData.collection, 'messages', this.originMessage.msgId, 'thread')
  }
}
