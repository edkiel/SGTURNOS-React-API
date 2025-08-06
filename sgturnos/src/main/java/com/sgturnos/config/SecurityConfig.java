package com.sgturnos.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.sgturnos.security.CustomLoginSuccessHandler;
import com.sgturnos.security.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private CustomLoginSuccessHandler successHandler;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CustomUserDetailsService userDetailsService() {
        return new CustomUserDetailsService();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder);
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
                    "/api/test", // <-- Aquí está el cambio
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