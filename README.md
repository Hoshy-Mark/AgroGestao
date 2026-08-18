# AgroGestão

[![License: MIT](https://img.shields.io/badge/license-MIT-4caf7d)](./LICENSE)

Simulador de gestão agroindustrial — o jogador herda uma pequena propriedade rural inexperiente e aprende a administrá-la enquanto a administra. Documento de design completo em [docs/GDD.md](./docs/GDD.md).

> Realismo de decisão, não realismo burocrático. Ver [docs/GDD.md#22](./docs/GDD.md#22-realismo-e-prioridades-de-escopo).

## Status

**Fase 0 — Fundação** (ver [roadmap](./docs/GDD.md#25-roadmap-de-desenvolvimento-e-prioridades)): estrutura do monorepo, API mínima e dashboard mockado. A [Domain Bible](./docs/DOMAIN_BIBLE.md) já está preenchida com regras reais (fontes citadas por seção), e o `MotorPostura` foi atualizado para usá-las: curva de postura por idade/linhagem, consumo por estágio do lote, Funrural sobre a receita. Um módulo de `DocumentoFiscal` (trilha de auditoria) também já existe no domínio, ainda não ligado a compras/vendas reais. O que na Domain Bible ainda não tem número sourced (ex.: taxa de mortalidade) está explicitamente marcado como placeholder de calibração — ver [docs/GAME_ECONOMY.md §2 e §4](./docs/GAME_ECONOMY.md).

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

Pré-requisitos: Node 20+, PostgreSQL (para a API, quando a persistência entrar em uso).

```bash
npm install

# motor de simulacao (dominio) — testes
npm run test

# frontend (http://localhost:3000)
npm run dev:web

# backend (http://localhost:3333) — precisa de DATABASE_URL (ver apps/api/.env.example)
npm run dev:api
```

## Próximos passos

Ver [docs/GDD.md#30](./docs/GDD.md#30-próxima-etapa-recomendada):

1. ~~Preencher a Domain Bible com as regras reais da avicultura de postura.~~ Feito — ver [docs/DOMAIN_BIBLE.md](./docs/DOMAIN_BIBLE.md).
2. Fechar os números que ainda faltam na Game Economy (mortalidade, preço de ração/ovo — ver [docs/GAME_ECONOMY.md §4](./docs/GAME_ECONOMY.md)).
3. Ligar o `MotorPostura` ao estado da empresa via API/Prisma (hoje só roda em memória, via testes e num placeholder no dashboard).
4. Primeiro vertical slice jogável: herança → prólogo → operação → produção → venda → recebimento → fechamento — incluindo emitir `DocumentoFiscal` a cada transação real.
5. Evoluir as demais telas (Negócios, Financeiro, Comercial, Mercado) no mesmo estilo do dashboard.

## Licença

[MIT](./LICENSE).
