import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CotizaDialogComponent } from '../modal/cotiza-dialog/cotiza-dialog.component';
import { JsonFormData } from '../components/dynamic-form/dynamic-form.component';
import { CategoDialogComponent } from '../modal/catego-dialog/catego-dialog.component';

export interface DialogData {
  title?: string;
  description?: string;
  schema?: JsonFormData;
  value?: any;
  file?: boolean;
  bfile?: boolean;
  tag?: string; // Opciones externas. En este caso 0 Deseos 1 Cotiza  2 Cotizar
  newUsr?: boolean;
  dgwidth?: number;
  dgheigth?: number;
  imgwidth?: number;
  imgheight?: number;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  public dialogRef: any;

  constructor(public dialog: MatDialog) { }

  aactualQuote(adata: DialogData) { 
    const dgsize = this.dialogsize(adata.dgheigth, adata.dgwidth);
    this.dialogRef = this.dialog.open(CotizaDialogComponent, {
      panelClass: 'custom-dialog-container',
      height: dgsize.dheight,
      width: dgsize.dwidth,
      data: adata
    });
    return this.dialogRef.afterClosed();
  }

  aShowCateg(adata: DialogData) { 
    const dgsize = this.dialogsize(adata.dgheigth, adata.dgwidth);
    this.dialogRef = this.dialog.open(CategoDialogComponent, {
      panelClass: 'custom-dialog-container',
      height: dgsize.dheight,
      width: dgsize.dwidth,
      data: adata
    });
    return this.dialogRef.afterClosed();
  }

  updatePropResult(obj: any, propVal: any): any {
    if (!propVal) return;
    Object.keys(propVal).forEach(key => {
      // if (obj.hasOwnProperty(key)) { obj[key] = propVal[key] }
      if(propVal[key] !== null) {obj[key] = propVal[key]; }
    });
    return obj;
  }

  private dialogsize(dgheigth: number = 100000, dgwidth: number = 100000) {
    let maxheight = window.innerHeight - 20;
    dgheigth = dgheigth || maxheight;
    maxheight = maxheight > dgheigth ? dgheigth : maxheight;

    let maxwidth = (window.innerWidth - 20);
    dgwidth = dgwidth || maxwidth;
    maxwidth = maxwidth > dgwidth ? dgwidth : maxwidth;

    return { dheight: maxheight.toString() + 'px', dwidth: maxwidth.toString() + 'px' } as const
  }
}
