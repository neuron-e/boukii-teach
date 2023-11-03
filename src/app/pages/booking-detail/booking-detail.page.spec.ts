import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingDetailPage } from './booking-detail.page';

describe('BookingDetailPage', () => {
  let component: BookingDetailPage;
  let fixture: ComponentFixture<BookingDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BookingDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
