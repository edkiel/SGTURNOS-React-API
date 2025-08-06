package com.sgturnos.service;

import com.sgturnos.model.Usuario;
import com.sgturnos.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Service
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    @Override
    public Usuario findById(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    @Override
public Usuario save(Usuario usuario) {
    if (usuario.getCorreo() != null) {
        Usuario usuarioExistente = usuarioRepository.findByCorreo(usuario.getCorreo()).orElse(null);
        if (usuarioExistente != null) {
            // Solo encriptar si la contraseña fue modificada y no ya cifrada
            if (!usuario.getContrasena().equals(usuarioExistente.getContrasena())) {
                usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
            } else {
                usuario.setContrasena(usuarioExistente.getContrasena());
            }
        } else {
            usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        }
    } else {
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
    }

    return usuarioRepository.save(usuario);
}

@Override
    public void deleteByCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));
        usuarioRepository.delete(usuario);
    }
    
    @Override
public Usuario findByCorreo(String correo) {
    return usuarioRepository.findByCorreo(correo)
      .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));
}

    @Override
public void deleteById(Long id) {
    usuarioRepository.deleteById(id);
    
    
    
}
}