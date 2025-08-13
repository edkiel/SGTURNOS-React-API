package com.sgturnos.security;

import com.sgturnos.model.Rol;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        // Busca el usuario por su correo electrónico
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));

        // Construye un UserDetails de Spring Security con los roles del usuario
    return new User(usuario.getCorreo(), usuario.getContrasena(), mapRolToAuthorities(usuario.getRol()));
    }

    // Método para mapear el conjunto de roles a una colección de GrantedAuthority
    // Método para mapear un solo rol a una colección de GrantedAuthority
    private Collection<GrantedAuthority> mapRolToAuthorities(Rol rol) {
        return List.of(new SimpleGrantedAuthority(rol.getNombre()));
    }
}
