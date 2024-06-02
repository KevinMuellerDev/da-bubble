import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storage: Storage = inject(Storage);

  files!: FileList;
  fileName!: string | undefined;

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

  
  onFileSelected(input: HTMLInputElement) {
    if (input.files?.item(0)?.size! > 1048576) {
      this.fileName = "This file exceeds the size of 1024kb !"
      return
    }
    if (!input.files || (input.files && !this.isValid(input))) return
    this.files = input.files;
    this.fileName = this.files.item(0)?.name
  }


  isValid(input: HTMLInputElement) {
    let dataType = input.files?.item(0)?.type
    dataType = dataType?.split('/').pop();
    console.log(input.files?.item(0)?.size!);

    return (dataType === 'jpeg' || dataType === 'jpg' || dataType === 'png' || dataType === 'gif')
  }


  async uploadFile() {
    if (this.files == undefined) return
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files.item(i);
      if (file) {
        const storageRef = ref(this.storage, 'TODO: IMPLEMENT ME');
        await uploadBytesResumable(storageRef, file);
        await getDownloadURL(storageRef).then((url) => {
          //TODO: IMPLEMENT LOGIC
        })
      }
    }
  }


}
