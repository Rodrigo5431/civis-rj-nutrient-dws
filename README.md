# 🏛️ Civis RJ - Centro de Comando Preditivo

![Status](https://img.shields.io/badge/Status-Hackathon_MVP-blue)
![Stack](https://img.shields.io/badge/Stack-React_%7C_Spring_Boot_%7C_Supabase-cyan)
![Nutrient](https://img.shields.io/badge/Integração-Nutrient_DWS-emerald)

O **Civis RJ** é uma plataforma de inteligência preditiva voltada para a gestão e fiscalização de obras públicas. Desenvolvido para atuar como um centro de comando operacional, o sistema monitora obras em tempo real e realiza a **auditoria automatizada de editais e contratos** para prevenir inconformidades, atrasos e desperdício de recursos públicos.

---

## 🚀 O Desafio e a Solução

A auditoria manual de contratos em licitações e execuções de obras públicas consome semanas de análise técnica e é altamente suscetível a erros humanos ou omissões de cláusulas críticas.

Neste MVP, integramos a **Nutrient DWS Data Extraction API** para automatizar esse fluxo de ponta a ponta:

1. **Upload do Documento:** O auditor seleciona a obra correspondente e envia o edital/contrato em formato PDF.
2. **Processamento via Backend:** A API em Spring Boot recebe o arquivo, armazena os metadados no PostgreSQL (Supabase) e despacha o arquivo para extração.
3. **Extração Inteligente:** O serviço da Nutrient DWS analisa o documento e extrai dados vitais estruturados (valores contratuais, prazos e metadados de execução).
4. **Visualização e Auditoria:** O frontend exibe a interface com visualizador do documento e permite a validação e assinatura rápida pelo auditor.

---

## 🛠️ Arquitetura e Tecnologias

### **Frontend**
* **React 18** com **TypeScript**
* **Vite**
* **Tailwind CSS** + **Shadcn UI**
* **Lucide React** (Ícones)

### **Backend**
* **Java 17+**
* **Spring Boot 3** (Spring Web, Spring Data JPA, Spring Validation)
* **PostgreSQL** hospedado no **Supabase**
* **HikariCP** (Connection Pooling)

### **Serviços & Integrações**
* **Nutrient DWS API** (Extração de dados e visualização de documentos)
* **Supabase** (Banco de dados relacional e infraestrutura em nuvem)

---

## 📁 Estrutura do Monorepo

civis-rj/
├── backend/                  # API REST em Spring Boot
│   ├── src/main/java/        # Controllers, Services, Repositories e Entidades
│   ├── src/main/resources/   # application.properties
│   └── pom.xml               # Dependências Maven
├── frontend/                 # Aplicação Web em React + Vite
│   ├── src/components/civis/ # Dashboards, Mapas e Telas de Auditoria
│   ├── src/routes/           # Rotas da aplicação
│   └── package.json          # Dependências Node
├── .gitignore
└── README.md

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
* **Java 17+** e **Maven** instalados
* **Node.js 18+** e **npm** (ou yarn/pnpm)
* Instância do **PostgreSQL** (ou projeto no **Supabase**)

---

### 1. Configuração do Banco de Dados
Execute o script de criação da tabela de auditoria no seu banco PostgreSQL:

CREATE TABLE IF NOT EXISTS contract_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_obra TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_EXTRACTION',
    dws_document_id VARCHAR(255),
    dws_viewer_url VARCHAR(500),
    extracted_data TEXT,
    auditor_notes TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_contract_audits_obra FOREIGN KEY (id_obra) REFERENCES obras(id_obra)
);

CREATE INDEX IF NOT EXISTS idx_contract_audits_id_obra ON contract_audits(id_obra);
CREATE INDEX IF NOT EXISTS idx_contract_audits_status ON contract_audits(status);

---

### 2. Executando o Backend (Spring Boot)

1. Navegue até a pasta do backend:
   cd backend

2. Configure suas credenciais de banco no arquivo `src/main/resources/application.properties`:
   spring.datasource.url=jdbc:postgresql://db.SEU_PROJETO.supabase.co:5432/postgres
   spring.datasource.username=postgres
   spring.datasource.password=SUA_SENHA_DO_BANCO
   spring.jpa.hibernate.ddl-auto=update

3. Inicie o servidor:
   mvn spring-boot:run
   
   *O backend estará rodando em `http://localhost:8080`.*

---

### 3. Executando o Frontend (React)

1. Em outro terminal, navegue até a pasta do frontend:
   cd frontend

2. Crie um arquivo `.env` na raiz do frontend com o endpoint da API:
   VITE_API_BASE_URL=http://localhost:8080/api/audits

3. Instale as dependências e inicialize o servidor de desenvolvimento:
   npm install
   npm run dev
   
   *Acesse a interface no navegador através de `http://localhost:5173`.*

---

## 👥 Desenvolvido para o Hackathon DevNetwork
Projeto concebido para modernizar e acelerar a fiscalização de obras e contratos públicos com uso de Inteligência Artificial e processamento de documentos.