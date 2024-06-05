import { Component, ViewChildren, ViewEncapsulation, inject } from '@angular/core';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ShowProfileComponent } from '../../show-profile/show-profile.component';
import { UserService } from '../../../services/user.service';
import { UserData } from '../../../models/userdata.class';
@Component({
  selector: 'app-user-menu-dialog',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, RouterLink],
  templateUrl: './user-menu-dialog.component.html',
  styleUrl: './user-menu-dialog.component.scss'
})
export class UserMenuDialogComponent {
  userService: UserService = inject(UserService);
  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<UserMenuDialogComponent>) { }

  logout() {
    sessionStorage.removeItem('uid');
    this.dialogRef.close();
  }

  /**
   * This function opens the dialog and determines if the ShowProfile component is editable or not
   * 
   * @param profileEditable boolean - determine if ShowUser component is editable or not
   */
  openDialog() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { position: { top: '120px', right: '25px' } })
    dialogRef.componentInstance.profileEditable = true;
    dialogRef
      .afterClosed()
      .subscribe();
  }
}
