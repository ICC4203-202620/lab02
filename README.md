# Laboratorio 2: Fundamentos de una PWA

Este laboratorio se enfoca en la transformación de una aplicación web simple en una aplicación instalable. Para ello, se trabaja directamente con HTML, CSS y JavaScript, sin frameworks, con el propósito de estudiar el rol del Web App Manifest, utilizar las herramientas de desarrollo del navegador, administrar permisos y comparar el comportamiento de la aplicación en un computador y en un teléfono real.

La aplicación entregada permite seleccionar un restaurante de destino y calcular su distancia en línea recta desde una estación de Metro. Esta funcionalidad ya se encuentra implementada con un conjunto temporal de restaurantes y estaciones; el trabajo del laboratorio consiste en incorporar y reparar el manifest, agregar la ubicación del dispositivo como un segundo origen y comprobar el funcionamiento de la aplicación publicada e instalada.

Las habilidades que se espera ejercitar en esta actividad son:

1. Explicar qué información aporta un Web App Manifest
2. Utilizar DevTools para encontrar y corregir problemas del manifest
3. Consultar una capacidad del navegador antes de utilizarla
4. Administrar el permiso de geolocalización a partir de una acción del usuario
5. Evaluar una aplicación en escritorio, emulación responsive y un teléfono real
6. Publicar e instalar una aplicación web mediante un origen HTTPS

## Requisitos previos

Antes de comenzar, se requiere contar con:

1. Un navegador de escritorio con DevTools, preferentemente una versión estable reciente de Chrome
2. Un editor de código
3. Python 3, Node.js u otro servidor HTTP local
4. Un teléfono con un navegador actualizado y acceso a Internet
5. Una clave temporal que será entregada para poder gestionar el despliegue

## Preparación

El directorio [`app/`](app/) contiene el material base:

```text
app/
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── app.js
├── app.webmanifest
├── index.html
└── styles.css
```

Antes de modificar los archivos, se debe revisar su contenido:

- `index.html` contiene el selector del restaurante, las alternativas de origen y una sección de ubicación inicialmente oculta
- `styles.css` contiene los estilos responsive de la aplicación
- `app.js` contiene los datos temporales, el cálculo de distancia y los bloques marcados con `TODO`
- `app.webmanifest` contiene la información de instalación, pero tiene errores
- `icons/` contiene los iconos que utilizará la aplicación instalada

La instalación no entrega nuevas capacidades al dispositivo. Si un navegador ofrece geolocalización, puede ofrecerla tanto en una pestaña como en la aplicación instalada. La instalación cambia principalmente la forma de iniciar y presentar la aplicación.

## Conceptos previos

### Consultas (`query`) y resultados que cambian de estado

Una consulta, denominada frecuentemente *query*, solicita información a un sistema. Algunas APIs del explorador utilizan directamente un método llamado `query(...)`; otras ofrecen métodos con nombres más específicos. En ambos casos, se trata de operaciones de consulta.

Una query puede producir distintos tipos de resultado:

- Un valor o una observación puntual, que representa la información disponible en el momento de la consulta y no cambia posteriormente
- Un objeto vinculado al estado consultado, cuyas propiedades pueden actualizarse cuando cambia la información que representa

En el segundo caso, obtener el objeto no implica que la interfaz de una aplicación se actualice automáticamente. El programa debe leer sus propiedades y utilizar el mecanismo definido por la API para detectar sus cambios.

Antes de utilizar una query, es necesario revisar qué tipo de resultado entrega, si ese resultado puede cambiar posteriormente y cómo se informan sus modificaciones.

### Listeners y eventos

Un evento representa un hecho que ocurre durante la ejecución de un programa. Un listener registra una función para responder cuando se produzca ese evento. El registro no ejecuta inmediatamente la función; ésta queda disponible para una ejecución futura cuando el evento ocurre.

La forma general es:

```js
eventTarget.addEventListener('eventName', () => {
  // Código que se ejecutará cuando ocurra el evento
});
```

El objeto que emite el evento se denomina `eventTarget`; el nombre del evento identifica qué ocurrió y la función registrada contiene la respuesta. Un mismo objeto puede emitir distintos tipos de eventos y tener más de un listener.

### Promesas, `async` y `await`

Algunas operaciones no pueden entregar un resultado inmediatamente. En esos casos, JavaScript puede retornar una promesa: un objeto que representa un resultado futuro. Una promesa comienza pendiente y posteriormente se "resuelve" con un valor cuando la operación finaliza o es rechazada debido a un error. Lo anterior significa tener que esperar a que la operación termine antes de utilizar su resultado.

Una función declarada con `async` es una función que retorna inmediatamente una promesa y permite utilizar `await`. Esta expresión espera la resolución de una promesa dentro de esa función y entrega su valor:

```js
async function performTask() {
  try {
    const result = await asynchronousOperation();
    // Utilizar result después de que la operación finalice
  } catch (error) {
    // Responder si la promesa es rechazada
  }
}
```

`await` pausa únicamente la ejecución de la función `async`; no bloquea la página completa. El bloque `try` contiene la operación que puede fallar y `catch` define qué hacer si la promesa es rechazada.

Estos mecanismos son independientes: una consulta no siempre retorna una promesa, una promesa no siempre produce un objeto actualizable y un listener puede responder a muchos tipos de eventos. Para combinarlos correctamente se debe identificar qué entrega cada operación y en qué momento estará disponible su resultado.

## Procedimiento

### 1. Ejecutar y verificar la aplicación base

No se debe abrir `index.html` utilizando una URL `file://`. En su lugar, se debe abrir un terminal en la carpeta `app/` e iniciar un servidor HTTP local. Por ejemplo:

```sh
python -m http.server 8000
```

Acceder a `http://localhost:8000` y comprobar el flujo inicial:

1. Verificar que al cargar la página sólo se presente la selección del restaurante de destino
2. Seleccionar un restaurante y comprobar que aparezcan sus coordenadas y la sección "¿Dónde estás?"
3. Seleccionar una estación de Metro y comprobar que aparezcan sus coordenadas y el botón "Calcular distancia"
4. Presionar "Calcular distancia" en la alternativa "Estación de Metro"
5. Verificar que aparezca una tercera tarjeta que identifique la estación, el restaurante y la distancia aproximada en kilómetros

La aplicación utiliza la fórmula de Haversine para calcular la distancia geodésica aproximada entre las dos coordenadas. Esta distancia corresponde a una línea recta sobre la superficie terrestre; no representa una ruta peatonal, vehicular ni la distancia recorrida por las calles.

Las listas incluidas en `app.js` contienen datos temporales que serán reemplazados por el equipo docente. La implementación de la fórmula y la administración de estas listas no forman parte de las actividades del estudiante.

Abrir la consola de DevTools y verificar que no existan errores de JavaScript.

### 2. Incorporar el manifest

Revisar `app.webmanifest` sin modificarlo todavía. Luego, agregar el siguiente elemento dentro del `<head>` de `index.html`:

```html
<link rel="manifest" href="./app.webmanifest" />
```

Este elemento permite que el navegador descubra el manifest. Incorporar el archivo no significa que su contenido sea correcto; solo permite que el navegador intente interpretarlo.

Recargar la página antes de continuar.

### 3. Diagnosticar el manifest

En DevTools, abrir "Application/Manifest". Revisar los valores interpretados por el navegador y los errores o advertencias que aparecen en el panel.

Contrastar el contenido del manifest con los archivos que realmente existen dentro de `app/`. Identificar tres problemas relacionados con:

1. La URL que se abrirá al iniciar la aplicación
2. El modo de visualización solicitado
3. Los iconos declarados

### 4. Reparar el manifest

Modificar solamente `app.webmanifest`. La versión reparada debe cumplir las siguientes condiciones:

- `start_url` referencia un documento que existe dentro del alcance de la aplicación
- `display` utiliza un valor válido y solicita una experiencia sin la interfaz normal de una pestaña
- Los dos iconos referencian archivos existentes y sus tamaños coinciden con lo declarado
- El archivo continúa siendo JSON válido

### 5. Validar la reparación

Recargar la aplicación y volver a "Application/Manifest". Verificar que:

- Aparecen el nombre y el nombre corto de la aplicación
- Se muestran los iconos de 192 y 512 píxeles
- La URL inicial corresponde a un archivo existente
- DevTools reconoce el modo de visualización
- Ya no aparecen los tres problemas diagnosticados

DevTools debe ser la fuente del diagnóstico. No se debe agregar código JavaScript para validar el manifest desde la propia aplicación.

### 6. Detectar la geolocalización

La interfaz necesaria para esta funcionalidad ya se encuentra preparada en `index.html`. El elemento `#location-section` contiene una única salida, `#location-output`, y los botones "Solicitar acceso" y "Calcular distancia". Esta salida presenta inicialmente el estado del permiso y, después de obtener la ubicación, presenta las coordenadas en el mismo recuadro. La sección incluye inicialmente el atributo `hidden`, por lo que no se presenta al usuario cuando se carga la página.

La sección de ubicación se encuentra dentro de `#origins-section`. La aplicación base muestra esta sección general después de seleccionar un restaurante. Por lo tanto, la alternativa de ubicación sólo será visible cuando se cumplan dos condiciones: existe un restaurante de destino y el navegador ofrece geolocalización. La alternativa basada en una estación continúa disponible aunque geolocalización no exista.

En `app.js` también se encuentra disponible la referencia `locationSection`. El objetivo de esta actividad es decidir, desde JavaScript, si corresponde mostrar la interfaz. No es necesario crear ni modificar los elementos HTML.

Localizar la función `initializeLocation()` y realizar el siguiente procedimiento:

1. Reemplazar el valor provisional `false` de `geolocationAvailable` por una expresión que compruebe si `geolocation` existe dentro de `navigator`
2. Mantener el retorno inmediato cuando la capacidad no se encuentre disponible; en este caso, la sección debe conservar su atributo `hidden`
3. Cuando la capacidad exista, continuar la ejecución y asignar `false` a la propiedad `hidden` de `locationSection`

La detección debe consultar directamente la capacidad disponible. No se debe deducir el soporte a partir del nombre, la plataforma o el user agent del navegador.

Para verificar esta actividad:

1. Recargar la página
2. Seleccionar un restaurante para mostrar la sección general de orígenes
3. Evaluar `'geolocation' in navigator` en la consola
4. Si el resultado es `true`, comprobar que la alternativa "Mi ubicación" se encuentre visible
5. Si el resultado es `false`, comprobar que la alternativa continúe oculta y que no se produzcan errores en la consola

### 7. Consultar el estado del permiso de ubicación

En un navegador, que la funcionalidad esté disponible no significa que se pueda usar. El usuario debe autorizar su uso. Por lo anterior, se debe comenzar por consultar el estado actual del permiso, sin solicitarlo todavía. La Permissions API informa uno de los siguientes estados:

| Estado | Significado |
| --- | --- |
| `prompt` | El usuario todavía no ha tomado una decisión |
| `granted` | El acceso a la ubicación está autorizado |
| `denied` | El acceso fue rechazado |

Cada estado debe producir los siguientes cambios en la interfaz:

| Estado | Texto del primer botón | Primer botón | Calcular distancia | Mensaje esperado |
| --- | --- | --- | --- | --- |
| `prompt` | Solicitar acceso | Habilitado | Oculto | Aún no se ha tomado una decisión |
| `granted` | Obtener ubicación | Habilitado | Oculto hasta obtener las coordenadas | Permiso concedido |
| `denied` | Solicitar acceso | Deshabilitado | Oculto | El permiso debe restablecerse desde la configuración del sitio |

La estructura base de esta actividad se encuentra dentro de `initializeLocation()`, después de mostrar la sección. Las modificaciones se deben mantener dentro de esa función. Dado que los métodos utilizados son asincrónicos, `initializeLocation()` ha sido declarada con `async`, por lo que es posible utilizar `await` directamente.

#### Paso 7.1: Completar la función que actualiza la interfaz

El código base ya declara `permissionState` y `currentLocation`, y contiene la función local `updatePermissionInterface(state)`. Esta función incluye los mensajes de los tres estados y algunos ejemplos de actualización del DOM.

Revisar su implementación y completar los tres comentarios `TODO` de la actividad 7.1:

1. El caso `granted` ya asigna "Obtener ubicación" al primer botón. En el bloque `else`, asignar "Solicitar acceso" para los demás estados
2. Asignar a `requestLocationButton.disabled` el resultado de comprobar si `state` es `denied`
3. El código ya deshabilita `calculateLocationButton` cuando el estado no es `granted`. En ese mismo bloque, ocultar el botón mediante su propiedad `hidden`

> Para facilitar la interacción con el DOM, en el preámbulo ya se han obtenido referencias a `locationOutput`, `requestLocationButton` y `calculateLocationButton`. Se pueden utilizar directamente dentro de la función.

#### Paso 7.2: Establecer el estado inicial

Después de la definición de la función, completar el `TODO` de la actividad 7.2 invocando `updatePermissionInterface(...)` con `prompt`. Esta llamada permite que la interfaz tenga un estado conocido incluso si la consulta posterior no se encuentra disponible.

#### Paso 7.3: Consultar el permiso

Antes de incorporar la consulta al programa, abrir la consola de DevTools y ejecutar:

```js
const permissionTest = await navigator.permissions.query({ name: 'geolocation' });
permissionTest
```

Inspeccionar el objeto obtenido y evaluar `permissionTest.state`. La consulta no abre el diálogo de autorización ni obtiene las coordenadas del dispositivo.

Para implementar la consulta se dispone de las siguientes operaciones:

| Operación | Resultado |
| --- | --- |
| `navigator.permissions.query({ name: 'geolocation' })` | Promesa que se resuelve con un objeto `PermissionStatus` |
| `permissionStatus.state` | Estado actual representado por el objeto |
| `permissionStatus.addEventListener('change', listener)` | Registro de una función que se ejecutará cuando el estado cambie |

El código base ya comprueba la disponibilidad de la API, ejecuta la query con `await` dentro de un bloque `try` y utiliza `updatePermissionInterface(permissionStatus.state)` para representar el resultado inicial. Esta primera llamada sirve como ejemplo para completar los dos `TODO` de la actividad 7.3:

1. Dentro del listener de `change`, repetir la llamada a `updatePermissionInterface(...)` utilizando el estado actualizado de `permissionStatus`
2. Dentro de `catch`, utilizar la misma función para representar nuevamente el estado `prompt`

No se deben repetir dentro del listener las modificaciones individuales del mensaje y de los botones. Esas decisiones pertenecen a `updatePermissionInterface(...)`.

El evento `change` permite actualizar los controles si el permiso cambia mientras la página está abierta. Si la Permissions API no existe o la consulta falla, la interfaz permanece en `prompt` y el permiso podrá solicitarse en la actividad siguiente.

Si el permiso ya había sido concedido en una visita anterior, la consulta retorna `granted` al cargar la página. La llamada a `updatePermissionInterface(permissionStatus.state)` debe cambiar inmediatamente el texto del botón a "Obtener ubicación" y mantenerlo habilitado.

Para verificar esta actividad, recargar la página y comprobar que no aparezca un diálogo de autorización. El mensaje y el primer botón deben representar el estado informado por `permissionTest.state`. Si el permiso ya estaba concedido, el botón debe aparecer directamente como "Obtener ubicación".

### 8. Solicitar acceso y obtener la ubicación

En esta actividad se debe completar el comportamiento del primer botón de la alternativa "Mi ubicación". Su funcionamiento depende del estado actual:

1. En estado `prompt`, el botón dice "Solicitar acceso" y provoca el diálogo de autorización
2. En estado `granted`, el mismo botón dice "Obtener ubicación" y permite leer las coordenadas
3. Después de obtener las coordenadas, se muestra el botón "Calcular distancia"

`getCurrentPosition(...)` es una operación asincrónica basada en callbacks. No retorna una promesa y, por lo tanto, no se utiliza con `await`. Su estructura es:

```js
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Responder a una lectura exitosa
  },
  (error) => {
    // Responder a un rechazo o a otro error
  }
);
```

El código base ya contiene esta llamada dentro de un listener de `requestLocationButton`. Los callbacks y el flujo general están preparados; se deben completar los comentarios `TODO` utilizando como referencia las instrucciones que los preceden.

#### Paso 8.1: Registrar la interacción

El listener incluido declara `obtainingLocation`, deshabilita temporalmente el botón y muestra "Obteniendo la ubicación…" cuando la pulsación busca las coordenadas. Completar el bloque `else` para que, cuando la pulsación solicite el permiso, `locationOutput` muestre "Esperando la respuesta del usuario…".

La variable `obtainingLocation` conserva el propósito de la pulsación mientras finaliza la operación asincrónica. No se debe volver a calcular su valor dentro de los callbacks.

#### Paso 8.2: Resolver una lectura exitosa

El callback que recibe `position` ya resuelve el caso en que la pulsación sólo solicita el permiso. Si `obtainingLocation` es falso, actualiza la interfaz al estado `granted` y finaliza sin presentar las coordenadas.

Para el segundo caso, el código crea `currentLocation` y copia `position.coords.latitude` en su propiedad `latitude`. Completar los dos `TODO` restantes:

1. Copiar `position.coords.longitude` en la propiedad `longitude`, siguiendo el ejemplo de la latitud
2. El botón de cálculo ya se habilita mediante `disabled`. Mostrarlo modificando también su propiedad `hidden`

Después de estos puntos, el código base presenta las coordenadas mediante `formatCoordinates(currentLocation)` y vuelve a habilitar `requestLocationButton`.

#### Paso 8.3: Revisar la resolución de errores

El callback que recibe `error` se encuentra implementado como parte de la estructura base. Revisar sus dos caminos:

1. Si `error.code` es igual a `error.PERMISSION_DENIED`, utiliza `updatePermissionInterface(...)` para representar `denied` y finaliza el callback
2. Para cualquier otro error, escribe `error.message` en `locationOutput` y vuelve a habilitar `requestLocationButton` para permitir otro intento

La primera llamada a `getCurrentPosition(...)` provoca la solicitud del permiso. Aunque esa llamada también entrega una posición, en este laboratorio se utiliza sólo para registrar la decisión. Después de conceder el permiso, el texto del botón cambia a "Obtener ubicación". La segunda pulsación obtiene las coordenadas, las presenta y muestra el botón de cálculo.

Para verificar esta actividad:

1. Restablecer previamente el permiso del sitio si ya se había tomado una decisión
2. Seleccionar un restaurante y comprobar que sólo aparezca "Solicitar acceso"
3. Presionar "Solicitar acceso" y conceder el permiso
4. Comprobar que el mismo botón cambie a "Obtener ubicación"
5. Recargar la página, seleccionar nuevamente un restaurante y comprobar que el botón aparezca directamente como "Obtener ubicación"
6. Presionar "Obtener ubicación" y comprobar que aparezcan las coordenadas y "Calcular distancia"
7. Restablecer nuevamente el permiso, repetir la prueba y rechazarlo
8. Comprobar que "Solicitar acceso" quede deshabilitado y que el botón de cálculo permanezca oculto

No se debe solicitar el permiso al cargar la página.

### 9. Calcular desde la ubicación actual

En esta actividad se debe implementar el botón "Calcular distancia" de la alternativa "Mi ubicación". Este botón sólo aparece después de obtener las coordenadas. La aplicación base ya proporciona `getSelectedRestaurant()`, `calculateDistanceKm(...)` y `formatDistance(...)`; no es necesario volver a implementar estas funciones.

El código base contiene un listener vacío para `calculateLocationButton`, con comentarios que indican dónde incorporar cada parte. Examinar primero el listener ya implementado de `calculateStationButton` y utilizarlo como ejemplo para completar el segundo contexto. La nueva implementación debe:

1. Obtener el restaurante seleccionado mediante `getSelectedRestaurant()`
2. Finalizar sin modificar la interfaz si no existe un restaurante o si `currentLocation` todavía es `null`
3. Calcular la distancia entregando `currentLocation` y el restaurante a `calculateDistanceKm(...)`
4. Formatear el número mediante `formatDistance(...)`
5. Escribir en `distanceResult` una oración con la forma: `Usted se encuentra a una distancia de [distancia] km en línea recta del restaurante "[nombre]"`
6. Mostrar `distanceSection` después de escribir el resultado

Las coordenadas almacenadas temporalmente en `currentLocation` tienen la misma estructura que los restaurantes y las estaciones. Este punto se entrega a `calculateDistanceKm(...)` junto con el restaurante seleccionado. La distancia se escribe en `#distance-result`, dentro de la tercera tarjeta utilizada también por el cálculo desde una estación. Esta tarjeta permanece oculta hasta que se presiona uno de los botones "Calcular distancia". No se deben enviar las coordenadas a otro sistema.

El resultado puede ser aproximado, ya que un computador y un teléfono no necesariamente utilizan las mismas fuentes para determinar su posición.

### 10. Probar la interfaz con DevTools

Abrir el modo dispositivo de DevTools y probar la aplicación en las siguientes condiciones:

- Un viewport angosto cercano a 320 CSS px
- Un perfil de teléfono
- Orientación vertical y horizontal
- Zoom o tamaño de fuente aumentado

Verificar que los campos, botones y resultados continúen visibles y utilizables. Corregir cualquier desbordamiento o control difícil de utilizar.

El modo dispositivo permite probar principalmente el viewport, la densidad y algunos mecanismos de entrada. No convierte el navegador de escritorio en el navegador del teléfono ni garantiza el mismo soporte de APIs.

### 11. Publicar la aplicación

Crear un archivo ZIP con el contenido de `app/`. `index.html` debe quedar directamente en la raíz del ZIP y no dentro de una carpeta adicional.

La estructura correcta es:

```text
index.html
app.js
app.webmanifest
styles.css
icons/
```

Utilizar el portal indicado por el equipo docente:

1. Ingresar el RUT y la clave temporal
2. Validar los datos y confirmar el nombre y la URL asignada
3. Cargar el archivo ZIP
4. Esperar la confirmación de publicación
5. Abrir la URL HTTPS que contiene el slug personal

Cada nueva carga reemplaza completamente la versión anterior. El portal solo publica los archivos y no diagnostica su contenido; las validaciones son responsabilidad del estudiante.

### 12. Probar en un teléfono real

Abrir la URL publicada directamente en el navegador del teléfono y realizar las siguientes verificaciones:

1. Es posible seleccionar un restaurante y calcular su distancia desde una estación
2. La sección de ubicación aparece solamente si el navegador ofrece geolocalización
3. Antes de autorizar, sólo aparece el botón "Solicitar acceso"
4. Al conceder el permiso, el mismo botón cambia a "Obtener ubicación"
5. Al presionar "Obtener ubicación", aparecen las coordenadas y el botón "Calcular distancia"
6. Al presionar "Calcular distancia", aparece la tercera tarjeta con el resultado
7. Al rechazar el permiso, la interfaz informa que debe restablecerse desde la configuración del sitio

### 13. Instalar la aplicación

Utilizar la opción de instalación del navegador. Según la plataforma, puede aparecer como "Instalar aplicación", "Agregar a pantalla de inicio" o dentro del menú de compartir.

Iniciar la aplicación desde el icono instalado y observar los efectos del manifest reparado:

- Nombre e icono presentados por el sistema
- Documento que se abre al iniciar
- Ejecución sin la interfaz normal de una pestaña
- Color de tema, cuando la plataforma lo utiliza

Comparar este resultado con la aplicación abierta como una pestaña. La disponibilidad de la instalación y la interfaz utilizada dependen del navegador y del sistema operativo.

## Problemas frecuentes

### DevTools no muestra el manifest

Verificar que se haya agregado `rel="manifest"`, que la ruta sea correcta y que se utilice un servidor HTTP. Revisar "Console" y "Network", recargar sin caché y volver a abrir el panel "Application".

### El navegador conserva una versión anterior

Realizar una recarga forzada. Después de publicar una nueva versión, esperar la confirmación del portal y probar también en una ventana privada para distinguir los datos locales de la versión publicada.

### La ubicación no aparece o falla

Comprobar `window.isSecureContext` en la consola. Geolocation requiere un contexto seguro. `localhost` recibe un tratamiento especial durante el desarrollo, pero una dirección HTTP de la red local puede no recibirlo. Revisar también el permiso del sitio y la configuración de ubicación del sistema operativo.

### El permiso quedó rechazado

La aplicación no puede cambiar un permiso `denied` a `granted`. El permiso se debe restablecer desde la configuración del sitio antes de repetir la prueba.

### El navegador no ofrece la instalación

Revisar nuevamente "Application" → "Manifest", confirmar que la página se sirve mediante HTTPS y utilizar el mecanismo de instalación propio del navegador. No todos los navegadores presentan un botón o mensaje automático.
