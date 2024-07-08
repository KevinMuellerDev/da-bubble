import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImprintComponent } from './imprint.component';
import { ActivatedRoute } from '@angular/router';

describe('ImprintComponent', () => {
  let component: ImprintComponent;
  let fixture: ComponentFixture<ImprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImprintComponent],
      providers: [{ provide: ActivatedRoute, useValue: {} }]
    })

      .compileComponents();

    fixture = TestBed.createComponent(ImprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
