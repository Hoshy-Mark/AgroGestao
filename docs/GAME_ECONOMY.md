# Game Economy v0.1 — Avicultura de Postura

> Rascunho inicial de números-base para a herança e o primeiro ciclo produtivo (~120 dias, GDD [seção 26](./GDD.md#26-impacto-no-mvp)). Todos os valores são placeholders a validar contra a Domain Bible antes de virar regra fixa no motor de simulação.

## 1. Estado inicial herdado (Dia 0)

| Item | Valor sugerido | Observação |
|---|---|---|
| Caixa inicial | R$ 8.000,00 | Baixo o suficiente para forçar decisão logo no prólogo |
| Dívida herdada (financiamento antigo) | R$ 15.000,00 | Parcelas mensais, juros a definir |
| Galpão | 1, capacidade ~2.000 poedeiras | Depreciado, manutenção pendente |
| Lote em produção | ~1.500 poedeiras, meio de ciclo | Produtividade abaixo do ideal (legado de manejo ruim) |
| Estoque de ração | ~7 dias | Gatilho da primeira decisão de compra |
| Funcionários | 1 (funcionário veterano) | Salário a definir |
| Fornecedores conhecidos | 1 (ração) | Preço à vista vs. faturado a modelar |
| Clientes herdados | 1–2 | Contrato antigo, condição pouco vantajosa |

## 2. Custos recorrentes (rascunho)

- Ração (maior componente do custo variável)
- Mão de obra (salário do funcionário veterano)
- Manutenção de ativos (galpão, equipamentos)
- Sanidade / insumos veterinários
- Energia / água
- Financiamento herdado (parcela + juros)

## 3. Receita

- Venda de ovos comerciais (canal spot vs. contrato)
- Classificação por tipo/peso pode segmentar preço (a validar na Domain Bible)

## 4. Perguntas em aberto (bloqueiam fórmulas fechadas)

- [ ] Qual a conversão alimentar realista para poedeiras comerciais em produção (kg ração / dúzia de ovos)?
- [ ] Qual a curva de mortalidade esperada por fase (recria vs. produção)?
- [ ] Qual o intervalo real entre pagamento a fornecedor de ração (à vista vs. faturado) e recebimento de clientes?
- [ ] Qual a faixa de preço de mercado do ovo (spot) para calibrar contra o preço contratado herdado?
- [ ] Qual taxa de juros é realista para o financiamento herdado e para crédito de capital de giro?

> Nenhuma fórmula abaixo deve ser considerada final até essas perguntas serem respondidas e registradas na [Domain Bible](./DOMAIN_BIBLE.md).

## 5. Fórmulas provisórias (a validar)

```
custo_racao_periodo = consumo_kg_dia * dias * preco_kg_racao
producao_ovos_dia   = poedeiras_em_producao * taxa_postura
receita_periodo      = producao_ovos_dia * dias * preco_medio_ovo
resultado_periodo    = receita_periodo - custo_racao_periodo - outros_custos
```

Essas fórmulas alimentam o tick diário do `MotorPostura` em `packages/domain/src/engine`.
