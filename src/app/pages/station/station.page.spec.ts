import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StationPage } from './station.page';

describe('StationPage', () => {
  let component: StationPage;
  let fixture: ComponentFixture<StationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
