package com.sgturnos.service;

import com.sgturnos.model.Usuario;
import org.springframework.stereotype.Service;

/**
 * Servicio para verificar permisos basados en roles administrativos
 */
@Service
public class RolPermisosService {

    // Constantes de roles
    public static final String ROL_ADMIN = "Administrador";
    public static final String ROL_JEFE_INMEDIATO = "Jefe Inmediato";
    public static final String ROL_OPERACIONES_CLINICAS = "Operaciones Clínicas";
    public static final String ROL_RECURSOS_HUMANOS = "Recursos Humanos";
    public static final String ROL_USUARIO = "Usuario";

    /**
     * Verifica si el usuario puede revisar/aprobar mallas
     * Roles permitidos: JEFE_INMEDIATO, RECURSOS_HUMANOS, ADMIN
     */
    public boolean puedeRevisarMallas(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return false;
        }
        String rol = usuario.getRol().getRol();
        return ROL_JEFE_INMEDIATO.equals(rol) || 
               ROL_RECURSOS_HUMANOS.equals(rol) || 
               ROL_ADMIN.equals(rol);
    }

    /**
     * Verifica si el usuario puede crear/editar/publicar mallas
     * Roles permitidos: OPERACIONES_CLINICAS, ADMIN
     */
    public boolean puedeGestionarMallas(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return false;
        }
        String rol = usuario.getRol().getRol();
        return ROL_OPERACIONES_CLINICAS.equals(rol) || ROL_ADMIN.equals(rol);
    }

    /**
     * Verifica si el usuario puede publicar mallas
     * Solo después de aprobación de JEFE_INMEDIATO y RECURSOS_HUMANOS
     * Roles permitidos: OPERACIONES_CLINICAS, ADMIN
     */
    public boolean puedePublicarMallas(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return false;
        }
        String rol = usuario.getRol().getRol();
        return ROL_OPERACIONES_CLINICAS.equals(rol) || ROL_ADMIN.equals(rol);
    }

    /**
     * Verifica si el usuario puede revisar novedades para nómina
     * Roles permitidos: RECURSOS_HUMANOS, ADMIN
     */
    public boolean puedeRevisarNovedadesNomina(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return false;
        }
        String rol = usuario.getRol().getRol();
        return ROL_RECURSOS_HUMANOS.equals(rol) || ROL_ADMIN.equals(rol);
    }

    /**
     * Verifica si el usuario es Jefe Inmediato
     */
    public boolean esJefeInmediato(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return false;
        }
        return ROL_JEFE_INMEDIATO.equals(usuario.getRol().getRol());
    }

    /**
     * Verifica si el usuario es de Operaciones Clínicas
     */
    public boolean esOperacionesClinicas(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return false;
        }
        return ROL_OPERACIONES_CLINICAS.equals(usuario.getRol().getRol());
    }

    /**
     * Verifica si el usuario es de Recursos Humanos
     */
    public boolean esRecursosHumanos(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return false;
        }
        return ROL_RECURSOS_HUMANOS.equals(usuario.getRol().getRol());
    }

    /**
     * Verifica si el usuario es Administrador
     */
    public boolean esAdministrador(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return false;
        }
        return ROL_ADMIN.equals(usuario.getRol().getRol());
    }

    /**
     * Obtiene el nombre del rol del usuario
     */
    public String obtenerNombreRol(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null) {
            return "Desconocido";
        }
        return usuario.getRol().getRol();
    }

    /**
     * Verifica si el usuario tiene permisos administrativos (cualquier rol admin)
     */
    public boolean tienePermisosAdministrativos(Usuario usuario) {
        return esAdministrador(usuario) || 
               esJefeInmediato(usuario) || 
               esOperacionesClinicas(usuario) || 
               esRecursosHumanos(usuario);
    }
}
