import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MainsectionComponent } from '../mainsection.component';
import { ShowProfileComponent } from '../../shared/components/show-profile/show-profile.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, MainsectionComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  constructor(public dialog: MatDialog){}
  
 closeThread() {
  document.getElementById('threadBar')?.classList.add('hide-show')
  }

  /**
  * This function opens the dialog and determines if the ShowProfile component is editable or not
  * 
  * @param profileEditable boolean - determine if ShowUser component is editable or not
  */
  openDialogUserInfo() {
    let dialogRef = this.dialog.open(ShowProfileComponent, {panelClass:'verify'})
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;

    dialogRef
      .afterClosed()
      .subscribe();
  }
}
