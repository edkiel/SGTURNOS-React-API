package com.sgturnos.config;

import com.sgturnos.security.CustomLoginSuccessHandler;
import com.sgturnos.security.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private CustomLoginSuccessHandler successHandler;
    
    
    @Bean
    public CustomUserDetailsService userDetailsService() {
        return new CustomUserDetailsService();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authenticationProvider(daoAuthenticationProvider())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
            "/login",
            "/login?error",
            "/login?logout",
            "/logout",
            "/dashboard_usuario",
            "/dashboard_admin",
            "/error_rol",
            "/novedades",
            "/planificar_turnos",
            "/registro",
            "/lista",
            "/malla_turnos",
            "/turno",
            "/form",
            "/recuperar",
            "/estilos.css",
            "/animac.css",
            "/css/**",
            "/js/**",
            "/test/**",
            "/static/**",
            "/images/**"
                 ).permitAll()
                .requestMatchers("/admin/dashboard_admin").hasRole("ADMINISTRADOR")
                .requestMatchers("/usuario/dashboard_usuario").hasAnyRole("AUXILIAR", "ENFERMERO", "MEDICO", "TERAPIA")
                .anyRequest().authenticated()
            )
             .formLogin(form -> form
        .loginPage("/login")
        .loginProcessingUrl("/login")
        .usernameParameter("username")
        .passwordParameter("password")
        .successHandler(successHandler)
        .failureUrl("/login?error")
        .permitAll()
    )
    .logout(logout -> logout
        .logoutUrl("/logout")
        .logoutSuccessUrl("/login?logout")
        .invalidateHttpSession(true)
        .deleteCookies("JSESSIONID")
        .permitAll()
    );

        return http.build();
    }
}