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

  public observe(element: ElementRef): void {
    this.initialChildCount = element.nativeElement.children.length;
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        const currentChildCount = element.nativeElement.children.length;
        if (currentChildCount > this.initialChildCount) {
          this.initialChildCount = currentChildCount;
          element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
          this.domChanges.next([mutation]);
        }
        else if (currentChildCount != this.initialChildCount) {
          this.initialChildCount = element.nativeElement.children.length;
        }
      });
    });

    this.mutationObserver.observe(element.nativeElement, {
      childList: true,
      subtree: false,
      characterData: false
    });
  }

  public disconnect(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

}
