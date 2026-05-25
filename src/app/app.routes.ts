import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Layout } from './components/layout/layout';
import { Home } from './components/home/home';
import { QuienSoy } from './components/quien-soy/quien-soy';
import { NotFound } from './components/not-found/not-found';
import { Proximamente } from './components/proximamente/proximamente';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { Ahorcado } from './components/ahorcado/ahorcado';
import { MayorMenor } from './components/mayor-menor/mayor-menor';
import { Chat } from './components/chat/chat';
import { Juegos } from './components/juegos/juegos';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'quien-soy', component: QuienSoy },
      { path: 'login', component: Login, canActivate: [publicGuard] },
      { path: 'register', component: Register, canActivate: [publicGuard] },
      {
        path: 'juegos/ahorcado',
        component: Ahorcado,
        canActivate: [authGuard],
      },
      {
        path: 'juegos/mayor-menor',
        component: MayorMenor,
        canActivate: [authGuard],
      },
      {
        path: 'juegos',
        component: Juegos,
        canActivate: [authGuard],
      },
      {
        path: 'chat',
        component: Chat,
        canActivate: [authGuard],
      },
      {
        path: 'resultados',
        component: Proximamente,
        canActivate: [authGuard],
        data: {
          titulo: 'Resultados',
          icono: '🏆',
          descripcion:
            'Los listados de resultados se completarán cuando los juegos registren estadísticas en la base de datos.',
        },
      },
    ],
  },
  { path: '**', component: NotFound },
];