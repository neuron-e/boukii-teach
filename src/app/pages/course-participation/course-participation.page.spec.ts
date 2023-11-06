import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseParticipationPage } from './course-participation.page';

describe('CourseParticipationPage', () => {
  let component: CourseParticipationPage;
  let fixture: ComponentFixture<CourseParticipationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CourseParticipationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
