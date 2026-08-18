# Domain Bible — Avicultura de Postura

> Regra: não abstrair antes de entender a regra de negócio real. Cada conceito abaixo só entra em código depois de estar documentado aqui.

Este documento é vivo: cresce um verbete por vez, conforme o time estuda cada regra de negócio real por trás da vertical de lançamento (Matriz + Poedeira Comercial). Ver GDD [seção 23](./GDD.md#23-domain-bible-e-princípios-de-modelagem).

## Como preencher um verbete

```md
### Nome do conceito

- **Definição real:** o que é, no mundo real (produção rural / zootecnia / finanças).
- **Como funciona na prática:** processo, fórmula ou regra operacional real.
- **Fonte:** de onde veio esse conhecimento (livro, técnico, artigo, experiência).
- **Representação no jogo:** como o conceito vira dado/regra no domínio (`packages/domain`).
- **Simplificação aplicada:** o que foi propositalmente simplificado e por quê.
- **Impacto no gameplay:** que decisão do jogador esse conceito afeta.
```

## Verbetes

### Conversão alimentar (CA)

- **Definição real:** *(a preencher)* razão entre kg de ração consumida e kg (ou dúzias/unidades) de ovo produzido em um período.
- **Como funciona na prática:** *(a preencher)*
- **Fonte:** *(a preencher)*
- **Representação no jogo:** *(a preencher — provável campo em `LoteProducao` ou métrica derivada no `MotorPostura`)*
- **Simplificação aplicada:** *(a preencher)*
- **Impacto no gameplay:** afeta custo de produção por ovo e, portanto, margem.

### Recria e transição para produção (spiking)

- **Definição real:** *(a preencher)*
- **Como funciona na prática:** *(a preencher)*
- **Fonte:** *(a preencher)*
- **Representação no jogo:** *(a preencher)*
- **Simplificação aplicada:** *(a preencher)*
- **Impacto no gameplay:** *(a preencher)*

### Capital de giro

- **Definição real:** *(a preencher)* recursos necessários para sustentar a operação no intervalo entre pagar insumos e receber pela venda.
- **Como funciona na prática:** *(a preencher)*
- **Fonte:** *(a preencher)*
- **Representação no jogo:** diferença entre prazo de pagamento a fornecedores e prazo de recebimento de clientes/contratos, medida contra o caixa disponível.
- **Simplificação aplicada:** *(a preencher)*
- **Impacto no gameplay:** gatilho de missões de sobrevivência financeira (GDD seção 13).

<!--
Próximos verbetes candidatos (não preenchidos ainda):
- Densidade e ambiência do galpão
- Mortalidade e curva de mortalidade por lote
- Classificação de ovos (peso, integridade, tipo)
- Programa de luz / fotoperíodo
- Bonificação e descontos comerciais
- Prazo médio de pagamento / recebimento
- Nota de auditoria técnica (GDD 11.6)
-->
