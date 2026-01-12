# Imagen base con Java 21
FROM eclipse-temurin:21-jdk-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el JAR generado por Maven
COPY target/sgturnos-0.0.1-SNAPSHOT.jar app.jar

# Puerto que expone Spring Boot (Render asigna dinámicamente)
EXPOSE 8085

# Comando para arrancar la aplicación con configuración de producción
ENTRYPOINT ["java","-Dspring.profiles.active=prod","-jar","/app/app.jar"]