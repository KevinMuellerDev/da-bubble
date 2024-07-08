import { TestBed } from '@angular/core/testing';
import { MutationObserverService } from './mutation.observer.service';

describe('MutationObserverService', () => {
  let service: MutationObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MutationObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
