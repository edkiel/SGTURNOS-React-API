package com.sgturnos.repository;

import com.sgturnos.model.AlertaMalla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertaMallaRepository extends JpaRepository<AlertaMalla, Long> {
    
    List<AlertaMalla> findByEstadoOrderByFechaCreacionDesc(String estado);
    
    List<AlertaMalla> findByMesAfectadoAndAnioAfectadoAndEstado(Integer mes, Integer anio, String estado);
    
    Long countByEstado(String estado);
}
