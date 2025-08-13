package com.sgturnos.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

/**
 * Componente que maneja la creaci\u00f3n, validaci\u00f3n y extracci\u00f3n de tokens JWT.
 */
@Component
public class JwtTokenProvider {

    // Clave secreta para firmar los tokens. DEBES cambiarla por una m\u00e1s segura en un entorno de producci\u00f3n.
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    // Tiempo de expiraci\u00f3n del token (24 horas en milisegundos).
    private final long jwtExpirationInMs = 86400000L;

    /**
     * Genera un token JWT a partir de la informaci\u00f3n de autenticaci\u00f3n del usuario.
     * @param authentication Objeto de autenticaci\u00f3n.
     * @return El token JWT como String.
     */
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("authorities", userDetails.getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .collect(Collectors.toList()))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Obtiene el correo electr\u00f3nico (nombre de usuario) a partir de un token JWT.
     * @param token El token JWT.
     * @return El correo electr\u00f3nico del usuario.
     */
    public String getCorreoFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * Valida la integridad de un token JWT.
     * @param token El token JWT a validar.
     * @return true si el token es v\u00e1lido, false en caso contrario.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            // Log de error: firma no v\u00e1lida.
        } catch (MalformedJwtException ex) {
            // Log de error: token mal formado.
        } catch (ExpiredJwtException ex) {
            // Log de error: token expirado.
        } catch (UnsupportedJwtException ex) {
            // Log de error: token no soportado.
        } catch (IllegalArgumentException ex) {
            // Log de error: el token es una cadena vac\u00eda.
        }
        return false;
    }
}
