import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchoolAddPage } from './school-add.page';

describe('SchoolAddPage', () => {
  let component: SchoolAddPage;
  let fixture: ComponentFixture<SchoolAddPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SchoolAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
