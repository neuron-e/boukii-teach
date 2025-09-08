import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CourseGroupPage } from './course-group.page';

describe('CourseGroupPage', () => {
  let component: CourseGroupPage;
  let fixture: ComponentFixture<CourseGroupPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CourseGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
