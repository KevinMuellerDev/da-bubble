import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule,NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user-to-channel-dialog',
  standalone: true,
  imports: [MatDialogModule,CommonModule,FormsModule],
  templateUrl: './add-user-to-channel-dialog.component.html',
  styleUrl: './add-user-to-channel-dialog.component.scss'
})
export class AddUserToChannelDialogComponent {

}
