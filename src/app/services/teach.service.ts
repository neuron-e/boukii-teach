import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeachService {

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // SEPARATE IN AUTH SERVICE
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/teach/login`, {
      email, password
    });
  }
  // SEPARATE IN AUTH SERVICE
  

  //GET (+ /id) (+ /params)
  getData<T>(route: string, id?: any, params?: {[param: string]: any}): Observable<T> {
    let url = `${environment.apiUrl}/${route}`;
    if (id) {
      url += `/${id}`;
    }
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http.get<T>(url, { headers: this.getHeaders(), params: httpParams });
  }

  //PUT
  updateData<T>(route: string, id: number, data: T): Observable<any> {
    return this.http.put(`${environment.apiUrl}/${route}/${id}`, data, { headers: this.getHeaders() });
  }

  // POST
  postData<T>(route: string, data: T): Observable<any> {
    return this.http.post<T>(`${environment.apiUrl}/${route}`, data, { headers: this.getHeaders() });
  }

}
