import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarAvailablePage } from './calendar-available.page';

describe('CalendarAvailablePage', () => {
  let component: CalendarAvailablePage;
  let fixture: ComponentFixture<CalendarAvailablePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CalendarAvailablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
