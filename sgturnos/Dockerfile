# Imagen base con Java 17
FROM eclipse-temurin:17-jdk-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el JAR generado por Maven
COPY target/sgturnos-0.0.1-SNAPSHOT.jar app.jar

# Puerto que expone Spring Boot
EXPOSE 8085

# Comando para arrancar la aplicación
ENTRYPOINT ["java","-jar","/app/app.jar"]