# AgroGestão

[![License: MIT](https://img.shields.io/badge/license-MIT-4caf7d)](./LICENSE)

Simulador de gestão agroindustrial — o jogador herda uma pequena propriedade rural inexperiente e aprende a administrá-la enquanto a administra. Documento de design completo em [docs/GDD.md](./docs/GDD.md).

> Realismo de decisão, não realismo burocrático. Ver [docs/GDD.md#22](./docs/GDD.md#22-realismo-e-prioridades-de-escopo).

## Status

**Fase 1 — vertical slice** (ver [roadmap](./docs/GDD.md#25-roadmap-de-desenvolvimento-e-prioridades)) em andamento. A [Domain Bible](./docs/DOMAIN_BIBLE.md) está preenchida com regras reais (fontes citadas por seção), e o `MotorPostura` (`packages/domain`) usa esses números: curva de postura por idade/linhagem, consumo por estágio do lote, mortalidade, sazonalidade de preço, custo de mão de obra, Funrural sobre a receita. Um módulo de `DocumentoFiscal` (trilha de auditoria) também existe no domínio, ainda não ligado a compras/vendas reais.

A API (`apps/api`) agora persiste `Empresa` → `UnidadeNegocio` → `Lote` via Prisma e expõe um endpoint que roda o `MotorPostura` de verdade: `POST /lotes/:id/avancar-dia`. **Isso ainda não foi testado contra um Postgres real** (o ambiente de desenvolvimento atual não tem Docker/Postgres instalado) — o que foi validado sem banco: schema Prisma (`prisma validate`/`generate`), build do NestJS, boot da aplicação (toda a injeção de dependência e as rotas resolvem certo — o único erro ao subir sem `DATABASE_URL` válido é de conexão, como esperado) e os testes unitários da lógica de tick (`lotes/lote-tick.spec.ts`, puro, sem Prisma). Falta rodar `prisma migrate dev` contra um banco real e testar end-to-end.

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

# frontend (http://localhost:3000)
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
2. ~~Ligar o `MotorPostura` ao estado da empresa via API/Prisma.~~ Feito — `Empresa`/`UnidadeNegocio`/`Lote` persistidos, `POST /lotes/:id/avancar-dia` roda o motor de verdade. **Falta validar contra um Postgres real** (não testado end-to-end neste ambiente — ver Status acima).
3. Fechar os números que ainda faltam na Game Economy (preço de ração/ovo "oficial", prazo de fornecedor — ver [docs/GAME_ECONOMY.md §9](./docs/GAME_ECONOMY.md)).
4. Ligar o frontend (`apps/web`) na API de verdade — hoje o dashboard só usa `criarEmpresaHerdada` localmente, sem chamar `/empresas`.
5. Primeiro vertical slice jogável: herança → prólogo → operação → produção → venda → recebimento → fechamento — incluindo emitir `DocumentoFiscal` a cada transação real (hoje o módulo existe no domínio mas nenhum endpoint o chama ainda).
6. Evoluir as demais telas (Negócios, Financeiro, Comercial, Mercado) no mesmo estilo do dashboard.

## Licença

[MIT](./LICENSE).
