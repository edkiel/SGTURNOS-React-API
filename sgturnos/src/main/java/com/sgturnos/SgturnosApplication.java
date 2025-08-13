package com.sgturnos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// La anotación @SpringBootApplication combina @Configuration, @EnableAutoConfiguration y @ComponentScan.
// Escanea automáticamente los componentes en el paquete 'com.sgturnos' y sus subpaquetes.
@SpringBootApplication
public class SgturnosApplication {

    public static void main(String[] args) {
        // Inicia la aplicación de Spring Boot.
        SpringApplication.run(SgturnosApplication.class, args);
    }
}
