import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogClose,
} from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-show-profile',
  standalone: true,
  imports: [MatDialogClose, CommonModule, ReactiveFormsModule],
  templateUrl: './show-profile.component.html',
  styleUrl: './show-profile.component.scss'
})

export class ShowProfileComponent {
  userService: UserService = inject(UserService);

  updateUserForm: FormGroup;

  profileEditable:Boolean = false;
  editMode:boolean = false;

  constructor(){
    this.updateUserForm= new FormGroup({
      name: new FormControl(''),
      email: new FormControl(this.userService.userInfo.email, [Validators.required, Validators.email]),
    });
  }

  /**
   * Function returns the class of user status for online indicator div and text
   * depending on given type as a string
   * @param type string - to determine which value should be returned
   * @returns class as a string
   */
  getUserStatus(type: string) {
    const status = this.userService.userInfo.isLoggedIn == true ? "online" : "offline";
    if (type == 'text')
      return status

    return status + '-div'
  }

  getStatusText() {
    const text = this.userService.userInfo.isLoggedIn == true ? "Aktiv" : "Inaktiv";
    return text
  }

  checkUpdateInput(){
    if (this.updateUserForm.valid) {
      this.userService.updateUserProfile(this.updateUserForm);
      this.editMode = false;
    }
  }

}
