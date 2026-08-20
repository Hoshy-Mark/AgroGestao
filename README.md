# AgroGestão

[![License: MIT](https://img.shields.io/badge/license-MIT-4caf7d)](./LICENSE)

Simulador de gestão agroindustrial — o jogador herda uma pequena propriedade rural inexperiente e aprende a administrá-la enquanto a administra. Documento de design completo em [docs/GDD.md](./docs/GDD.md).

> Realismo de decisão, não realismo burocrático. Ver [docs/GDD.md#22](./docs/GDD.md#22-realismo-e-prioridades-de-escopo).

## Status

**Fase 1 — vertical slice** (ver [roadmap](./docs/GDD.md#25-roadmap-de-desenvolvimento-e-prioridades)) em andamento. A [Domain Bible](./docs/DOMAIN_BIBLE.md) está preenchida com regras reais (fontes citadas por seção), e o `MotorPostura` (`packages/domain`) usa esses números: curva de postura por idade/linhagem, consumo por estágio do lote, mortalidade, sazonalidade de preço, custo de mão de obra, Funrural sobre a receita.

A API (`apps/api`) persiste `Empresa` → `UnidadeNegocio` → `Lote`, mais `Fornecedor`, `Cliente`, `Contrato`, `HistoricoProducao` e `DocumentoFiscal`, via Prisma. `POST /lotes/:id/avancar-dia` roda o `MotorPostura` de verdade: preço de ração vem do `Fornecedor` escolhido pela unidade, preço de venda vem do `Contrato` ativo — cada um cai num valor de referência só se o jogador ainda não decidiu. Cada tick grava um `HistoricoProducao` (base do DRE) e emite `DocumentoFiscal`s de compra/venda (trilha de auditoria, Domain Bible §17-18) — a numeração sequencial por tipo é persistida no Postgres, diferente do `NumeradorDocumentoFiscal` em memória do `packages/domain` (que o próprio módulo documenta como não sobrevivendo a restart). `PrismaService` conecta sob demanda (não trava o boot se o banco cair).

**Sobre o `.env` da API:** `main.ts` carrega `apps/api/.env` via `dotenv/config` — sem isso, `nest start`/`node dist/main.js` não leem o arquivo sozinhos (diferente do Prisma CLI, que carrega `.env` automaticamente).

O jogo já tem um loop de decisão real, não só o botão de avançar dia:

- **`/nova-empresa`** cria a herança completa (empresa + unidade + lote já em produção, pico de postura).
- **Dashboard (`/`)**: "Avançar 1 dia" roda o `MotorPostura`; caixa, dia, aves vivas, e KPIs de "Receita/Custos/Lucro" (dos últimos N dias, via `HistoricoProducao`) atualizam com dado real.
- **`/mercado`**: escolher entre 3 fornecedores de ração com trade-off real (barato/pouco confiável vs. caro/confiável vs. meio-termo) — o preço escolhido é o que entra no próximo tick.
- **`/comercial`**: fechar contrato com 1 de 3 clientes (volume alto/preço baixo vs. volume baixo/preço alto) — determina o preço de venda dos ovos.
- **`/relatorios`**: trilha de documentos fiscais (compra de ração, venda de ovos) gerados por cada dia avançado — número sequencial, chave fictícia, valor.
- **`/financeiro`**: DRE de verdade (Receita bruta → Funrural → Receita líquida → Ração → Mão de obra → Resultado) do período, mais a tabela dia a dia — mesmo dado do `HistoricoProducao`, sem endpoint novo.
- Sidebar navega de verdade (`Link`/`usePathname`); Negócios/Codex ainda são "em construção", com uma explicação do que falta em cada uma.

O que na Domain Bible ainda não tem número sourced (ex.: preço de ração/ovo "oficial", usados como fallback antes do jogador escolher fornecedor/cliente) está explicitamente marcado como placeholder de calibração — ver [docs/GAME_ECONOMY.md §9](./docs/GAME_ECONOMY.md).

## Estrutura

```
AgroGestao/
├── docs/
│   ├── GDD.md              # design doc completo
│   ├── DOMAIN_BIBLE.md      # regras de negocio reais, estudadas e documentadas
│   └── GAME_ECONOMY.md      # numeros-base da economia do jogo (rascunho)
├── packages/
│   └── domain/               # regras de negocio e motor de simulacao, sem depender de UI/framework
├── apps/
│   ├── api/                  # NestJS + Prisma
│   └── web/                  # Next.js, UI desktop estilo game-management
```

`packages/domain` é o núcleo: entidades e o motor de simulação (ex.: `MotorPostura`) vivem ali, testáveis isoladamente, e são consumidos tanto pela API quanto pelo frontend. Ver princípios de modelagem em [docs/GDD.md#23](./docs/GDD.md#23-domain-bible-e-princípios-de-modelagem).

## Como rodar

Pré-requisitos: Node 20+, PostgreSQL (para a API — sem ele só dá pra rodar o frontend e os testes do domínio).

```bash
npm install

# motor de simulacao (dominio) — testes
npm run test

# testes da API (logica pura do tick, sem precisar de banco)
npm run test -w apps/api

# frontend (http://localhost:3000) — roda sozinho em "modo demo" mesmo sem API/Postgres.
# Para conectar na API de verdade, copie apps/web/.env.local.example para
# apps/web/.env.local (API_URL, default http://localhost:3333)
npm run dev:web

# backend (http://localhost:3333) — precisa de Postgres rodando e DATABASE_URL
# configurado (copie apps/api/.env.example para apps/api/.env e ajuste a URL)
npm run prisma:migrate -w apps/api   # cria as tabelas Empresa/UnidadeNegocio/Lote
npm run dev:api
```

Fluxo mínimo pra testar a API de ponta a ponta (depois do `dev:api` no ar): `POST /empresas` (cria a empresa herdada) → `POST /unidades-negocio` (com o `empresaId` retornado) → `POST /lotes` (com o `unidadeNegocioId` retornado) → `POST /lotes/:id/avancar-dia` (corpo `{}` funciona — usa valores de referência) — cada chamada roda um dia do `MotorPostura` e atualiza o caixa da empresa. Opcionalmente, antes de avançar: `GET /fornecedores` + `PATCH /unidades-negocio/:id/fornecedor-racao` e `GET /clientes` + `POST /contratos` pra ver o preço realmente usado mudar.

## Próximos passos

Ver [docs/GDD.md#30](./docs/GDD.md#30-próxima-etapa-recomendada):

1. ~~Preencher a Domain Bible com as regras reais da avicultura de postura.~~ Feito — ver [docs/DOMAIN_BIBLE.md](./docs/DOMAIN_BIBLE.md).
2. ~~Ligar o `MotorPostura` ao estado da empresa via API/Prisma.~~ Feito e validado contra Postgres real.
3. ~~Ligar o frontend (`apps/web`) na API de verdade.~~ Feito e validado.
4. ~~Ligar o botão "avançar dia" na UI ao endpoint real.~~ Feito e validado.
5. ~~`HistoricoProducao`/DRE de verdade.~~ Feito — KPIs de "Receita/Custos/Lucro" do período usam dado real (`GET /empresas/:id/historico`), não mais placeholder.
6. ~~Fornecedor de ração jogável (`/mercado`).~~ Feito e validado — preço de ração muda de verdade conforme o fornecedor escolhido.
7. ~~Primeira venda de verdade: `Cliente`/`Contrato` (`/comercial`).~~ Feito e validado — preço de venda vem do contrato fechado, não mais fixo.
8. ~~Sidebar navega de verdade.~~ Feito — Negócios/Financeiro/Relatórios/Codex viraram páginas "em construção" com explicação, não links mortos.
9. ~~Emitir `DocumentoFiscal` a cada transação real.~~ Feito e validado — `/relatorios` mostra a trilha real (compra de ração + venda de ovos por dia avançado), numeração sequencial persistida.
10. ~~Financeiro com DRE real.~~ Feito e validado — Receita bruta → Funrural → Receita líquida → Ração → Mão de obra → Resultado, mais tabela dia a dia. Ainda falta fluxo de caixa projetado (contas a pagar/receber futuras não existem, tudo é à vista hoje).
11. Negócios com conteúdo real (hoje é placeholder) — detalhe de cada `UnidadeNegocio`/`Lote`, e um caminho pra investir em capacidade (novo galpão, segundo lote).
12. Sistema de acerto de IEP (integração vertical, Domain Bible §7.3), crédito Pronaf (§11), seguro rural (§12) — sistemas maiores, ainda não implementados.
13. Reputação/relacionamento dinâmicos: hoje `relacionamento`/`confiança` do Cliente e `confiabilidade` do Fornecedor existem como dado mas não mudam com o comportamento do jogador (GDD §14) — são só estatísticas de exibição por enquanto.

## Licença

[MIT](./LICENSE).
