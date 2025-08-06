package com.sgturnos.service;

import com.sgturnos.model.Usuario;

import java.util.List;

public interface UsuarioService {
    List<Usuario> findAll();
    Usuario findById(Long id);
    Usuario save(Usuario usuario);
    void deleteById(Long id);
    void deleteByCorreo(String correo);
    Usuario findByCorreo(String correo);
}