package com.sgturnos.repository;

import com.sgturnos.model.CambioTurno;
import com.sgturnos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CambioTurnoRepository extends JpaRepository<CambioTurno, Long> {
    
    // Buscar todos los cambios de un usuario (como solicitante o compañero)
    @Query("SELECT c FROM CambioTurno c WHERE c.usuarioSolicitante.idUsuario = :idUsuario OR c.usuarioCompañero.idUsuario = :idUsuario ORDER BY c.fechaSolicitud DESC")
    List<CambioTurno> findByUsuario(@Param("idUsuario") Long idUsuario);
    
    // Buscar cambios donde el usuario es solicitante
    List<CambioTurno> findByUsuarioSolicitanteOrderByFechaSolicitudDesc(Usuario usuarioSolicitante);
    
    // Buscar cambios donde el usuario es compañero
    List<CambioTurno> findByUsuarioCompañeroOrderByFechaSolicitudDesc(Usuario usuarioCompañero);
    
    // Buscar cambios pendientes de aprobación del compañero para un usuario específico
    @Query("SELECT c FROM CambioTurno c WHERE c.usuarioCompañero.idUsuario = :idUsuario AND c.estado = 'PENDIENTE_COMPAÑERO'")
    List<CambioTurno> findPendientesParaCompañero(@Param("idUsuario") Long idUsuario);
    
    // Buscar cambios pendientes de aprobación administrativa
    @Query("SELECT c FROM CambioTurno c WHERE c.estado = 'PENDIENTE_ADMIN' AND c.aprobacionCompañero = true")
    List<CambioTurno> findPendientesAdmin();
    
    // Buscar cambios pendientes de aprobación del Jefe (solo requiere aprobación del compañero)
    @Query("SELECT c FROM CambioTurno c WHERE c.estado = 'PENDIENTE_ADMIN' AND c.aprobacionCompañero = true AND c.aprobacionJefe = false ORDER BY c.fechaSolicitud")
    List<CambioTurno> findPendientesJefe();
    
    // Buscar cambios pendientes de aprobación de Operaciones Clínicas (requiere Jefe ya aprobado)
    @Query("SELECT c FROM CambioTurno c WHERE c.estado = 'PENDIENTE_ADMIN' AND c.aprobacionJefe = true AND c.aprobacionOperaciones = false ORDER BY c.fechaSolicitud")
    List<CambioTurno> findPendientesOperaciones();
    
    // Buscar cambios pendientes de aprobación de RRHH (requiere Operaciones ya aprobado)
    @Query("SELECT c FROM CambioTurno c WHERE c.estado = 'PENDIENTE_ADMIN' AND c.aprobacionOperaciones = true AND c.aprobacionRrhh = false ORDER BY c.fechaSolicitud")
    List<CambioTurno> findPendientesRrhh();
    
    // Buscar cambios aprobados pero no aplicados a la malla
    @Query("SELECT c FROM CambioTurno c WHERE c.estado = 'APROBADA' AND c.aplicadaAMalla = false")
    List<CambioTurno> findAprobadosPendientesAplicar();
}
