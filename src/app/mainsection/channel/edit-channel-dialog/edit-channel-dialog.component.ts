import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule ,NgForm} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [MatDialogModule,CommonModule,FormsModule],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent {

  editChannelName: boolean = false;
  
  newChannelName = {
    'name':''
  }

  changeEditChannelStatus() {
    this.editChannelName =true
  }

    saveEditChannelStatus() {
    this.editChannelName =false
  }
}
