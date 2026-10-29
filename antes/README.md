# UNA Chat

Chat del Laboratorio 5 con inicio de sesión social (US-01) mediante Auth0.

El nombre que aparece en el chat sale de la cuenta autenticada. El chat no se abre sin sesión. Los secretos viven en variables de entorno.

## Ejecutar en local

```bash
cd antes
npm install
copy .env.example .env
npm start
```

Abre http://localhost:3000. Sin un `.env` completo, la aplicación muestra la página de configuración y no abre el chat.

## Configurar Auth0

1. Crea una cuenta en https://auth0.com y un tenant.
2. Crea una aplicación de tipo Regular Web Application llamada UNA Chat.
3. En Authentication, Social, activa al menos un proveedor (Google alcanza).
4. En la aplicación, Allowed Callback URLs:

```
http://localhost:3000/callback
https://TU-PROYECTO.vercel.app/callback
```

5. Allowed Logout URLs:

```
http://localhost:3000
https://TU-PROYECTO.vercel.app
```

6. Allowed Web Origins:

```
http://localhost:3000
https://TU-PROYECTO.vercel.app
```

7. Copia Domain, Client ID y Client Secret al `.env`. `AUTH0_ISSUER_BASE_URL` es `https://TU-DOMINIO` (el Domain de Auth0, con https). `AUTH0_BASE_URL` es la URL donde corre la aplicación, sin barra final.

Genera `AUTH0_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

No subas el archivo `.env`.

## Desplegar en Vercel

1. Importa este repositorio en Vercel. El directorio raíz del proyecto es `antes`.
2. Crea las mismas variables del `.env`. `AUTH0_BASE_URL` debe ser la URL de Vercel.
3. Agrega esa URL en Auth0, en callback, logout y orígenes, como se indica arriba.
4. Redeploy después de guardar las variables.

El inicio y el cierre de sesión usan rutas HTTP (`/login`, `/callback`, `/logout`). El chat en tiempo real usa Socket.IO y funciona con `npm start`. En el plan serverless de Vercel el canal de Socket.IO puede no mantenerse; el flujo de entrar, ver la identidad y salir sí está implementado sobre HTTP.

## Pruebas

```bash
npm test
```

## Variables

| Variable | Uso |
|---|---|
| `AUTH0_SECRET` | Firma la cookie de sesión |
| `AUTH0_BASE_URL` | URL pública de esta aplicación |
| `AUTH0_CLIENT_ID` | Client ID de la aplicación Auth0 |
| `AUTH0_CLIENT_SECRET` | Client Secret. Solo en el servidor |
| `AUTH0_ISSUER_BASE_URL` | Dominio del tenant, con https |
