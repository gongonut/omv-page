import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NavObserverService } from '../../services/nav-observer.service';
import { DialogData, DialogService } from '../../services/dialog.service';
import { LocalstorageService } from '../../services/localstorage.service';
import { HttpQuoteService } from '../../services/http-quote.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CotizaWish } from 'src/app/datatypes';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  @Output() submenuSelected = new EventEmitter<boolean>();
  @Output() whishCatSelected = new EventEmitter<boolean>();

  public prodList!: { [index: string]: any }
  cotizaTtl = 0;
  wishTtl = 0;

  readonly menuList = [
    {
      title: 'Catálogos',
      subMenus: ['Promocionales', 'Textiles y Dotación']
    },
    {
      title: 'Nuestra empresa',
      subMenus: ['Quienes somos', 'Ubicación', 'Contacto']
    }
    /*
    ,
    {
      title: 'Contactos',
      subMenus: ['Teléfonico', 'Dirección', 'Oficinas']
    }
    */
  ]

  constructor(
    private http_quote: HttpQuoteService,
    public nvg: NavObserverService,
    private dg: DialogService,
    public storage: LocalstorageService,
    private snkBar: MatSnackBar) { }

  ngOnInit(): void {
    this.nvg.setReady();
    this.badgeObs();
  }

  badgeObs() {
    this.storage.getactualWishQuote();
    this.storage.getBadgeObs().subscribe(wq => {
      if (wq.list_name === 'wishList') { this.wishTtl = wq.total }
      if (wq.list_name === 'quoteList') { this.cotizaTtl = wq.total }
    });
  };

  ongetClass(mnIndex: number): string {
    if (this.storage.selMenu[0] === mnIndex) return 'text-red-600 font-medium'
    return 'hover:text-red-700';
  }

  onMenuNav(index: number) {
    this.storage.selMenu[0] = index;
    this.storage.selMenu[1] = -1;
    this.storage.filter.seltype = 4;
    let arute = 'home';
    switch (index) {
      case 0:
        arute = 'itemlist';
        break;
      case 1:
        arute = 'home';
        break;
    }
    this.nvg.onRouteDetail('', '', arute, true);
  }

  ongetSubClass(mnIndex: number): string {
    if (this.storage.selMenu[1] === mnIndex) return 'text-yellow-200 pl-3 font-medium'
    return 'text-gray-200 pl-3 hover:text-yellow-200';
  }

  onSubMenu(index: number) {
    this.nvg.showProgress = true;
    this.storage.selMenu[1] = index;
    this.submenuSelected.emit(true);
  }


  onMenuCatSubMenu(index: number) {
    this.onMenuNav(1);
    this.onSubMenu(index);
  }

  wishQuoteModule(what: string): void {
    
    let tit = '';
    let list!: CotizaWish;

    switch (what) {
      case '0':
        if (this.wishTtl === 0) return;
        tit = 'Lista de Favoritos';
        list = this.storage.wishList;
        break;
      case '1':
        if (this.cotizaTtl === 0) return;
        tit = 'Módulo de Cotizaciones';
        list = this.storage.quoteList;
        break;
    }

    const ddta: DialogData = {
      title: tit,
      tag: what,
      value: list,
    }
    this.dg.aactualQuote(ddta).subscribe((result: any) => {
      
      if (this.storage.quoteList.status === 1) {
        this.http_quote.createQuote(list).subscribe({
          error: (e) => this.snkBar.open(`Error al enviar la cotización. Intente más tarde. -- ${e.error}`, 'Listo', { duration: 3000 }),
          complete: () => {
            this.storage.deleteactualWidhQuote('1');
            this.snkBar.open(`Su solicitud ha sido enviada, responderemos en el menor tiempo posible`, 'Listo', { duration: 3000 })
          }
        });
      } else {
        this.storage.saveWishQuote(what);
        if (this.storage.filter.seltype === 2) {this.whishCatSelected.emit(true); }
      }
    });
  }

  getWhatsApp() {
    // let htmtext = `https://wa.me/573104616698/?`;
    let htmtext = 'https://api.whatsapp.com/send/?phone=573104616698&text=%C2%A1Hola%21+Me+gustar%C3%ADa+recibir+asesor%C3%ADa+comercial.&type=phone_number&app_absent=0';
    this.onNavigate(htmtext);
  }

  private onNavigate(rute: string) {
    if (rute.indexOf('https://') === -1) {
      rute = 'https://' + rute;
    }
    const newWindow = window.open(rute, 'popup',
      `height=${window.innerHeight}, width=${window.innerWidth}, modal=yes,alwaysRaised=yes,
        titlebar=no,toolbar=no,location=no,status=no,menubar=no`
    );
  }

}
