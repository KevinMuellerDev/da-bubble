import { Component } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('openClose', [
      state('closed', style({ display: 'none' })),
      state('open', style({ display: 'flex' })),
    ]),
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  menuStates: { [state: string]: 'open' | 'closed' } = {
    channel: 'closed',
    message: 'closed',
  };

  toggleMenu(menu: 'channel' | 'message') {
    this.menuStates[menu] =
      this.menuStates[menu] === 'open' ? 'closed' : 'open';
  }
}
