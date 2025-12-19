package com.sgturnos.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final Key jwtSecret;
    private final long jwtExpirationInMs = 3600000; // 1 hora

    public JwtTokenProvider(@Value("${jwt.secret}") String jwtSecretString) {
        // La clave se decodifica del String del archivo de propiedades a bytes
        // Esto requiere que el valor en application.properties sea una cadena Base64 válida
        try {
            byte[] secretBytes = Base64.getDecoder().decode(jwtSecretString);
            this.jwtSecret = Keys.hmacShaKeyFor(secretBytes);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("La clave secreta JWT en application.properties no es una cadena Base64 válida.", e);
        }
    }

    /**
     * Genera un token JWT para un usuario autenticado.
     * @param authentication el objeto de autenticación de Spring Security.
     * @return el token JWT generado.
     */
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationInMs);

        // Extraer el rol del usuario autenticado
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(auth -> auth.getAuthority())
                .orElse("Usuario");

        return Jwts.builder()
                .setSubject(username)
                .claim("rol", role)
                .setIssuedAt(new Date())
                .setExpiration(expireDate)
                .signWith(jwtSecret)
                .compact();
    }

    /**
     * Valida un token JWT.
     * @param token el token JWT a validar.
     * @return true si el token es válido, false en caso contrario.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(jwtSecret).build().parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            // Se puede agregar un logger para ver el tipo de error específico (ej. token expirado, firma inválida)
            return false;
        }
    }

    /**
     * Obtiene el nombre de usuario (subject) del token JWT.
     * @param token el token JWT.
     * @return el nombre de usuario del token.
     */
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }
}