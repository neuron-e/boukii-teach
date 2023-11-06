import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseDetailLevelUpdatePage } from './course-detail-level-update.page';

describe('CourseDetailLevelUpdatePage', () => {
  let component: CourseDetailLevelUpdatePage;
  let fixture: ComponentFixture<CourseDetailLevelUpdatePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CourseDetailLevelUpdatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
