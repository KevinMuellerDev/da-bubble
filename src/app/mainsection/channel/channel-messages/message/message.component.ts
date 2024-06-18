import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MainsectionComponent } from '../../../mainsection.component';
import { AddUserToChannelDialogComponent } from '../../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from '../../add-user-dialog/add-user-dialog.component';
import { EditChannelDialogComponent } from '../../edit-channel-dialog/edit-channel-dialog.component';
import { ShowProfileComponent } from '../../../../shared/components/show-profile/show-profile.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ChannelService } from '../../../../shared/services/channel.service';
import { Unsubscribe } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../shared/services/user.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
registerLocaleData(localeDe);

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AddUserToChannelDialogComponent, AddUserDialogComponent, EditChannelDialogComponent, ShowProfileComponent, PickerComponent, EmojiComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  private dataSubscription!: Subscription;
  unsubMessageData!: Unsubscribe;
  dateToday!:number;
  userId!: string;
  showEmojiPickerArray: boolean[] = [];
  isEmojiPickerVisible: boolean = false;
  dateMap:string[] = [];

  //test Nachrichtaufbau entfällt später, da die Daten von Firebase kommen. 
  messages: any[] = [];
  /*   messages: any[] = [
      {
     'profilePicture': '/assets/img/profile/testchar1.svg',
     'userName': 'Noah Braun',
     'timeStamp': '14:25 Uhr',
     'messageText': 'Welche Version von Angular ist aktuell ?',
     'emojiCounts': [] as { emoji: string, count: number }[],
     'repliesCount': 2,
     'lastReplyTimeStamp': '14:56'
     },
      {
     'profilePicture': '/assets/img/profile/testchar1.svg',
     'userName': 'Noah Braun',
     'timeStamp': '14:25 Uhr',
     'messageText': 'Welche Version von Angular ist aktuell ?',
     'emojiCounts': [] as { emoji: string, count: number }[],
     'repliesCount': 2,
     'lastReplyTimeStamp': '14:56'
   }
   ]; */

  constructor(public dialog: MatDialog, public mainsectionComponent: MainsectionComponent, private changeDetectorRef: ChangeDetectorRef) {
    this.userId = sessionStorage.getItem('uid')!;
    if (!this.channelService.channelMsg) {
      this.dataSubscription = this.channelService.data$.subscribe(data => {
        if (data) {
          this.channelService.messagesLoaded = true;
          setTimeout(() => {
            this.showEmojiPickerArray = [];
            this.showEmojiPickerArray = this.channelService.messages.map(() => false);
          }, 500);
        }
      });
    }
  }

  ngOnInit(){
    this.dateToday = Date.now() as number;
  }

  hasSeen(date:any){
    const arrangedDate = new Date(date) 
    let index = this.channelService.messagesTimestamp.indexOf(arrangedDate.toLocaleDateString());
    console.log(index);
    
    return true
  }

  ngAfterViewInit(){
    this.changeDetectorRef.detectChanges();
  }

  pushTimestamp(timestamp:string | null){
    this.dateMap.push(timestamp as string);
    console.log(this.dateMap);
  }
  checkIfDateExists(timestamp:string | null){
    console.log(this.dateMap.includes(timestamp as string));
    
    return this.dateMap.includes(timestamp as string)
  }

  /**
 * Toggles the visibility of the emoji picker for the message at the specified index.
 * It sets the corresponding value in the `showEmojiPickerArray` to the opposite of its current value.
 * All other values in the array are set to false, ensuring that only one emoji picker is visible at a time.
 * @param index - The index of the message for which the emoji picker should be toggled.
 */
  toggleEmojiPicker(index: number) {
    this.showEmojiPickerArray = this.showEmojiPickerArray.map((value, i) => i === index ? !value : false);
  }

  /**
* Toggles the visibility of the emoji picker.
* It stops the propagation of the event to prevent it from bubbling up to other event listeners.
* It then toggles the `isEmojiPickerVisible` property, which determines whether the emoji picker is visible or not.
* @param event - The click event that triggered this function.
*/
  toggleEmojiPickerEvent(event: Event) {
    event.stopPropagation();
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  /**
   * Adds an emoji to the message at the specified index.
   * If the emoji already exists in the message's emojiCounts, increment its count.
   * If the emoji does not exist, add it to the emojiCounts with a count of 0.
   * @param event - The event object containing the emoji data.
   * @param index - The index of the message to which the emoji should be added.
   */
  addEmoji(event: any, index: number, messageId: string, userId: string) {
    const emoji = event['emoji']['native'];
    let foundEmoji = false;
    let userMatched = messageId === userId;

    for (let i = 0; i < this.channelService.messages[index].emoji.length; i++) {
      if (this.channelService.messages[index].emoji[i].emoji === emoji) {
        if (!this.channelService.messages[index].emoji[i].users) {
          this.channelService.messages[index].emoji[i].users = [];
        }
        if (!userMatched && !this.channelService.messages[index].emoji[i].users.includes(userId)) {
          console.log("keine Nachricht von mir, es gibt einen emoji und ich habe noch nicht reagiert");
          this.channelService.messages[index].emoji[i].count++;
          this.channelService.messages[index].emoji[i].users.push(userId);
        }
        foundEmoji = true;
        this.channelService.updateDirectMessage(this.channelService.messages[index]);
        break;

      }
    }

    if (!foundEmoji) {
      //wenn ich keinen emoji gefunden habe startet der count immer mit 0
      const count = 0//userMatched ? 0 : 1;
      const users = userMatched ? [] : [userId];
      console.log(count, userMatched, emoji);
      this.channelService.messages[index].emoji.push({ emoji: emoji, count: count, users: users });
      this.channelService.updateDirectMessage(this.channelService.messages[index]);
    }
    this.toggleEmojiPicker(index);
    this.isEmojiPickerVisible = false;
  }

  /**
 * Removes an emoji from the message at the specified index.
 * If the emoji count is greater than 1, it decrements the count.
 * If the emoji count is 1, it removes the emoji from the emojiCounts array.
 * @param index - The index of the message from which the emoji should be removed.
 * @param emoji - The emoji to be removed.
 */
  removeEmoji(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string) {
    //leert einzelne emojis bei meinen nachrichten  oder meine Reaktion
    console.log(this.channelService.messages, currentMessageIndex);
    if (messageId === userId || this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].users.includes(userId)) {
      this.channelService.messages[currentMessageIndex].emoji.splice(currentEmojiIndex, 1);
      this.channelService.updateDirectMessage(this.channelService.messages[currentMessageIndex]);
    }

  }


  /**
 * Checks if a given element or any of its parent elements have a specific class.
 * @param element - The element to check.
 * @param className - The class name to search for.
 * @returns True if the element or any of its parent elements have the specified class, false otherwise.
 */
  isClickedElementOrChildWithClass(element: any, className: string): boolean {
    while (element) {
      if (element.classList.contains(className)) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  @ViewChild('emojiPickerContainer', { static: false }) emojiPickerContainer!: ElementRef;

  /**
 * Listens for click events on the document and closes the emoji picker if the click is outside of it.
 * @param event - The click event.
 */
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (!this.isEmojiPickerVisible || !this.emojiPickerContainer) {
      return;
    }

    if (!this.isClickedElementOrChildWithClass(event.target, 'emoji-mart') && this.emojiPickerContainer) {
      this.showEmojiPickerArray = this.channelService.messages.map(() => false);
      this.isEmojiPickerVisible = false;
    }
  }

  @ViewChild('scroll', { read: ElementRef }) public scroll!: ElementRef<any>;
  @ViewChild('messageContent', { read: ElementRef }) public messageContent!: ElementRef<any>;

  ngAfterViewChecked() {
    this.scrollBottom();
  }

  public scrollBottom() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }

  async getOtherUserData(id?: string) {
    await this.userService.retrieveOtherUserProfile(id!);
    this.openDialogUserInfo();
  }

  /**
  * This function opens the dialog and determines if the ShowProfile component is editable or not
  * @param profileEditable boolean - determine if ShowUser component is editable or not
  */
  async openDialogUserInfo() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: 'verify' })
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;
    dialogRef
      .afterClosed()
      .subscribe();
  }

  showThreadBar() {
    this.mainsectionComponent.showThread();
  }

  ngOnDestroy() {
    /* this.unsubMessageData(); */
    this.channelService.messages = [];
    this.channelService.messagesLoaded = false;
    this.channelService.currentMessagesId = '';
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    console.log('true?');

  }
}
