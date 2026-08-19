# AgroGestão

[![License: MIT](https://img.shields.io/badge/license-MIT-4caf7d)](./LICENSE)

Simulador de gestão agroindustrial — o jogador herda uma pequena propriedade rural inexperiente e aprende a administrá-la enquanto a administra. Documento de design completo em [docs/GDD.md](./docs/GDD.md).

> Realismo de decisão, não realismo burocrático. Ver [docs/GDD.md#22](./docs/GDD.md#22-realismo-e-prioridades-de-escopo).

## Status

**Fase 1 — vertical slice** (ver [roadmap](./docs/GDD.md#25-roadmap-de-desenvolvimento-e-prioridades)) em andamento. A [Domain Bible](./docs/DOMAIN_BIBLE.md) está preenchida com regras reais (fontes citadas por seção), e o `MotorPostura` (`packages/domain`) usa esses números: curva de postura por idade/linhagem, consumo por estágio do lote, mortalidade, sazonalidade de preço, custo de mão de obra, Funrural sobre a receita. Um módulo de `DocumentoFiscal` (trilha de auditoria) também existe no domínio, ainda não ligado a compras/vendas reais.

A API (`apps/api`) persiste `Empresa` → `UnidadeNegocio` → `Lote` via Prisma e expõe um endpoint que roda o `MotorPostura` de verdade: `POST /lotes/:id/avancar-dia`. **Validado end-to-end contra um Postgres real**: `POST /empresas` → `POST /unidades-negocio` → `POST /lotes` → `POST /lotes/:id/avancar-dia` roda o motor e persiste o resultado — caixa e idade do lote atualizam certinho no banco. O frontend também foi validado no mesmo teste: `/nova-empresa` cria a empresa via API e o dashboard carrega os dados reais (sem o banner de "modo demo"). `PrismaService` conecta sob demanda (não trava o boot se o banco cair depois).

**Sobre o `.env` da API:** `main.ts` carrega `apps/api/.env` via `dotenv/config` — sem isso, `nest start`/`node dist/main.js` não leem o arquivo sozinhos (diferente do Prisma CLI, que carrega `.env` automaticamente).

O dashboard já é jogável: `/nova-empresa` cria a herança completa (empresa + unidade + um lote que já nasce em produção, pico de postura) e o botão **"Avançar 1 dia"** roda o `MotorPostura` de verdade a cada clique — caixa, dia, aves vivas e a fala do mentor atualizam com o resultado real. Preço de ração/ovo ainda são valores de referência fixos (não existe `Mercado` nem `Fornecedor` jogável ainda — GDD §15).

O que na Domain Bible ainda não tem número sourced (ex.: preço de ração/ovo "oficial") está explicitamente marcado como placeholder de calibração — ver [docs/GAME_ECONOMY.md §9](./docs/GAME_ECONOMY.md).

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

Fluxo mínimo pra testar a API de ponta a ponta (depois do `dev:api` no ar): `POST /empresas` (cria a empresa herdada) → `POST /unidades-negocio` (com o `empresaId` retornado) → `POST /lotes` (com o `unidadeNegocioId` retornado) → `POST /lotes/:id/avancar-dia` com `{ precoKgRacao, precoMedioDuzia }` no corpo — cada chamada roda um dia do `MotorPostura` e atualiza o caixa da empresa.

## Próximos passos

Ver [docs/GDD.md#30](./docs/GDD.md#30-próxima-etapa-recomendada):

1. ~~Preencher a Domain Bible com as regras reais da avicultura de postura.~~ Feito — ver [docs/DOMAIN_BIBLE.md](./docs/DOMAIN_BIBLE.md).
2. ~~Ligar o `MotorPostura` ao estado da empresa via API/Prisma.~~ Feito e validado contra Postgres real — ver Status acima.
3. ~~Ligar o frontend (`apps/web`) na API de verdade.~~ Feito e validado — onboarding cria empresa real, dashboard carrega sem cair no modo demo.
4. ~~Ligar o botão "avançar dia" na UI ao endpoint real.~~ Feito e validado — dashboard mostra lote real e "Avançar 1 dia" roda o motor de verdade a cada clique.
5. Fechar os números que ainda faltam na Game Economy (preço de ração/ovo "oficial", prazo de fornecedor — ver [docs/GAME_ECONOMY.md §9](./docs/GAME_ECONOMY.md)) — hoje o preço usado no "Avançar 1 dia" é fixo no código (`apps/web/src/app/actions.ts`), sem `Mercado`/`Fornecedor` jogável.
6. Primeira venda de verdade: `Contrato`/venda direta (Domain Bible §15) — hoje os ovos produzidos viram receita automaticamente, sem cliente nem negociação. Emitir `DocumentoFiscal` a cada transação real (o módulo existe no domínio, nenhum endpoint o chama ainda).
7. `HistoricoProducao`/DRE de verdade (GDD §9) — hoje "Receita/Custos (mês)" não existem, só o resultado do último dia.
8. Evoluir as demais telas (Negócios, Financeiro, Comercial, Mercado) no mesmo estilo do dashboard.

## Licença

[MIT](./LICENSE).
