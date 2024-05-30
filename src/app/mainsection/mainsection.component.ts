import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChannelComponent } from './channel/channel.component';
import { ThreadComponent } from './thread/thread.component';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-mainsection',
  standalone: true,
  imports: [CommonModule , HeaderComponent ,SidebarComponent,ChannelComponent,ThreadComponent, MatIconModule],
  templateUrl: './mainsection.component.html',
  styleUrl: './mainsection.component.scss'
})
export class MainsectionComponent {

}
