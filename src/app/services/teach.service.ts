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

    let httpParams = new HttpParams().set('perPage', '99999');

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];

        if (Array.isArray(value)) {
          httpParams = httpParams.delete(key);
          value
            .filter(item => item !== undefined && item !== null)
            .forEach(item => {
              httpParams = httpParams.append(key, item);
            });
        } else if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value);
        }
      });
    }

    return this.http.get<T>(url, { headers: this.getHeaders(), params: httpParams });
  }

  //PUT
  updateData<T>(route: string, id: number, data: T): Observable<any> {
    // Agregar headers anti-caché para evitar problemas en Android WebView
    const headers = this.getHeaders()
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');

    return this.http.put(`${environment.apiUrl}/${route}/${id}`, data, { headers });
  }

  // POST
  postData<T>(route: string, data: T): Observable<any> {
    // Agregar headers anti-caché para evitar problemas en Android WebView
    const headers = this.getHeaders()
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');

    return this.http.post<T>(`${environment.apiUrl}/${route}`, data, { headers });
  }
  
  // DELETE
  deleteData(route: string, id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/${route}/${id}`, { headers: this.getHeaders() });
  }

}
