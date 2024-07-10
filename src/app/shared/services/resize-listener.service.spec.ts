import { TestBed } from '@angular/core/testing';
import { ResizeListenerService } from './resize-listener.service';

describe('ResizelistenerService', () => {
  let service: ResizeListenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResizeListenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
