import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { NavEvent } from 'src/app/components/nav-bar/nav-bar.component';
import { Item } from 'src/app/datatypes';
import { DialogData, DialogService } from 'src/app/services/dialog.service';
import { HttpMapicoService } from 'src/app/services/http-mapico.service';
import { HttpQuoteService } from 'src/app/services/http-quote.service';
import { Filter, LocalstorageService } from 'src/app/services/localstorage.service';
import { NavObserverService } from 'src/app/services/nav-observer.service';



@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {

  // menuIndex!: NavEvent;
  // private filter!: Filter;
  // catFilter = ['Selecciona una categoría','Pulse sobre éste link'];

  constructor(
    public storage: LocalstorageService,
    private nvg: NavObserverService,
    private dg: DialogService,
    private snkBar: MatSnackBar,
    private http_marpico: HttpMapicoService,
    private http_omv: HttpQuoteService) {
  }

  async ngOnInit() {

    await this.http_omv.getMARPICO();
    // selecciona católogo 1
    // await this.onSelected('');
    if (this.storage.itemList2Show.length === 0) {
      this.storage.selMenu = [0, 0];
      this.onSelected(this.storage.selMenu);
    }
  }

  itemClicked(item: Item) {

    if (item.tag === 'select_ADV' || item.tag === 'select') {
      this.storage.selItem = item;
      if (item.tag === 'select_ADV') {
        this.snkBar.open('Debe seleccionar un color o estilo', 'Ok', { duration: 5000 });
      }
      this.nvg.onRouteDetail(item.descripcion_comercial, '', 'itemdeta', true);
    } else {
      this.add2WishList(item);
    }

  }

  async onSelected(event: any) {
    this.nvg.showProgress = true;
    switch (this.storage.selMenu[1]) {

      case 0: // Marpico
        title: 'Marpico';
        this.storage.filter = { seltype: 0, catFilter: ['Seleccione una categoría', '...'] };
        await this.http_omv.getMARPICOCatsDataPromise('MARPICO');
        // await this.http_marpico.getMarpicoDataPromise('MARPICO');

        break;

      case 1: // OMV
        title: 'omv';
        this.storage.filter = { seltype: 0, catFilter: ['Seleccione una categoría', '...'] };
        await this.http_omv.getOMVCatsDataPromise('OMV');

        break;


    }
    this.nvg.showProgress = false;
    this.getCat();

  }

  async onCatWishSel() {

    switch (this.storage.filter.catalogTitle) {
      case 'MARPICO': // Marpico
        await this.http_omv.getMARPICOCatsDataPromise('MARPICO');
        //await this.http_marpico.getMarpicoDataPromise('MARPICO');
        break;
      case 'OMV': // OMV
        await this.http_omv.getOMVCatsDataPromise('OMV');
        break;
    }

  }


  getCat() {
    // const h = this.storage.screenShort ? 0 : 400;

    if (this.storage.itemList2Show.length > 0) {
      const ddta: DialogData = {
        title: 'Seleccionar Categoría/Subcategoría ',
        tag: '1',
        // dgheigth: h,
        value: this.storage.categTree,
      }
      this.dg.aShowCateg(ddta).subscribe((result: any) => {

        if (result) { this.storage.filter = result as Filter }
      });
    } else {
      this.snkBar.open('Seleccione el catálogo de su preferencia', 'Ok', { duration: 3000 });
    }
  }

  filterItem(item: Item): boolean {

    switch (this.storage.filter.seltype) {
      case 0:
        return item.subcategoria_1.categoria.nombre === this.storage.filter.catFilter[0] && item.subcategoria_1.nombre === this.storage.filter.catFilter[1];
        break;
      case 1: // Elementos por nombre o id
        if (this.storage.filter.find) {

          if (item.familia.toUpperCase().includes(this.storage.filter.find.toUpperCase())) return true;
          return item.descripcion_comercial.toUpperCase().includes(this.storage.filter.find.toUpperCase());
        }
        return true;
        break;
      case 2:
        return item.familia === this.storage.filter.familia;
        break;

    }
    return false;
  }

  add2WishList(item: Item) {
    this.storage.addWishQuote('0', item);
  }

}
