import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacypolicyComponent } from './privacypolicy.component';
import { ActivatedRoute } from '@angular/router';

describe('PrivacypolicyComponent', () => {
  let component: PrivacypolicyComponent;
  let fixture: ComponentFixture<PrivacypolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacypolicyComponent],
      providers: [{ provide: ActivatedRoute, useValue: {} }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PrivacypolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
