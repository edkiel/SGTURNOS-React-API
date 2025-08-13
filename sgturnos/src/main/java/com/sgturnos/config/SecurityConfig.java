package com.sgturnos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.sgturnos.security.JwtAuthenticationFilter;
import com.sgturnos.security.JwtGenerator;
import com.sgturnos.security.CustomUserDetailsService;

import java.util.Arrays;
import java.util.Collections;

/**
 * Clase de configuraci\u00f3n de seguridad de Spring para JWT.
 * Define la cadena de filtros de seguridad, el gestor de autenticaci\u00f3n y los beans
 * del codificador de contrase\u00f1as y la autenticaci\u00f3n de usuarios.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Habilita la seguridad en los m\u00e9todos (por ejemplo, con @PreAuthorize)
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    /**
     * Define el bean para el filtro de autenticaci\u00f3n JWT.
     * Este filtro ser\u00e1 inyectado en la cadena de seguridad.
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtGenerator jwtGenerator, CustomUserDetailsService customUserDetailsService) {
        return new JwtAuthenticationFilter(jwtGenerator, customUserDetailsService);
    }

    /**
     * Define el bean para el codificador de contrase\u00f1as.
     * BCryptPasswordEncoder es una funci\u00f3n de hash de contrase\u00f1as fuerte.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Expone el AuthenticationManager como un bean.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Crea un DaoAuthenticationProvider que utiliza nuestro CustomUserDetailsService
     * y el PasswordEncoder para validar las credenciales de los usuarios.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Configura la cadena de filtros de seguridad HTTP.
     * Aqu\u00ed se integran el filtro JWT y las reglas de autorizaci\u00f3n.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtGenerator jwtGenerator) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Pol\u00edtica sin estado para JWT
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        )
                .authenticationProvider(authenticationProvider());

        // A\u00f1adimos el filtro JWT que se encargar\u00e1 de validar el token en cada petici\u00f3n
    http.addFilterBefore(jwtAuthenticationFilter(jwtGenerator, customUserDetailsService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configura CORS (Cross-Origin Resource Sharing).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Collections.singletonList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
