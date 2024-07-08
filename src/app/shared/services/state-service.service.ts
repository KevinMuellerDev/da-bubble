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

  /**
   * Constructor function that registers a resize callback for the edit channel dialog on mobile devices.
   */
  constructor() {
    this.resizeListenerService.registerResizeCallback(this.getEditChannelDialogOpenMobile.bind(this));
  }

  /**
   * Sets the state of the edit channel dialog on mobile devices.
   * @param {boolean} state - The state to set for the edit channel dialog on mobile devices.
   */
  setEditChannelDialogOpenMobile(state: boolean): void {
    this.editChannelDialogOpenMobile = state;
  }

  /**
   * Retrieves the state of the edit channel dialog on mobile devices.
   * @return {boolean} The state of the edit channel dialog on mobile devices.
   */
  getEditChannelDialogOpenMobile(): boolean {
    return this.editChannelDialogOpenMobile;
  }

  /**
   * Triggers the `showAddUserSubject` BehaviorSubject to emit a new value, indicating that the add user dialog should be opened.
   */
  triggerAddUser(): void {
    this.showAddUserSubject.next();
  }

  /**
   * Unregisters the resize callback function from the ResizeListenerService
   * in order to clean up and prevent memory leaks when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.resizeListenerService.unregisterResizeCallback(this.getEditChannelDialogOpenMobile.bind(this));
  }
}

