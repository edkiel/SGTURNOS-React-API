package com.sgturnos.repository;

import com.sgturnos.model.Novedad;
import com.sgturnos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para gestionar novedades
 */
@Repository
public interface NovedadRepository extends JpaRepository<Novedad, Long> {
    /**
     * Obtiene todas las novedades de un usuario
     */
    List<Novedad> findByUsuario(Usuario usuario);

    /**
     * Obtiene todas las novedades por estado
     */
    List<Novedad> findByEstado(String estado);

    /**
     * Obtiene todas las novedades de un usuario con un estado específico
     */
    List<Novedad> findByUsuarioAndEstado(Usuario usuario, String estado);

    /**
     * Obtiene todas las novedades pendientes por aprobar
     */
    List<Novedad> findByEstadoOrderByFechaSolicitudAsc(String estado);

    /**
     * Obtiene novedades pendientes de aprobación por Jefe
     */
    List<Novedad> findByAprobacionJefeAndEstado(Boolean aprobacionJefe, String estado);

    /**
     * Obtiene novedades pendientes de aprobación por Operaciones
     */
    List<Novedad> findByAprobacionJefeTrueAndAprobacionOperacionesFalseAndEstado(String estado);

    /**
     * Obtiene novedades pendientes de aprobación por RRHH
     */
    List<Novedad> findByAprobacionJefeTrueAndAprobacionOperacionesTrueAndAprobacionRrhhFalseAndEstado(String estado);
}
