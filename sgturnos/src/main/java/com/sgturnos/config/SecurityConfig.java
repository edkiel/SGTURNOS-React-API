package com.sgturnos.config;

// Importaciones necesarias para la configuración de seguridad
import com.sgturnos.security.JwtAuthenticationFilter;
import com.sgturnos.security.CustomUserDetailsService;
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
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.Collections;

/**
 * Clase de configuración principal para la seguridad de la aplicación
 * @Configuration: Indica que es una clase de configuración de Spring
 * @EnableWebSecurity: Habilita la seguridad web de Spring Security
 * @EnableMethodSecurity: Habilita la seguridad a nivel de método (anotaciones @PreAuthorize, etc.)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Servicios necesarios para la autenticación
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Constructor que recibe las dependencias necesarias
     * No es necesario @Autowired ya que Spring lo hace automáticamente desde Spring 4.3
     */
    public SecurityConfig(
            CustomUserDetailsService customUserDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    /**
     * Configura el codificador de contraseñas
     * @return BCryptPasswordEncoder para el hash seguro de contraseñas
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configura el administrador de autenticación
     * @param authenticationConfiguration configuración de autenticación de Spring
     * @return AuthenticationManager que maneja el proceso de autenticación
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Configura la cadena de filtros de seguridad
     * Define las reglas de seguridad y el comportamiento de la aplicación
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Configura la cadena de seguridad
        http
            // Deshabilita CSRF ya que usamos tokens JWT
            .csrf(AbstractHttpConfigurer::disable)
            // Configura CORS para permitir peticiones del frontend
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Configura el manejo de sesiones como STATELESS (sin estado, usando JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Configura las reglas de autorización
            .authorizeHttpRequests(auth -> auth
                // Permite acceso público a las rutas de autenticación y registro
                .requestMatchers("/api/auth/**").permitAll()
                // CUIDADO: Permite el acceso a TODAS las operaciones de usuarios (crear, listar). Esto es inseguro para production.
                .requestMatchers("/api/usuarios/**").permitAll()
                // Permitimos temporalmente acceso público a los endpoints de mallas para pruebas locales.
                .requestMatchers("/api/mallas/**").permitAll()
                // Todas las demás rutas requieren autenticación
                .anyRequest().authenticated()
            )
            // Configura el proveedor de autenticación
            .authenticationProvider(authenticationProvider())
            // Añade el filtro JWT antes del filtro de autenticación estándar
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configura el proveedor de autenticación que usa el servicio de detalles de usuario
     * y el codificador de contraseñas
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Configura CORS (Cross-Origin Resource Sharing)
     * Permite peticiones desde el frontend que se ejecuta en un dominio diferente
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permite peticiones solo desde el frontend en desarrollo
        configuration.setAllowedOrigins(Collections.singletonList("http://localhost:5173"));
        // Permite métodos HTTP específicos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Permite encabezados específicos
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        // Permite credenciales (cookies, encabezados de autorización)
        configuration.setAllowCredentials(true);
        // Expone el encabezado de autorización al frontend
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Aplica la configuración CORS a todas las rutas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}