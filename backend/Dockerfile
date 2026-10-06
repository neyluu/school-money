FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline -B -X

COPY src ./src

CMD ["./mvnw", "spring-boot:run"]
