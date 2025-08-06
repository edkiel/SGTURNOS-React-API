package com.sgturnos.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "turno")
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTurno;

    private LocalDate fechaIni;
    private LocalDate fechaFin;

  //  @ManyToOne
    //@JoinColumn(name = "id_horario")
   // private Horario horario;

     
    @ManyToOne
    @JoinColumn(name = "Id_usuario")
    private Usuario usuario;

    // Getters y Setters
    public Long getIdTurno() {
        return idTurno;
    }

    public void setIdTurno(Long idTurno) {
        this.idTurno = idTurno;
    }

    public LocalDate getFechaIni() {
        return fechaIni;
    }

    public void setFechaIni(LocalDate fechaIni) {
        this.fechaIni = fechaIni;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

  //  public Horario getHorario() {
   //     return horario;
   // }

   // public void setHorario(Horario horario) {
    //    this.horario = horario;
    //}
    
      public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}