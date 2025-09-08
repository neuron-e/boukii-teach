import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CourseDetailLevelPage } from './course-detail-level.page';

describe('CourseDetailLevelPage', () => {
  let component: CourseDetailLevelPage;
  let fixture: ComponentFixture<CourseDetailLevelPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CourseDetailLevelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
