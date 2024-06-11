import { CommonModule } from '@angular/common';
import { Component,ElementRef,ViewChild } from '@angular/core';
import { MainsectionComponent } from '../../mainsection.component';
import { MatDialog } from '@angular/material/dialog';
import { ShowProfileComponent } from '../../../shared/components/show-profile/show-profile.component';


@Component({
  selector: 'app-channel-messages',
  standalone: true,
  imports: [CommonModule,MainsectionComponent,ShowProfileComponent],
  templateUrl: './channel-messages.component.html',
  styleUrl: './channel-messages.component.scss'
})
export class ChannelMessagesComponent {

  constructor(public dialog: MatDialog){}
  
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
  * 
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
    document.getElementById('threadBar')?.classList.remove('hide-show')
  }


}
