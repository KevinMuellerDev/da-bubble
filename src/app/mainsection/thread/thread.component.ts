import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MainsectionComponent } from '../mainsection.component';
import { ShowProfileComponent } from '../../shared/components/show-profile/show-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../shared/services/channel.service';
import { ThreadService } from '../../shared/services/thread.service';
import { EmojiService } from '../../shared/services/emoji.service';
import { MutationObserverService } from '../../shared/services/mutation.observer.service';
import { Subscription } from 'rxjs';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule, NgForm } from '@angular/forms';
import { OutsideclickDirective } from '../../outsideclick.directive';
import { UserService } from '../../shared/services/user.service';



@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, MainsectionComponent,EmojiComponent,PickerComponent,FormsModule,OutsideclickDirective],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
  

  
export class ThreadComponent {
  channelService:ChannelService= inject(ChannelService);
  threadService: ThreadService = inject(ThreadService);
  userService: UserService = inject(UserService);
  private domChangesSubscription!: Subscription;
  userId!: string;
  messages: any[] = [];
  newMessage: { message: string } = { message: '' };
  originalMessage!: string;
  emojiAdded: boolean = false;
  isEmojiPickerVisible: boolean = false;
  isEditMessageTextareaVisible: boolean = false;

  constructor(public dialog: MatDialog, private mainsectionComponent: MainsectionComponent, public emojiService: EmojiService, private MutationObserverService: MutationObserverService) { 
    this.userId = sessionStorage.getItem('uid')!;
     setTimeout(() => {
          emojiService.initMaps();
        }, 500);
  }

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
   ngOnInit() {
     this.domChangesSubscription = this.MutationObserverService.domChanges$.subscribe((mutations: MutationRecord[]) => {
      console.log('DOM changes detected:', mutations);
    });
  }
  
  ngAfterViewInit() {
    if (this.scrollContainer) {
          this.MutationObserverService.observe(this.scrollContainer);
      }
  }


  closeThread() {
    this.mainsectionComponent.hideThread();
    this.threadService.isActive = false;
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
}
