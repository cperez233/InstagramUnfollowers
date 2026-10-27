# InstagramUnfollowers

[English](README.md) · **Español**

<img src="./assets/results.png" alt="Lista de cuentas que no te siguen de vuelta" width="720" />

Mira qué cuentas de las que sigues no te siguen de vuelta. Corre en tu propio navegador, dentro de tu sesión de Instagram: no hay que instalar nada y nunca pide la contraseña.

Es un fork de [InstagramUnfollowers](https://github.com/davidarroyo1234/InstagramUnfollowers) de David Arroyo. La idea y la base son suyas. Este fork corrige los resultados erróneos en cuentas grandes y simplifica la interfaz.

**Para copiar el código:** https://cperez233.github.io/InstagramUnfollowers/

## Cómo se usa

1. Abre la página de arriba y pulsa **Copiar código**.
2. Entra a [instagram.com](https://www.instagram.com/) desde el ordenador e inicia sesión.
3. Abre la consola (`Ctrl + Shift + J` en Windows y Linux, `⌘ + ⌥ + J` en Mac), pega el código y pulsa `Enter`.
4. Pulsa **Escanear**. Las cuentas que no te siguen van apareciendo mientras avanza el escaneo.

Desde la lista puedes abrir perfiles, buscar, ocultar cuentas verificadas, copiar los usuarios, ignorar las cuentas que te dan igual y dejar de seguir de una en una (pide confirmación). El último escaneo queda guardado en el navegador.

Escanear tarda alrededor de un segundo por cada cuenta que sigues. Si Instagram empieza a limitar las peticiones, el escaneo se detiene y muestra lo que ya comprobó; espera unas horas antes de repetirlo. El móvil no tiene consola; en Android, el navegador [Eruda](https://github.com/liriliri/eruda-android/releases/) trae una.

## Qué arreglamos

**Resultados erróneos de "no te sigue de vuelta".** El original descargaba tu lista completa de seguidores en trozos pequeños y la cruzaba con las cuentas que sigues. En cuentas grandes son cientos de peticiones, y bastaba con perder un trozo para que gente que sí te sigue saliera como que no.

Ahora se le pregunta a Instagram por cada cuenta que sigues y responde directamente sí o no. Un fallo solo afecta a esa cuenta, y el número de peticiones depende de cuántas cuentas sigues, no de cuántos seguidores tienes. Si un resultado no es fiable, el escaneo te avisa en lugar de mostrar una lista equivocada.

**Una interfaz más simple.** Una sola lista con el aspecto de Instagram que sigue su tema claro u oscuro. Se quitó todo lo que no hace falta para ver quién no te sigue (filtros extra, dejar de seguir en bloque, exportaciones, ajustes).

**Una página nueva para copiar el código.** Los pasos vienen con una demo corta, un botón-marcador que se arrastra a la barra y un selector de idioma (inglés y español).

<img src="./assets/copy-page.png" alt="Página para copiar el código" width="720" />

## Desarrollo

- Node 16 o superior y luego `npm install`.
- `npm run webpack-build` compila `dist/dist.js`.
- `npm run build` compila y además genera `public/index.html` a partir de `src/page/index.html`. Lo hace GitHub Actions en cada push a `master`. No edites `public/index.html` a mano: los PR que lo modifican se rechazan.
- Para probar la interfaz sin Instagram, sirve la raíz del repo y abre `http://localhost:<puerto>/public/preview.html?preview=results` (o `?preview=live` para ver un escaneo en curso). En `localhost` se usan datos de prueba.

## Licencia

MIT. El proyecto original es de David Arroyo y sus colaboradores; ver [LICENSE](LICENSE).
