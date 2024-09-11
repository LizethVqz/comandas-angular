// Este tipo es una función que se utiliza para decidir si se puede activar una ruta específica.
import { CanActivateFn } from '@angular/router';
//Define un Guard y toma dos parámetros: 'route' (la ruta actual) y 'state' (el estado del router).
export const authGuard: CanActivateFn = (route, state) => {
  // La función, en este caso, simplemente devuelve 'true', lo que permite el acceso a la ruta.
  return true;
};
