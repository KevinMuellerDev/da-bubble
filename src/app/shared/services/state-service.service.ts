import { Injectable, inject } from '@angular/core';
import { ResizeListenerService } from '../../shared/services/resize-listener.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  editChannelDialogOpenMobile: boolean = false;
  resizeListenerService: ResizeListenerService = inject(ResizeListenerService);

  constructor() {
    this.resizeListenerService.registerResizeCallback(this.getEditChannelDialogOpenMobile.bind(this));
  }

  setEditChannelDialogOpenMobile(state: boolean): void {
    this.editChannelDialogOpenMobile = state;
  }

  getEditChannelDialogOpenMobile(): boolean {
    return this.editChannelDialogOpenMobile;
  }

  ngOnDestroy(): void {
    this.resizeListenerService.unregisterResizeCallback(this.getEditChannelDialogOpenMobile.bind(this));
  }
}

