import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchoolsPage } from './schools.page';

describe('SchoolsPage', () => {
  let component: SchoolsPage;
  let fixture: ComponentFixture<SchoolsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SchoolsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
