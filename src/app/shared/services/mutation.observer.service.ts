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

  constructor() { }
  public observe(element: ElementRef, isThread: boolean = false): void {
    if (!element || !element.nativeElement) {
      return;
    }
    if (isThread) {
      element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
      console.log("ich scrolle einmal weil ich ein thread bin");
    }
    this.initialChildCount = element.nativeElement.children.length;
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        const currentChildCount = element.nativeElement.children.length;
        if (currentChildCount > this.initialChildCount) {
          this.initialChildCount = currentChildCount;
          element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
          this.domChanges.next([mutation]);
          console.log('ich scrolle korrekt weil ich cool bin');
        }
        else if (currentChildCount != this.initialChildCount) {
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
