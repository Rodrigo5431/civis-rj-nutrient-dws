# 💻 Civis RJ - Frontend Dashboard (React + TypeScript)

Interface web interativa e centro de comando preditivo para acompanhamento de obras públicas, mapas operacionais e auditoria de contratos com a integração **Nutrient DWS**.

---

## 🛠️ Stack Tecnológica

* **Framework:** React 18
* **Linguagem:** TypeScript
* **Build Tool:** Vite
* **Estilização:** Tailwind CSS (Dark Mode nativo)
* **Componentes UI:** Shadcn UI (Tabs, Cards, Buttons, Inputs)
* **Ícones:** Lucide React
* **Comunicação:** Fetch API / REST

---

## 📂 Estrutura de Pastas

src/
├── components/
│   ├── ui/                    # Componentes base (Card, Tabs, etc.)
│   └── civis/
│       ├── Dashboard.tsx      # Dashboard central com sistema de abas
│       ├── ContractAuditor.tsx# Painel de upload e visualização Nutrient DWS
│       ├── MapaCivis.tsx      # Mapa de calor operacional (Lazy loaded)
│       ├── KpiCards.tsx       # Indicadores em tempo real
│       ├── Filtros.tsx        # Filtros de bairro, zona e risco
│       └── AuditoriaTable.tsx # Tabela detalhada de obras
├── hooks/
│   └── useObras.ts            # Hook customizado de consumo de dados
└── vite-env.d.ts              # Definições de tipagem das variáveis Vite

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz da pasta `frontend/`:

VITE_API_BASE_URL=http://localhost:8080/api/audits

---

## 🚀 Instalação e Execução

1. Instale as dependências:
npm install

2. Inicie o servidor de desenvolvimento:
npm run dev

3. Acesse a aplicação:
Abra http://localhost:5173 no seu navegador.