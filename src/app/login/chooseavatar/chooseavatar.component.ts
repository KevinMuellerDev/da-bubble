import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'app-chooseavatar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './chooseavatar.component.html',
  styleUrls: ['./chooseavatar.component.scss']
})
export class ChooseavatarComponent implements OnInit {
  avatars: string[] = [];
  selectedAvatar: string = '../../assets/img/login/default_profil_img.png'; // default img

  constructor(private storageService: StorageService) { }

  ngOnInit() {
    this.avatars = this.storageService.getAvatars();
  }

  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }
}
