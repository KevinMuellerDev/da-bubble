import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule,NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [MatDialogModule,CommonModule,FormsModule],
  templateUrl: './add-user-dialog.component.html',
  styleUrl: './add-user-dialog.component.scss'
})
export class AddUserDialogComponent {
  addUser = {
    name: ''
  }

  submitUser(addedUser: NgForm) {
    console.log(addedUser.name);
    addedUser.reset();
  }
}
