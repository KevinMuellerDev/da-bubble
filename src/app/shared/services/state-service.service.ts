import { Injectable, inject } from '@angular/core';
import { EditChannelDialogComponent } from '../../mainsection/channel/edit-channel-dialog/edit-channel-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ResizeListenerService } from '../../shared/services/resize-listener.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  public editChannelDialogOpen: boolean = false;
  resizeListenerService: ResizeListenerService = inject(ResizeListenerService);

  constructor() {
    // this.resizeListenerService.registerResizeCallback(this.updateEditChannelDialogState.bind(this));
  }

  setEditChannelDialogOpen(state: boolean): void {
    this.editChannelDialogOpen = state;
    console.log(`EditChannelDialog open im smScreen: ${this.editChannelDialogOpen ? '🟢 Ja' : '\u001b[31m  Nein'}`);
  }

  getEditChannelDialogOpen(): boolean {
    return this.editChannelDialogOpen;
  }

  // private updateEditChannelDialogState(): void {
  //   this.editChannelDialogOpen = this.resizeListenerService.smScreen && this.dialogRefsExist(EditChannelDialogComponent); // Assuming dialogRefs exist in ChannelMessagesComponent
  //   console.log(`EditChannelDialogComponent ist im smScreen geöffnet: ${this.editChannelDialogOpen ? '🟢 Ja' : '\u001b[31m  Nein'}`);
  // }

  // Helper function to check if specific dialog component instances exist (assuming you have a mechanism to track dialogs)
  // private dialogRefsExist(componentType: any): boolean {
  //   // Implement logic to check if dialogs of the specified component type are open (replace with your actual implementation)
  //   // This could involve iterating through dialogRefs or using a separate state management mechanism
  //   return false;
  // }
}

