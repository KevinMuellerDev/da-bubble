import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../mainsection.component';
import { ShowProfileComponent } from '../../shared/components/show-profile/show-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { EditChannelDialogComponent } from './edit-channel-dialog/edit-channel-dialog.component';
import { AddUserToChannelDialogComponent } from './add-user-to-channel-dialog/add-user-to-channel-dialog.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, MainsectionComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  message = {
    content: ''
  }

  submitClick: boolean = false;
  textareaBlur: boolean = false;

  @ViewChild('scroll', { read: ElementRef }) public scroll!: ElementRef<any>;
  @ViewChild('messageContent', { read: ElementRef }) public messageContent!: ElementRef<any>;

  constructor(public dialog: MatDialog){}

  ngAfterViewChecked() {
    this.scrollBottom();
  }
  public scrollBottom() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }

  onSubmit(form: NgForm) {
   this.submitClick = true;
    this.textareaBlur = true;
    if (!form.valid) {
      console.log(form)
      form.reset();
    } else if (form.valid) {
      console.log(this.message.content);
      form.reset();
      this.messageContent.nativeElement.focus()
      this.submitClick = false;
    }
  }
 
  showThreadBar() {
    document.getElementById('threadBar')?.classList.remove('hide-show')
  }

  openDialogEditChannel() {
       this.dialog.open(EditChannelDialogComponent, { panelClass: 'mod-dialog-window-2' })
  }

    openDialogAddUserToChannel() {
       this.dialog.open(AddUserToChannelDialogComponent, { panelClass: 'mod-dialog-window-3' })
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
}
