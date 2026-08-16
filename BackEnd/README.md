# ⚙️ Civis RJ - Backend API (Spring Boot)

API REST desenvolvida em **Java 17** e **Spring Boot 3** para gerenciar a persistência de auditorias de contratos públicos e intermediar o processamento de documentos com a plataforma **Nutrient DWS**.

---

## 🛠️ Stack Tecnológica

* **Linguagem:** Java 17+
* **Framework:** Spring Boot 3.3.x
* **Módulos:**
  * Spring Web (APIs REST e manipulação de Multipart/Uploads)
  * Spring Data JPA (Camada de persistência)
  * Spring Validation
* **Banco de Dados:** PostgreSQL (Supabase)
* **Driver JDBC:** PostgreSQL JDBC Driver + HikariCP
* **Build Tool:** Maven

---

## 📦 Estrutura de Pacotes

src/main/java/com/civisanalytics/
├── CivisAnalyticsApplication.java  # Classe principal de inicialização
├── config/
│   └── WebConfig.java             # Configuração de CORS (portas 5173/3000)
└── audit/
    ├── AuditController.java        # Endpoints REST (/api/audits)
    ├── AuditService.java           # Regras de negócio, I/O e persistência
    ├── AuditStatus.java            # Enum com estados da auditoria
    ├── ContractAudit.java          # Entidade JPA (tabela contract_audits)
    ├── ContractAuditRepository.java# Repositório JPA de acesso ao banco
    ├── NutrientDwsMockService.java # Integração/Mock da Nutrient DWS API
    └── dto/
        └── AuditUploadResponse.java# DTO de resposta das operações

---

## 🚀 Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/audits/upload` | Recebe `id_obra` (Text) e `file` (Multipart PDF), armazena e dispara extração |
| `GET` | `/api/audits/obra/{idObra}` | Lista todas as auditorias e documentos vinculados a uma obra |
| `PATCH` | `/api/audits/{id}/approve` | Atualiza o status da auditoria para `APPROVED` após validação |

---

## 🔧 Configuração e Execução

1. Certifique-se de que a tabela `contract_audits` existe no banco PostgreSQL.
2. Edite `src/main/resources/application.properties` com suas credenciais:

```properties
spring.datasource.url=jdbc:postgresql://db.SEU_PROJETO.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA_DO_BANCO
spring.jpa.hibernate.ddl-auto=update

spring.servlet.multipart.max-file-size=25MB
spring.servlet.multipart.max-request-size=25MB
app.upload-dir=./uploads
server.port=8080