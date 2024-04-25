import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CotizaWish, Etiqueta, Item } from '../datatypes';
import { Observable, firstValueFrom } from 'rxjs';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class HttpQuoteService {

  // https://www.youtube.com/watch?v=AmF_BTzJdFY

  constructor(private httpq: HttpClient, private storage: LocalstorageService) { }

  getHeader() {
    const aheaders = new HttpHeaders({
      'Access-Control-Allow-Origin': 'http://localhost:4310/',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    });

    return {
      headers: aheaders,
      // withCredentials: true
    };
  }

  getQuotes(): Observable<CotizaWish[]> {
    return this.httpq.get<CotizaWish[]>(`${this.storage.QUOTE_SERVER}quote/findAll`);
  }
  getQuote(id: string): Observable<CotizaWish> {
    return this.httpq.get<CotizaWish>(`${this.storage.QUOTE_SERVER}quote/findOne/${id}`, this.getHeader());
  }

  createQuote(quote: CotizaWish): Observable<CotizaWish> {
    quote.date = new Date().getTime();
    return this.httpq.post<CotizaWish>(`${this.storage.QUOTE_SERVER}quote`, quote);
  }

  /*
  deleteQuote(id: string): Observable<CotizaWish> {
    return this.httpq.delete<CotizaWish>(`${this.QUOTE_SERVER}quote/delete?id=${id}`);
  }
  */

  updateQuote(id: string, quote: CotizaWish): Observable<CotizaWish> {
    return this.httpq.put<CotizaWish>(`${this.storage.QUOTE_SERVER}quote/update?id=${id}`, quote);
  }

  // ....................................................................................

  getOMVCats(): Observable<any> {
    return this.httpq.get<any>(`${this.storage.QUOTE_SERVER}catalog`);
  }

  getOMARPICOCats(): Observable<any> {
    return this.httpq.get<any>(`${this.storage.QUOTE_SERVER}marpico`);
  }

  getOMVCatsFromTxt(): Observable<Item[]> {
    return this.httpq.get<Item[]>(`${this.storage.QUOTE_SERVER}catalog/txtdatabs`);
  }

  async getOMVCatsDataPromise(catName: string) {
    return new Promise(async resolve => {
      if (this.storage.selCatalogTitle === catName && this.storage.itemList2Show.length > 0) {
        resolve(true); return;
      }
      const sub = this.getOMVCats()
      // TODO: Habilitar el vínculo para economizar a omv
        .subscribe({
          next: (data) => {
            
            if (sub) { sub.unsubscribe(); }           
            this.storage.itemList2Show = data.data as Item[];
            console.log(this.storage.itemList2Show);
            if (this.storage.itemList2Show.length > 0) { this.storage.resolveDataOMV(this.storage.itemList2Show); }
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

  async getMARPICOCatsDataPromise(catName: string) {
    return new Promise(async resolve => {
      if (this.storage.selCatalogTitle === catName && this.storage.itemList2Show.length > 0) {
        resolve(true); return;
      }
      debugger;
      const sub = this.getOMARPICOCats()
      // TODO: Habilitar el vínculo para economizar a omv
        .subscribe({
          next: (data) => {
            
            if (sub) { sub.unsubscribe(); }           
            this.storage.itemList2Show = data as Item[];
            console.log(this.storage.itemList2Show);
            if (this.storage.itemList2Show.length > 0) { this.storage.resolveDataOMV(this.storage.itemList2Show); }
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

  // ........................... GENERAL GENERAL MARPICO .................................

  async getMARPICO() {
    
    const pr = await firstValueFrom(
      this.httpq.get<any>(`${this.storage.QUOTE_SERVER}general/marpico/`)
    )
    return this.storage.marpicoCatTitleList = pr.data;
  }

}
