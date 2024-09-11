import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProviderService } from '../../services/provider.service';
import { WebSocketsService } from '../../services/web-sockets.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { LocalstorageService } from '../../services/localstorage.service';


@Component({
  selector: 'app-dialog-complete',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './dialog-complete.component.html',
  styleUrl: './dialog-complete.component.scss'
})
export class DialogCompleteComponent {
  // Inyección de dependencias usando el método 'inject'
private dialog: MatDialog = inject(MatDialog);  // Servicio para manejar diálogos (modales)
private _data = inject(MAT_DIALOG_DATA);  // Inyecta los datos pasados al diálogo
private _provider: ProviderService = inject(ProviderService);  // Servicio para manejar solicitudes a la API
private _wsService: WebSocketsService = inject(WebSocketsService);  // Servicio para manejar WebSockets en tiempo real
private _snackBar: MatSnackBar = inject(MatSnackBar);  // Servicio para mostrar notificaciones (snack bars)
private _localStorage: LocalstorageService = inject(LocalstorageService);  // Servicio para manejar el almacenamiento local

// Método que se ejecuta al inicializar el componente
ngOnInit() {
  console.log(this._data);
}

// Método asíncrono para actualizar el estado de un pedido
async updateStatus() {
  // Verifica si la conexión WebSocket está activa
  if (this._wsService.socketStatus) {
    // Suscribe un evento que actualiza el estado del pedido después de que se cierran todos los diálogos abiertos
    this.dialog.afterAllClosed.subscribe(
      await this._provider.request('PUT', 'order/updateStatus', {
        "status": 3,  // Cambia el estado del pedido a "completado"
        "idorder": this._data.idorder,  // ID del pedido actual
        "users_idusers": this._localStorage.getItem('user').idusers  // ID del usuario que está actualizando el pedido
      })
    );

    // Muestra una notificación indicando que el pedido ha sido actualizado a "completado"
    this._snackBar.open("Pedido actualizado a completada", "", { duration: 3000, verticalPosition: 'top' });

    // Crea un objeto con el nuevo estado del pedido
    let nStatus: object = {
      "idorder": this._data.idorder,  // ID del pedido
      "client": this._data.client,  // Cliente que hizo el pedido
      "total": this._data.total,  // Total del pedido
      "mes": this._data.mes,  // Mes del pedido
      "comments": this._data.comments,  // Comentarios sobre el pedido
      "status": 3,  // Estado actualizado a "completado"
      "users_idusers": this._localStorage.getItem('user').idusers  // ID del usuario que actualiza el estado
    };

    console.warn(nStatus);

    // Crea un objeto con los detalles de la venta para gráficos
    let sale: object = {
      "mes": this._data.mes,  // Mes del pedido
      "total": this._data.total  // Total del pedido
    };
    // Envía el nuevo estado del pedido a través de WebSockets
    this._wsService.request('comandas', nStatus);

    // Envía los detalles de la venta a través de WebSockets para actualizar los gráficos
    this._wsService.request('graficas', sale);
  }
}

}
