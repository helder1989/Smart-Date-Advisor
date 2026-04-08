# Pitch — Smart Date Advisor

## 4 minutos. Estrutura sugerida.

---

### 0:00 — 0:30 | O problema (gancho)

> "Toda semana, empresas brasileiras perdem dinheiro em passagens aéreas. Não por comprar errado — mas por comprar na data errada."

> "Um colaborador que precisa ir a São Paulo na semana do dia 15 pode economizar R$ 400 simplesmente saindo na terça em vez de segunda. Mas ninguém mostra isso para ele no momento em que ele está escolhendo a data."

---

### 0:30 — 1:30 | A solução (demo ao vivo)

**Abrir a extensão no Chrome. Demonstrar em tempo real.**

> "Instalamos uma extensão Chrome. O viajante informa: origem, destino, datas pretendidas e quantos dias pode antecipar ou adiar."

> "Em segundos, a IA consulta o histórico real de cotações da Onfly no BigQuery e retorna: as 3 melhores combinações de data, com o preço, a economia em reais e o motivo — em linguagem natural."

**Mostrar o resultado na tela:**

```
✅ Volta quarta 20/04 em vez de sexta 25/04 → R$ 680 (-43%)
   Economia: R$ 520 por pessoa

IA explica: "Quartas-feiras concentram menor demanda corporativa
nesse trecho, reduzindo tarifas em média 28%."
```

---

### 1:30 — 2:30 | Por que isso é diferente

> "Isso não é Google Flights. É diferente em três pontos:"

1. **Dado proprietário** — consultamos o histórico real de cotações da Onfly, não preços genéricos de internet. São comportamentos reais do segmento corporativo.

2. **IA que raciocina** — não é filtro SQL. O Claude pondera combinações de ida+volta, identifica padrões sazonais e explica o raciocínio. O viajante entende por quê.

3. **Zero atrito** — extensão Chrome. Funciona em qualquer página, no momento exato da decisão. Sem trocar de aba, sem abrir outro sistema.

---

### 2:30 — 3:30 | Impacto no negócio

> "Para a Onfly, isso tem dois efeitos diretos:"

- **Retenção de conversão** — o viajante que antes saía para pesquisar no Google Flights agora fica na plataforma. A decisão acontece dentro do ecossistema Onfly.

- **ROI mensurável para o cliente** — cada sugestão aceita gera uma economia documentada. O CFO da empresa cliente vê: "R$ 18.400 economizados no trimestre com Smart Date Advisor."

> "Economia real, rastreável, atribuível à Onfly."

---

### 3:30 — 4:00 | Fechamento

> "Construímos com dado real, IA real, no produto real. A extensão está funcionando. Obrigado."

---

## Slide único para a bancada (se exigido)

```
┌─────────────────────────────────────────────┐
│         SMART DATE ADVISOR                  │
│                                             │
│  "R$ 520 economizados.                      │
│   Por sair 5 dias antes."                   │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ BigQuery │→ │  Claude  │→ │  Chrome  │  │
│  │ histórico│  │  Sonnet  │  │Extension │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  Dado real · IA que explica · Zero atrito   │
└─────────────────────────────────────────────┘
```

---

## Copy para LinkedIn (pós-hackathon)

**Versão 1 — resultado concreto:**
> Em 8 horas, construímos uma IA que analisa o histórico real de preços da Onfly e diz: "se você voltar na quarta em vez de sexta, economiza R$ 520."
> Extensão Chrome. BigQuery. Claude API. Zero código manual.
> Esse é o novo papel do desenvolvedor.

**Versão 2 — provocação:**
> Sua empresa está comprando passagens nas datas certas?
> Provavelmente não — e ninguém estava mostrando isso.
> Construímos o Smart Date Advisor no Hackathon Onfly.
> Agora alguém mostra.
