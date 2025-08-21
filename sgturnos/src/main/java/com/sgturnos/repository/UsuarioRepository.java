package com.sgturnos.repository;

import com.sgturnos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByCorreo(String correo);
    
    // Método para buscar usuario por correo (que usaremos como username)
    default Optional<Usuario> findByUsername(String username) {
        return findByCorreo(username);
    }
}