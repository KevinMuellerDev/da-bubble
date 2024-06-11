import { CommonModule } from '@angular/common';
import { Component,ElementRef,ViewChild } from '@angular/core';
import { MainsectionComponent } from '../../mainsection.component';
import { MatDialog } from '@angular/material/dialog';
import { ShowProfileComponent } from '../../../shared/components/show-profile/show-profile.component';
import { EditChannelDialogComponent } from '../edit-channel-dialog/edit-channel-dialog.component';
import { AddUserToChannelDialogComponent } from '../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { MessageComponent } from './message/message.component';


@Component({
  selector: 'app-channel-messages',
  standalone: true,
  imports: [CommonModule,MainsectionComponent,ShowProfileComponent,EditChannelDialogComponent,AddUserToChannelDialogComponent,AddUserDialogComponent,MessageComponent],
  templateUrl: './channel-messages.component.html',
  styleUrl: './channel-messages.component.scss'
})
export class ChannelMessagesComponent {

  constructor(public dialog: MatDialog){}
  


      openDialogAddUser() {
       this.dialog.open(AddUserDialogComponent, { panelClass: 'mod-dialog-window-3' })
  }

  
    openDialogAddUserToChannel() {
       this.dialog.open(AddUserToChannelDialogComponent, { panelClass: 'mod-dialog-window-3' })
  }

    openDialogEditChannel() {
       this.dialog.open(EditChannelDialogComponent, { panelClass: 'mod-dialog-window-2' })
  }




}
