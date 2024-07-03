import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ResizeListenerService } from '../../shared/services/resize-listener.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  resizeListenerService: ResizeListenerService = inject(ResizeListenerService);
  private showAddUserSubject = new Subject<void>();
  openDialogAddUser$ = this.showAddUserSubject.asObservable();
  editChannelDialogOpenMobile: boolean = false;


  constructor() {
    this.resizeListenerService.registerResizeCallback(this.getEditChannelDialogOpenMobile.bind(this));
  }

  setEditChannelDialogOpenMobile(state: boolean): void {
    this.editChannelDialogOpenMobile = state;
  }

  getEditChannelDialogOpenMobile(): boolean {
    return this.editChannelDialogOpenMobile;
  }

  triggerAddUser(): void {
    this.showAddUserSubject.next();
  }

  ngOnDestroy(): void {
    this.resizeListenerService.unregisterResizeCallback(this.getEditChannelDialogOpenMobile.bind(this));
  }
}

