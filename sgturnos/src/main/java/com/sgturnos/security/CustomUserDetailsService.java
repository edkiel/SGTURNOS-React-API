package com.sgturnos.security;

import com.sgturnos.model.Usuario;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import java.util.*;
import org.springframework.security.core.GrantedAuthority;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getRol().toUpperCase())
        );
        
         // 🔍 Aquí agregamos el log para ver el rol al iniciar sesión
    System.out.println("Login exitoso con roles: " + authorities);


        return org.springframework.security.core.userdetails.User
        .withUsername(usuario.getCorreo())
        .password(usuario.getContrasena())
        .authorities(authorities)
        .build();
    }
}
