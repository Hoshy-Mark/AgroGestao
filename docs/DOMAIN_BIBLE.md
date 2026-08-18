# Domain Bible — Avicultura de Postura e Gestão da Propriedade

> Regra: não abstrair antes de entender a regra de negócio real. (GDD §23)

Este documento registra, para a vertical de lançamento (Matriz + Poedeira Comercial) e para
os sistemas corporativos que a sustentam (terra, compras, transporte, crédito), cada conceito
de negócio real que embasa o `MotorPostura` e os módulos de Compras/Logística/Financeiro:
definição, funcionamento prático, fonte, representação no jogo, simplificação aplicada e
impacto no gameplay.

Convenção de cada entrada:

| Campo | Conteúdo |
| --- | --- |
| **Definição real** | O que é, no mundo real |
| **Funcionamento prático** | Como se comporta na operação |
| **Fonte** | De onde veio o dado |
| **Representação no jogo** | Como o motor de simulação modela isso |
| **Simplificação aplicada** | O que foi cortado ou achatado, e por quê |
| **Impacto no gameplay** | Que decisão do jogador isso afeta |

---

## Sumário

1. Terra e Propriedade Rural
2. Ciclo de vida da poedeira
3. Alimentação e conversão alimentar
4. Mortalidade e sanidade
5. Classificação e comercialização dos ovos
6. Economia do ciclo produtivo (ordem de grandeza)
7. Aquisição de animais: integração vertical vs. produção independente (com sistema de acerto)
8. Transporte de animais vivos
9. Transporte e logística de ovos
10. Compras, fornecedores, prazos e capital de giro
11. Crédito e financiamento rural
12. Seguro rural
13. Tributação da atividade rural
14. Construção e investimento em galpão (CAPEX)
15. Cláusulas contratuais de venda
16. Venda consignada — um terceiro canal comercial
17. Documentos fiscais por transação — a base da trilha de auditoria
18. Modelo de domínio: `DocumentoFiscal` e trilha de auditoria
19. Parâmetros consolidados para o motor de simulação
20. Próximas entradas pendentes e itens descartados
21. Fontes consultadas

---

## 1. Terra e Propriedade Rural

A herança do jogador (GDD §5) parte de um pressuposto que precisa ser explícito: **como o
jogador ocupa a terra**. No mundo real, existem três regimes juridicamente distintos, e cada
um implica uma estrutura de custo e de risco diferente.

### 1.1 Propriedade própria

**Definição real:** o produtor é dono do imóvel rural (matrícula própria). Não há custo
periódico de ocupação da terra, mas o capital fica imobilizado no ativo, e há custos fixos de
manutenção, impostos (ITR) e depreciação de benfeitorias.

**Fonte:** consolidação a partir das fontes de arrendamento/parceria abaixo, por contraste.

**Representação no jogo:** é o regime padrão da herança inicial — o jogador já recebe o
`Ativo` "terreno" sem dívida associada a ele especificamente (embora possa haver dívidas
gerais herdadas, conforme GDD §5).

**Simplificação aplicada:** ITR e questões fundiárias (regularização, usucapião, inventário)
ficam fora do MVP — a propriedade é tratada como resolvida juridicamente desde o início.

**Impacto no gameplay:** define o "chão" sobre o qual todas as decisões de expansão de
capacidade (novos galpões) acontecem sem custo de ocupação — só custo de construção.

### 1.2 Arrendamento rural

**Definição real:** contrato agrário (Estatuto da Terra, Lei nº 4.504/1964; Decreto nº
59.566/66) em que o proprietário (arrendador) cede o uso e gozo do imóvel a outra pessoa
(arrendatário) mediante **retribuição fixa** — o "aluguel rural" — **independente do resultado
da atividade**. O arrendatário assume sozinho os riscos e fica com a totalidade dos frutos.

**Funcionamento prático:** mesmo que a safra ou o ciclo produtivo seja ruim (queda de preço,
evento sanitário), o valor do arrendamento continua devido integralmente — é uma obrigação
fixa, como um aluguel comum.

**Fonte:** Ambito Jurídico, "Contratos de arrendamento e parceria rural"; Agrishow Digital,
"Arrendamento rural x Parceria agrícola"; Direito Rural, "Contrato de Arrendamento x Parceria
Rural".

**Representação no jogo:** uma `ContaPagar` recorrente de valor fixo por período (mensal ou por
ciclo), lançada automaticamente pelo motor de simulação, sem qualquer vínculo com a receita do
período — é a forma mais simples de simular "expandir para uma segunda área sem comprar a
terra".

**Simplificação aplicada:** sem cláusulas de reajuste por índice, sem disputas judiciais, sem
direito a benfeitorias na saída — o contrato é tratado como um valor fixo e um prazo, o
suficiente para gerar a decisão de trade-off (comprometer caixa fixo vs. ganhar capacidade).

**Impacto no gameplay:** é a primeira ferramenta de expansão de capacidade sem exigir todo o
capital de uma compra de terra — mas cria uma obrigação fixa que pesa mesmo em ciclos ruins,
reforçando o Pilar 2 (consequência percebida) em decisões de expansão.

### 1.3 Parceria rural

**Definição real:** também prevista no Estatuto da Terra, a parceria é o contrato em que o
proprietário (parceiro-outorgante) cede o uso do imóvel — podendo incluir benfeitorias,
animais e outros bens — ao parceiro-outorgado, mas **com partilha dos riscos e dos resultados**
da atividade, em percentuais definidos em contrato (limites percentuais fixados em lei). É uma
espécie de "sociedade capital-trabalho": o dono da terra entra com o imóvel, o parceiro entra
com o trabalho.

**Funcionamento prático:** se o ciclo for ruim, o proprietário recebe menos (ou nada); se for
bom, recebe uma fração combinada da produção ou do resultado financeiro. Juridicamente, a
diferença central em relação ao arrendamento é justamente essa variabilidade atrelada ao
resultado — mesmo contratos com quantidade prefixada podem ser reclassificados como parceria
se há risco de variação de preço embutido.

**Fonte:** ConJur, "Parceria agrícola versus arrendamento rural e riscos tributários"; Legale
Educacional, "Contratos Rurais: Diferenças entre Parceria e Arrendamento"; Migalhas,
"Diferenças nos conceitos de arrendamento rural e parceria rural".

**Representação no jogo:** um `Contrato` do tipo `PARCERIA`, com um `percentual_divisao`
aplicado sobre a receita (ou sobre o resultado líquido) do ciclo produtivo daquela unidade,
gerando uma `ContaPagar` variável em vez de fixa.

**Simplificação aplicada:** um único percentual simples sobre receita bruta no MVP, em vez da
divisão detalhada de custos/receitas específicos por item que existe na prática real.

**Impacto no gameplay:** cria uma alternativa de expansão de menor risco fixo (bom para
jogador com caixa apertado) mas que reduz a margem em ciclos bons — decisão real de apetite a
risco, coerente com o Pilar 1 (decisão acima de execução).

### 1.4 Contrato de integração como regime de uso do imóvel

Ver Seção 7 — a integração vertical avícola frequentemente se combina com parceria rural: o
proprietário cede a estrutura (galpões, equipamentos) *e* recebe os animais do integrador,
sendo remunerado por ave produzida/entregue, não pela venda direta do produto. Está detalhado
na Seção 7 porque a característica dominante ali é a propriedade dos animais, não da terra.

---

## 2. Ciclo de vida da poedeira

### 2.1 Fases biológicas

**Definição real:** a ave passa por três fases fisicamente separadas: **cria** (0–6 semanas),
**recria** (6–17 semanas) e **produção/postura** (17–90 semanas). Granjas comerciais mantêm
essas fases em galpões distintos, porque misturar idades aumenta risco sanitário.

**Funcionamento prático:** a maturidade sexual chega por volta da 18ª semana; antes disso a
ave só consome ração e não gera receita — é capital parado.

**Fonte:** Nutrimosaic, "Como funciona a avicultura de postura"; BNDES, *Avicultura de postura:
estrutura da cadeia produtiva*; aviNews Brasil, "Início da Postura".

**Representação no jogo:** todo lote (`Lote`) tem um `estagio`: `RECRIA` → `INICIO_POSTURA` →
`PRODUCAO` → `DECLINIO` → `DESCARTE`, avançando automaticamente por dia simulado conforme a
idade do lote em semanas.

**Simplificação aplicada:** cria e recria são fundidas em uma única fase `RECRIA` de 0–17
semanas, sem galpão fisicamente separado no MVP — apenas um custo de ração e um período sem
receita. A separação física vira decisão de investimento em fases futuras.

**Impacto no gameplay:** o jogador vê caixa saindo (ração + mão de obra) sem receita entrando
por ~17 semanas de jogo (semanas simuladas, não reais) — a primeira lição prática de capital
de giro citada no GDD §6.

### 2.2 Curva de postura

**Definição real:** a produção de ovos por ave não é constante; segue uma curva:

| Semana de idade | % de postura (aves em produção/dia) |
| --- | --- |
| 17–18 | 5–10% |
| 19–20 | ~50% |
| 24–30 (pico) | 90–95%+ |
| 45–60 | platô com leve queda |
| 60–90 | declínio progressivo até descarte |

**Fonte:** aviNews Brasil; SlideShare "Avicultura de Postura" (dados CEPLAC); EMATER-DF,
*Avicultura: Linhagens de Postura*.

**Representação no jogo:** o motor calcula, a cada tick diário, `ovos_do_dia = aves_vivas ×
taxa_postura(semana_idade)`, onde `taxa_postura` é uma tabela paramétrica por linhagem
(branca/vermelha), interpolada entre os pontos acima.

**Simplificação aplicada:** curva única simplificada por linhagem (2 curvas no MVP), sem
variação individual entre aves nem efeito fino de fotoperíodo/luz artificial.

**Impacto no gameplay:** explica por que um lote recém-iniciado "não paga as contas" nas
primeiras semanas mesmo com aves saudáveis — cria tensão de fluxo de caixa sem ser um bug.

### 2.3 Descarte e ciclo completo

**Definição real:** ao final do ciclo (80–90 semanas), a produção cai a ponto de não compensar
o custo de manutenção do lote. A ave é vendida para abate (descarte) e, idealmente, essa venda
paga o custo de reposição do próximo lote de pintainhas.

**Fonte:** Agronegócio AZ, "A Matemática da Caixa de 30 Dúzias".

**Representação no jogo:** ao atingir a semana de descarte configurada (parâmetro por
linhagem, ~90 semanas), o lote é automaticamente ofertado para venda como `Ativo` de descarte,
gerando uma `ContaReceber` cujo valor compõe o `PedidoCompra` do lote seguinte.

**Simplificação aplicada:** preço de descarte tratado como % fixo do custo da pintainha nova.

**Impacto no gameplay:** decisão real de "renovar o plantel agora ou esperar mais um pouco".

---

## 3. Alimentação e conversão alimentar

### 3.1 Consumo de ração por fase

**Definição real:** o consumo varia por fase, com valores documentados por poedeira ao longo
do ciclo (ex.: pré-inicial 0,336 kg, inicial 1,379 kg, crescimento 1,442 kg, desenvolvimento
0,791 kg, pré-postura 1,274 kg, e ~14,6–15,3 kg por fase de produção, em três sub-fases de ração
de produção com formulações diferentes).

**Fonte:** Embrapa, *Custo de Produção de Ovos* (Circular Técnica 127, dez/2008).

**Representação no jogo:** `consumo_diario_g = 112g` na fase de produção (valor de referência
para linhagens leves), multiplicado por `aves_vivas`, abatendo o `Estoque` de ração.

**Simplificação aplicada:** consumo tratado como constante única por fase (`RECRIA` vs
`PRODUCAO`), sem as sub-fases de formulação da Embrapa.

**Impacto no gameplay:** consumo de ração é o principal dreno de caixa recorrente.

### 3.2 Conversão alimentar (CA)

**Definição real:** métrica central de eficiência — quantos kg de ração são necessários para
produzir uma dúzia de ovos. Meta de mercado: **~1,35 kg/dúzia para linhagens brancas** e
**~1,50 kg/dúzia para linhagens vermelhas**; média de mercado mais ampla citada em ~1,7
kg/dúzia; estudos de campo registraram 1,591 kg/dúzia em condições controladas.

**Fonte:** Agronegócio AZ; Cidadão Consumidor (dados de mercado SP, 2024–2025); Revista Unimar
Ciências (estudo linhagem Hisex White).

**Representação no jogo:** `conversao_alimentar = kg_racao_consumida / duzias_produzidas`,
exposto como indicador de desempenho do lote — métrica central da "Saúde da Operação"
(GDD §11.6) na dimensão produtiva.

**Simplificação aplicada:** CA fixa por linhagem e por qualidade da ração comprada, sem efeito
de ambiência/estresse térmico no MVP.

**Impacto no gameplay:** gancho mecânico direto da lição de capital de giro do GDD §13
("preço menor não significa custo menor").

### 3.3 Custo de ração como parcela do custo total

**Definição real:** a alimentação representa **60–70% do custo total de produção** de ovos.

**Fonte:** aviNews Brasil; Fatece, *Análise de custo-benefício de sistemas de produção de
ovos*.

**Representação no jogo:** no fechamento de DRE, o custo de ração é sempre a maior linha
isolada de custo variável.

**Simplificação aplicada:** demais custos agregados em categorias mais largas do que num ERP
real.

**Impacto no gameplay:** justifica por que negociação com fornecedor de ração é a decisão
comercial mais recorrente do início de jogo.

---

## 4. Mortalidade e sanidade

**Definição real:** toda granja opera com uma taxa de mortalidade esperada por lote/ciclo,
afetada por densidade de alojamento, ambiência (temperatura, ventilação), sanidade e manejo.

**Fonte:** Revista Brasileira de Zootecnia (2009), estudo de densidade de alojamento em
poedeiras Dekalb White; BNDES, *Avicultura de postura*.

**Representação no jogo:** `taxa_mortalidade_base` diária por lote, modulada por um
multiplicador de risco calculado a partir de `ambiencia`, `densidade` e `sanidade` (GDD §19).

**Simplificação aplicada:** sem simulação de doenças específicas no MVP — mortalidade é taxa
agregada, com eventos sanitários pontuais representando picos anormais.

**Impacto no gameplay:** reduzir `aves_vivas` reduz produção futura de forma permanente —
investir em ambiência/infraestrutura é decisão de capital que se paga via menor mortalidade.

---

## 5. Classificação e comercialização dos ovos

### 5.1 Peso e classificação

**Definição real:** ovos são classificados por peso (ex.: extra a partir de 60g/unidade ou
720g/dúzia; classes decrescentes até ~45g/unidade ou 540g/dúzia).

**Fonte:** BNDES, *Avicultura de postura: estrutura da cadeia produtiva*.

**Representação no jogo:** cada coleta gera `Produto` com `peso_medio` derivado da linhagem e
idade do lote, determinando a `classe` e o preço-base de venda.

**Simplificação aplicada:** 3–4 classes no MVP (extra, grande, médio, descarte/trincado).

**Impacto no gameplay:** cria dimensão de qualidade além de volume.

### 5.2 Unidade comercial: caixa de 30 dúzias

**Definição real:** a unidade comercial padrão do mercado brasileiro é a **caixa de 30 dúzias
(360 ovos)**.

**Fonte:** Agronegócio AZ.

**Representação no jogo:** toda oferta de venda, contrato e cotação de mercado é expressa em
caixas de 30 dúzias na UI de Comercial.

**Impacto no gameplay:** ancora o dimensionamento de contratos (GDD §16) numa unidade real do
setor.

---

## 6. Economia do ciclo produtivo (ordem de grandeza)

**Definição real:** um lote de 100 poedeiras, ciclo de 90 semanas, tem custo total de produção
da ordem de **R$ 23.000**, produzindo cerca de **32 dúzias/ave** ao longo do ciclo. Em escala
de pequeno produtor (200 aves), com ovos a R$12/dúzia e produção de 90%, a operação gera
receita bruta mensal da ordem de R$5.400 e custo mensal da ordem de R$2.540.

**Fonte:** EMATER-DF; Click Petróleo e Gás, "Dinheiro com galinhas" (2025).

**Representação no jogo:** âncora de ordem de grandeza para a Game Economy v0.1.

**Simplificação aplicada:** valores usados como faixa de calibração, a ajustar por
playtesting.

**Impacto no gameplay:** define se o capital inicial herdado é "apertado mas sobrevivível" ou
"impossível".

---

## 7. Aquisição de animais: integração vertical vs. produção independente

Esta é uma das decisões estruturais mais importantes que faltava documentar: **o jogador
compra suas próprias aves e vende seu próprio produto, ou entra num contrato de integração?**
São dois modelos de negócio radicalmente diferentes, ambos reais e comuns no setor.

### 7.1 Produção independente

**Definição real:** o produtor compra as pintainhas de um incubatório por conta própria, é
proprietário do lote do início ao fim, assume todo o risco de mercado e vende o produto
(ovos ou aves de descarte) diretamente a quem quiser.

**Funcionamento prático:** ao adquirir pintainhas, o produtor deve buscar incubatórios idôneos,
com matrizes sadias e bom nível de anticorpos contra doenças comuns (newcastle, coriza
infecciosa, varíola aviária, gumboro, bronquite). O estado físico das pintainhas na chegada
(uniformidade, vigor) é decisivo para o resultado do lote inteiro.

**Fonte:** CPT, "O sucesso de uma granja começa pelas pintainhas!".

**Representação no jogo:** é o modelo padrão da herança inicial (GDD §5) e do MVP — o jogador
compra `Lote` de pintainhas via `PedidoCompra` a um `Fornecedor` (incubatório), com
`qualidade_lote` variável conforme o fornecedor escolhido, afetando mortalidade inicial e
uniformidade de produção.

**Simplificação aplicada:** qualidade do lote representada por um único índice (0–100) em vez
da checklist completa de inspeção veterinária.

**Impacto no gameplay:** reforça a decisão de "fornecedor barato vs. fornecedor confiável" já
prevista no GDD §11.2 — comprar pintainhas de baixa qualidade é uma armadilha de curto prazo
que gera mortalidade e CA piores no ciclo inteiro.

### 7.2 Integração vertical (contrato de integração)

**Definição real:** modelo em que uma empresa **integradora** (detentora de incubatório,
fábrica de ração e, em ciclo fechado, abatedouro) fornece os pintainhos e a ração a um produtor
**integrado**, que entra com terra, galpão, equipamentos e mão de obra. Os animais **permanecem
propriedade da integradora** durante todo o processo — o integrado não vende os ovos/aves no
mercado, apenas recebe uma remuneração por ave entregue/produzida, conforme padrão de qualidade
contratado. É juridicamente um contrato agrário típico desde a Lei nº 13.288/2016, distinto de
vínculo empregatício (a integradora não é empregadora do integrado).

**Funcionamento prático:** o ciclo pode ser **fechado (vertical)** — a integradora controla
fábrica de ração, incubatório e abatedouro próprios, e os "granjeiros" só entram com a
estrutura — ou **aberto (horizontal)** — a integradora terceiriza parte desses elos. A
integradora seleciona os integrados, faz o projeto técnico, acompanha a implantação do aviário
(6 meses a 1 ano da construção até o início da operação) e dá suporte técnico contínuo,
exigindo que o integrado siga os padrões de manejo.

**Fonte:** ConJur, "Contrato de integração, o novo contrato típico agrário"; Jusbrasil,
jurisprudência sobre "Contrato de Integração Avícola"; UNESP/FCAV, *Sistemas de produção de
frangos de corte e galinhas poedeiras*; Cocari, "A integração na atividade avícola..."; Canal
Rural, "Conheça as etapas para se tornar um integrado".

**Representação no jogo:** um `Contrato` do tipo `INTEGRACAO`, no qual os animais não entram no
balanço do jogador como `Ativo` próprio — em vez disso, o jogador recebe uma `ContaReceber`
periódica por ave/lote entregue dentro do padrão de qualidade acordado, e a integradora
fornece pintainhos e ração via `PedidoCompra` a custo zero (ou custo negociado), descontado da
remuneração final. O valor exato dessa remuneração é calculado pelo sistema de acerto — ver
Seção 7.3.

**Simplificação aplicada:** no MVP, a integração é representada como um **contrato alternativo
disponível a partir de certo ponto do jogo** (não implementado desde o dia 1), sem simular a
rede completa de granjeiros concorrendo pela mesma integradora — embora o *ranking* entre
produtores, que no mundo real afeta a remuneração (ver 7.3), seja um gancho natural para a IA
de concorrentes já prevista no roadmap (GDD §30).

**Impacto no gameplay:** é a segunda grande bifurcação estratégica do jogo, ao lado de
terra própria vs. arrendada — integração reduz risco de mercado e de capital de giro (a
integradora banca insumos) em troca de menor teto de lucro e menor autonomia comercial. Um
jogador avesso a risco pode migrar para integração numa fase difícil; um jogador que já
domina o mercado pode preferir permanecer independente para capturar toda a margem.

### 7.3 Sistema de acerto: como a integração liquida o pagamento

Esta é a peça que faltava para responder "como, exatamente, o jogador recebe da integradora" —
e é também onde diferentes clientes/integradoras podem, de fato, ter fórmulas diferentes.

**Definição real:** "acerto" é o nome de mercado para a liquidação financeira periódica entre
integradora e produtor integrado ao final de cada lote. Não é um valor fixo por ave — é
calculado por uma fórmula de eficiência. A mais usada no setor é o **IEP (Índice de Eficiência
Produtiva)**:

```
IEP = (Viabilidade × Ganho de Peso Diário) / (Conversão Alimentar × 10)
```

onde: **Viabilidade** é o % de aves entregues em relação ao número alojado (o inverso da
mortalidade, já coberto na Seção 4); **Ganho de Peso Diário** é o peso médio da ave dividido
pela idade do lote em dias; **Conversão Alimentar** é a métrica já documentada na Seção 3.2.
Quanto melhor o IEP do lote, maior a remuneração por ave — e várias integradoras comparam o IEP
de um produtor contra a **classificação geral de todos os integrados da região**: o produtor
mais eficiente do grupo recebe um valor por ave melhor que o menos eficiente, mesmo que ambos
tenham entregue lotes "aceitáveis".

**Funcionamento prático:** isso cria dois efeitos importantes: (1) o mesmo manejo (mesma
mortalidade, mesma CA) pode valer mais ou menos dependendo do desempenho dos concorrentes
naquele ciclo — não é uma nota absoluta, é relativa; (2) diferentes integradoras publicam
tabelas de bonificação diferentes (algumas dão mais peso à conversão alimentar, outras à
viabilidade), então o "melhor cliente" para um produtor pode depender do que ele já faz bem.

**Fonte:** Embrapa, "Desempenho zootécnico" (Portal Embrapa); UFSM, *Sistema Contratual de
Integração: Vantagens e Desvantagens*; artigo em Anais CBC, "Viabilidade econômica da atividade
avícola no sistema de integração".

**Representação no jogo:** cada `Contrato` do tipo `INTEGRACAO` carrega sua própria
`formula_acerto` — uma combinação de pesos sobre `viabilidade`, `ganho_peso`/`producao` e
`conversao_alimentar` do lote entregue, calculada no fechamento do ciclo pelo motor. Isso é
exatamente o mecanismo para "diferentes cálculos de acerto por cliente": a Integradora A pode
pagar mais por conversão alimentar boa, a Integradora B pode pagar mais por baixa mortalidade —
o jogador escolhe o contrato que combina com o que sua operação já faz bem, ou ajusta o manejo
para mirar a fórmula do contrato que quer fechar. Uma versão simplificada do ranking contra
outros produtores pode alimentar o sistema de concorrentes do GDD §30 sem precisar simular
cada granja rival em detalhe — basta uma distribuição de IEPs "de mercado" contra a qual o
lote do jogador é comparado.

**Simplificação aplicada:** fórmula única (a do IEP) com pesos parametrizáveis por contrato, em
vez do cardápio completo de índices que cada integradora real usa (algumas incluem também
uniformidade do lote, taxa de refugo, etc.).

**Impacto no gameplay:** transforma a integração de "vender por um preço fixo" em uma segunda
camada de otimização de manejo — o jogador não está só maximizando produção bruta, está
mirando a fórmula específica do contrato que assinou. É uma mecânica de propósito duplo: dá
profundidade à integração e cria o gancho natural para medir o jogador contra a IA de
concorrentes.

---

## 8. Transporte de animais vivos

> **Nota de curadoria:** a entrada original detalhava a regulamentação do CONTRAN (número da
> resolução, tipo de carroceria exigida por lei, sinalização obrigatória). Isso é lore, não
> mecânica — nenhuma dessas regras vira uma escolha do jogador. Mantido só o que gera uma
> variável no motor: mortalidade em trânsito como função de distância e qualidade do
> transportador.

**Definição real:** a apanha das aves na granja é manual, acomodadas em gaiolas empilháveis; um
caminhão típico carrega cerca de 3.300 aves. No desembarque de pintainhos, mortalidade
concentrada em certas áreas do veículo costuma indicar problema de ventilação/temperatura
localizado durante a viagem — ou seja, mortalidade de transporte tem causa gerenciável
(qualidade do veículo/transportador), não é puro acaso.

**Fonte:** Canal Rural, "Frangos, pintainhos e até ovos: caminhoneiro conta como carrega carga
viva"; O Presente Rural, "Armazenamento e transporte de pintinhos".

**Representação no jogo:** todo `PedidoCompra` de pintainhas e toda venda de aves de descarte
gera um evento de transporte com `mortalidade_transporte` (%) aplicada sobre a quantidade,
função de distância ao fornecedor/comprador e qualidade do transportador contratado.

**Simplificação aplicada:** um único índice de mortalidade em trânsito, sem simular veículo,
motorista ou rota.

**Impacto no gameplay:** conecta a decisão de "qual fornecedor escolher" (GDD §11.2) também à
distância — fornecedor mais barato e mais distante pode ter mortalidade de transporte maior,
compensando parte da economia no preço.

---

## 9. Transporte e logística de ovos

**Definição real:** diferente de animais vivos, o desafio logístico do ovo é a **fragilidade
física** — perdas por quebra de casca e por danos internos (albúmen, gema, membrana) causados
pela agitação do produto durante o transporte, historicamente tratadas como "inevitáveis" no
setor, embora tecnologias recentes (embalagens de polpa moldada reforçada, sensores de impacto)
venham reduzindo essas perdas.

**Funcionamento prático:** a embalagem (caixa/bandeja) é o principal fator de proteção —
distribui a pressão uniformemente e impede que os ovos se movam dentro da caixa; sobrecarregar
a embalagem além do limite recomendado, misturar outras cargas com os ovos, ou trafegar em
rotas malconservadas aumentam diretamente a taxa de quebra. Rotas com boa pavimentação e menor
tráfego reduzem tempo de viagem e preservam a integridade da carga.

**Fonte:** Frotanews, "Logística de cargas frágeis: o que o setor de transporte precisa saber
sobre ovos"; Cotefrete, "Desafio no transporte de ovos no Brasil"; Equipacenter, "Embalagem na
Logística"; Embalagens M2B, "Embalagens para ovos: 5 dicas para transportar com segurança".

**Representação no jogo:** toda venda de ovos gera uma `taxa_quebra_transporte` (%) aplicada
sobre o volume vendido, reduzindo a quantidade efetivamente entregue e faturada. Essa taxa é
modulada por: qualidade da embalagem comprada (item de `Estoque`/insumo, com custo próprio),
distância até o cliente e qualidade do transportador (frota própria vs. terceirizada
contratada).

**Simplificação aplicada:** um único percentual de quebra por entrega, sem simular embalagem
por embalagem — mas com o percentual sensível às escolhas de investimento em embalagem e
transporte, para preservar a decisão real de "investir em embalagem melhor reduz perda, mas
custa mais por unidade".

**Impacto no gameplay:** cria uma segunda camada de custo variável de comercialização, distinta
do preço de venda — um contrato com cliente distante e exigente (GDD §14, "exigência de
qualidade") só é lucrativo se a logística for adequada; entregar com quebra alta prejudica
`Confiança` do cliente mesmo que o volume contratado nominalmente "saia da granja".

---

## 10. Compras, fornecedores, prazos e capital de giro

**Definição real:** fornecedores de insumos (ração, pintainhas, embalagens) oferecem
combinações de preço à vista vs. faturado (prazo de pagamento), e o custo de ração é sensível a
insumos-commodity (milho, farelo de soja) que oscilam mês a mês — ex.: alta de milho de
R$63 para R$73/saca de 60kg em poucos meses, puxando o custo de produção para cima mesmo sem
nenhuma decisão errada do produtor.

**Fonte:** Cidadão Consumidor, "Alta do preço do ovo" (dados CEPEA/Embrapa Aves e Suínos,
2024–2025).

**Representação no jogo:** cada `Fornecedor` tem `preco_vista`, `preco_faturado`, `prazo_dias`
e `confiabilidade`; o `Mercado` aplica variação periódica sobre o preço-base de ração
(componente de commodity), independente das decisões do jogador — gancho mecânico do Pilar 2
aplicado a choques externos, não só a decisões do jogador.

**Simplificação aplicada:** sem separação entre milho e farelo de soja como insumos distintos
no MVP — um único índice de "custo de ração" absorve essa variação.

**Impacto no gameplay:** base mecânica direta da missão de capital de giro descrita no GDD §13
(ração para 10 dias, contrato recebendo em 30 dias, caixa limitado).

---

## 11. Crédito e financiamento rural

Faltava no documento original a principal fonte de capital externo disponível a um pequeno
produtor real: as linhas de crédito rural subsidiadas pelo governo federal, centrais para
qualquer decisão de expansão (GDD §16, §28).

### 11.1 Pronaf Custeio

**Definição real:** linha de crédito para financiar as despesas normais do ciclo produtivo em
curso (no caso avícola: ração, vacinas, medicamentos, mão de obra do ciclo). Destinada
especificamente a produtores enquadrados como agricultura familiar (CAF/DAP), com renda e área
dentro de limites legais (até 4 módulos fiscais).

**Funcionamento prático:** limite de até R$ 250 mil por ano agrícola; juros subsidiados,
variando por atividade — na prática, faixas de 1% a 7,5% ao ano dependendo da cultura/atividade
financiada, muito abaixo de juros de mercado; prazo de pagamento de até 10 meses para a maioria
das atividades (avicultura de postura incluída explicitamente na lista de atividades
elegíveis), podendo chegar a 20 meses em casos específicos de regime extensivo.

**Fonte:** BNDES, "Pronaf Custeio"; Sicredi, "Pronaf Custeio"; Banco Amazônia, "PRONAF
Custeio"; MDA, "Resumo das linhas de crédito rural do Pronaf — Safra 2025/2026".

**Representação no jogo:** um tipo de `Financiamento` de curto prazo, com `taxa_juros` bem
abaixo do crédito comercial comum, `prazo_meses` curto (~10), e elegibilidade condicionada ao
porte da empresa do jogador (só disponível enquanto a operação for "pequena" — reforçando a
fantasia de herdeiro pequeno produtor do GDD §4).

**Simplificação aplicada:** sem a burocracia de DAP/CAF em si — a elegibilidade é simplificada
para "porte da empresa abaixo de um limiar", em vez de simular toda a documentação.

**Impacto no gameplay:** é a resposta mecânica real à missão de capital de giro do GDD §13 —
em vez de negociar só com fornecedor, o jogador pode recorrer a crédito subsidiado para cobrir
o intervalo entre pagar insumos e receber pela venda, com custo de juros bem menor que crédito
comercial genérico.

### 11.2 Pronaf Investimento (Mais Alimentos)

**Definição real:** linha para investimento em infraestrutura, máquinas, equipamentos e
aquisição de matrizes/reprodutores — não para despesas correntes, mas para capacidade.

**Funcionamento prático:** limite de até R$ 400–450 mil/ano para avicultura (entre as
atividades de maior valor agregado elegíveis); juros de referência na faixa de 1,5% a 7,5% ao
ano conforme o item financiado; prazos mais longos — até 8 anos (com até 3 de carência) para
aquisição isolada de matrizes/reprodutores, até 10 anos (com até 3 de carência) para os demais
itens de investimento.

**Fonte:** Aegro, "Pronaf 2025: Guia Completo"; ANATER, "Pronaf: saiba mais"; BNB, "Linha de
Crédito para Investimento (Pronaf Mais Alimentos)"; Caixa, "Pronaf Investimento".

**Representação no jogo:** segundo tipo de `Financiamento`, de longo prazo e carência inicial,
usado para expandir capacidade (novo galpão, novo lote de matrizes) em vez de cobrir o ciclo
corrente — reflete a diferença real entre "capital de giro" e "capital fixo" que o GDD §11.1
já menciona como conceito central do sistema Financeiro.

**Simplificação aplicada:** um único produto de investimento com prazo/carência parametrizados,
em vez do cardápio completo de sublinhas (Pronaf Mais Alimentos, Agroecologia, etc.).

**Impacto no gameplay:** viabiliza mecanicamente a progressão descrita no GDD §28 ("mais
galpões", "financiamento para expansão") sem exigir que o jogador acumule 100% do capital
via lucro operacional puro — mas com carência e prazo que criam um compromisso de médio prazo
visível no fluxo de caixa futuro (relevante para o relatório de fluxo de caixa do GDD §21.4).

### 11.3 Risco e limite de crédito

**Definição real:** o acesso e as condições de crédito rural, mesmo subsidiado, dependem de
garantias e de um projeto técnico que demonstre viabilidade de retorno em prazo compatível com
o ciclo produtivo — não é um cheque em branco.

**Fonte:** BNDES, "Pronaf Custeio" (seção de garantias); BNB, "Linha de Crédito para
Investimento" (exigência de projeto técnico).

**Representação no jogo:** o `limite_credito` da empresa (já previsto no modelo de dados do
GDD §9, campo `Crédito` do Estado da Empresa) determina o teto de financiamento disponível, e
esse limite cresce com `Reputação` e histórico de pagamentos em dia — fechando o loop com o
sistema de reputação já descrito no GDD §14.

**Simplificação aplicada:** sem avaliação de "projeto técnico" propriamente dita — o limite é
uma função direta de reputação e histórico, calculável automaticamente pelo motor.

**Impacto no gameplay:** cria uma razão mecânica concreta para o jogador cuidar da reputação
mesmo fora do contexto comercial (clientes/fornecedores) — reputação ruim também fecha portas
de crédito, não só de negociação.

---

## 12. Seguro rural

Faltava a ferramenta de mitigação de risco que espelha, do lado financeiro, todo o risco
sanitário e climático já modelado no GDD §19 (eventos sanitários) e nas Seções 4 e 8 deste
documento (mortalidade e transporte).

### 12.1 Seguro Propriedade Rural e Rebanho

**Definição real:** apólice que protege conjuntamente as benfeitorias da propriedade e os
animais de produção. Para aves, a identificação é feita por lote (não é preciso identificar
cada ave individualmente, ao contrário de bovinos). Cobertura básica: incêndio, raio,
explosão, vendaval, ciclone, granizo, impacto de veículos, alagamento e inundação. Cobertura
adicional para rebanho inclui morte durante embarque, desembarque ou deslocamento — ou seja,
o próprio risco de transporte descrito na Seção 8 pode ser segurado.

**Fonte:** Swiss Re Corporate Solutions, "Seguro Propriedade Rural e Rebanho".

**Representação no jogo:** um produto de `Seguro` contratável, com `premio_mensal` e
`cobertura` (lista de eventos cobertos, mapeada 1:1 aos tipos de `EventoSanitario`/
`EventoClimatico` já previstos no GDD §19), que substitui uma perda pontual por um custo fixo
recorrente menor — o clássico trade-off de gestão de risco.

**Simplificação aplicada:** apólice única por propriedade, com pacotes de cobertura
pré-definidos (básico, básico + transporte, completo), em vez de cotação item a item.

**Impacto no gameplay:** dá ao jogador uma ferramenta ativa contra os eventos negativos
aleatórios do GDD §19, em vez de deixá-lo apenas reativo — decisão de "pagar um prêmio fixo
todo mês para reduzir a variância de eventos ruins" é uma lição financeira real (seguro como
instrumento de gestão de risco, não de lucro esperado). No Brasil o seguro rural é parcialmente
subsidiado pelo governo federal, o que o torna acessível mesmo a um pequeno produtor — por
isso, no jogo, o prêmio já é calibrado como opção viável desde o início, não como luxo de
operação grande.

### 12.2 Seguro específico para avicultura — cobertura por falta de energia

**Definição real:** um produto de mercado oferece cobertura específica para mortalidade de
aves por interrupção no fornecimento de energia elétrica — risco recorrente, já que a
ventilação/climatização de aviários modernos depende de energia constante.

**Fonte:** Alper Seguros, "Seguro Avícola".

**Representação no jogo:** um risco `FALTA_DE_ENERGIA` no catálogo de eventos do GDD §19, com
probabilidade maior em propriedades sem gerador/energia solar, e um addon de seguro que cobre o
prejuízo financeiro desse evento específico.

**Impacto no gameplay:** cria uma decisão de investimento cruzada entre infraestrutura (comprar
gerador) e seguro (contratar cobertura) para o mesmo risco — dois caminhos válidos com custos e
efeitos diferentes.

---

## 13. Tributação da atividade rural

O GDD ainda não modela nenhuma forma de imposto — um ponto cego relevante, já que tributação é
uma das primeiras decisões estruturais reais de qualquer produtor (pessoa física ou jurídica) e
afeta diretamente o resultado líquido de cada ciclo.

### 13.1 Pessoa física vs. pessoa jurídica

**Definição real:** a legislação brasileira permite que o produtor rural atue como pessoa
física ou como pessoa jurídica, com regras e alíquotas próprias para cada modelo — e essa
escolha também afeta o acesso a crédito rural e a determinados tipos de contrato comercial
(alguns compradores exigem CNPJ). Cerca de **92% da atividade rural no Brasil é explorada como
pessoa física**, em grande parte por causa da agricultura familiar.

**Fonte:** Agronota, "Produtor Pessoa Física e Jurídica: quais as diferenças?"; Aegro,
"Tributação Rural: Guia Completo".

**Representação no jogo:** o jogador herda a operação como `PESSOA_FISICA` por padrão (coerente
com a fantasia de pequeno herdeiro do GDD §4–5), com a opção de migrar para `PESSOA_JURIDICA`
como marco de progressão (GDD §28) — abrindo acesso a contratos maiores e a mais linhas de
crédito, em troca de uma estrutura tributária mais complexa.

**Simplificação aplicada:** a transição é tratada como uma decisão única e binária no jogo, não
um processo administrativo gradual.

**Impacto no gameplay:** vira um marco de "virada de jogo" — sair de pequeno produtor
individual para empresa rural — coerente com a curva de progressão de longo prazo do GDD.

### 13.2 ITR — Imposto sobre a Propriedade Territorial Rural

**Definição real:** imposto federal anual, pago por todo proprietário de imóvel rural (pessoa
física ou jurídica), calculado com base na área total do imóvel e no **Grau de Utilização
(GU)** — o percentual da área efetivamente usado para atividade agropecuária. Quanto maior o
GU, menor a alíquota; terra ociosa paga mais.

**Fonte:** Aegro, "Tributação Rural"; Sensix Blog, "Tributação rural: 4 principais tributos";
Lage Portilho Jardim, "Tributação do produtor rural".

**Representação no jogo:** uma `ContaPagar` anual proporcional à `area_total` da propriedade e
inversamente proporcional ao `grau_de_utilizacao` (área com galpões/produção ativa dividida
pela área total) — recompensando mecanicamente o jogador por não deixar terra ociosa, um
incentivo real do desenho tributário brasileiro.

**Simplificação aplicada:** cálculo simplificado em faixas (2–3 níveis de alíquota conforme
GU), em vez da tabela progressiva completa da Lei 9.393/1996.

**Impacto no gameplay:** dá um motivo financeiro concreto para expandir a área produtiva de uma
propriedade grande e subutilizada, em vez de deixar o excedente parado — reforça decisões de
expansão de capacidade.

### 13.3 Funrural e demais tributos sobre a atividade

**Definição real:** o Funrural é uma contribuição previdenciária obrigatória sobre a
comercialização de produtos rurais, com opção de recolhimento de **1,2% sobre a receita bruta**
(mais 0,1% de GILRAT) ou 20% sobre a folha de pagamento (produtor pessoa física). Pessoas
jurídicas ainda respondem por IRPJ, CSLL, PIS e COFINS, podendo optar entre Simples Nacional,
Lucro Presumido ou Lucro Real. Produtor pessoa física sem escrituração de Livro Caixa paga
alíquota simplificada de 20% sobre a receita bruta anual.

**Fonte:** ArtData Contabilidade, "Produtor Rural Pessoa Física - Tributação"; Agronota,
"Tributação da atividade rural: um guia completo"; Contábeis, "IR do produtor rural".

**Representação no jogo:** um percentual fixo (`aliquota_funrural`) aplicado sobre toda receita
bruta de venda, deduzido automaticamente no fechamento do `HistoricoProducao`/DRE — a linha de
"impostos" que hoje falta no modelo financeiro do GDD §21.

**Simplificação aplicada:** um único percentual efetivo simplificado por regime (pessoa física
vs. jurídica), sem simular Livro Caixa, regimes de apuração (Lucro Real/Presumido) ou
deduções detalhadas.

**Impacto no gameplay:** toda receita de venda no jogo passa a ter uma dedução tributária real
antes de virar caixa líquido — relevante para o cálculo de precificação e de viabilidade de
contratos (GDD §16), que hoje provavelmente calcula margem só sobre custo direto.

---

## 14. Construção e investimento em galpão (CAPEX)

Faltava dado concreto de quanto custa, de fato, expandir capacidade física — insumo direto
para o sistema de "mais galpões" do GDD §28.

> **Nota de curadoria:** a escala "hobby" (dezenas de aves em galinheiro doméstico) foi
> removida — o jogador começa herdando uma granja comercial (GDD §5), então esse degrau nunca
> aparece no fluxo do jogo. A itemização de equipamentos internos (comedouro, nebulizador,
> dosador de cloro etc.) foi reduzida a uma nota de uma linha: é detalhe real, mas o GDD já
> optou por agregá-lo em 2–3 categorias largas (`AMBIENCIA`, `HIGIENIZACAO`) e não há indício de
> que o MVP precise do item individual — vira gordura até que o roadmap peça esse nível de
> granularidade.

### 14.1 Escala de pequeno produtor comercial (o degrau relevante para o MVP)

**Definição real:** uma granja comercial pequena, de **~300 aves**, custa entre **R$15.000 e
R$25.000** para começar, incluindo galpão, aves, ração inicial e equipamentos — com retorno do
investimento entre 5 e 12 meses conforme manejo e preço de venda. Densidade recomendada: 6–8
aves por m² em piso, ou 12–15 aves/m² em sistema de gaiolas.

**Fonte:** Granja Forte, "Como Montar uma Granja de Poedeiras: Guia Completo com Custos".

**Representação no jogo:** esta é a faixa que melhor calibra o **primeiro galpão real** da
campanha (GDD §5–6) — coerente em ordem de grandeza com o custo total de ciclo de 100 aves já
citado na Seção 6 (~R$23.000), o que dá consistência cruzada entre as duas fontes.

### 14.2 Escala industrial (referência de teto para fases avançadas)

**Definição real:** aviários automatizados de grande porte custam a partir de **R$500 mil**
podendo passar de **R$1 milhão** para quem começa do zero (incluindo terraplenagem). Quem já
tem infraestrutura básica (área cercada, rede elétrica, gerador) expande por cerca de R$840 mil
por galpão adicional. Custo de construção de referência: cerca de **R$350/m²** para um aviário
bem equipado.

**Fonte:** Gazeta do Povo, "Criar galinha virou negócio para quem já tem pelo menos R$1
milhão"; Sindicarne, "Vai construir seu aviário?".

**Representação no jogo:** teto de referência para expansão multi-galpão em fases avançadas —
mostra que a curva de investimento não é linear: o segundo aviário custa menos que o primeiro
(infraestrutura compartilhada já paga), mas a escala industrial exige capital de outra ordem de
grandeza, coerente com crédito de investimento de longo prazo (§11.2) em vez de capital de
giro.

*(Equipamentos internos do galpão — comedouro, nebulizador, aquecedor, lavadora de ovos —
existem e têm custo próprio real, mas ficam fora deste documento até o roadmap exigir
investimento item a item; hoje cabem dentro das categorias `AMBIENCIA`/`HIGIENIZACAO` do GDD
§11.4.)*

---

## 15. Cláusulas contratuais de venda

Esta é a peça que faltava para dar corpo real ao sistema de Contratos com Clientes já
desenhado no GDD §16 — hoje a "matemática da caixa de 30 dúzias" existe, mas não as cláusulas
que tornam um contrato bom ou ruim além do preço.

**Definição real:** contratos de fornecimento agrícola, na prática jurídica brasileira,
giram em torno de um pequeno conjunto de cláusulas recorrentes, independentemente do produto:
prazo e periodicidade de entrega, multa por atraso ou descumprimento (tipicamente um percentual
do valor do contrato), forma e prazo de pagamento, responsabilidade pelo transporte/frete
(cuja parte assume o custo e o risco da entrega), especificação de qualidade/peso do produto, e
condição de rescisão (aviso prévio, geralmente 30 dias). Contratos maiores também costumam
prever cláusula de força maior (eventos climáticos) e, quando envolvem somas altas, garantias
reais.

**Fonte:** SEDEP, modelos de "Contrato de Fornecimento de Produtos Agrícolas" (prazo
determinado e indeterminado); Vigna Advogados, "Contratos do Agronegócio"; Jusbrasil,
"Contrato de Fornecimento de Insumos Agrícolas".

**Representação no jogo:** cada `Contrato` de venda ganha, além de `preco` e `quantidade`, os
campos que já fazem sentido para o loop de decisão do GDD §16: `prazo_entrega`,
`percentual_multa_atraso`, `responsavel_transporte` (produtor ou comprador assume o frete/risco
de quebra descrito na Seção 9), `especificacao_qualidade` (classe mínima aceita, ligando ao
sistema de classificação da Seção 5) e `prazo_pagamento`. Descumprir qualquer um gera a multa
como `ContaPagar`, e reincidência reduz `Confiança` do cliente (GDD §14).

**Simplificação aplicada:** um conjunto fixo de 5 campos negociáveis por contrato, em vez do
texto jurídico completo — o suficiente para criar trade-offs reais (aceitar transportar por
conta própria barateia o contrato mas expõe à quebra da Seção 9; aceitar multa maior por atraso
sinaliza confiabilidade e pode render preço melhor).

**Impacto no gameplay:** transforma "fechar um contrato" de uma decisão de preço único para uma
negociação de múltiplas variáveis — exatamente o tipo de decisão que o Pilar 1 (decisão acima
de execução) pede, e dá ao sistema de Reputação/Confiança do GDD §14 um gatilho mecânico
concreto (cumprir cláusula vs. levar multa) em vez de abstrato.

---

## 16. Venda consignada — um terceiro canal comercial

Além de venda direta por contrato (§15) e integração (§7), existe um terceiro modelo comercial
real e comum no varejo de alimentos perecíveis: a consignação. Vale a pena documentar porque
muda o risco de quem fica com o produto não vendido — algo que hoje nenhum canal do GDD cobre.

**Definição real:** na venda consignada (juridicamente um "contrato estimatório"), o **
consignante** (o produtor, dono do ovo) entrega uma quantidade de produto ao **consignatário**
(um varejista — mercearia, feira, pequeno mercado) para que este tente vender. O consignatário
não paga pelo produto na entrada: só paga pelo que efetivamente vender, dentro de um prazo
combinado, e **devolve o que não vendeu**. Uma vez que o produto entra no estabelecimento do
consignatário, o risco de perda/deterioração passa a ser dele — mas ele não é obrigado a
comprar o que não conseguiu vender.

**Funcionamento prático:** o consignante define o preço mínimo de revenda e, às vezes, uma
margem máxima que o consignatário pode praticar. Se o consignatário não devolver nem pagar
pelo que recebeu, ele continua devendo o preço combinado — a devolução física é a única forma
de se livrar da obrigação de pagamento.

**Fonte:** Jusbrasil, jurisprudência sobre "Consignação de Mercadorias" (contrato estimatório);
Jusbrasil, "[Modelo] Contrato de venda em consignação"; Nota Fiscal Simples, "Operações de
Consignação".

**Representação no jogo:** um terceiro `tipo_venda` além de `CONTRATO_DIRETO` e `INTEGRACAO`:
`CONSIGNACAO`, em que o `Estoque` de ovos sai da granja para um `Cliente` do tipo pequeno
varejo sem gerar `ContaReceber` imediata — em vez disso, ao fim de um `prazo_consignacao`, o
motor liquida: parte vendida vira receita (ao preço combinado), parte não vendida retorna ao
`Estoque` do jogador (com uma penalidade de qualidade/quebra proporcional ao tempo fora da
granja, ligando à Seção 9).

**Simplificação aplicada:** sem simular o fluxo fiscal de nota de remessa/devolução — o jogo só
precisa da mecânica de risco (produto sai, pode não virar receita, pode voltar degradado), não
da escrituração contábil por trás dela.

**Impacto no gameplay:** é um canal de menor risco de relacionamento (não depende de fechar
contrato antes de vender) mas de maior risco de resultado — o jogador pode entregar um volume
grande a um pequeno mercado e, no acerto, descobrir que boa parte voltou (ou voltou
degradada). Serve como contraponto ao contrato fixo do §15: contrato garante preço mas exige
cumprir cláusula; consignação não trava preço nem cláusula, mas não garante venda nenhuma.

---

## 17. Documentos fiscais por transação — a base da trilha de auditoria

Cada canal comercial e cada compra já documentados neste arquivo (§7 acerto, §10 compras,
§15 contrato direto, §16 consignação) tem, no mundo real, um documento fiscal correspondente
diferente — e é essa diferença que dá ao jogo uma trilha de auditoria naturalmente rica, sem
precisar inventar um sistema de log à parte.

**Definição real:** produtor rural (pessoa física ou jurídica) emite documentos fiscais
diferentes conforme a operação: **NFP-e/NF-e modelo 55** para venda de produção (ovos, aves de
descarte); **nota de entrada** para compras de insumos (ração, pintainhas) recebida do
fornecedor; **nota de remessa** para envio de mercadoria em consignação (sem venda ainda —
saída sem transferência de propriedade); **nota de devolução** para o que o consignatário
não vendeu; e, no caso de integração, um documento de **acerto/liquidação** periódico que
resume o resultado do lote (IEP, valores apurados, descontos de insumos fornecidos pela
integradora) — não é uma NF de venda convencional, porque o produtor nunca foi dono do animal.

**Fonte:** Aegro, "Nota Fiscal de Produtor Rural: Guia Completo"; Fiscal.io/Avalara, "Nota
Fiscal Eletrônica Produtor Rural"; FarmPlus, "Nota Fiscal do Produtor Rural 2026".

**Representação no jogo:** cada tipo de transação já modelado neste documento passa a emitir um
`DocumentoFiscal` com número fictício e sequencial — não um número de NF-e real, mas um
identificador com a mesma função (rastreável, imutável, ligado à transação que o originou). A
sequência completa desses documentos, em ordem cronológica, **é** a trilha de auditoria: em vez
de um log genérico "aconteceu X", cada evento financeiro do jogo já nasce como um documento
tipado, o que também dá ao jogador uma tela de "Documentos" navegável e realista sem custo
extra de design. Modelo de dados na Seção 18.

**Simplificação aplicada:** números fictícios, sem validação de chave de acesso ou schema
XML real — a forma imita o real (série, número, tipo, partes, valor) para dar autenticidade
visual, mas não tem validade fiscal nenhuma nem se conecta a nenhum órgão externo.

**Impacto no gameplay:** transforma o histórico financeiro (GDD §21) de números soltos em uma
sequência de documentos que o jogador pode abrir, entender e — em fases avançadas — usar como
evidência em disputas de contrato (ex.: provar que entregou dentro do prazo antes de discutir
uma multa).

---

## 18. Modelo de domínio: `DocumentoFiscal` e trilha de auditoria

Segue uma primeira versão do modelo, no estilo do `packages/domain` (TypeScript puro, sem
dependência de framework), pronta para ser adaptada ao motor real.

```typescript
// packages/domain/src/fiscal/documento-fiscal.ts

/**
 * Tipos de documento fiscal fictício gerados pelo motor de simulação.
 * Cada tipo corresponde a uma transação real já documentada na Domain Bible.
 */
export enum TipoDocumentoFiscal {
  NOTA_ENTRADA_COMPRA = "NOTA_ENTRADA_COMPRA",       // compra de ração, pintainhas, insumos (§10)
  NOTA_VENDA_DIRETA = "NOTA_VENDA_DIRETA",           // venda por contrato direto (§15)
  NOTA_REMESSA_CONSIGNACAO = "NOTA_REMESSA_CONSIGNACAO", // saída p/ consignatário (§16)
  NOTA_VENDA_CONSIGNACAO = "NOTA_VENDA_CONSIGNACAO", // liquidação do que o consignatário vendeu
  NOTA_DEVOLUCAO_CONSIGNACAO = "NOTA_DEVOLUCAO_CONSIGNACAO", // retorno do não vendido
  NOTA_ACERTO_INTEGRACAO = "NOTA_ACERTO_INTEGRACAO", // liquidação periódica de integração (§7.3)
  NOTA_DESCARTE_LOTE = "NOTA_DESCARTE_LOTE",         // venda de aves de descarte (§2.3)
  NOTA_TRANSPORTE = "NOTA_TRANSPORTE",               // frete de animais vivos (§8), opcional
}

export enum StatusDocumentoFiscal {
  EMITIDO = "EMITIDO",
  CANCELADO = "CANCELADO",
}

export interface ItemDocumentoFiscal {
  descricao: string;        // ex.: "Ração fase produção 40kg", "Ovos classe extra (caixa 30dz)"
  quantidade: number;
  unidade: string;          // "kg", "duzia", "caixa30dz", "ave"
  valorUnitario: number;
  valorTotal: number;
}

export interface DocumentoFiscal {
  id: string;                       // uuid interno
  numero: number;                   // sequencial por série, fictício
  serie: number;                    // 1 série por tipo de documento, simplificado
  tipo: TipoDocumentoFiscal;
  status: StatusDocumentoFiscal;
  dataEmissao: string;              // ISO 8601, data simulada do jogo
  emitenteId: string;               // quem emite (jogador ou contraparte, conforme tipo)
  destinatarioId: string;           // quem recebe
  itens: ItemDocumentoFiscal[];
  valorTotal: number;
  chaveFicticia: string;            // string decorativa, sem valor fiscal real
  referencia: {
    transacaoId: string;            // liga ao PedidoCompra, Contrato, Lote etc. de origem
    contratoId?: string;
    loteId?: string;
  };
}

/** Gera uma "chave" decorativa que imita o formato de uma chave de acesso de NF-e,
 * apenas para dar autenticidade visual à UI — não tem nenhuma validade fiscal. */
function gerarChaveFicticia(numero: number, serie: number, tipo: TipoDocumentoFiscal): string {
  const base = `${serie}`.padStart(3, "0") + `${numero}`.padStart(9, "0");
  const hashTipo = tipo.length.toString().padStart(2, "0");
  return `FIC-${base}-${hashTipo}-0000`;
}

/** Serviço de numeração: uma sequência independente por tipo de documento,
 * persistida junto ao estado da empresa (equivalente a um contador por série). */
export class NumeradorDocumentoFiscal {
  private contadores = new Map<TipoDocumentoFiscal, number>();

  proximoNumero(tipo: TipoDocumentoFiscal): number {
    const atual = this.contadores.get(tipo) ?? 0;
    const proximo = atual + 1;
    this.contadores.set(tipo, proximo);
    return proximo;
  }
}

/** Fábrica central: toda transação financeira do motor passa por aqui para
 * nascer já como documento fiscal — é isso que forma a trilha de auditoria. */
export class FabricaDocumentoFiscal {
  constructor(private numerador: NumeradorDocumentoFiscal) {}

  emitir(params: {
    tipo: TipoDocumentoFiscal;
    emitenteId: string;
    destinatarioId: string;
    itens: ItemDocumentoFiscal[];
    dataEmissao: string;
    referencia: DocumentoFiscal["referencia"];
    serie?: number;
  }): DocumentoFiscal {
    const serie = params.serie ?? 1;
    const numero = this.numerador.proximoNumero(params.tipo);
    const valorTotal = params.itens.reduce((soma, item) => soma + item.valorTotal, 0);

    return {
      id: crypto.randomUUID(),
      numero,
      serie,
      tipo: params.tipo,
      status: StatusDocumentoFiscal.EMITIDO,
      dataEmissao: params.dataEmissao,
      emitenteId: params.emitenteId,
      destinatarioId: params.destinatarioId,
      itens: params.itens,
      valorTotal,
      chaveFicticia: gerarChaveFicticia(numero, serie, params.tipo),
      referencia: params.referencia,
    };
  }

  cancelar(doc: DocumentoFiscal): DocumentoFiscal {
    return { ...doc, status: StatusDocumentoFiscal.CANCELADO };
  }
}

/**
 * Repositório de auditoria: a trilha completa é simplesmente a lista ordenada
 * de todos os documentos emitidos por uma empresa/propriedade, sem necessidade
 * de uma estrutura de log paralela — o documento fiscal já É o registro de auditoria.
 */
export interface RepositorioAuditoriaFiscal {
  registrar(doc: DocumentoFiscal): Promise<void>;
  listarPorPeriodo(empresaId: string, inicio: string, fim: string): Promise<DocumentoFiscal[]>;
  listarPorTipo(empresaId: string, tipo: TipoDocumentoFiscal): Promise<DocumentoFiscal[]>;
  buscarPorReferencia(transacaoId: string): Promise<DocumentoFiscal[]>;
}
```

**Como isso se conecta ao resto do domínio:**

| Evento do `MotorPostura`/módulos | `TipoDocumentoFiscal` emitido |
| --- | --- |
| `PedidoCompra` de ração/pintainhas confirmado | `NOTA_ENTRADA_COMPRA` |
| Venda por `Contrato` direto entregue (§15) | `NOTA_VENDA_DIRETA` |
| Envio de ovos a um consignatário (§16) | `NOTA_REMESSA_CONSIGNACAO` |
| Fechamento do período de consignação — parte vendida | `NOTA_VENDA_CONSIGNACAO` |
| Fechamento do período de consignação — parte devolvida | `NOTA_DEVOLUCAO_CONSIGNACAO` |
| Fechamento de ciclo de `Contrato` de integração (§7.3) | `NOTA_ACERTO_INTEGRACAO` |
| Venda do lote de descarte ao final do ciclo (§2.3) | `NOTA_DESCARTE_LOTE` |

Cada linha do `HistoricoProducao`/DRE (GDD §21) pode então referenciar o `DocumentoFiscal` que a
originou, em vez de guardar só um valor — o que dá rastreabilidade total sem exigir uma tabela
de auditoria separada: a auditoria é uma *view* sobre os documentos já emitidos.

---

## 19. Parâmetros consolidados para o motor de simulação (v0.3)

| Parâmetro | Valor de referência | Seção |
| --- | --- | --- |
| Início de postura | 17–18 semanas | §2.2 |
| Pico de postura | 24–30 semanas, 90–95% | §2.2 |
| Semana de descarte | ~90 semanas | §2.3 |
| Consumo diário (produção) | ~112 g/ave/dia | §3.1 |
| Conversão alimentar meta (branca) | ~1,35 kg/dúzia | §3.2 |
| Conversão alimentar meta (vermelha) | ~1,50 kg/dúzia | §3.2 |
| Ração como % do custo total | 60–70% | §3.3 |
| Peso ovo extra | ≥60 g/unidade (720 g/dúzia) | §5.1 |
| Unidade comercial | caixa de 30 dúzias (360 ovos) | §5.2 |
| Custo total / lote 100 aves / 90 semanas | ~R$23.000 (referência) | §6 |
| Prazo de implantação de galpão (integração) | 6 meses a 1 ano | §7.2 |
| Aves por caminhão (transporte vivo) | ~3.300 aves | §8 |
| Pronaf Custeio — juros | ~1% a 7,5% a.a. | §11.1 |
| Pronaf Custeio — prazo | até 10 meses (20 em casos específicos) | §11.1 |
| Pronaf Custeio — limite | até R$250 mil/ano agrícola | §11.1 |
| Pronaf Investimento — prazo | até 8–10 anos, carência até 3 anos | §11.2 |
| Pronaf Investimento — limite (avicultura) | até R$400–450 mil/ano | §11.2 |
| Densidade de alojamento (piso) | 6–8 aves/m² | §14.1 |
| Densidade de alojamento (gaiola) | 12–15 aves/m² | §14.1 |
| CAPEX inicial — granja pequena (~300 aves) | R$15.000–25.000 | §14.1 |
| CAPEX — construção de galpão equipado | ~R$350/m² | §14.2 |
| CAPEX — aviário industrial (do zero) | R$500 mil a R$1+ milhão | §14.2 |
| Funrural (pessoa física, sobre receita bruta) | 1,2% + 0,1% GILRAT | §13.3 |
| Funrural (alíquota simplificada sem Livro Caixa) | 20% sobre receita bruta | §13.3 |
| Fórmula de acerto (IEP) | (Viabilidade × GPD) / (CA × 10) | §7.3 |
| Tipos de `DocumentoFiscal` no MVP | 7 tipos (§18) | §17–18 |

> Estes valores são **ponto de partida para calibração**, não fórmulas finais — devem ser
> ajustados durante o desenvolvimento da Game Economy v0.1 (GDD §30, item 2) e revisados
> sempre que uma nova fonte primária for incorporada a este documento.

---

## 20. Próximas entradas pendentes e itens descartados

### Pendentes com valor real de gameplay

- **Ambiência (temperatura/ventilação) como multiplicador quantitativo de mortalidade e CA** —
  já é categoria de investimento no GDD §11.4, mas ainda falta a curva numérica que liga
  investimento em ambiência a redução de mortalidade/CA. Alto valor: fecha o loop entre
  investir em infraestrutura e ver o resultado nas métricas de desempenho.
- **Programa de luz artificial** — efeito real e documentado sobre a curva de postura (§2.2),
  mas só vale a pena modelar como sistema próprio se/quando "ambiência" virar um investimento
  desagregado (ver nota abaixo). Até lá, é uma variação dentro do parâmetro já existente da
  curva por linhagem — não precisa de seção própria.

### Descartado deliberadamente (avaliado e considerado gordura)

Estes itens são reais e documentáveis, mas foram avaliados e excluídos porque **não geram uma
variável nova nem uma decisão nova** — apenas explicam "por quê" algo que o jogo já vai tratar
como um número fixo:

- **ICMS interestadual e substituição tributária.** Regra fiscal genuína, mas sua
  complexidade (alíquotas por estado, regime de substituição) não se traduz em uma decisão do
  jogador diferente do que o Funrural (§13.3) já cobre — seria replicar o mesmo efeito
  ("uma fatia da receita vira imposto") com mais burocracia e nenhum ganho de gameplay.
- **Sucessão familiar / transmissão de propriedade.** É a premissa narrativa do jogo
  (GDD §5), não um sistema — o jogador já começa depois desse evento. Modelar o processo
  jurídico de sucessão não cria loop de decisão nenhum; é background resolvido.
- **Moderagro / Inovagro e demais sublinhas do Plano Safra.** Mecanicamente são "mais uma
  linha de crédito de investimento com prazo/juros parecidos" ao Pronaf Investimento já
  documentado (§11.2) — diferenciá-las hoje adicionaria variedade de nome sem adicionar uma
  decisão distinta. Só voltaria a valer a pena se o jogo já tivesse implementado a transição
  para pessoa jurídica de grande porte (§13.1) como sistema jogável, não só como marco.
- **Detalhamento de equipamentos internos do galpão item a item** (comedouro, nebulizador,
  dosador de cloro etc., §14). Reduzido a uma nota de uma linha — real, mas o GDD já escolheu
  agregar isso em 2–3 categorias largas, e não há sinal de que o roadmap precise de mais
  granularidade que isso tão cedo.
- **Regulamentação detalhada de transporte de carga viva (CONTRAN, número de resolução, tipo
  de carroceria exigido por lei).** Cortado do §8 na revisão anterior pelo mesmo motivo: não
  vira alavanca de decisão, só justifica um número que o motor já calcula de outra forma
  (distância × qualidade do transportador).
- **Validação fiscal real de `DocumentoFiscal`** (schema XML de NF-e, chave de acesso válida,
  certificado digital, integração com SEFAZ). Deliberadamente fora de escopo — o §18 já deixa
  explícito que os documentos são fictícios; simular a validação real não mudaria nenhuma
  decisão do jogador, só aumentaria a complexidade de implementação sem ganho de gameplay.

---

## 21. Fontes consultadas

**Avicultura / produção:**
Nutrimosaic — "Como funciona a avicultura de postura?"; BNDES — *Avicultura de postura:
estrutura da cadeia produtiva*; EMATER-DF — *Avicultura: Linhagens de Postura*; SlideShare —
"Avicultura de postura" (fonte CEPLAC); aviNews Brasil — "Início da Postura", "Quanto poderia
ser economizado no custo de alimentação de galinhas poedeiras?"; Portal Agropecuário —
"Aprenda sobre o manejo de galinhas poedeiras"; Embrapa — *Custo de Produção de Ovos*, Circular
Técnica 127; Revista Unimar Ciências — viabilidade econômica poedeiras Hisex White; Cidadão
Consumidor — "Alta do preço do ovo"; Click Petróleo e Gás — "Dinheiro com galinhas"; Fatece —
*Análise de custo-benefício de sistemas de produção de ovos*; Agronegócio AZ — "A Matemática da
Caixa de 30 Dúzias"; Revista Brasileira de Zootecnia (2009) — densidade de alojamento.

**Terra e contratos agrários:**
Ambito Jurídico — "Contratos de arrendamento e parceria rural"; ConJur — "Parceria agrícola
versus arrendamento rural e riscos tributários"; Agrishow Digital — "Arrendamento rural x
Parceria agrícola"; Migalhas — "Diferenças nos conceitos de arrendamento rural e parceria
rural"; UNIFAN — "Principais diferenças entre o contrato de parceria e arrendamento"; Legale
Educacional — "Contratos Rurais: Diferenças entre Parceria e Arrendamento"; Jusbrasil — "As
diferenças entre o contrato de arrendamento e o de parceria"; Direito Rural — "Contrato de
Arrendamento x Parceria Rural".

**Integração vertical:**
ConJur — "Contrato de integração, o novo contrato típico agrário"; Jusbrasil — jurisprudência
"Contrato de Integração Avícola"; UNESP/FCAV — *Sistemas de produção de frangos de corte e
galinhas poedeiras*; Informativo Cocari — "A integração na atividade avícola..."; Canal Rural —
"Conheça as etapas para se tornar um integrado"; CPT — "O sucesso de uma granja começa pelas
pintainhas!".

**Transporte:**
Canal Rural — "Frangos, pintainhos e até ovos: caminhoneiro conta como carrega carga viva"; O
Presente Rural — "Armazenamento e transporte de pintinhos"; Frotanews — "Logística de cargas
frágeis: o que o setor de transporte precisa saber sobre ovos"; Cotefrete — "Desafio no
transporte de ovos no Brasil"; Equipacenter — "Embalagem na Logística"; Embalagens M2B —
"Embalagens para ovos: 5 dicas para transportar com segurança".

**Crédito rural:**
Aegro — "Pronaf 2025: Guia Completo Sobre o Crédito Rural"; ANATER — "Pronaf: saiba mais sobre
o Programa de Crédito Rural"; BNDES — "Pronaf Custeio"; Banco Amazônia — "PRONAF Custeio"; BNB —
"Linha de Crédito para Investimento (Pronaf Mais Alimentos)"; Caixa — "Pronaf Investimento";
Sicredi — "Pronaf Custeio"; MDA — "Resumo das linhas de crédito rural do Pronaf — Safra
2025/2026".

**Seguro rural:**
Swiss Re Corporate Solutions — "Seguro Propriedade Rural e Rebanho"; Alper Seguros — "Seguro
Avícola"; Ligados e Integrados / Canal Rural — "Seguro rural para aves e suínos: entenda como
funciona e sua importância".

**Tributação:**
Aegro — "Tributação Rural: Guia Completo de ITR, Funrural, ICMS e Impostos"; Agronota —
"Tributação da atividade rural: um guia completo", "Produtor Pessoa Física e Jurídica: quais as
diferenças?"; Contábeis — "IR do produtor rural: entenda como funciona"; Sensix Blog —
"Tributação rural: 4 principais tributos"; ArtData Contabilidade — "Produtor Rural Pessoa
Física - Tributação"; Lage Portilho Jardim — "Tributação do produtor rural"; Prime
Contabilidade — "Tributação do produtor rural: pessoa física e jurídica".

**Construção e CAPEX de galpão:**
Embrapa/avicultura.info — "Instalações para galinhas poedeiras e bem-estar animal"; Granja
Forte — "Como Montar uma Granja de Poedeiras: Guia Completo com Custos e Passo a Passo";
Sindicarne — entrevista sobre custos e tecnologia de galpões; Gazeta do Povo — "Criar galinha
virou negócio para quem já tem pelo menos R$1 milhão".

**Cláusulas contratuais de venda:**
SEDEP — modelos de "Contrato de Fornecimento de Produtos Agrícolas" (prazo determinado e
indeterminado); Vigna Advogados — "Contratos do Agronegócio"; Jusbrasil — "Contrato de
Fornecimento de Insumos Agrícolas".

**Sistema de acerto (integração):**
Portal Embrapa — "Desempenho zootécnico"; UFSM (Periódicos), "Sistema Contratual de
Integração: Vantagens e Desvantagens percebidas pelos produtores"; Anais CBC — "Viabilidade
econômica da atividade avícola no sistema de integração"; UERGS (repositório) — "Sistema de
integração avícola: uma análise do perfil dos produtores".

**Venda consignada:**
Jusbrasil — jurisprudência "Consignação de Mercadorias" (contrato estimatório), "[Modelo]
Contrato de venda em consignação"; Nota Fiscal Simples — "Operações de Consignação".

**Documentos fiscais do produtor rural:**
Aegro — "Nota Fiscal de Produtor Rural: Guia Completo para Emitir Nota Fiscal em 2026"; Avalara
(Fiscal.io) — "Nota Fiscal Eletrônica Produtor Rural"; FarmPlus — "Nota Fiscal do Produtor
Rural 2026: guia completo"; SPED/SEFA-PR — "Nota Fiscal de Produtor Eletrônica - NFP-e".