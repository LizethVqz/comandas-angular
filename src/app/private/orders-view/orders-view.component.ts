import { Component, inject } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { ProviderService } from '../../services/provider.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DialogComponent } from '../dialog/dialog.component';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { DialogCompleteComponent } from '../dialog-complete/dialog-complete.component';
import { DialogCancelComponent } from '../dialog-cancel/dialog-cancel.component';
import { WebSocketsService } from '../../services/web-sockets.service';


@Component({
  selector: 'app-orders-view',
  standalone: true,
  imports: [MatTabsModule, MatDialogModule, MatTableModule],
  templateUrl: './orders-view.component.html',
  styleUrl: './orders-view.component.scss'
})
export class OrdersViewComponent {
  // Inyección de servicios necesarios en el componente
private _provider: ProviderService = inject(ProviderService); // Servicio para manejar solicitudes a la API
private dialog: MatDialog = inject(MatDialog); // Servicio para manejar cuadros de diálogo
private _wsService: WebSocketsService = inject(WebSocketsService); // Servicio para comunicaciones en tiempo real

// Arreglo para almacenar las órdenes
order: any[] = []; 

// Arreglo de objetos para definir los diferentes estados de las órdenes
status = [
  { name: "Activas", value: 0 },
  { name: "En proceso", value: 1 },
  { name: "Ordenes Listas", value: 2 },
  { name: "Completadas", value: 3 },
  { name: "Canceladas", value: 4 }
];

// Columnas que se mostrarán en la tabla
displayedColumns = ['client', 'total', 'comments', 'function'];

// Método asíncrono que se ejecuta cuando el componente se inicializa
async ngOnInit() {
  // Se obtienen las órdenes desde el servicio y se asignan al arreglo 'order'
  this.order = await this._provider.request('GET', 'order/viewOrders');
  
  // Se inicia la escucha de eventos WebSocket para actualizar las órdenes en tiempo real
  this.listenSocket();
}

// Filtra las órdenes por estado
filterByStatus(status: number) {
  return this.order.filter((eachOrder: any) => eachOrder.status == status);
}

// Abre un cuadro de diálogo con los detalles de una orden
openOrderDetailDialog(idorder: string) {
  this.dialog.open(OrderDetailComponent, { data: idorder });
}

// Abre un cuadro de diálogo de confirmación con los datos proporcionados
openConfirmDialog(data: string) {
  this.dialog.open(DialogCompleteComponent, { data: data });
  console.log(data);
}

// Abre un cuadro de diálogo de cancelación con los datos proporcionados
openCancelDialog(data: any) {
  this.dialog.open(DialogCancelComponent, { data: data });
}

// Escucha eventos WebSocket relacionados con las órdenes y actualiza la lista de órdenes
listenSocket() {
  this._wsService.listen('comanda').subscribe((data) => {
    console.log(data);
    
    // Filtra la orden recibida y la coloca al inicio del arreglo
    this.order = this.order.filter((item) => item.idorder != data.idorder);
    this.order.unshift(data);
    
    // Filtra las órdenes por el estado de la orden recibida
    this.filterByStatus(data.status);
  });
}

}
