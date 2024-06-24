import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  originMessage!:any
  isActive:boolean=false;
  constructor() { }
}
