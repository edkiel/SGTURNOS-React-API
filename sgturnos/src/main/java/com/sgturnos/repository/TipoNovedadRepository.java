package com.sgturnos.repository;

import com.sgturnos.model.TipoNovedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio para gestionar tipos de novedades
 */
@Repository
public interface TipoNovedadRepository extends JpaRepository<TipoNovedad, Long> {
    TipoNovedad findByNombre(String nombre);
}
