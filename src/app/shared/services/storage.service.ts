import { Injectable, OnInit, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { UserService } from './user.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements OnInit {
  private readonly storage: Storage = inject(Storage);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  userService: UserService = inject(UserService);
  selectedAvatar!: string;
  files!: FileList;
  filesTextarea!: FileList;
  filesTextareaThread!: FileList;
  fileName!: string | undefined;
  fileNameTextarea!: string | undefined;
  fileNameTextareaThread!: string | undefined;
  fileUrl!: any;
  fileUrlTextarea!: SafeResourceUrl | string | ArrayBuffer | null;
  fileUrlTextareaThread!: SafeResourceUrl | string | ArrayBuffer | null;
  pdfUrl!: SafeResourceUrl | null;
  pdfUrlThread!: SafeResourceUrl | null;
  downloadUrl!: string;
  downloadUrlThread!: string;
  uploadedFileType!: string;
  uploadedFileTypeThread!: string;
  avatars: string[] = [
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile2.svg?alt=media&token=fdc78ec8-f201-4138-8447-d49c957ba67a',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile1.svg?alt=media&token=e8652777-3f75-4517-9789-e3b24ef87820',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile6.svg?alt=media&token=f7827bc5-1cd3-499d-be4e-2e748a170699',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile4.svg?alt=media&token=104a104e-712c-4d89-99c8-5c6d6eeb381b',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile5.svg?alt=media&token=25935b79-8ce7-4f23-9d2e-a82b95adfbc3',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile3.svg?alt=media&token=7bd92926-13d9-476b-8c39-fde34aa7044e'
  ];

  constructor() { }

  ngOnInit() {
    this.avatars = this.getAvatars();
  }

  /**
   * Retrieves the list of avatars.
   * @return {string[]} The array of avatar paths.
   */
  getAvatars(): string[] {
    return this.avatars;
  }

  /**
   * The function `onFileSelected` checks if a selected file exceeds a certain size limit and sets the
   * file name and URL if it is valid.
   * @param {HTMLInputElement} input - The `onFileSelected` function takes an `HTMLInputElement` as input
   * parameter. This function is used to handle file selection events, such as when a user selects a file.
   * @returns If the file selected exceeds the size of 1024kb, the function will return a message
   * indicating that the file exceeds the size limit. If there are no files selected or the selected file
   * is not valid, the function will return without further action. If a valid file is selected, the
   * function will set the selected file to be used in the application.
   */
  onFileSelected(input: HTMLInputElement) {
    if (input.files?.item(0)?.size! > 1048576) {
      this.fileName = "This file exceeds the size of 1024kb !";
      return;
    }
    if (!input.files || (input.files && !this.isValid(input))) {
      return;
    }
    this.files = input.files;
    this.fileName = this.files.item(0)?.name;
    this.fileUrl = this.files.item(0);
  }

  // only for elements from Textarea upload size not changed yet
  onFileSelectedTextarea(input: HTMLInputElement) {
    const file = input.files?.item(0);
    if (!file || !this.isValid(input)) {
      return;
    }
    if (file.size > 1048576) {
      this.fileNameTextarea = "This file exceeds the size of 1024kb!";
      return;
    }
    if (input.files) {
      this.filesTextarea = input.files;
    }
    this.fileNameTextarea = file.name;
    if (this.isPdf(file)) {
      this.handlePdfFile(file);
    } else {
      this.handleImageFile(file);
    }
  }

  onFileSelectedTextareaForThread(input: HTMLInputElement) {
    const file = input.files?.item(0);
    if (!file || !this.isValid(input)) {
      return;
    }
    if (file.size > 1048576) {
      this.fileNameTextareaThread = "This file exceeds the size of 1024kb!";
      return;
    }
    if (input.files) {
      this.filesTextareaThread = input.files;
    }
    this.fileNameTextareaThread = file.name;
    if (this.isPdf(file)) {
      this.handlePdfFileForThread(file);
    } else {
      this.handleImageFileForThread(file);
    }
  }

  private handlePdfFileForThread(file: File) {
    this.pdfUrlThread = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
    this.fileUrlTextareaThread = 'assets/img/pdfDefault.jpg';
  }

  private handleImageFileForThread(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result !== undefined) {
        this.fileUrlTextareaThread = result;
      }
    };
    reader.readAsDataURL(file);
  }
  
  async uploadFileAndGetUrlForThread(originalMessageId: string) {
  if (this.filesTextareaThread.length < 0) {
    return;
  }
  const file = this.filesTextareaThread.item(0) as File;
  this.uploadedFileTypeThread = file.type;
  const storageRef = ref(this.storage, `${originalMessageId}/${file.name}`);
  await uploadBytesResumable(storageRef, file);
  await getDownloadURL(storageRef).then((url) => {
    this.downloadUrlThread = url;
  });
}

  private handlePdfFile(file: File) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
    // Platzhalterbild pdf wird erst nach einem klick auf das Bild geöffnet
    this.fileUrlTextarea = 'assets/img/pdfDefault.jpg';
  }

  private handleImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result !== undefined) {
        this.fileUrlTextarea = result;
      }
    };
    reader.readAsDataURL(file);
  }

  isImage(file: File | null | undefined): boolean {
    if (!file) return false;
    const fileType = file.type.split('/')[0];
    return fileType === 'image';
  }

  isPdf(file: File | null | undefined): boolean {
    if (!file) return false;
    const fileType = file.type;
    return fileType === 'application/pdf';
  }

  abortUploadForThread() {
    this.filesTextareaThread = null!;
    this.fileNameTextareaThread = '';
    this.fileUrlTextareaThread = '';
  }

  abortUpload() {
    this.filesTextarea = null!;
    this.fileNameTextarea = '';
    this.fileUrlTextarea = '';
  }

  async uploadFileAndGetUrl(channelId: string) {
    if (this.filesTextarea.length < 0) {
      return
    }
    const file = this.filesTextarea.item(0) as File;
    this.uploadedFileType = file.type;
    const storageRef = ref(this.storage, `${channelId}/${file.name}`);
    await uploadBytesResumable(storageRef, file);
    await getDownloadURL(storageRef).then((url) => {
      this.downloadUrl = url
    });
  }

  // textarea upload function end

  /**
   * The function `isValid` checks if the file uploaded through an HTML input element is a valid image
   * file and logs the file size in bytes.
   * @param {HTMLInputElement} input - The `isValid` function takes an `HTMLInputElement` as input. This
   * input is expected to be a file input element where the user can select a file. The function then
   * checks if the selected file is a valid image file
   * @returns The function `isValid` is returning a boolean value based on whether the file type of the
   * input element is 'jpeg', 'jpg', 'png', or 'gif'.
   */
  isValid(input: HTMLInputElement) {
    let dataType = input.files?.item(0)?.type
    dataType = dataType?.split('/').pop();
    console.log('your file size is', input.files?.item(0)?.size!, 'bytes');
    console.log(input.files);
    return (dataType === 'jpeg' || dataType === 'jpg' || dataType === 'png' || dataType === 'gif' || dataType === 'pdf')
  }

  /**
   * The `uploadFile` function asynchronously uploads files to a storage location and updates the user's
   * profile picture URL.
   * @param {string} uid - The `uid` parameter in the `uploadFile` function is a string representing the
   * user ID.
   * @returns If the `this.files` variable is `undefined`, the function will return early without
   * executing the file upload logic.
   */
  async uploadFile(uid: string) {
    if (this.files == undefined) return
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files.item(i);
      if (file) {
        const storageRef = ref(this.storage, uid + '/' + 'profile');
        await uploadBytesResumable(storageRef, file);
        await getDownloadURL(storageRef).then((url) => {
          this.userService.createUserInfo.profilePicture = url;
        })
      }
    }
  }
}
