import { Injectable } from '@angular/core';
import { CotizaWish, Etiqueta, Item, ItemTag, Materiales } from '../datatypes';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Subject, Observable } from 'rxjs';

export interface CatTree {
  categ: string;
  subcateg?: string[];
}

export interface Filter {
  seltype: number; //-1: nada se ve, 0: categoria y subcategoria, 1:find, 2:familia, es decir, uno solo
  find?: string;
  familia?: string;
  catalogTitle?: string;
  catFilter: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {
  readonly DEV_STATUS=true;
  readonly QUOTE_SERVER = this.DEV_STATUS? 'http://localhost:3000/' : `https://${window.location.hostname}/`; // 'https://omv-production.up.railway.app/'; // 'https://catalogos.omvpublicidadsas.com/';
  // readonly QUOTE_SERVER = 'http://localhost:3000/'; // 'https://omv-production.up.railway.app/'; // 'https://catalogos.omvpublicidadsas.com/';
  selMenu = [0, -1];
  // menuNm = '';
  // submenuNm = '';
  selCatalogTitle = '';
  itemList2Show: Item[] = [];
  categTree: CatTree[] = [];
  filter: Filter = { seltype: 0, catFilter: ['...', '...'] };
  selItem!: Item;
  wishList!: CotizaWish;
  quoteList!: CotizaWish;
  screenShort = false;
  milisecDay = 86400000;

  private badgeObs = new Subject<{ list_name: string, total: number }>();

  constructor(private storage: StorageMap) { }

  getBadgeObs(): Observable<{ list_name: string, total: number }> {
    return this.badgeObs.asObservable();
  }

  addUpdateLocalItemList(itemList: Item[], proveedor: string = 'owner') {
    this.storage.set(proveedor, itemList).subscribe(() => { });
  }

  delLocalItemList(proveedor: string = 'owner') {
    this.storage.delete(proveedor).subscribe(() => { });
  }

  // ....................................................................................

  getScreenWidth() {
    this.screenShort = screen.availWidth < 850;
  }

  // ................................................................................

  getactualWishQuote() {

    this.storage.get('wishList').subscribe((cot) => {
      if (cot) { this.wishList = cot as CotizaWish } else { this.wishList = { itemList: [], status: 0, p_iva: 0, error: '' } }
      this.badgeObs.next({ list_name: 'wishList', total: this.wishList.itemList.length });
    })

    this.storage.get('quoteList').subscribe((cot) => {
      
      if (cot) {
        const date = new Date().getMilliseconds();
        this.quoteList = cot as CotizaWish;
        this.quoteList.error = '';
        const datedif = this.quoteList.date! - this.milisecDay;
        let i = 0;
        while (i < this.quoteList.itemList.length) {
          const adate = this.quoteList.itemList[i].itemTag?.date;
          if (adate && adate < datedif) {
            this.quoteList.itemList.splice(i,1);
            this.quoteList.error = 'ERROR: Algunos productos han sido elimiados de la lista porque el inventario ya no corresponde al seleccionado.';
          } else {
            i++;
          }
        }
      } else {
        this.quoteList = { itemList: [], status: 0, p_iva: 0, error: '' } }
      this.badgeObs.next({ list_name: 'quoteList', total: this.quoteList.itemList.length });
    })

  }

  addWishQuote(what: string, item: Item, material: Materiales | null = null): boolean {
    
    const date = new Date().getMilliseconds();
    if (what === '0') {
      const itm1 = this.wishList.itemList.find(ct => ct.familia === item.familia && ct.materiales[0].codigo === material!.codigo);
      if (itm1) return true;
      // item.materiales = [material];// this.selMaterial.inventario
      // if (Number(item.materiales[0].inventario) === 0) return false;
      if (!item.itemTag) {
        item.itemTag = {} as ItemTag;
        item.itemTag.cantidad = 1;
        item.itemTag.descuento = 0;
        item.itemTag.precio = Number(item.materiales[0].precio);
        item.itemTag.expand = false;
        item.itemTag.date = date;
        item.itemTag.origen = this.selCatalogTitle;
        this.wishList.itemList.push(item);
      }
    } else {
      const itm1 = this.quoteList.itemList.find(ct => ct.familia === item.familia && ct.materiales[0].codigo === material!.codigo);
      if (itm1) return true;
      item.materiales = [material!];// this.selMaterial.inventario
      if (Number(item.materiales[0].inventario) === 0) return false;
      if (!item.itemTag) {
        item.itemTag = {} as ItemTag;
        item.itemTag.cantidad = 1;
        item.itemTag.descuento = 0;
        item.itemTag.precio = Number(item.materiales[0].precio);
        item.itemTag.expand = false;
        item.itemTag.date = date;
        item.itemTag.origen = this.selCatalogTitle;
        this.quoteList.itemList.push(item);
      }
    }

    this.saveWishQuote(what);
    return true;
  }

  saveWishQuote(what: string) {
    if (what === '0') {
      this.storage.set('wishList', this.wishList).subscribe(() => { });
      this.badgeObs.next({ list_name: 'wishList', total: this.wishList.itemList.length });
    } else {
      this.storage.set('quoteList', this.quoteList).subscribe(() => { });
      this.badgeObs.next({ list_name: 'quoteList', total: this.quoteList.itemList.length });
    }

  };

  deleteactualWidhQuote(what: string) {
    if (what === '0') {
      this.storage.delete('wishList').subscribe(() => {
        this.wishList = { itemList: [], status: 0, p_iva: 0, error: '' }
        this.badgeObs.next({ list_name: 'wishList', total: 0 });
      });
    } else {
      this.storage.delete('quoteList').subscribe(() => {
        this.quoteList = { itemList: [], status: 0, p_iva: 0, error: '' }
        this.badgeObs.next({ list_name: 'quoteList', total: 0 });
      });
    }

  };

  resolveData(data: Item[]) {
    this.categTree = [];
    data.forEach((item: Item) => {

      item.existencia = 0;
      item.materiales.forEach((mat: any) => {
        item.precio = item.precio || mat.precio;
        item.existencia = item.existencia + (Number(mat.inventario) || 0);
      });
      if (item.etiquetas) {
        const etiqList: string[] = [];
        item.etiquetas.forEach((etiq: Etiqueta) => {
          if (etiq && etiq.nombre) { etiqList.push(etiq['nombre']) }
        });
      }
      

      let catList = item.subcategoria_1 as { nombre: string, categoria: { nombre: string } };
      const subcateg_1 = catList.nombre || '';
      const categ = catList.categoria.nombre;
      catList = item.subcategoria_2 as { nombre: string, categoria: { nombre: string } };
      // let subcateg_2 = '';
      // if (catList) { subcateg_2 = catList.nombre || '' }
      // this.addToCatTree(categ, subcateg_1, subcateg_2);
      this.addToCatTreeSimple(categ, subcateg_1);
    });
    this.sortCat();
  }

  private sortCat() {
    
    this.categTree.sort((a, b) => {return a.categ.localeCompare(b.categ)});
    this.categTree.forEach(ct => {
      ct.subcateg?.sort((a, b) => {return a.localeCompare(b)});
    })
  }

  addToCatTreeSimple(categ: string = 'root', subcat1: string) {
    let categoria = this.categTree.find((cat: CatTree) => cat.categ === categ);
    if (!categoria) {
      categoria = { categ, subcateg: [] };
      this.categTree.push(categoria);
    }
    if (subcat1 && subcat1.length > 0) {
      let subcat = categoria.subcateg?.find(subcat => subcat === subcat1);
      if (!subcat) categoria.subcateg?.push(subcat1);
    }
    /*
    if (subcat2 && subcat2.length > 0) {
      let subcat = categoria.subcateg?.find(subcat => subcat === subcat2);
      if (!subcat) categoria.subcateg?.push(subcat2);
    }
    */
  }

  /*
  addToCatTree(categ: string = 'root', subcat1: string, subcat2: string) {
    let categoria = this.categTree.find((cat: CatTree) => cat.categ === categ);
    if (!categoria) {
      categoria = { categ, subcateg: [] };
      this.categTree.push(categoria);
    }
    if (subcat1 && subcat1.length > 0) {
      let subcat = categoria.subcateg?.find(subcat => subcat === subcat1);
      if (!subcat) categoria.subcateg?.push(subcat1);
    }
    if (subcat2 && subcat2.length > 0) {
      let subcat = categoria.subcateg?.find(subcat => subcat === subcat2);
      if (!subcat) categoria.subcateg?.push(subcat2);
    }
  }
  */

}
