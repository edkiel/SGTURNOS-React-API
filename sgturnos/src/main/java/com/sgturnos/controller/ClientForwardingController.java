package com.sgturnos.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// Este controlador asegura que las rutas del cliente (React)
// sean manejadas por el archivo index.html.
@Controller
public class ClientForwardingController {

    // Este patrón redirige cualquier ruta que no sea un archivo estático
    // al front-end de React. La anotación @GetMapping con "/{path:.*}"
    // es la forma más robusta de manejar el enrutamiento del lado del cliente
    // en una aplicación Spring Boot moderna.
    @GetMapping(value = "/{path:.*}")
    public String redirect() {
        // Redirigimos al archivo raíz 'index.html'
        // que debe estar en el directorio `src/main/resources/static/`.
        return "forward:/";
    }
}
