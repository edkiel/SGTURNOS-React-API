package com.sgturnos.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.sgturnos.model.Usuario;
import com.sgturnos.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Busca al usuario por correo, ya que en tu modelo de Usuario, el email es 'correo'.
        Usuario usuario = userRepository.findByCorreo(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + username));

        // Construye un objeto UserDetails de Spring Security usando los datos de tu objeto Usuario
        return org.springframework.security.core.userdetails.User
                .withUsername(usuario.getCorreo())
                .password(usuario.getContrasena())
                // Usamos getRol() de tu clase Rol para obtener el nombre del rol.
                .authorities("ROLE_" + usuario.getRol().getRol())
                .build();
    }
}
