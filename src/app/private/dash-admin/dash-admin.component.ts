import { Component, ViewChild, inject } from '@angular/core';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ProviderService } from '../../services/provider.service';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { WebSocketsService } from '../../services/web-sockets.service';

@Component({
  selector: 'app-dash-admin',
  standalone: true,
  imports: [BaseChartDirective, MatCardModule, MatButtonModule,MatListModule, MatDividerModule],
  templateUrl: './dash-admin.component.html',
  styleUrl: './dash-admin.component.scss'
})
export class DashAdminComponent {
  // Inyección de dependencias usando el método 'inject'
private _provider: ProviderService = inject(ProviderService);  // Servicio para manejar solicitudes a la API
private _wsService: WebSocketsService = inject(WebSocketsService);  // Servicio para manejar WebSockets en tiempo real

// Variables para almacenar datos
products: any = [];  // Almacena productos más vendidos
clients: any = [];  // Almacena los mejores clientes
avg: any = [];  // Almacena el tiempo promedio
total: any = [];  // Almacena el total de ventas
sales: any = [];  // Almacena las ventas
dataSales!: ChartData<'bar'>;  // Datos para la gráfica de ventas
dataProduct!: ChartData<'bar'>;  // Datos para la gráfica de productos más vendidos
dataClient!: ChartData<'bar'>;  // Datos para la gráfica de mejores clientes
totalSum: number = 0;  // Almacena el total acumulado de ventas

// Decorador @ViewChild para acceder a la gráfica de ventas
@ViewChild(BaseChartDirective) chartSales!: BaseChartDirective;  // Referencia a la gráfica de ventas

// Método asíncrono que se ejecuta al inicializar el componente
async ngOnInit() {
  this.Sales();  // Llama al método para obtener y mostrar las ventas
  this.bestSeller();  // Llama al método para obtener y mostrar los productos más vendidos
  this.bestClient();  // Llama al método para obtener y mostrar los mejores clientes
  this.total = await this._provider.request('GET', 'graphics/totalSales');  // Solicita el total de ventas al servidor
  this.avg = await this._provider.request('GET', 'graphics/avgTime');  // Solicita el tiempo promedio al servidor
  this.listenGraphics();  // Comienza a escuchar cambios en las gráficas en tiempo real
}

// Método asíncrono para escuchar los gráficos en tiempo real utilizando WebSockets
async listenGraphics() {
  this._wsService.listen('grafica').subscribe((data) => {
    let btotal: number = parseInt(data.total ?? 0);  // Convierte el total recibido en número
    let atotal: number = this.dataSales.datasets[0].data[data.mes - 1] as number ?? 0;  // Obtiene el total actual del mes de la gráfica    
    this.dataSales.datasets[0].data[data.mes - 1] = btotal + atotal;  // Actualiza la gráfica sumando el nuevo total
    this.total.total = parseInt(this.total.total) + data.total;  // Actualiza el total acumulado
    console.log(data);
    
    this.chartSales.update();  // Actualiza la gráfica de ventas
  });
}

// Método asíncrono para obtener las ventas desde el servidor y configurar la gráfica de ventas
async Sales() {
  this.sales = await this._provider.request('GET', 'graphics/sales');  // Solicita las ventas al servidor
  this.dataSales = {  // Configura los datos de la gráfica de ventas
    labels: this.sales.labels,
    datasets: [
      {
        data: this.sales.data, 
        label: 'Total', 
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
      }
    ]
  };
}

// Método asíncrono para obtener los productos más vendidos desde el servidor y configurar la gráfica de productos
async bestSeller() {
  this.products = await this._provider.request('GET', 'graphics/bestSeller', { mes: 5 });  // Solicita los productos más vendidos al servidor
  this.dataProduct = {  // Configura los datos de la gráfica de productos más vendidos
    labels: this.products.labels,
    datasets: [
      {
        data: this.products.data, 
        label: 'Cantidad', 
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)'
        ],
      }
    ]
  };
}

// Método asíncrono para obtener los mejores clientes desde el servidor y configurar la gráfica de clientes
async bestClient() {
  this.clients = await this._provider.request('GET', 'graphics/bestClient');  // Solicita los mejores clientes al servidor
  this.dataClient = {  // Configura los datos de la gráfica de mejores clientes
    labels: this.clients.labels,
    datasets: [
      {
        data: this.clients.data, 
        label: 'No. de compras', 
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)'
        ],
      }
    ]
  };
}

}
