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
        path: 'juegos',
        component: Proximamente,
        canActivate: [authGuard],
        data: {
          titulo: 'Juegos',
          icono: '🎮',
          descripcion:
          'Desde esta sección se irán agrupando los juegos disponibles. Ahorcado Argentino ya está habilitado y Mayor o Menor se agregará durante este sprint.',
        },
      },
      {
        path: 'chat',
        component: Proximamente,
        canActivate: [authGuard],
        data: {
          titulo: 'Chat',
          icono: '💬',
          descripcion:
            'La sala de chat global se implementará en el Sprint 3 con mensajes en tiempo real usando Supabase.',
        },
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