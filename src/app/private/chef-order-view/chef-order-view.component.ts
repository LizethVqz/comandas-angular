import { Component, TemplateRef, ViewChild, inject } from '@angular/core';
import {MatTable, MatTableModule} from '@angular/material/table';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogModule,
} from '@angular/material/dialog';
import { ProviderService } from '../../services/provider.service';
import { DialogComponent } from '../dialog/dialog.component';
import { WebSocketsService } from '../../services/web-sockets.service';
import { MatDrawer } from '@angular/material/sidenav';
import { LocalstorageService } from '../../services/localstorage.service';
import { OrderDetailComponent } from '../order-detail/order-detail.component';


@Component({
  selector: 'app-chef-order-view',
  standalone: true,
  imports: [MatTableModule, MatDialogModule],
  templateUrl: './chef-order-view.component.html',
  styleUrl: './chef-order-view.component.scss'
})
export class ChefOrderViewComponent {
  // Inyección de dependencias utilizando el método 'inject'
private _provider: ProviderService = inject(ProviderService);  // Servicio para manejar solicitudes a la API
private dialog: MatDialog = inject(MatDialog);  // Servicio para abrir cuadros de diálogo de Angular Material
private _wsService: WebSocketsService = inject(WebSocketsService);  // Servicio para manejar la comunicación en tiempo real con WebSockets
private _localStorage: LocalstorageService = inject(LocalstorageService);  // Servicio para manejar el almacenamiento local

// Decorador @ViewChild para acceder a la tabla de la vista correspondiente
@ViewChild('chefTable') chefTable!: MatTable<any>;  // Referencia a la tabla del chef en la plantilla HTML

// Definición de las columnas que se mostrarán en la tabla
displayedColumns: string[] = ['client', 'comments', 'function'];  // Columnas de la tabla

// Variables para almacenar datos de órdenes y detalles de cada orden
order: any[] = [];  // Almacena todas las órdenes
eachOrderDetails = [];  // Almacena detalles de cada orden
orderExist: any[] = [];  // Almacena la última orden existente del usuario

// Método asíncrono que se ejecuta al inicializar el componente
async ngOnInit() {
  this.listenSocket();  // Escucha eventos de WebSocket en tiempo real
  this.order = await this._provider.request('GET', 'order/viewOrders');  // Solicita la lista de órdenes al servidor
  
  // Obtiene la última orden del usuario desde la API y la almacena en el almacenamiento local
  this.orderExist = await this._provider.request('GET', 'order/lastOrder', {"iduser": this._localStorage.getItem('user').idusers});
  this._localStorage.setItem('lastOrder', this.orderExist[0]);  // Guarda la última orden en el almacenamiento local
  
  console.log(this.orderExist); 
  // Si existe una última orden, abre un cuadro de diálogo con los detalles de la misma
  if (this.orderExist?.[0]?.idorder) {
    this.dialog.open(OrderDetailComponent, {data: this._localStorage.getItem('lastOrder')});
  }
}

// Método para filtrar las órdenes por su estado (en este caso, aquellas con estado 0)
filterByStatus() { 
  return this.order.filter((eachOrder: any) => eachOrder.status == 0);
}

// Método para abrir un cuadro de diálogo de confirmación con datos específicos
openConfirmDialog(data: string) {
  this.dialog.open(DialogComponent, {data: data});
}

// Método para escuchar eventos de WebSocket en tiempo real
listenSocket() {  
  this._wsService.listen('comanda').subscribe((data) => {
    console.log(data.idorder);     
    // Filtra la lista de órdenes para remover la orden recibida si ya existe
    this.order = this.order.filter((item) => item.idorder != data.idorder);
    // Inserta la nueva orden recibida al principio de la lista
    this.order.unshift(data);
    // Filtra las órdenes por estado después de recibir la nueva orden
    this.filterByStatus();
  });
}

}

