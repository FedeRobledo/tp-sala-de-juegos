import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Layout } from './components/layout/layout';
import { Home } from './components/home/home';
import { QuienSoy } from './components/quien-soy/quien-soy';
import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'quien-soy', component: QuienSoy },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ],
  },
  { path: '**', component: NotFound },
];