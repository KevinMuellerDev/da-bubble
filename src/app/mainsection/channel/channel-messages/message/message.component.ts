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
import { Subject, Subscription, Observable } from 'rxjs';
import { UserService } from '../../../../shared/services/user.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { EmojiService } from '../../../../shared/services/emoji.service';
import { OutsideclickDirective } from '../../../../outsideclick.directive';
import { ThreadService } from '../../../../shared/services/thread.service';

registerLocaleData(localeDe);



@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AddUserToChannelDialogComponent, AddUserDialogComponent, EditChannelDialogComponent, ShowProfileComponent, PickerComponent, EmojiComponent, FormsModule, OutsideclickDirective],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'

})

export class MessageComponent {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  threadService:ThreadService = inject(ThreadService);
  private dataSubscription!: Subscription;
  unsubMessageData!: Unsubscribe;
  dateToday!: number;
  userId!: string;

  isEmojiPickerVisible: boolean = false;
  isEditMessageTextareaVisible: boolean = false;
  dateMap: string[] = [];

  messages: any[] = [];
  newMessage: { message: string } = { message: '' };
  originalMessage!: string;
  emojiAdded: boolean = false;

  constructor(public dialog: MatDialog, public mainsectionComponent: MainsectionComponent, private changeDetectorRef: ChangeDetectorRef, public emojiService: EmojiService) {
    this.userId = sessionStorage.getItem('uid')!;
    this.channelService.messagesLoaded = false;
    this.dataSubscription = this.channelService.data$.subscribe(data => {
      if (data) {
        setTimeout(() => {
          emojiService.initMaps();
        }, 500);
      }
    });

  }

  @ViewChild('scroll', { static: false }) scroll!: ElementRef;
  @ViewChild('emojiPickerContainer', { static: false }) emojiPickerContainer!: ElementRef;
  @ViewChild('editMessageContainer', { static: false }) editMessageContainer!: ElementRef;
  @ViewChild('editMessageTextarea', { static: false }) editMessageTextarea!: ElementRef;

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
        else if (currentChildCount != this.initialChildCount) {
          this.initialChildCount = this.scroll.nativeElement.children.length;
        }
      });
    });

    this.mutationObserver.observe(this.scroll.nativeElement, {
      childList: true,
      subtree: false,
      characterData: false
    });

    this.domChanges$.subscribe((mutations: any) => {
      console.log('DOM changes detected:', mutations);
      this.emojiService.initMaps();
    });
  }

  pushTimestamp(timestamp: string | null) {
    this.dateMap.push(timestamp as string);
    console.log(this.dateMap);
  }

  onOutsideClick(index: number, event: Event): void {
    this.emojiService.showEmojiPickerArray[index] = false;
    this.emojiService.openEditMessageToggle[index] = false;
    if (!this.emojiAdded) {
      this.emojiService.editMessage[index] = false;
      this.editMessageAbort(index)
    }
  }

  onAddEmoji(event: any, index: number, messageId: string, userId: string, calledFromFunction: boolean = false) {
    this.emojiService.addEmoji(event, index, messageId, userId);
    this.emojiAdded = true;
    setTimeout(() => {
      this.emojiAdded = false;
    }, 500);
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
    this.emojiService.showEmojiPickerArray = this.emojiService.showEmojiPickerArray.map((value, i) => i === index ? !value : false);
  }

  toggleOpenEditMessage(index: number) {
    this.emojiService.openEditMessageToggle = this.emojiService.openEditMessageToggle.map((value, i) => i === index ? !value : false);
  }

  /**
* Toggles the visibility of the emoji picker.
* It stops the propagation of the event to prevent it from bubbling up to other event listeners.
* It then toggles the `isEmojiPickerVisible` property, which determines whether the emoji picker is visible or not.
* @param event - The click event that triggered this function.
*/

  toggleEvent(event: any, index: number): void {
    if (event.target.classList.contains('edit-message-icon') || event.target.classList.contains('add-reaction-icon') || event.target.classList.contains('text-area-editable')) {
      event.stopPropagation();
    }
  }

  updateMessageAfterEmojiSelection(index: number) {
    this.newMessage = { message: this.channelService.messages[index].message };
  }

  editMessageFunction(index: number) {
    this.originalMessage = this.channelService.messages[index].message;
    this.emojiService.messageEdit = true;
    this.isEditMessageTextareaVisible = true;
    this.emojiService.editMessage[index] = !this.emojiService.editMessage[index];
    const textareaId = 'editMessageTextarea-' + index;
    this.newMessage = { message: this.channelService.messages[index].message };
    // Der timeout gleicht Verzögerung im DOM aus. Sonst gibt es ab und zu Fokusprobleme
    setTimeout(() => {
      const textareaElement = document.getElementById(textareaId) as HTMLTextAreaElement;
      if (textareaElement) {
        textareaElement.focus();
      }
    }, 0);
    this.emojiService.openEditMessageToggle[index] = !this.emojiService.openEditMessageToggle[index];
  }
  editMessageAbort(index: number) {
    this.emojiService.editMessage[index] = false;
    this.emojiService.messageEdit = false;
    this.newMessage = { message: this.originalMessage };
    this.channelService.messages[index].message = this.originalMessage;
  }

  onKeyup(event: KeyboardEvent, editMessageForm: NgForm, index: number) {
    this.channelService.messages[index].message = this.newMessage.message;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit(editMessageForm, index);
    }
  }

  onSubmit(editMessageForm: NgForm, index: number) {
    if (editMessageForm.valid) {
      this.channelService.messages[index].message = this.newMessage.message;
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[index]);
      } else {
        this.channelService.updateChannelMessage(this.channelService.messages[index]);
      }
      this.emojiService.editMessage[index] = false;
      editMessageForm.reset();
      this.emojiService.messageEdit = false;
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
  showThreadBar(message?:object) {
    this.threadService.originMessage = message;
    this.mainsectionComponent.showThread();
    this.threadService.isActive=true;
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
