import { Injectable, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MutationObserverService {

   private mutationObserver!: MutationObserver;
  private domChanges = new Subject<MutationRecord[]>();
  public domChanges$: Observable<MutationRecord[]> = this.domChanges.asObservable();
  private initialChildCount: number = 0;
  scrolledOnce:boolean = false;
 



  constructor() { }
public observe(element: ElementRef,isThread: boolean = false): void {
    console.log('ElementRef received:', element);
    
    if (!element || !element.nativeElement) {
      console.error('ElementRef is invalid:', element);
      return;
  }
  
  if (isThread) {
    element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
    this.scrolledOnce = true
  }

    
    this.initialChildCount = element.nativeElement.children.length;
    console.log('Initial child elements count:', this.initialChildCount);
    this.mutationObserver = new MutationObserver((mutations) => {
      console.log('MutationObserver callback invoked:', mutations);
      mutations.forEach(mutation => {
        console.log('Processing mutation:', mutation);
        const currentChildCount = element.nativeElement.children.length;
        console.log('Current child count:', currentChildCount);
        if (currentChildCount > this.initialChildCount) {
          this.initialChildCount = currentChildCount;
          element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
          this.domChanges.next([mutation]);
          console.log('Child count increased, scrolled to bottom');
        } else if (currentChildCount != this.initialChildCount) {
          this.initialChildCount = element.nativeElement.children.length;
          console.log('Child count changed but not increased, updated initial count');
        }
      });
    });

    this.mutationObserver.observe(element.nativeElement, {
      childList: true,
      subtree: false,
      characterData: false
    });

    console.log('MutationObserver started observing');
  }

  public disconnect(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      console.log('MutationObserver disconnected');
    }
  }
}
