package com.sgturnos.repository;

import java.util.Optional; // Ahora importa la clase Usuario

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sgturnos.model.Usuario;

@Repository
public interface UserRepository extends JpaRepository<Usuario, Long> {

    // Método para buscar un usuario por su email.
    // Asegúrate de que el nombre del método sea findByCorreo si tu columna de email es 'correo'.
    Optional<Usuario> findByCorreo(String correo);
}
