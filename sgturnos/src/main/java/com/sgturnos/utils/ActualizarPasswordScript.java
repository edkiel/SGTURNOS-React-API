//package com.sgturnos.utils;

//import com.sgturnos.model.Usuario;
//import com.sgturnos.repository.UsuarioRepository;
//import jakarta.annotation.PostConstruct;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.crypto.password.PasswordEncoder;

//import java.util.List;

//@Configuration
//public class ActualizarPasswordScript {

    //@Autowired
    //private UsuarioRepository usuarioRepository;

    //@Autowired
    //private PasswordEncoder passwordEncoder;

    //@PostConstruct
    //public void actualizarPasswords() {
       // List<Usuario> usuarios = usuarioRepository.findAll();
       // for (Usuario u : usuarios) {
        //   if (!u.getContrasena().startsWith("$2a$")) {
    //u.setContrasena(passwordEncoder.encode(u.getContrasena()));
    //usuarioRepository.save(u);
    //System.out.println("✅ Contraseña actualizada para usuario: " + u.getCorreo());
//} else {
   // System.out.println("⚠️ Usuario ya tiene contraseña encriptada: " + u.getCorreo());
//}
        //}
   // }
//}