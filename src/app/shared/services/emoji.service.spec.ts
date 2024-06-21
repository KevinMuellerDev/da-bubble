import { TestBed } from '@angular/core/testing';

import { EmojiServiceService } from './emoji.service';

describe('EmojiServiceService', () => {
  let service: EmojiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmojiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
