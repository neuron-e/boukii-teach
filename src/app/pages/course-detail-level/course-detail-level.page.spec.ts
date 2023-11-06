import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseDetailLevelPage } from './course-detail-level.page';

describe('CourseDetailLevelPage', () => {
  let component: CourseDetailLevelPage;
  let fixture: ComponentFixture<CourseDetailLevelPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CourseDetailLevelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
