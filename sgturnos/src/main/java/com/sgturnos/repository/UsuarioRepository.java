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

    // Buscar usuarios por idRol (o por Rol.rol si fuera necesario)
    java.util.List<com.sgturnos.model.Usuario> findAllByRol_IdRol(String idRol);

    java.util.List<com.sgturnos.model.Usuario> findAllByRol_RolIgnoreCase(String rolName);

    // Métodos para desactivación de usuarios
    /**
     * Obtiene todos los usuarios activos en el sistema
     */
    java.util.List<com.sgturnos.model.Usuario> findAllByActivoTrue();

    /**
     * Obtiene todos los usuarios desactivados
     */
    java.util.List<com.sgturnos.model.Usuario> findAllByActivoFalse();

    /**
     * Obtiene un usuario activo por correo (para login)
     */
    Optional<Usuario> findByCorreoAndActivoTrue(String correo);
}