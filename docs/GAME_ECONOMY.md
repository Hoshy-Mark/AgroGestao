# Game Economy v0.2 — Avicultura de Postura

> Atualização da v0.1 (GDD [seção 26](./GDD.md#26-impacto-no-mvp)) após a expansão da
> [Domain Bible](./DOMAIN_BIBLE.md) para terra, integração/acerto, transporte, consignação,
> crédito, seguro, tributação, CAPEX, documentos fiscais, sazonalidade, mão de obra,
> perecibilidade e sistema de criação. O que muda em relação à v0.1 está marcado com **[NOVO]**
> ou **[ATUALIZADO]**; o resto permanece igual. Como antes: o que tem fonte real está marcado
> como tal, o que é estimativa de calibração está marcado como estimativa, não como dado.

## 1. Estado inicial herdado (Dia 0)

| Item | Valor sugerido | Observação |
|---|---|---|
| Caixa inicial | R$ 8.000,00 | Baixo o suficiente para forçar decisão logo no prólogo |
| Dívida herdada (financiamento antigo) | R$ 15.000,00 | Parcelas mensais, juros a definir |
| Galpão | 1, capacidade ~2.000 poedeiras | Depreciado, manutenção pendente. Ordem de grandeza coerente com CAPEX de granja pequena (Domain Bible [§14.1](./DOMAIN_BIBLE.md#141-escala-de-pequeno-produtor-comercial-o-degrau-relevante-para-o-mvp): R$15–25 mil para ~300 aves) |
| Regime de terra | Propriedade própria | **[ATUALIZADO]** Confirmado como padrão da herança em Domain Bible [§1.1](./DOMAIN_BIBLE.md#11-propriedade-própria) — sem `ContaPagar` de arrendamento/parceria no Dia 0; esses regimes (§1.2/1.3) só entram como opção de *expansão*, não fazem parte do estado inicial |
| Lote em produção | ~1.500 poedeiras, meio de ciclo | Produtividade abaixo do ideal (legado de manejo ruim) |
| Estoque de ração | ~7 dias | Gatilho da primeira decisão de compra |
| Funcionários | 1 (funcionário veterano), CLT | **[ATUALIZADO]** custo agora sourced — ver Seção 6 |
| Fornecedores conhecidos | 1 (ração) | À vista vs. faturado — prazo default agora estimado, ver Seção 7 |
| Clientes herdados | 1–2 | Contrato antigo, condição pouco vantajosa |
| Regime tributário | Pessoa física | Padrão da herança (Domain Bible [§13.1](./DOMAIN_BIBLE.md#131-pessoa-física-vs-pessoa-jurídica)); migrar para PJ é marco de progressão (GDD §28) |
| Sistema de criação | Convencional (gaiola) | **[NOVO]** Domain Bible [§22](./DOMAIN_BIBLE.md#22-sistema-de-criação-e-prêmio-de-preço) — caipira/orgânico ficam como upgrade de médio prazo, não como estado inicial; herança de granja falida não bancaria a certificação |

## 2. Parâmetros já implementados em `packages/domain`

| Parâmetro | Valor | Status | Fonte |
|---|---|---|---|
| Curva de postura (branca/vermelha) | Interpolada, 17→90 semanas | Sourced | Domain Bible [§2.2](./DOMAIN_BIBLE.md#22-curva-de-postura) |
| Consumo diário — fase produção | 112 g/ave/dia | Sourced | Domain Bible [§3.1](./DOMAIN_BIBLE.md#31-consumo-de-ração-por-fase) |
| Consumo diário — fase recria | ~41 g/ave/dia | Derivado (soma das sub-fases Embrapa ÷ ~126 dias) | Domain Bible §3.1 |
| Funrural (pessoa física, com Livro Caixa) | 1,3% sobre receita bruta (1,2% + 0,1% GILRAT) | Sourced | Domain Bible [§13.3](./DOMAIN_BIBLE.md#133-funrural-e-demais-tributos-sobre-a-atividade) |
| Mortalidade diária base | **0,018%/dia** | **[ATUALIZADO] Sourced** — ver Seção 3 abaixo. O placeholder da v0.1 já estava, por coincidência, muito próximo do valor real | Domain Bible §4, agora com fonte primária (ver Seção 3) |
| Estágios do lote (RECRIA/INICIO_POSTURA/PRODUCAO/DECLINIO/DESCARTE) | limites em semanas | Sourced | Domain Bible §2.1/2.3 |
| Multiplicador sazonal de preço | tabela por mês, fev–abr alta / dez–jan baixa | **[NOVO]** Sourced | Domain Bible [§19](./DOMAIN_BIBLE.md#19-sazonalidade-de-preço-de-venda) — ver Seção 4 |
| Custo de mão de obra (CLT) | R$1.800–2.550/mês por funcionário | **[NOVO]** Sourced | Domain Bible [§20](./DOMAIN_BIBLE.md#20-mão-de-obra) — ver Seção 6 |
| Prazo de degradação de estoque de ovo | 30 dias (referência de mercado, não norma verificada) | **[NOVO]** Implementado, fonte fraca | Domain Bible [§21](./DOMAIN_BIBLE.md#21-perecibilidade-e-armazenamento-de-ovos) |

**[ATUALIZADO]** Sazonalidade (`engine/sazonalidade.ts`), custo de mão de obra (parâmetro
`custoMaoDeObraMensal` em `simularDiaLote`) e degradação de estoque de ovo
(`engine/estoqueOvos.ts`) já estão implementados em `packages/domain` — ver Seções 4, 6 e 8
abaixo para o mapeamento exato.

Implementado, mas **ainda não ligado ao tick da empresa**: `DocumentoFiscal`
(`packages/domain/src/fiscal`) — pronto para emitir notas em cada transação, falta acoplar às
operações reais de compra/venda quando esses módulos existirem. A degradação de estoque
(`estoqueOvos.ts`) também está isolada — falta um `Estoque` de verdade para chamá-la a cada dia.

**Ainda não implementado, sem prioridade para o vertical slice:** integração/acerto (Domain
Bible §7.3), consignação (§16), seguro rural (§12), arrendamento/parceria (§1.2/1.3). Todos
são canais/mecânicas *alternativas* ao caminho padrão (terra própria + venda direta), coerentes
com a decisão de escopo do GDD de lançar um vertical slice único antes de ramificar — ver
Seção 8.

## 3. Mortalidade — agora sourced

A v0.1 registrava 0,018%/dia como placeholder, sem fonte. Encontramos uma referência primária
citável: **Sarcinelli et al. (2007)** estimam mortalidade de **8% a 10% ao longo de toda a fase
de produção** de poedeiras comerciais (citado em Research, Society and Development, v.11 n.1,
2022, estudo de viabilidade econômica de granja cage-free). A fase de produção de referência
nesse mesmo estudo tem **72 semanas / 504 dias** (mais 20 dias de vazio sanitário entre lotes).

Distribuindo 9% (ponto médio da faixa 8–10%) uniformemente sobre 504 dias:

```
taxa_mortalidade_diaria_base ≈ 9% / 504 dias ≈ 0,0179%/dia
```

Isso confirma, dentro do arredondamento, o valor que já estava em código (0,018%/dia) — o
placeholder da v0.1 pode ser promovido de "estimativa" para "sourced", sem alteração de valor.

**Ressalva importante:** essa distribuição é uniforme por simplificação — na vida real a
mortalidade não é constante ao longo do ciclo (maior nas primeiras semanas de postura e no
fim do ciclo, conforme a "crise das 18–35 semanas" documentada em nutriNews e a curva de
declínio geral). Para o MVP, taxa constante é aceitável; uma curva de mortalidade por fase
(análoga à curva de postura) é candidata a v0.3 se o playtesting mostrar que o ciclo "sente"
mortalidade demais no início ou de menos no fim.

**Fonte:** Sarcinelli et al. (2007), citado em Research, Society and Development v.11 n.1,
e17611123811 (2022), "Custos de produção de ovos em sistema cage-free"; nutriNews, "A crise das
18 às 35 semanas em poedeiras comerciais" (contexto sobre distribuição não-uniforme).

## 4. Sazonalidade de preço — multiplicador por mês [NOVO]

Domain Bible §19 documenta o padrão sazonal do Cepea. Proposta de multiplicador sobre
`precoMedioDuzia`, calibrado como faixa (não fixado em número único, já que a intensidade varia
ano a ano no mundo real — ex.: alta de 9,2% em fev/2026 vs. alta recorde em mar/2023):

| Mês | Multiplicador sugerido | Base real |
|---|---|---|
| Jan | 0,85–0,90 | vale sazonal (férias escolares, menor poder de compra) |
| Fev | 1,00–1,10 | início da alta (Quaresma + volta às aulas) |
| Mar | 1,10–1,30 | pico (Quaresma/Páscoa — maior variação histórica do ano) |
| Abr | 1,05–1,15 | Páscoa + cauda da Quaresma |
| Mai–Nov | 0,95–1,05 | estável, sem padrão forte documentado |
| Dez | 0,85–0,90 | vale sazonal (queda de consumo, alta oferta pré-ano novo) |

**Simplificação proposta:** aplicar o ponto médio de cada faixa como valor fixo por mês
simulado no MVP (sem variação estocástica ano a ano ainda) — a faixa fica registrada para
quando o módulo de `Mercado` ganhar variação probabilística.

## 5. Preço de ração e de ovo — reconciliando duas fontes [ATUALIZADO]

A v0.1 usava **R$12/dúzia** (fonte: EMATER-DF / Click Petróleo e Gás, pequeno produtor,
Domain Bible §6) para chegar a um preço implícito de ração de ~R$2,50/kg. A expansão da Domain
Bible trouxe uma segunda fonte, de natureza diferente: o **Cepea/Esalq**, referência de mercado
atacado/produtor, registrou caixas de 30 dúzias entre **R$89 e R$227** ao longo de 2025–2026
(Domain Bible §19) — o que equivale a **R$2,97 a R$7,57 por dúzia**, uma faixa bem abaixo do
R$12/dúzia usado na v0.1.

Isso não é um erro — são **canais de venda diferentes**: o Cepea mede o preço médio de mercado
recebido pelo produtor em operações de atacado (a granel, caixa fechada), enquanto o
R$12/dúzia do EMATER-DF é uma referência de pequeno produtor vendendo por canal mais direto
(feira, venda local, menor volume, maior margem por unidade). O GDD já prevê os dois tipos de
cliente (contrato com distribuidor grande vs. cliente pequeno/local, ex. "Supermercado
Horizonte"), então **os dois números são úteis, para contextos diferentes**:

| Canal | Preço de referência | Uso no jogo |
|---|---|---|
| Venda em volume / contrato com distribuidor | ~R$3,00–7,50/dúzia (Cepea, variação sazonal já embutida) | `precoMedioDuzia` do `Mercado`/contratos grandes |
| Venda direta / cliente pequeno / feira | ~R$12,00/dúzia (EMATER-DF) | Preço-teto de canais de menor volume e maior margem, coerente com a lógica de "valor agregado" da Seção 1 (sistema de criação) e com consignação (Domain Bible §16) |

**Recomendação de calibração para o vertical slice:** usar a faixa do Cepea (R$3,00–7,50,
multiplicada pela sazonalidade da Seção 4) como `precoMedioDuzia` **default** do `Mercado`, já
que é a fonte de série histórica mais robusta — e reservar o valor de R$12/dúzia como teto
alcançável apenas por canais de venda direta/pequena escala, não como média de mercado.

Consequência prática: o preço de ração implícito calculado na v0.1 (~R$2,45–2,65/kg), que foi
derivado do R$12/dúzia, precisa ser recalculado se `precoMedioDuzia` migrar para a faixa Cepea
— ficando marcado como **estimativa de calibração pendente de novo cálculo**, não removido
(o valor de ~R$2,50/kg de ração continua plausível como ordem de grandeza isolada, mas não deve
ser derivado do R$12/dúzia antigo sem reconciliar as duas fontes).

## 6. Mão de obra — custo do `Funcionario` herdado [NOVO]

Domain Bible §20: trabalhador de avicultura de postura (CBO 6233-10) tem salário-base CLT na
faixa de **R$1.800–2.550/mês** (2025–2026, CAGED/eSocial). Proposta de calibração:

```
custo_mensal_funcionario_clt = R$ 2.000,00   // ponto de partida, dentro da faixa sourced
```

O `Funcionario` herdado no Dia 0 já é CLT (não diarista) — coerente com "funcionário veterano"
já descrito na Seção 1: alguém que ficou com a operação decadente, não uma contratação recente
por tarefa. Diaristas/empreitada (Domain Bible §20) ficam como opção de reforço temporário, não
como parte do estado inicial.

**Efeito no motor:** por ora, tratado como custo fixo mensal simples (`ContaPagar` recorrente),
sem ainda ligar `capacidade_manejo` a mortalidade/CA — esse acoplamento é o próximo passo
natural (ver Seção 8, pendências), mas o custo em si já pode entrar no DRE hoje.

## 7. Prazo de fornecedor — preenchendo o parâmetro em aberto [NOVO]

A v0.1 deixava como pergunta aberta o "intervalo real entre pagamento a fornecedor e
recebimento de clientes". A Domain Bible não fixa um prazo específico do setor de ração — o
que encontramos é o padrão comercial B2B brasileiro geral de **boleto faturado**, tipicamente
entre 7 e 30 dias (mais comumente 30, o padrão de mercado mais citado). Como não há fonte
específica de avicultura para esse número, ele entra como **estimativa de calibração
explícita**, não como dado sourced:

```
prazo_faturado_dias_default = 30   // ESTIMATIVA — padrão comercial B2B geral, não específico do setor de ração
desconto_a_vista_estimado   = 3–5% // ESTIMATIVA — prática comum de mercado para pagamento antecipado
```

Isso é o suficiente para o primeiro `Fornecedor` do jogo oferecer as duas opções já descritas
no GDD (à vista com desconto vs. faturado em 30 dias), sem inventar precisão que a Domain
Bible não sustenta.

## 8. Fórmulas em uso (implementadas) — atualizado

```
idade_semanas   = idade_dias / 7
estagio         = estagioPorIdadeSemanas(idade_semanas)          // Domain Bible §2.1/2.3
mortas_hoje     = round(aves_vivas * taxa_mortalidade_diaria_base) // agora sourced, §4 deste doc
aves_vivas      = aves_vivas - mortas_hoje

taxa_postura    = taxaPosturaPorSemana(idade_semanas, linhagem)  // 0 fora do periodo de postura, §2.2
ovos_dia        = aves_vivas * taxa_postura

racao_kg_dia    = aves_vivas * consumo_diario_kg[estagio]         // 112g producao / ~41g recria, §3.1
custo_racao     = racao_kg_dia * preco_kg_racao

preco_duzia_hoje = preco_medio_duzia_base * multiplicador_sazonal[mes_atual]  // [NOVO] §4 deste doc
receita_bruta    = (ovos_dia / 12) * preco_duzia_hoje
funrural         = receita_bruta * aliquota_funrural               // 1,3% padrao, §13.3
receita_liquida  = receita_bruta - funrural

custo_mao_de_obra_dia = custo_mensal_funcionario_clt / 30           // [NOVO] §6 deste doc, simplificação linear

resultado_dia   = receita_liquida - custo_racao - custo_mao_de_obra_dia
```

Métrica de período (não diária, evita divisão por zero em recria):

```
conversao_alimentar = racao_kg_acumulada / (ovos_acumulados / 12)  // §3.2
```

Degradação de estoque de ovo não vendido (perecibilidade, Domain Bible §21) — **implementada**
em `packages/domain/src/engine/estoqueOvos.ts` (`fatorQualidadeEstoque`,
`avancarDiaEstoqueOvos`), isolada de um `Estoque` real ainda inexistente:

```
dias_em_estoque > 0 e <= 30  →  classificacao_efetiva degrada linearmente até o limite
dias_em_estoque > 30         →  lote é descartado do Estoque (perda total)
```

## 9. Perguntas em aberto

Resolvidas na v0.1:

- ~~Conversão alimentar realista~~ → 1,35 kg/dúzia (branca) / 1,50 kg/dúzia (vermelha).
- ~~Curva de postura por fase~~ → tabela por semana de idade, implementada em `curvaPostura.ts`.
- ~~Regime tributário sobre a receita~~ → Funrural 1,3%.
- ~~Linhas de crédito disponíveis~~ → Pronaf Custeio e Investimento (ainda não implementado
  como `Financiamento` no motor).

Resolvidas nesta v0.2:

- ~~Taxa de mortalidade diária com número sourced~~ → 0,018%/dia, confirmado por Sarcinelli et
  al. (2007) — Seção 3.
- ~~Custo de mão de obra~~ → R$1.800–2.550/mês CLT (CBO 6233-10) — Seção 6.
- ~~Multiplicador sazonal de preço~~ → tabela por mês, Cepea — Seção 4.
- ~~Prazo de degradação de estoque de ovo~~ → 30 dias, referência de mercado — Seção 8.

Implementadas em `packages/domain` nesta rodada (não eram só documentação):

- Sazonalidade sobre `precoMedioDuzia` via parâmetro `mes` em `simularDiaLote`.
- Custo de mão de obra via parâmetro `custoMaoDeObraMensal` em `simularDiaLote`.
- Degradação de estoque de ovo em `engine/estoqueOvos.ts` (ainda sem um `Estoque` real que a
  chame todo dia).

Ainda em aberto:

- [ ] Preço de ração e preço do ovo "oficiais" — a reconciliação da Seção 5 resolve *qual*
  fonte usar para cada canal, mas o preço de ração implícito (~R$2,50/kg) precisa ser
  recalculado a partir da faixa Cepea, não mais do R$12/dúzia antigo.
- [ ] Prazo de fornecedor — preenchido como estimativa de calibração (Seção 7), não como dado
  sourced específico do setor; revisar se surgir fonte melhor.
- [ ] Taxa de juros e regras de elegibilidade do financiamento herdado (distinto do Pronaf, que
  é para o jogador contratar depois) — segue em aberto, sem fonte nova nesta rodada.
- [ ] Acoplar `capacidade_manejo` do `Funcionario` a mortalidade/CA — hoje mão de obra só entra
  como custo fixo, não como modificador de desempenho (Seção 6).
- [ ] Curva de mortalidade não-uniforme por fase (Seção 3, ressalva) — candidato a v0.3, não
  bloqueante para o vertical slice.
- [ ] Preço-base e produtividade dos sistemas caipira/orgânico (Domain Bible §22) — os
  multiplicadores (+30–80%/+100–200% preço, produtividade 280–350/250–320 ovos) existem na
  Domain Bible, mas ainda não foram convertidos em parâmetros de motor porque o sistema de
  criação alternativo não é parte do vertical slice inicial (Seção 1).