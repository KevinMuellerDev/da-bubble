import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private avatars: string[] = [
    '../assets/img/profile/elias_neumann.png',
    '../assets/img/profile/elise_roth.png',
    '../assets/img/profile/frederik_beck.png',
    '../assets/img/profile/noah_braun.png',
    '../assets/img/profile/sofia_müller.png',
    '../assets/img/profile/steffen_hoffmann.png'
  ];

  constructor() { }

  getAvatars(): string[] {
    return this.avatars;
  }
}
