package com.sgturnos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.sgturnos.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    // Inyectamos PasswordEncoder en lugar de crearlo aquí
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(CustomUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/sgturnos/login").permitAll()
                .requestMatchers("/sgturnos/register").permitAll()
                .anyRequest().authenticated()
            );

        http.formLogin(formLogin -> formLogin
            .loginPage("/sgturnos/login")
            .loginProcessingUrl("/sgturnos/login")
            .usernameParameter("username")
            .passwordParameter("password")
            .defaultSuccessUrl("/sgturnos/admin/dashboard_admin")
        );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        // Usamos el passwordEncoder que inyectamos
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }
}
