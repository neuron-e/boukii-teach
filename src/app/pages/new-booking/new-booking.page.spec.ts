import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewBookingPage } from './new-booking.page';

describe('NewBookingPage', () => {
  let component: NewBookingPage;
  let fixture: ComponentFixture<NewBookingPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewBookingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
