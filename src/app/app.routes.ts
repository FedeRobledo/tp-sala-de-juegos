{
  path: 'juegos',
  component: Proximamente,
  canActivate: [authGuard],
},
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
  path: 'chat',
  component: Chat,
  canActivate: [authGuard],
},
{
  path: 'resultados',
  component: Proximamente,
  canActivate: [authGuard],
},