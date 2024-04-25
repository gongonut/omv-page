import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
// import { ImagenList, Item, Materiales } from '../datatypes';
import { LocalstorageService } from './localstorage.service';
import { Item, Etiqueta } from '../datatypes';

@Injectable({
  providedIn: 'root'
})


// implements HttpInterceptor
export class HttpMapicoService implements HttpInterceptor {
  private api_key = 'KlRAzNmCqZFnJTEnOPmyRC2t2WLs8xylfGMbogjGnfcb02wlvaUYXIeiNaLAQKAI';
  private url = 'https://apipromocionales.marpico.co/api/inventarios';
  // private url = 'https://marpicoprod.azurewebsites.net/api/inventarios';

  force = false;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log("intercepted request ... ");

    return next.handle(
      req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Api-Key ' + this.api_key
        }
      }));
  }

  constructor(private http: HttpClient, private storage: LocalstorageService) { }

  getFullData() {
    const aheaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Api-Key ' + this.api_key
    });

    const requestOptions = {
      headers: aheaders,
      
    };
    const suburl = '/materialesAPI';
    return this.http.get<any[]>(`${this.url}${suburl}`, requestOptions)
  }

  async getMarpicoDataPromise(catName: string) {
    return new Promise(async resolve => {
      
      if (this.storage.selCatalogTitle === catName && this.storage.itemList2Show.length > 0) {
        resolve(true); return;
      }
      const sub = this.getFullData()
        .subscribe({
          next: (data) => {
            
            if (sub) { sub.unsubscribe(); }
            console.log(data);
            
            this.storage.itemList2Show = (data as { [key: string]: any })['results'] as Item[];
            
            if (this.storage.itemList2Show.length > 0) { this.storage.resolveDataMARPICO(this.storage.itemList2Show); }
            this.storage.selCatalogTitle = catName;
            resolve(true);
          },
          error: (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.log('An error occurred:', err.error.message);
            } else {
              console.log('Backend returned status code: ', err.status);
              console.log('Response body:', err.error);
            }
          },
          complete: () => { if (sub) { sub.unsubscribe(); } }
        });
    })
  }

  async getDataPruebaPromise() {
    return new Promise(async resolve => {
      const URL = '../assets/articulos.json';
      const dataArray = await lastValueFrom(this.http.get(URL)) as Item[];
      if (dataArray.length > 0) {
        this.storage.resolveDataMARPICO(dataArray);
        this.storage.itemList2Show = dataArray;
        this.storage.addUpdateLocalItemList(dataArray, 'MARPICO');
        resolve(true);
      }
    })
  }

}