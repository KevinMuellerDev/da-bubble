import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild,HostListener} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MainsectionComponent } from '../../../mainsection.component';
import { AddUserToChannelDialogComponent } from '../../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from '../../add-user-dialog/add-user-dialog.component';
import { EditChannelDialogComponent } from '../../edit-channel-dialog/edit-channel-dialog.component';
import { ShowProfileComponent } from '../../../../shared/components/show-profile/show-profile.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';


@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AddUserToChannelDialogComponent, AddUserDialogComponent, EditChannelDialogComponent, ShowProfileComponent, PickerComponent, EmojiComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent  {
  constructor(public dialog: MatDialog, public mainsectionComponent: MainsectionComponent) { }
   

  showEmojiPickerArray: boolean[] = [];
  isEmojiPickerVisible:boolean = false;

  //test Nachrichtaufbau entfällt später, da die Daten von Firebase kommen. 
  messages = [{
    'profilePicture': '/assets/img/profile/testchar1.svg',
    'userName': 'Noah Braun',
    'timeStamp': '14:25 Uhr',
    'messageText': 'Welche Version von Angular ist aktuell ?',
    'selectedEmoji': [] as string[],
    'emojiCounts': [] as { emoji: string, count: number }[],
    'repliesCount': 2,
    'lastReplyTimeStamp': '14:56'
  }, {
    'profilePicture': '/assets/img/profile/testchar1.svg',
    'userName': 'Noah Braun',
    'timeStamp': '14:25 Uhr',
    'messageText': 'Welche Version von Angular ist aktuell ?',
    'selectedEmoji': [] as string[],
    'emojiCounts': [] as { emoji: string, count: number }[],
    'repliesCount': 2,
    'lastReplyTimeStamp': '14:56'
  },
  {
    'profilePicture': '/assets/img/profile/testchar1.svg',
    'userName': 'Noah Braun',
    'timeStamp': '14:25 Uhr',
    'messageText': 'Welche Version von Angular ist aktuell?',
    'selectedEmoji': [] as string[],
    'emojiCounts': [] as { emoji: string, count: number }[],
    'repliesCount': 2,
    'lastReplyTimeStamp': '14:56'
  }

  ]
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
 * Adds an emoji to the selected message.
 * @param event - The event object that contains the emoji data.
 * @param index - The index of the message to which the emoji should be added.
 * @returns {void}
 */

  addEmoji(event: any, index: number) {
    this.messages[index]['selectedEmoji'].push(event['emoji']['native']);
    console.log(this.messages[index]['selectedEmoji']);
    console.log(event['emoji']['name']);
    console.log(event['emoji']['native']);
    console.log(event['emoji']);
    this.toggleEmojiPicker(index);
    this.emojiCounter();
    this.isEmojiPickerVisible = false; 
  }

  /**
   * Updates the emoji counts for each message. For each message, it counts consecutive identical emojis 
   * and stores the count along with the emoji in a list of objects.
   */
  emojiCounter() {
    this.messages.forEach(message => {
      let emojiCountsMap = new Map();
      let previousEmoji: string | null = null;
      let currentCount = 0;
      message.selectedEmoji.forEach(emoji => {
        if (emoji === previousEmoji) {
          currentCount++;
        } else {
          previousEmoji = emoji;
          currentCount = 1;
        }
        emojiCountsMap.set(emoji, currentCount);
      });
      /**
     * Convert the Map to an array of objects and store it in message.emojiCounts.
     * Each object contains an emoji and its corresponding count.
     */
      message.emojiCounts = Array.from(emojiCountsMap, ([emoji, count]) => ({ emoji, count }));
      console.log(message.emojiCounts);
    });
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
}
