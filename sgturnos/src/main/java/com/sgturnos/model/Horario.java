//package com.sgturnos.sgturnos.model;

//import com.sgturnos.model.Turno;
//import javax.persistence.*;
//import java.time.LocalTime;
//import java.util.List;

//@Entity
//@Table(name = "horario")
//public class Horario {

  //  @Id
 //   @Column(name = "id_horario", length = 10)
  //  private String idHorario;

 //   @Column(name = "hora_inicio")
 //  private LocalTime horaInicio;

  //  @Column(name = "hora_fin")
  //  private LocalTime horaFin;

    // Relación con Turno (uno a muchos)
  //  @OneToMany(mappedBy = "horario")
  //  private List<Turno> turnos;

    // Getters y Setters
  //  public String getIdHorario() {
  //      return idHorario;
  //  }

  //  public void setIdHorario(String idHorario) {
  //      this.idHorario = idHorario;
 //   }

  //  public LocalTime getHoraInicio() {
    //    return horaInicio;
 //   }

   // public void setHoraInicio(LocalTime horaInicio) {
    //    this.horaInicio = horaInicio;
   // }

  //  public LocalTime getHoraFin() {
      //  return horaFin;
    //}

   // public void setHoraFin(LocalTime horaFin) {
    //    this.horaFin = horaFin;
  //  }

  //  public List<Turno> getTurnos() {
   //     return turnos;
  //  }

   // public void setTurnos(List<Turno> turnos) {
   //     this.turnos = turnos;
   // }
//}