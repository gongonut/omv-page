import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

// import { HomeComponent } from './pages/home/home.component';
import { CotizaDialogComponent } from './modal/cotiza-dialog/cotiza-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DynamicFormModule } from './components/dynamic-form/dynamic-form.module';
// import {MatFormFieldModule} from '@angular/material/form-field';
// import { FormsModule } from '@angular/forms';
import { CategoDialogComponent } from './modal/catego-dialog/catego-dialog.component';
import { NavBarModule } from './components/nav-bar/nav-bar.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ItemListComponent } from './pages/item-list/item-list.component';
import { ItemModule } from './components/item/item.module';
import { HomeComponent } from './pages/home/home.component';
import { APP_BASE_HREF } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ItemListComponent,
    CotizaDialogComponent,
    CategoDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    DynamicFormModule,
    // MatFormFieldModule,
    // FormsModule,
    MatIconModule,
    MatButtonModule,
    NavBarModule,
    ItemModule,
    MatCheckboxModule
  ],
 
  bootstrap: [AppComponent],
  providers:[ {provide: APP_BASE_HREF, useValue: '/page'}] // SOLO EN NESTJS
})
export class AppModule { }
