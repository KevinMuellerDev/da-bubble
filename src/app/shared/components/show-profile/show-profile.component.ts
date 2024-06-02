import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-show-profile',
  standalone: true,
  imports: [MatDialogClose, CommonModule],
  templateUrl: './show-profile.component.html',
  styleUrl: './show-profile.component.scss'
})

export class ShowProfileComponent {
  userService: UserService = inject(UserService);

  profileEditable:Boolean = false;
  editMode:boolean = false;

  /**
   * Function returns the class of user status for online indicator div and text
   * depending on given type as a string
   * 
   * @param type string - to determine which value should be returned
   * @returns class as a string
   */
  getUserStatus(type:string ){
    const status = this.userService.userInfo.isLoggedIn == true ? "online" : "offline";
    if (type == 'text') 
      return status
    
    return status+'-div'
  }

  getStatusText(){
    const text = this.userService.userInfo.isLoggedIn == true ? "Aktiv" : "Inaktiv";
    return text
  }

}
