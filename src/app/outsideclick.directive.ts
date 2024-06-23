import { Directive,EventEmitter,HostListener,Output,ElementRef, } from '@angular/core';

@Directive({
  selector: '[appOutsideclick]',
  standalone: true
})
export class OutsideclickDirective {
@Output() outsideClick = new EventEmitter<Event>();

  constructor(private _elementRef: ElementRef) {}

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }

    const isEditMessageSpanClicked = targetElement.classList.contains('edit-message-span');
    const clickedInside = this._elementRef.nativeElement.contains(targetElement);

    if (!clickedInside && !isEditMessageSpanClicked) {
      this.outsideClick.emit(event);
    }
  }
}
