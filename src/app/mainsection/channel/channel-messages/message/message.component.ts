import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, inject } from '@angular/core';
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


@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AddUserToChannelDialogComponent, AddUserDialogComponent, EditChannelDialogComponent, ShowProfileComponent, PickerComponent, EmojiComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  channelService: ChannelService = inject(ChannelService);
  private dataSubscription!: Subscription;
  unsubMessageData!: Unsubscribe;
  userId!:string;
  showEmojiPickerArray: boolean[] = [];
  isEmojiPickerVisible: boolean = false;

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


  constructor(public dialog: MatDialog, public mainsectionComponent: MainsectionComponent) {
    this.userId = sessionStorage.getItem('uid')!;
    if (!this.channelService.channelMsg) {
        this.dataSubscription = this.channelService.data$.subscribe(data => {
          if (data) {
            this.channelService.messagesLoaded=true;
          }
        });
    }
  }



  ngOnInit() {
    this.showEmojiPickerArray = this.messages.map(() => false);
  }


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

  addEmoji(event: any, index: number) {
    const emoji = event['emoji']['native'];
    let foundEmoji = false;
    // Check if emoji already exists in emojiCounts
    for (let i = 0; i < this.channelService.messages[index].emoji.length; i++) {
      if (this.channelService.messages[index].emoji[i].emoji === emoji) {
        this.channelService.messages[index].emoji[i].count++;
        foundEmoji = true;
        break;
      }
    }
    if (!foundEmoji) {
      this.channelService.messages[index].emoji.push({ emoji: emoji, count: 0 });
    }
    //console.log(this.messages[index].emojiCounts);
    //console.log(event['emoji']['name']);
    //console.log(event['emoji']['native']);
    //console.log(event['emoji']);
    this.toggleEmojiPicker(index);
    this.channelService.updateDirectMessage(this.channelService.messages[index])
    
    this.isEmojiPickerVisible = false;
  }

  /**
 * Removes an emoji from the message at the specified index.
 * If the emoji count is greater than 1, it decrements the count.
 * If the emoji count is 1, it removes the emoji from the emojiCounts array.
 * @param index - The index of the message from which the emoji should be removed.
 * @param emoji - The emoji to be removed.
 */
  removeEmoji(index: number, emoji: string) {
    for (let i = 0; i < this.channelService.messages[index].emoji.length; i++) {
      if (this.channelService.messages[index].emoji[i].emoji === emoji) {
        if (this.channelService.messages[index].emoji[i].count > 1) {
          this.channelService.messages[index].emoji[i].count--;
        } else {
          this.channelService.messages[index].emoji.splice(i, 1);
        }
        break;
      }
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
      console.log('Clicked outside class "emoji-mart"');
      this.showEmojiPickerArray = this.messages.map(() => false);
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

  /**
* This function opens the dialog and determines if the ShowProfile component is editable or not
* @param profileEditable boolean - determine if ShowUser component is editable or not
*/

  openDialogUserInfo() {
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
    this.channelService.messagesLoaded=false;
    this.channelService.currentMessagesId = '';
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
