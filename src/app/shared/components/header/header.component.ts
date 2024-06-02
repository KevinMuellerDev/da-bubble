import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { UserMenuDialogComponent } from './user-menu-dialog/user-menu-dialog.component';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  userService: UserService = inject(UserService);  

  constructor(public dialog: MatDialog){}


  openDialog() {
    this.dialog.open(UserMenuDialogComponent,{position: {top: '120px', right: '25px'}})
    .afterClosed()
    .subscribe();
  }

    /**
   * Function returns the class of user status for online indicator div
   * 
   * @param type string - to determine which value should be returned
   * @returns class as a string
   */
    getUserStatus(){
      const loggedIn = this.userService.userInfo.isLoggedIn == true ? "online-div" : "offline-div";
      return loggedIn
    }
}
