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
import { EmojiService } from '../../../../shared/services/emoji.service';

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
  selectedEmojis: string[] = [];

  constructor(public dialog: MatDialog, public mainsectionComponent: MainsectionComponent, private changeDetectorRef: ChangeDetectorRef,private emojiService: EmojiService) {
    this.userId = sessionStorage.getItem('uid')!;
    this.channelService.messagesLoaded=false;
    this.dataSubscription = this.channelService.data$.subscribe(data => {
      if (data) {
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
          this.initialChildCount = this.scroll.nativeElement.children.length;}
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

    onAddEmoji(event: any, index: number, messageId: string, userId: string, calledFromFunction: boolean = false) {
    this.emojiService.addEmoji(event, index, messageId, userId);
    if (!calledFromFunction) {
      this.toggleEmojiPicker(index);
      this.isEmojiPickerVisible = false;
    }
  }

  onUpdateReaction(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string) {
    this.emojiService.updateReaction(currentEmojiIndex, currentMessageIndex, currentEmoji, messageId, userId);
  }

  onAddCheckEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string) {
    this.emojiService.addCheckEmoji(event, currentMessageIndex, messageId, userId);
  }

  onAddRaisedHandsEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string) {
    this.emojiService.addRaisedHandsEmoji(event, currentMessageIndex, messageId, userId);
  }

  /**
 * Toggles the visibility of the emoji picker for the message at the specified index.
 * It sets the corresponding value in the `showEmojiPickerArray` to the opposite of its current value.
 * All other values in the array are set to false, ensuring that only one emoji picker is visible at a time.
 * @param index - The index of the message for which the emoji picker should be toggled.
 */
toggleEmojiPicker(index: number) {
  if (this.editMessage[index]) {
    // Wenn die Nachricht bearbeitet wird, Emojis zur bearbeiteten Nachricht hinzufügen
    this.showEmojiPickerArray = this.showEmojiPickerArray.map((value, i) => i === index ? !value : false);
    if (this.showEmojiPickerArray[index]) {
      document.addEventListener('emoji-click', (event: any) => this.addEmojiToEditedMessage(event, index), { once: true });
    }
  } else {
    // Standardverhalten
    this.showEmojiPickerArray = this.showEmojiPickerArray.map((value, i) => i === index ? !value : false);
  }
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
  // Der timeout gleicht Verzögerung im DOM aus. Sonst gibt es ab und zu Fokusprobleme
  setTimeout(() => {
    const textareaId = 'editMessageTextarea-' + index;
    const textareaElement = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textareaElement) {
      textareaElement.focus();
    }
  }, 0);
  this.openEditMessageToggle = this.openEditMessageToggle.map((value, i) => i === index ? !value : false);
}

addEmojiToEditedMessage(event: any, index: number) {
  const selectedEmoji = event['emoji']['native'];
  this.selectedEmojis.push(selectedEmoji);
  this.channelService.messages[index].message += selectedEmoji;
}

  editMessageAbort(index: number) {
    this.editMessage = this.editMessage.map((value, i) => i === index ? !value : false);
     this.openEditMessageToggle = this.openEditMessageToggle.map((value, i) => i === index ? !value : false);
  }

  editMessageBlur(index: number,event:any,editMessageForm:NgForm) {
    const relatedTarget = event.relatedTarget as HTMLElement;
  // weitere funktionen sollen nicht bei einem button klick ausgefürhrt werden
    if (relatedTarget && (relatedTarget.tagName === 'BUTTON' || relatedTarget.closest('button'))) {
    return;
  } 
      this.editMessage = this.editMessage.map((value, i) => i === index ? !value : false);
      editMessageForm.reset();
  }

  onSubmit(editMessageForm: NgForm, index: number) {
    console.log(editMessageForm.value,this.newMessage);
    
    if (editMessageForm.valid) {
        this.channelService.messages[index].message = editMessageForm.value.editMessageTextarea;
        //this.channelService.updateChannelMessage(this.channelService.messages[index]);
      this.editMessage = this.editMessage.map((value, i) => i === index ? !value : false);
      editMessageForm.reset();
      this.selectedEmojis = [];
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
