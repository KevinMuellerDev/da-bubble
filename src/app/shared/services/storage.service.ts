import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storage: Storage = inject(Storage);
  selectedAvatar!: string;
  files!: FileList;
  fileName!: string | undefined;
  fileUrl!: any;

  constructor() { }

  onFileSelected(input: HTMLInputElement) {
    if (input.files?.item(0)?.size! > 1048576) {
      this.fileName = "This file exceeds the size of 1024kb !";
      return;
    }
    if (!input.files || (input.files && !this.isValid(input))) {
      // console.warn('Files not valid.');
      return;
    }
    console.log('Files valid.');
    this.files = input.files;
    this.fileName = this.files.item(0)?.name;
    this.fileUrl = this.files.item(0);
    console.log('onFileSelected this.files:', this.files);
    console.log('onFileSelected this.fileName:', this.fileName);
  }

  isValid(input: HTMLInputElement) {
    let dataType = input.files?.item(0)?.type
    dataType = dataType?.split('/').pop();
    console.log('your file size is', input.files?.item(0)?.size!, 'bytes');

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
