//package com.sgturnos.config;

//import com.sgturnos.model.Usuario;
//import com.sgturnos.repository.UsuarioRepository;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.stereotype.Component;
//import java.util.List;

//@Component
//public class PasswordMigrationRunner implements CommandLineRunner {

   // private final UsuarioRepository usuarioRepository;
   // private final BCryptPasswordEncoder passwordEncoder;

    //public PasswordMigrationRunner(UsuarioRepository usuarioRepository) {
     //   this.usuarioRepository = usuarioRepository;
      //  this.passwordEncoder = new BCryptPasswordEncoder();
    //}

    //@Override
    //public void run(String... args) throws Exception {
     //   List<Usuario> usuarios = usuarioRepository.findAll();

       // for (Usuario usuario : usuarios) {
           // String passPlano = usuario.getContrasena();

           // if (!passPlano.startsWith("$2a$")) { // evita volver a encriptar
              //  String hash = passwordEncoder.encode(passPlano);
              //  usuario.setContrasena(hash);
               // usuarioRepository.save(usuario);
               // System.out.println("🔒 Contraseña actualizada para usuario: " + usuario.getCorreo());
           // }
        //}

      //  System.out.println("✅ Migración de contraseñas completada.");
    //}
//}