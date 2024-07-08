import { OutsideclickDirective } from './outsideclick.directive';
import { ElementRef } from '@angular/core';

describe('OutsideclickDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = new ElementRef({} as HTMLElement);
    const directive = new OutsideclickDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});
