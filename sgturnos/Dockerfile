# Etapa de build: compila el JAR con Maven (Java 21)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -DskipTests clean package

# Etapa final: imagen ligera solo con el JAR
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copiamos el artefacto generado en la etapa de build
COPY --from=build /app/target/sgturnos-0.0.1-SNAPSHOT.jar app.jar

# Render usa PORT, pero exponemos el puerto por claridad
EXPOSE 8085

# Arranque con perfil de producción
ENTRYPOINT ["java","-Dspring.profiles.active=prod","-jar","/app/app.jar"]