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

  /**
   * The function observes changes in a DOM element's children and scrolls to the bottom if new children
   * are added.
   * @param {ElementRef} element - The `element` parameter in the `observe` method is of type
   * `ElementRef`, which is a reference to a DOM element in Angular. It is used to observe changes in the
   * element's children and scroll to the bottom if `isThread` is set to true.
   * @param {boolean} [isThread=false] - The `isThread` parameter in the `observe` method is a boolean
   * flag that indicates whether the element being observed is a thread. If `isThread` is set to `true`,
   * the method will scroll the element to the bottom when new content is added.
   * @returns If the `element` or `element.nativeElement` is falsy, the function will return early and
   * not execute the rest of the code block.
   */
  public observe(element: ElementRef, isThread: boolean = false): void {
    if (!element || !element.nativeElement) {
      return;
    }
    if (isThread) {
      element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
    }
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

  /**
   * The `disconnect` function in TypeScript disconnects the mutation observer if it is currently active.
   */
  public disconnect(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }
}
