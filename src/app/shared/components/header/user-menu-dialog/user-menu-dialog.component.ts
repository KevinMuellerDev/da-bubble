import { Component, ViewChildren, inject } from '@angular/core';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ShowProfileComponent } from '../../show-profile/show-profile.component';
import { UserService } from '../../../services/user.service';
import { UserData } from '../../../models/userdata.class';
import { getAuth } from '@angular/fire/auth';
@Component({
  selector: 'app-user-menu-dialog',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, RouterLink],
  templateUrl: './user-menu-dialog.component.html',
  styleUrl: './user-menu-dialog.component.scss'
})
export class UserMenuDialogComponent{
  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<UserMenuDialogComponent>, private userService: UserService) { }

  async logout() {
    await this.userService.userLoggedOut();
    sessionStorage.removeItem('uid');
    getAuth().signOut();
    setTimeout(() => {
      this.userService.userInfo = new UserData();   
    }, 200);
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
