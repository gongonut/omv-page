import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Imagenes, Materiales } from 'src/app/datatypes';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { NavObserverService } from 'src/app/services/nav-observer.service';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss']
})
export class ItemDetailComponent  implements OnInit{

  constructor(
    public storage: LocalstorageService,
    private snkBar: MatSnackBar,
    private nvg: NavObserverService) {}

  imageList: Imagenes[] = [];
  imageOptionList: {nombre: string, codigo: string}[] = [];
  imageSMList: string[] = [];
  private imageXLList: string[] = [];
  SelImg = '';
  private selMaterial!: Materiales;

  ngOnInit() {
    this.getImageLists();
    this.SelImg = this.imageXLList[0] || '';
  }

  private getImageLists(code: string = '') {
    
    // console.log( typeof( this.selMaterial));
    this.imageList = [];
    this.imageOptionList = [{codigo: '', nombre: 'Todo'}];
    this.storage.selItem.materiales.forEach(mti => {
      this.imageOptionList.push({codigo: mti.codigo, nombre: mti.color_nombre});
    });
    if (code.length === 0) {
      
      this.selMaterial = this.storage.selItem.materiales[-1];
      if (this.storage.selItem.imagenes) {this.imageList = [...this.storage.selItem.imagenes];}
      this.storage.selItem.materiales.forEach(mat => {
        this.imageList = [...this.imageList,...mat.imagenes];
      });
      /*
      this.selMaterial = this.storage.selItem.materiales[-1];
      this.imageList = [...this.storage.selItem.imagenes];
      this.imageList.push(this.storage.selItem.imagen);
      this.storage.selItem.materiales.forEach(mti => {
        this.imageList = [...this.imageList, ...mti.imagenes];
      })
      */
    } else {
      const mat = this.storage.selItem.materiales.find(mt => mt.codigo === code);
      if (mat) {
        this.selMaterial = mat;
        this.imageList = [...this.imageList,...mat.imagenes];
      }
    }
    this.imageSMList = []; this.imageXLList = [];
    this.imageList.forEach(iml => {
      this.imageSMList.push(iml.imagen.file_sm); this.imageXLList.push(iml.imagen.file_md);
    })
    
  }

  setImage(index: number) {
    this.SelImg = this.imageXLList[index] || '';
  }

  getInventario(): number {
    if (this.selMaterial) {
      return this.selMaterial.inventario || 0
    } else {
      return Number(this.storage.selItem.existencia) || 0}
  }

  /*
  getImage(): string {
    return 'https://tecdn.b-cdn.net/img/new/slides/041.jpg';
  }
  */

  add2Cotiza() {
    
    if (!this.selMaterial) {
      this.snkBar.open('Debe seleccionar un color o estilo', 'Ok', { duration: 3000 });
      return;
    }
    if (this.storage.addWishQuote('1', this.storage.selItem, this.selMaterial)) {
      this.snkBar.open('Agregado a la lista de Cotización', 'Ok', { duration: 3000 });
    } else {
      this.snkBar.open('No existe inventario', 'Ok', { duration: 3000 });
    }
  }

  add2WishList() {
    this.storage.addWishQuote('0', this.storage.selItem);
  }

  onSelectEvent(value: any){
    this.getImageLists(value);
    if (this.imageXLList.length > 0) this.setImage(0);
  }

  async  onSelected(event: any) {
    this.goBack();
   
  }

  goBack() {
    this.nvg.onRouteDetail('', '', 'itemlist', true);
  }


}
