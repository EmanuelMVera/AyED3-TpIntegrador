# 📚 Mi Pokedex Personal 🚀

![Pokémon Logo](https://img.icons8.com/color/96/000000/pokemon--v1.png)

¡Bienvenidos a **Mi Pokedex Personal**! Esta es una aplicación web interactiva desarrollada con **Angular** que te permite explorar información detallada sobre los primeros 151 Pokémon y, ¡lo que es aún más emocionante, crear tus propias criaturas personalizadas!

Puedes ver la aplicación en vivo aquí: [**Mi Pokedex Personal en GitHub Pages**](https://emanuelmvera.github.io/AyED3-TpIntegrador/)

Este proyecto fue desarrollado por **Emanuel Vera** como trabajo integrador para la materia **Algoritmos y Estructuras de Datos III**.

---

## ✨ Características Destacadas

* **Exploración Completa**: Sumérgete en la información detallada de los 151 Pokémon originales, incluyendo sus tipos, descripciones y estadísticas.
* **Búsqueda Rápida**: Encuentra tus Pokémon favoritos con facilidad gracias a una función de búsqueda avanzada.
* **Crea tu Pokémon Único**: ¡Da rienda suelta a tu imaginación y diseña Pokémon personalizados con sus propios nombres, descripciones, tipos e imágenes!
* **Diseño Adaptable (Responsive)**: Disfruta de una experiencia fluida y visualmente atractiva en cualquier dispositivo, ya sea una computadora de escritorio, tablet o smartphone.
* **Aplicación de Conceptos de Angular**: Demuestra la implementación de principios fundamentales de Angular, como componentes, enlaces de datos, servicios y enrutamiento.
* **Interfaz Inspirada en Videojuegos**: Una interfaz de usuario moderna con toques retro, que incluye animaciones sutiles, efectos de brillo y un diseño de panel intuitivo que evoca la estética de los videojuegos.

---

## 🛠️ Tecnologías Utilizadas

* **Angular**: Framework principal para el desarrollo de la aplicación web.
* **TypeScript**: Lenguaje de programación utilizado para el desarrollo de Angular.
* **HTML5**: Para la estructura y el contenido de las páginas.
* **CSS3**: Para los estilos y animaciones, utilizando variables CSS para la personalización y la consistencia del tema.
* **Material Icons**: Para los iconos decorativos y funcionales de la interfaz de usuario.
* **Fuentes Personalizadas**: "Press Start 2P" para títulos y "Inter" para el cuerpo del texto, aportando un toque distintivo.

---

## 🏗️ Estructura del Proyecto y Componentes Clave

Este proyecto sigue una arquitectura modular en Angular, organizada para facilitar la comprensión y el mantenimiento.

```
AyED3-TpIntegrador/
├── src/
│   ├── app/
│   │   ├── app.routes.ts               # Define las rutas principales de la aplicación
│   │   ├── core/                       # Módulo para servicios globales y modelos
│   │   │   ├── services/
│   │   │   │   └── pokemon.service.ts  # Maneja la lógica de la API de Pokémon
│   │   │   └── models/
│   │   │       ├── pokemon.model.ts    # Define la estructura de un objeto Pokémon
│   │   │       └── pokeapi-response.model.ts # Estructura para la respuesta de la PokeAPI
│   │   ├── features/                   # Módulos/Componentes principales de la aplicación
│   │   │   ├── home/                   # Página de inicio/bienvenida
│   │   │   │   ├── home.component.ts
│   │   │   │   ├── home.html
│   │   │   │   └── home.css
│   │   │   ├── nosotros/               # Sección "Acerca de Nosotros"
│   │   │   │   ├── nosotros.component.ts
│   │   │   │   ├── nosotros.html
│   │   │   │   └── nosotros.css
│   │   │   ├── pokedex/                # Componente principal para mostrar la lista de Pokémon
│   │   │   │   ├── pokedex.component.ts
│   │   │   │   ├── pokedex.html
│   │   │   │   └── pokedex.css
│   │   │   ├── crear-pokemon/          # Componente para crear Pokémon personalizados
│   │   │   │   ├── crear-pokemon.component.ts
│   │   │   │   ├── crear-pokemon.html
│   │   │   │   └── crear-pokemon.css
│   │   │   └── ... (posibles componentes para detalle de Pokémon, etc.)
│   │   ├── shared/                     # Componentes, directivas o pipes reutilizables
│   │   └── styles.css                  # Estilos globales y variables CSS
│   └── assets/                         # Recursos estáticos (imágenes, etc.)
├── docs/                               # Carpeta de salida de la compilación para GitHub Pages
├── .gitignore
├── angular.json
├── package.json
└── tsconfig.json
```

### Explicación de Componentes y Servicios Clave:

Aquí se detalla la función de los componentes y servicios principales del proyecto:

#### 📂 `src/app/core/models/`
* **`pokemon.model.ts`**:
    * **Función**: Define la interfaz o clase que representa la estructura de un objeto Pokémon en la aplicación. Esto asegura la consistencia de los datos y facilita el trabajo con TypeScript. Incluirá propiedades como `id`, `name`, `type`, `imageUrl`, `description`, `abilities`, etc.
    * **Importancia**: Sirve como el "contrato" de datos para los Pokémon, tanto los obtenidos de la API como los creados por el usuario.

* **`pokeapi-response.model.ts`**:
    * **Función**: Define la interfaz para estructurar la respuesta esperada de la PokeAPI (o cualquier API externa utilizada). Esto es útil para mapear las respuestas JSON de la API a un formato TypeScript seguro, facilitando el acceso a los datos anidados.
    * **Importancia**: Asegura que el servicio de Pokémon pueda parsear y manejar correctamente los datos recibidos de fuentes externas.

#### 🛠️ `src/app/core/services/pokemon.service.ts`
* **Función**: Este servicio es el encargado de toda la lógica relacionada con la obtención y gestión de datos de Pokémon.
    * **Comunicación con la API**: Realiza las peticiones HTTP a la PokeAPI para obtener información de los Pokémon existentes (ej. los primeros 151).
    * **Manejo de Datos**: Puede incluir métodos para filtrar, buscar o transformar los datos de Pokémon antes de que lleguen a los componentes.
    * **Gestión de Pokémon Creados**: Si los Pokémon personalizados se persisten (ej. en un servicio de almacenamiento local o en una pequeña base de datos en memoria), este servicio sería el responsable de ello.
* **Importancia**: Centraliza la lógica de datos, desacoplando los componentes de la implementación de la API y haciendo el código más modular y mantenible.

#### 🏠 `src/app/features/home/` (Componente `Home`)
* **`home.component.ts`**:
    * **Función**: Es el "cerebro" de la página de bienvenida.
    * **Lógica**: Puede manejar animaciones de entrada, mensajes de bienvenida y la navegación a otras secciones de la aplicación (Pokedex, Crear Pokémon).
    * **No. de Líneas (ejem.)**: Generalmente corto, enfocado en UI/UX simple.
* **`home.html`**:
    * **Función**: Define la estructura visual de la página de inicio.
    * **Contenido**: Contendrá el título de bienvenida, posiblemente una imagen temática de Pokémon y botones o enlaces para navegar a la Pokedex o a la sección de creación.
* **`home.css`**:
    * **Función**: Estilos específicos para la página de inicio.
    * **Estilo**: Probablemente incluye estilos para centrar el contenido, definir el fondo, animaciones de texto o botones llamativos.

#### ℹ️ `src/app/features/nosotros/` (Componente `Nosotros`)
* **`nosotros.component.ts`**:
    * **Función**: Un componente de presentación.
    * **Lógica**: Muy mínima o nula. Sirve principalmente como un contenedor para la plantilla HTML estática.
    * **No. de Líneas (ejem.)**: Muy corto, solo el decorador `@Component` y la clase vacía.
* **`nosotros.html`**:
    * **Función**: Presenta información sobre el creador del proyecto (Emanuel Vera), el propósito de la aplicación y sus características principales.
    * **Contenido**: Texto descriptivo, listas de características con iconos, y un enlace de contacto.
* **`nosotros.css`**:
    * **Función**: Estilos para la sección "Acerca de Nosotros".
    * **Estilo**: Define el diseño de los paneles, la tipografía específica para títulos y texto, sombras, y los estilos de los iconos y enlaces de contacto, con un diseño adaptable para diferentes tamaños de pantalla.

#### 🔍 `src/app/features/pokedex/` (Componente `Pokedex`)
* **`pokedex.component.ts`**:
    * **Función**: El "cerebro" principal para la visualización de Pokémon.
    * **Lógica**:
        * Inyecta `PokemonService` para obtener la lista de Pokémon.
        * Maneja la lógica de búsqueda y filtrado de Pokémon.
        * Gestiona la paginación o carga infinita de resultados.
        * Puede manejar la navegación a una vista de detalle de Pokémon (si existe).
* **`pokedex.html`**:
    * **Función**: Presenta la interfaz de usuario para explorar Pokémon.
    * **Contenido**: Un campo de búsqueda, una lista o cuadrícula de tarjetas de Pokémon, cada una mostrando información básica (nombre, imagen, tipo). Utiliza bucles `*ngFor` para renderizar la lista de Pokémon.
* **`pokedex.css`**:
    * **Función**: Estilos para la lista y las tarjetas de Pokémon.
    * **Estilo**: Probablemente incluye diseño de cuadrícula (`display: grid`), estilos para las tarjetas de Pokémon (bordes, sombras, fondos por tipo), estilos para el campo de búsqueda, y responsividad para diferentes dispositivos.

#### 🎨 `src/app/features/crear-pokemon/` (Componente `CrearPokemon`)
* **`crear-pokemon.component.ts`**:
    * **Función**: Gestiona la lógica detrás del formulario de creación de Pokémon.
    * **Lógica**:
        * Maneja los estados del formulario (validación de campos, envío).
        * Recopila los datos ingresados por el usuario.
        * Puede interactuar con `PokemonService` para "guardar" el nuevo Pokémon (ej. añadirlo a una lista en memoria o a `localStorage`).
        * Puede incluir lógica para previsualizar la imagen del Pokémon antes de crearlo.
* **`crear-pokemon.html`**:
    * **Función**: Define el formulario interactivo para que el usuario ingrese la información de su Pokémon.
    * **Contenido**: Campos de entrada para nombre, tipo, descripción, URL de imagen, etc. Botones para "Crear" y "Cancelar".
* **`crear-pokemon.css`**:
    * **Función**: Estilos para el formulario de creación.
    * **Estilo**: Probablemente incluye estilos para los campos de entrada, botones, mensajes de validación y el diseño general del formulario, asegurando una buena usabilidad en diferentes tamaños de pantalla.

---

## 📧 Contacto

Si tienes alguna pregunta, sugerencia o simplemente quieres contactarme, no dudes en enviar un correo electrónico a:

**EmanuelCompany@mail.com.ar** *(¡Recuerda reemplazar este correo electrónico con tu dirección real si la haces pública!)*

---

¡Gracias por visitar Mi Pokedex Personal! Espero que disfrutes explorando y creando.
