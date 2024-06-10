import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule,NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-add-new-user-to-channel',
  standalone: true,
  imports: [MatDialogModule, FormsModule,CommonModule],
  templateUrl: './add-new-user-to-channel.component.html',
  styleUrl: './add-new-user-to-channel.component.scss'
})
export class AddNewUserToChannelComponent {


  selectedOption: string;
 
  inputs = {
    'specificUser': ''
  }
  
    constructor() {
    this.selectedOption = '';
   
  }

  onSubmit(addUserInputs: NgForm) {
   
    console.log(this.selectedOption);
    console.log(this.inputs.specificUser);
    addUserInputs.reset();
   }


}
