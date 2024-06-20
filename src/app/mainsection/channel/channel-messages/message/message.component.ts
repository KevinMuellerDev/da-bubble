import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../../../mainsection.component';
import { AddUserToChannelDialogComponent } from '../../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from '../../add-user-dialog/add-user-dialog.component';
import { EditChannelDialogComponent } from '../../edit-channel-dialog/edit-channel-dialog.component';
import { ShowProfileComponent } from '../../../../shared/components/show-profile/show-profile.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ChannelService } from '../../../../shared/services/channel.service';
import { Unsubscribe } from '@angular/fire/firestore';
import { Subject, Subscription,Observable } from 'rxjs';
import { UserService } from '../../../../shared/services/user.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe);

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AddUserToChannelDialogComponent, AddUserDialogComponent, EditChannelDialogComponent, ShowProfileComponent, PickerComponent, EmojiComponent,FormsModule ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  private dataSubscription!: Subscription;
  unsubMessageData!: Unsubscribe;
  dateToday!: number;
  userId!: string;
  showEmojiPickerArray: boolean[] = [];
  isEmojiPickerVisible: boolean = false;
  dateMap: string[] = [];
  openEditMessageToggle: boolean[] = [];
  editMessage: boolean[] = [];
  messages: any[] = [];
  newMessage: { message: string } = { message: '' };

  constructor(public dialog: MatDialog, public mainsectionComponent: MainsectionComponent, private changeDetectorRef: ChangeDetectorRef) {
    this.userId = sessionStorage.getItem('uid')!;
    this.dataSubscription = this.channelService.data$.subscribe(data => {
      if (data) {
        this.channelService.messagesLoaded = true;
        setTimeout(() => {
          this.showEmojiPickerArray = [];
          this.editMessage = [];
          this.showEmojiPickerArray = this.channelService.messages.map(() => false);
          this.openEditMessageToggle = this.channelService.messages.map(() => false);
          this.editMessage = this.channelService.messages.map(() => false);
        }, 500);
      }
    });

  }

  @ViewChild('scroll', { static: false }) scroll!: ElementRef;
  @ViewChild('emojiPickerContainer', { static: false }) emojiPickerContainer!: ElementRef;

  private mutationObserver!: MutationObserver;
  private domChanges = new Subject<MutationRecord[]>();
  public domChanges$: Observable<MutationRecord[]> = this.domChanges.asObservable();
  private initialChildCount: number = 0;

  ngOnInit() {
    this.dateToday = Date.now() as number;
  }

  isNewDate(oldDate: number, newDate: number) {
    /* let oldDateAsString = this.convertToDate(oldDate);
    let newDateAsString = this.convertToDate(newDate); */
    let oldDateAsString = new Date(oldDate).toLocaleDateString();
    let newDateAsString = new Date(newDate).toLocaleDateString();
    return oldDateAsString != newDateAsString;
  }


  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();

   this.initialChildCount = this.scroll.nativeElement.children.length;
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        const currentChildCount = this.scroll.nativeElement.children.length;
        if (currentChildCount > this.initialChildCount) {
          this.initialChildCount = currentChildCount; 
           this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
          this.domChanges.next([mutation]);
        }
        else if(currentChildCount != this.initialChildCount){
          this.initialChildCount = this.scroll.nativeElement.children.length;        }
      });
    });

    this.mutationObserver.observe(this.scroll.nativeElement, {
      childList: true,
      subtree: false,
      characterData: false 
    });

    this.domChanges$.subscribe((mutations:any) => {
      console.log('DOM changes detected:', mutations);
    });
  }

  pushTimestamp(timestamp: string | null) {
    this.dateMap.push(timestamp as string);
    console.log(this.dateMap);
  }
  checkIfDateExists(timestamp: string | null) {
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

  toggleEditMessage(index: number) {
    this.openEditMessageToggle = this.openEditMessageToggle.map((value, i) => i === index ? !value : false);
  }

  editMessageFunction(index: number) {
    this.editMessage = this.editMessage.map((value, i) => i === index ? !value : false);
    console.log(this.channelService.messages[index].message);
    //der timeout gleicht verzögerung im DOM aus. Sonst gibt es abunzu focus probleme
      setTimeout(() => {
    const textareaId = 'editMessageTextarea-' + index;
    const textareaElement = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textareaElement) {
      textareaElement.focus();
    }
  }, 0);
  }

  editMessageAbort(index: number) {
    this.editMessage = this.editMessage.map((value, i) => i === index ? !value : false);
     this.openEditMessageToggle = this.openEditMessageToggle.map((value, i) => i === index ? !value : false);
  }

  onSubmit(editMessageForm: NgForm, index: number) {
    console.log(editMessageForm,"ausgeführt");
    
      if (editMessageForm.valid) {
    console.log(editMessageForm.value);
   // this.channelService.messages[index].message = editMessageForm.value.editMessageTextarea;
        this.editMessage = this.editMessage.map((value, i) => i === index ? !value : false);
        this.openEditMessageToggle = this.openEditMessageToggle.map((value, i) => i === index ? !value : false);
        editMessageForm.reset();
  }
  }

  /**
   * Adds an emoji to the message at the specified index.
   * If the emoji already exists in the message's emojiCounts, increment its count.
   * If the emoji does not exist, add it to the emojiCounts with a count of 0.
   * @param event - The event object containing the emoji data.
   * @param index - The index of the message to which the emoji should be added.
   */
  addEmoji(event: any, index: number, messageId: string, userId: string, calledFromFunction: boolean = false) {
    const emoji = event['emoji']['native'];
    let foundEmoji = false;
    let userMatched = messageId === userId;
    let callFromSingleEmoji = calledFromFunction;

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
        if (this.channelService.privateMsg) {
          console.log('hier bin ich');
          
          this.channelService.updateDirectMessage(this.channelService.messages[index]);
        } else{
          this.channelService.updateChannelMessage(this.channelService.messages[index])
        }
        break;

      }
    }

    if (!foundEmoji) {
      //wenn ich keinen emoji gefunden habe startet der count immer mit 0
      const count = 0//userMatched ? 0 : 1;
      const users = userMatched ? [] : [userId];
      console.log(count, userMatched, emoji, users);
      this.channelService.messages[index].emoji.push({ emoji: emoji, count: count, users: users });
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[index]);
      } else{
        this.channelService.updateChannelMessage(this.channelService.messages[index])
      }
    }
    if (!callFromSingleEmoji) {
      this.toggleEmojiPicker(index);
      this.isEmojiPickerVisible = false;
    }

  }


  updateReaction(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string) {
    let emojiUserIds = this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].users;
    let emojiCount = this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].count;

    //es muss nicht geprüft werden ob ein Emoji vorhanden ist. 
    // Prüfen, ob die Nachricht von mir stammt oder ob ich bereits reagiert habe
    if (messageId === userId || emojiUserIds.includes(userId)) {
      // Wenn der count des emojis 0 und die Reaktion mit mir zusammenhängt, soll dieses entfernt werden
      if (emojiCount === 0) {
        this.channelService.messages[currentMessageIndex].emoji.splice(currentEmojiIndex, 1);
      } else {
        // Wenn count > 0, den count um 1 verringern
        this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].count--;
        // Entfernen meiner Benutzer-ID aus der Liste der Reaktionen
        const userIndex = emojiUserIds.indexOf(userId);
        if (userIndex !== -1) {
          emojiUserIds.splice(userIndex, 1);
        }
      }
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[currentMessageIndex]);
      } else{
        this.channelService.updateChannelMessage(this.channelService.messages[currentMessageIndex])
      }
    } else {
      // Wenn die Nachricht nicht von mir stammt
      if (emojiUserIds.includes(userId)) {
        // Wenn count > 0, den count um 1 verringern
        if (emojiCount > 0) {
          this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].count--;
          // Entfernen meiner Benutzer-ID aus der Liste der Reaktionen
          const userIndex = emojiUserIds.indexOf(userId);
          if (userIndex !== -1) {
            emojiUserIds.splice(userIndex, 1);
          }
        }
      } else {
        // Wenn es bereits ein emoji gibt, soll der countWert erhöht werden
        this.channelService.messages[currentMessageIndex].emoji[currentEmojiIndex].count++;
        // Hinzufügen meiner Benutzer-ID zur Liste der Reaktionen
        emojiUserIds.push(userId);
      }
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[currentMessageIndex]);
      } else{
        this.channelService.updateChannelMessage(this.channelService.messages[currentMessageIndex])
      }
    }
  }

  addCheckEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string): void {
    this.addEmoji(event, currentMessageIndex, messageId, userId, true)
  }

  addRaisedHandsEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string): void {
    this.addEmoji(event, currentMessageIndex, messageId, userId, true)
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

 /**
  * The function `getOtherUserData` asynchronously retrieves other user data and opens a dialog with
  * the user information.
  * @param {string} [id] - The `id` parameter in the `getOtherUserData` function is a string that
  * represents the user ID of the other user whose profile information you want to retrieve.
  */
  async getOtherUserData(id?: string) {
    await this.userService.retrieveOtherUserProfile(id!);
    this.openDialogUserInfo();
  }

  /**
  * This function opens the dialog and determines if the ShowProfile component is editable or not
  * @param profileEditable boolean - determine if ShowUser component is editable or not
  */
  async openDialogUserInfo() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: ['show-profile-from-message', 'box-shadow', 'box-radius'] });
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;
    dialogRef
      .afterClosed()
      .subscribe();
  }

/**
 * The `showThreadBar` function calls the `showThread` method of the `mainsectionComponent`.
 */
  showThreadBar() {
    this.mainsectionComponent.showThread();
  }

  ngOnDestroy() {
    /* this.unsubMessageData(); */
     this.mutationObserver.disconnect();
    this.channelService.messages = [];
    this.channelService.messagesLoaded = false;
    this.channelService.currentMessagesId = '';
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    console.log('true?');

  }
}
