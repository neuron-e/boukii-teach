import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalendarAvailablePage } from './calendar-available.page';

describe('CalendarAvailablePage', () => {
  let component: CalendarAvailablePage;
  let fixture: ComponentFixture<CalendarAvailablePage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CalendarAvailablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
