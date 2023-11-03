import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StationsListPage } from './stations-list.page';

describe('StationsListPage', () => {
  let component: StationsListPage;
  let fixture: ComponentFixture<StationsListPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StationsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
