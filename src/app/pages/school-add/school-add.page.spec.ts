import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SchoolAddPage } from './school-add.page';

describe('SchoolAddPage', () => {
  let component: SchoolAddPage;
  let fixture: ComponentFixture<SchoolAddPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(SchoolAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
