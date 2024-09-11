//Estas importaciones incluyen los módulos y componentes necesarios para el funcionamiento del componente
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MenuComponent } from './menu/menu.component';
import {MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LocalstorageService } from '../services/localstorage.service';
@Component({
  //nombre del componente para usarlo en el html
  selector: 'app-private',
  //Indica que el componente es independiente
  standalone: true,
  //importaciones de los modulos
  imports: [MatSidenavModule, MatIconModule, MenuComponent, MatFormFieldModule,RouterOutlet,RouterLink],
  //ruta del html y scss del componente
  templateUrl: './private.component.html',
  styleUrl: './private.component.scss'
})
export class PrivateComponent {
  //Inyeccion de las dependiencias que necesitamos guardadas en variables privadas
  private _localstorage: LocalstorageService = inject(LocalstorageService);
  private _router: Router = inject(Router);
  //Declaración de variables
  user: string = '';
  rol: number = 0;
  
//Una vez que se inicia el componente entra en el ngOnInit
  ngOnInit(){
    //Se guarda en variables los datos necesarios para su uso, las tomamos del localstorage
    this.user = this._localstorage.getItem('user').name;
    this.rol = this._localstorage.getItem('user').rol;
  }
  //Función para cerrar sesión
  logOut(){
    //Limpieza el localstorage
    this._localstorage.clear();
    //Redirección al Login
    this._router.navigate(['/auth/sign-in'])
  }
}
