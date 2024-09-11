//Importaciones necesarias para el funcionamiento del componente
import { Routes } from '@angular/router';
import { PrivateComponent } from './private/private.component';
import { ChefOrderViewComponent } from './private/chef-order-view/chef-order-view.component';
import { MenuComponent } from './private/menu/menu.component';
import { PublicComponent } from './public/public.component';
import { Component } from '@angular/core';
import { SignInComponent } from './public/auth/sign-in/sign-in.component';
import { OrderViewComponent } from './private/order-view/order-view.component';
import { OrdersViewComponent } from './private/orders-view/orders-view.component';
import { DashAdminComponent } from './private/dash-admin/dash-admin.component';
import { UserViewComponent } from './private/user-view/user-view.component';
import { UserComponent } from './private/user/user.component';
//Definicion de las rutas y los componentes
export const routes: Routes = [
  {
    path: 'auth/sign-in',
    component: SignInComponent,
  },
  //En caso de que la url no tenga parametros se redigira al login
  {
    path: '',
    redirectTo: 'auth/sign-in',
    pathMatch: 'prefix',
  },
//Definicion del componente privado como un padre y todos sus hijos
  {
    path: 'private',
    component: PrivateComponent,
    children: [
      {
        path: 'chef-order-view',
        component: ChefOrderViewComponent,
      },
      {
        path: 'menu',
        component: MenuComponent,
      },
      {
        path: 'order-view',
        component: OrderViewComponent,
      },
      {
        path: 'orders-view',
        component: OrdersViewComponent,
      },
      {
        path: 'dash-admin',
        component: DashAdminComponent,
      },
      {
        path: 'user-view',
        component: UserViewComponent,
      },
      {
        path: 'user-create',
        component: UserComponent,
      },
      {
        path: 'user-edit/:id',
        component: UserComponent,
      },
    ],
  },
];
