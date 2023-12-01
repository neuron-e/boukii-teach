import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private _loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$ = this._loading.asObservable();

  show() {
    this._loading.next(true);
  }

  hide() {
    this._loading.next(false);
  }
}
