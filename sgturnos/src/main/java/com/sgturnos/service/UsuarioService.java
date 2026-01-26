package com.sgturnos.service;

import com.sgturnos.model.Usuario;
import com.sgturnos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestión de usuarios, incluyendo desactivación y reactivación.
 * Proporciona métodos para auditoría y control de acceso.
 */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    /**
     * Obtiene un usuario por ID (solo activos)
     */
    public Optional<Usuario> obtenerUsuarioActivo(Long idUsuario) {
        Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
        if (usuario.isPresent() && usuario.get().isActivo()) {
            return usuario;
        }
        return Optional.empty();
    }

    /**
     * Obtiene todos los usuarios activos en el sistema
     */
    public List<Usuario> obtenerUsuariosActivos() {
        return usuarioRepository.findAllByActivoTrue();
    }

    /**
     * Obtiene todos los usuarios desactivados
     */
    public List<Usuario> obtenerUsuariosDesactivados() {
        return usuarioRepository.findAllByActivoFalse();
    }

    /**
     * Desactiva un usuario de forma lógica (no elimina datos)
     * 
     * @param idUsuario ID del usuario a desactivar
     * @param usuarioDesactivador ID del usuario que desactiva (para auditoría)
     * @return Usuario actualizado
     * @throws IllegalArgumentException si el usuario no existe o ya está desactivado
     */
    @Transactional
    public Usuario desactivarUsuario(Long idUsuario, Long usuarioDesactivador) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + idUsuario));

        if (!usuario.isActivo()) {
            throw new IllegalArgumentException("El usuario ya está desactivado");
        }

        usuario.setActivo(false);
        usuario.setDesactivadoPor(usuarioDesactivador);
        usuario.setFechaDesactivacion(LocalDateTime.now());

        return usuarioRepository.save(usuario);
    }

    /**
     * Reactiva un usuario desactivado
     * 
     * @param idUsuario ID del usuario a reactivar
     * @return Usuario actualizado
     * @throws IllegalArgumentException si el usuario no existe o ya está activo
     */
    @Transactional
    public Usuario activarUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + idUsuario));

        if (usuario.isActivo()) {
            throw new IllegalArgumentException("El usuario ya está activo");
        }

        usuario.setActivo(true);
        usuario.setDesactivadoPor(null);
        usuario.setFechaDesactivacion(null);

        return usuarioRepository.save(usuario);
    }

    /**
     * Busca un usuario por correo (para login, solo activos)
     * 
     * @param correo Email del usuario
     * @return Usuario si existe y está activo
     */
    public Optional<Usuario> buscarUsuarioActivoPorCorreo(String correo) {
        return usuarioRepository.findByCorreoAndActivoTrue(correo);
    }

    /**
     * Obtiene un usuario sin validar estado activo (para validación)
     * 
     * @param correo Email del usuario
     * @return Usuario si existe
     */
    public Optional<Usuario> buscarUsuarioPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    /**
     * Obtiene todos los usuarios
     */
    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }

    /**
     * Guarda o actualiza un usuario
     */
    @Transactional
    public Usuario guardarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    /**
     * Obtiene un usuario por ID sin validar estado
     */
    public Optional<Usuario> obtenerUsuarioPorId(Long idUsuario) {
        return usuarioRepository.findById(idUsuario);
    }
}
