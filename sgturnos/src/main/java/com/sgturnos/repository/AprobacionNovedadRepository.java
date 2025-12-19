package com.sgturnos.repository;

import com.sgturnos.model.AprobacionNovedad;
import com.sgturnos.model.Novedad;
import com.sgturnos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AprobacionNovedadRepository extends JpaRepository<AprobacionNovedad, Long> {
    
    List<AprobacionNovedad> findByNovedad(Novedad novedad);

    List<AprobacionNovedad> findByNovedad_IdNovedad(Long idNovedad);
    
    List<AprobacionNovedad> findByUsuarioAprobador(Usuario usuarioAprobador);
    
    List<AprobacionNovedad> findByUsuarioAprobadorAndEstadoAprobacion(Usuario usuarioAprobador, String estadoAprobacion);
    
    Optional<AprobacionNovedad> findByNovedadAndTipoAprobador(Novedad novedad, String tipoAprobador);
    
    long countByNovedadAndEstadoAprobacion(Novedad novedad, String estadoAprobacion);
}
