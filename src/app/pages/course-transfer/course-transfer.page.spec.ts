import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseTransferPage } from './course-transfer.page';

describe('CourseTransferPage', () => {
  let component: CourseTransferPage;
  let fixture: ComponentFixture<CourseTransferPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CourseTransferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
