import { TestBed } from '@angular/core/testing';

import { ResizelistenerService } from './resize-listener.service';

describe('ResizelistenerService', () => {
  let service: ResizelistenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResizelistenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
