# Game Economy v0.1 — Avicultura de Postura

> Rascunho de números-base para a herança e o primeiro ciclo produtivo (~120 dias, GDD [seção 26](./GDD.md#26-impacto-no-mvp)). A partir da atualização da [Domain Bible](./DOMAIN_BIBLE.md), boa parte dos parâmetros abaixo já tem fonte — o que ainda é estimativa de calibração está marcado como tal, não como dado real.

## 1. Estado inicial herdado (Dia 0)

| Item | Valor sugerido | Observação |
|---|---|---|
| Caixa inicial | R$ 8.000,00 | Baixo o suficiente para forçar decisão logo no prólogo |
| Dívida herdada (financiamento antigo) | R$ 15.000,00 | Parcelas mensais, juros a definir |
| Galpão | 1, capacidade ~2.000 poedeiras | Depreciado, manutenção pendente. Ordem de grandeza coerente com CAPEX de granja pequena (Domain Bible [§14.1](./DOMAIN_BIBLE.md#141-escala-de-pequeno-produtor-comercial-o-degrau-relevante-para-o-mvp): R$15–25 mil para ~300 aves) |
| Lote em produção | ~1.500 poedeiras, meio de ciclo | Produtividade abaixo do ideal (legado de manejo ruim) |
| Estoque de ração | ~7 dias | Gatilho da primeira decisão de compra |
| Funcionários | 1 (funcionário veterano) | Salário a definir |
| Fornecedores conhecidos | 1 (ração) | Preço à vista vs. faturado a modelar (Domain Bible [§10](./DOMAIN_BIBLE.md#10-compras-fornecedores-prazos-e-capital-de-giro)) |
| Clientes herdados | 1–2 | Contrato antigo, condição pouco vantajosa |
| Regime tributário | Pessoa física | Padrão da herança (Domain Bible [§13.1](./DOMAIN_BIBLE.md#131-pessoa-física-vs-pessoa-jurídica)); migrar para PJ é marco de progressão (GDD §28) |

## 2. Parâmetros já implementados em `packages/domain`

Estes valores estão em código (`packages/domain/src/engine/motorPostura.ts` e `curvaPostura.ts`), não só em documentação:

| Parâmetro | Valor | Status | Fonte |
|---|---|---|---|
| Curva de postura (branca/vermelha) | Interpolada, 17→90 semanas | Sourced | Domain Bible [§2.2](./DOMAIN_BIBLE.md#22-curva-de-postura) |
| Consumo diário — fase produção | 112 g/ave/dia | Sourced | Domain Bible [§3.1](./DOMAIN_BIBLE.md#31-consumo-de-ração-por-fase) |
| Consumo diário — fase recria | ~41 g/ave/dia | **Derivado**, não é um número que a fonte declara direto (soma das sub-fases Embrapa ÷ ~126 dias) | Domain Bible §3.1 |
| Funrural (pessoa física, com Livro Caixa) | 1,3% sobre receita bruta (1,2% + 0,1% GILRAT) | Sourced | Domain Bible [§13.3](./DOMAIN_BIBLE.md#133-funrural-e-demais-tributos-sobre-a-atividade) |
| Mortalidade diária base | 0,018%/dia (placeholder) | **Não sourced** — a Domain Bible registra que a mortalidade existe e do que depende, mas não fixa um número | Domain Bible §4, item pendente em [§20](./DOMAIN_BIBLE.md#20-próximas-entradas-pendentes-e-itens-descartados) |
| Estágios do lote (RECRIA/INICIO_POSTURA/PRODUCAO/DECLINIO/DESCARTE) | limites em semanas | Sourced | Domain Bible §2.1/2.3 |

Implementado, mas **ainda não ligado ao tick da empresa**: `DocumentoFiscal` (`packages/domain/src/fiscal`) — pronto para emitir notas em cada transação, falta acoplar às operações reais de compra/venda quando esses módulos existirem.

## 3. Preço de ração e de ovo — estimativa de calibração

A Domain Bible não fixa um preço por kg de ração nem por dúzia de ovo isolado — dá ordens de grandeza (Domain Bible [§6](./DOMAIN_BIBLE.md#6-economia-do-ciclo-produtivo-ordem-de-grandeza) e [§10](./DOMAIN_BIBLE.md#10-compras-fornecedores-prazos-e-capital-de-giro)):

- 200 aves, 90% de postura, ovo a **R$12/dúzia** → receita mensal ~R$5.400, custo mensal ~R$2.540 (fonte: EMATER-DF / Click Petróleo e Gás).
- Ração é 60–70% do custo total (Domain Bible §3.3) → custo de ração mensal estimado em ~R$1.650–1.780.
- 200 aves × 112g/dia × 30 dias ≈ 672 kg de ração/mês → **preço de ração implícito ≈ R$2,45–2,65/kg**.

Esses dois números (**R$12/dúzia**, **~R$2,50/kg de ração**) são o ponto de partida para `precoMedioDuzia` e `precoKgRacao` nos testes e no primeiro vertical slice, até existir um módulo de Mercado com variação real (GDD §15).

## 4. Perguntas em aberto

Resolvidas pela atualização da Domain Bible:

- ~~Conversão alimentar realista~~ → 1,35 kg/dúzia (branca) / 1,50 kg/dúzia (vermelha), Domain Bible §3.2.
- ~~Curva de postura por fase~~ → tabela por semana de idade, Domain Bible §2.2, implementada em `curvaPostura.ts`.
- ~~Regime tributário sobre a receita~~ → Funrural 1,3% (ou 20% simplificado sem Livro Caixa), Domain Bible §13.3.
- ~~Linhas de crédito disponíveis~~ → Pronaf Custeio e Investimento, Domain Bible §11 (ainda não implementado como `Financiamento` no motor).

Ainda em aberto:

- [ ] Taxa de mortalidade diária/semanal com número sourced (hoje é placeholder — ver tabela acima).
- [ ] Preço de ração e preço do ovo "oficiais" — hoje são estimativas derivadas (seção 3), não uma fonte direta por kg/dúzia.
- [ ] Intervalo real entre pagamento a fornecedor (à vista vs. faturado) e recebimento de clientes — Domain Bible §10 descreve o mecanismo, falta um prazo de referência em dias.
- [ ] Taxa de juros e regras de elegibilidade a aplicar por padrão no financiamento herdado (distinto do Pronaf, que é para o jogador contratar depois).

## 5. Fórmulas em uso (implementadas)

Substituem as fórmulas provisórias da v0.1 — refletem exatamente `simularDiaLote` em `packages/domain/src/engine/motorPostura.ts`:

```
idade_semanas   = idade_dias / 7
estagio         = estagioPorIdadeSemanas(idade_semanas)          // Domain Bible §2.1/2.3
mortas_hoje     = round(aves_vivas * taxa_mortalidade_diaria_base) // placeholder, §4
aves_vivas      = aves_vivas - mortas_hoje

taxa_postura    = taxaPosturaPorSemana(idade_semanas, linhagem)  // 0 fora do periodo de postura, §2.2
ovos_dia        = aves_vivas * taxa_postura

racao_kg_dia    = aves_vivas * consumo_diario_kg[estagio]         // 112g producao / ~41g recria, §3.1
custo_racao     = racao_kg_dia * preco_kg_racao

receita_bruta   = (ovos_dia / 12) * preco_medio_duzia
funrural        = receita_bruta * aliquota_funrural               // 1,3% padrao, §13.3
receita_liquida = receita_bruta - funrural

resultado_dia   = receita_liquida - custo_racao
```

Métrica de período (não diária, evita divisão por zero em recria):

```
conversao_alimentar = racao_kg_acumulada / (ovos_acumulados / 12)  // §3.2
```
