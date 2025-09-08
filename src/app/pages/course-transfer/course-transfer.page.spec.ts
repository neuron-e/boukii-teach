import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CourseTransferPage } from './course-transfer.page';

describe('CourseTransferPage', () => {
  let component: CourseTransferPage;
  let fixture: ComponentFixture<CourseTransferPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CourseTransferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
