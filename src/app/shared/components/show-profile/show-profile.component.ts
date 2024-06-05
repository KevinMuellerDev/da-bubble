import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { VerifyComponent } from '../verify/verify.component';


@Component({
  selector: 'app-show-profile',
  standalone: true,
  imports: [MatDialogActions, MatDialogClose, CommonModule, ReactiveFormsModule],
  templateUrl: './show-profile.component.html',
  styleUrl: './show-profile.component.scss'
})

export class ShowProfileComponent {
  userService: UserService = inject(UserService);
  authService: AuthService = inject(AuthService);
  updateUserForm: FormGroup;

  profileEditable: Boolean = false;
  editMode: boolean = false;

  constructor(public dialog: MatDialog) {
    this.updateUserForm = new FormGroup({
      name: new FormControl(this.userService.userInfo.name),
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

  checkUpdateInput() {
    if (this.updateUserForm.valid) {
      this.openDialog()
    }
  }

  openDialog() {
    this.dialog.open(VerifyComponent,{panelClass: 'verify'})
      .afterClosed()
      .subscribe(() => {
        console.log(this.authService.verified);
        
        if (this.authService.verified == true) {
          this.authService.updateUserMail(this.updateUserForm.controls['email'].value)
          this.userService.updateUserProfile(this.updateUserForm);
          this.editMode = false;
        }else{
          return
        }
      })
  }

}
