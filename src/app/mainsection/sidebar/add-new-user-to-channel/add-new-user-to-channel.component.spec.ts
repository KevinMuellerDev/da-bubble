import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddNewUserToChannelComponent } from './add-new-user-to-channel.component';

describe('AddNewUserToChannelComponent', () => {
  let component: AddNewUserToChannelComponent;
  let fixture: ComponentFixture<AddNewUserToChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewUserToChannelComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddNewUserToChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
