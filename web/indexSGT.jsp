<%-- 
    Document   : index
    Created on : 11/05/2025, 10:45:54 p. m.
    Author     : Admin
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
  <meta name="description" content=""/>
  <meta name="author" content=""/>
  <title>Registro de Usuarios Digi-Leyed Sistema de Gestión de Turnos</title>

  <!-- Bootstrap 5 desde CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

   
  <!-- Bootstrap 5 desde CDN (versión más reciente, funcional y recomendada) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Ícono del sitio -->
<link rel="icon" href="assets/images/favicon.ico" type="image/x-icon">

<!-- Font Awesome (íconos modernos) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<!-- Tus estilos personalizados (usa solo una forma) -->
<link rel="stylesheet" type="text/css" href="estilos.css">

<!-- Otros estilos si realmente los estás usando -->
<link href="assets/css/animate.css" rel="stylesheet" type="text/css"/>
<link href="assets/css/icons.css" rel="stylesheet" type="text/css"/>
<link href="assets/css/app-style.css" rel="stylesheet"/>
  
</head>

<body class="bg-theme bg-theme2 pace-done">
<!-- start loader -->
   <div id="pageloader-overlay" class="visible incoming"><div class="loader-wrapper-outer"><div class="loader-wrapper-inner" ><div class="loader"></div></div></div></div>
   <!-- end loader -->

<!-- Start wrapper-->
 <div id="wrapper">

	<div class="card card-authentication1 mx-auto my-4">
		<div class="card-body">
		 <iv class="card-content p-2">
		 	<div class="text-center">
		 		<img src="images/logosinfondo_SGT-naranja1.png" alt="Logo Turnos" width="100">
                                
		 	</div>
		  <div class="card-title text-uppercase text-center py-3">Registro de Usuarios</div>
 
<form action="Registrar" method="post">
    
          <div class="form-group">
            <label for="Id_usuario">Id Usuario</label>
              <div class="position-relative has-icon-right">
                <input 
                    type="text" 
                    id="Id_usuario" 
                    name="Id_usuario"
                    class="form-control input-shadow" placeholder="Ingrese Número de documento" required>
                <div class="form-control-position">
                <i class="fas fa-user"></i>
                </div>
              </div>
           </div>
      
    <div class="form-group">
  <label for="Primer_nombre">Primer Nombre</label>
  <div class="position-relative has-icon-right">
    <input 
      type="text" 
      id="Primer_nombre" 
      name="Primer_nombre"
      class="form-control input-shadow" placeholder="Ingrese Primer Nombre" required 
      autocomplete="given-name">
    <div class="form-control-position">
      <i class="fas fa-user"></i>
    </div>
  </div>
 </div>  
      
        <div class="form-group">
  <label for="Segundo_nombre">Segundo Nombre</label>
  <div class="position-relative has-icon-right">
    <input 
      type="text" 
      id="Segundo_nombre" 
      name="Segundo_nombre"
      class="form-control input-shadow" 
      placeholder="Ingrese Segundo Nombre" 
      autocomplete="given-name">
    <div class="form-control-position">
      <i class="fas fa-user"></i>
    </div>
  </div>
 </div>
    
          <div class="form-group">
  <label for="Primer_apellido">Primer Apellido</label>
  <div class="position-relative has-icon-right">
    <input 
      type="text" 
      id="Primer_apellido" 
      name="Primer_apellido"
      class="form-control input-shadow" 
      placeholder="Ingrese Primer apellido" 
      required 
      autocomplete="given-name">
    <div class="form-control-position">
      <i class="fas fa-user"></i>
    </div>
  </div>
     </div>
    
            <div class="form-group">
  <label for="Segundo_apellido">Segundo Apellido</label>
  <div class="position-relative has-icon-right">
    <input 
      type="text" 
      id="Segundo_apellido" 
      name="Segundo_apellido"
      class="form-control input-shadow" placeholder="Ingrese Segundo apellido" 
      autocomplete="given-name">
    <div class="form-control-position">
      <i class="fas fa-user"></i>
    </div>
  </div>
     </div>
    
<div class="form-group">
  <label for="Cargo">Cargo</label>
  <div class="position-relative has-icon-right">
    <select 
      id="Cargo" 
      name="Rol"
      class="form-control input-shadow" 
      required>
      <option value="">Seleccione un cargo</option>
      <option value="Med03">Médico</option>
      <option value="Enf02">Enfermero</option>
      <option value="Ter04">Terapeuta</option>
      <option value="Aux01">Auxiliar</option>
    </select>
    <div class="form-control-position">
      <i class="fas fa-user"></i>
    </div>
  </div>
</div>
              
       <div class="form-group">
  <label for="correo">Correo</label>
  <div class="position-relative has-icon-right">
    <input 
      type="text" 
      id="correo" 
      name="Correo"
      class="form-control input-shadow" 
      placeholder="Ingrese el correo" required 
      autocomplete="given-name">
    <div class="form-control-position">
      <i class="fas fa-envelope"></i>
    </div>
  </div>
     </div>
    
	      
	<div class="form-group">
         <label for="Contrasena">Contraseña</label>
          <div class="position-relative has-icon-right">
           <input 
            type="password" 
            id="Contrasena" 
            name="Contrasena"
            class="form-control input-shadow" 
            placeholder="Ingrese Contraseña" 
            required 
            autocomplete="new-password">
         <div class="form-control-position">
       <i class="fas fa-lock" onclick="togglePassword()" style="cursor:pointer;"></i>
    </div>
  </div>
</div>
        </div>
		
       <div class="form-group centered-checkbox">
  <div class="icheck-material-white">
    <input 
      type="checkbox" 
      id="user-checkbox" 
      name="terminos" 
      value="aceptado" 
      checked />
    <label for="user-checkbox">Acepto los términos y condiciones</label>
  </div>
</div>
    
  
<button type="submit" class="btn btn-light waves-effect waves-light d-block mx-auto mt-3">
  Registrarse
</button>	
        <div class="form-container" style="padding-bottom: 2rem;">
  <!-- aquí va todo tu formulario -->
</div>
       
</form>
                  
      </div>
    </div>
 </div>
    
     <!--Start Back To Top Button-->
    <a href="javaScript:void();" class="back-to-top"><i class="fa fa-angle-double-up"></i> </a>
    <!--End Back To Top Button-->
	
	
	</div><!--wrapper-->
	
  <!-- Bootstrap core JavaScript-->
  <script src="assets/js/jquery.min.js"></script>
  <script src="assets/js/popper.min.js"></script>
  <script src="assets/js/bootstrap.min.js"></script>
	
  <!-- sidebar-menu js -->
  <script src="assets/js/sidebar-menu.js"></script>
  
  <!-- Custom scripts -->
  <script src="assets/js/app-script.js"></script>
      </body>
      
  </html>

