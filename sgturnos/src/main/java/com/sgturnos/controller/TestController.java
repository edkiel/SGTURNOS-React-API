package com.sgturnos.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public String test() {
        return "¡Hola desde la API de SGTurnos! El backend está funcionando.";
    }
}

