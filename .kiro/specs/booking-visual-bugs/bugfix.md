# Bugfix Requirements Document

## Introduction

O sistema de booking da Movnly apresenta múltiplos bugs visuais graves nos componentes interativos (DatePicker, TimePicker, LuxurySelect, LocationInput e o painel de passageiros/malas). Os menus dropdown abrem cortados, invisíveis, desalinhados ou atrás de outros elementos, quebrando completamente a experiência premium que o produto exige. Os problemas têm origem em stacking contexts incorretos criados por `backdrop-filter`, `transform` e `overflow` nos containers pai, ausência de portal rendering, e z-index não hierárquico. O impacto é crítico: o utilizador não consegue selecionar data, hora, passageiros ou localização de forma confiável.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN o utilizador clica no DatePicker dentro do BookingEngine (HeroSection) THEN o calendário abre cortado ou parcialmente invisível porque o container pai tem `overflow` implícito que limita a renderização do popover

1.2 WHEN o utilizador clica no TimePicker dentro do BookingEngine THEN o menu de horas abre atrás de outros elementos da página porque o z-index `z-[100]` é insuficiente face ao stacking context criado pelo `backdrop-blur-3xl` do container pai

1.3 WHEN o utilizador clica no LuxurySelect (Passageiros ou Malas) dentro do `glass-bento-luxury` em StepDetails THEN o dropdown abre cortado pela borda do container porque `glass-bento-luxury` tem `overflow-hidden` aplicado via `@apply relative overflow-hidden`

1.4 WHEN o utilizador clica no painel de Passageiros/Malas no sub-bar do BookingEngine THEN o popover pode aparecer com largura incorreta ou desalinhado em mobile porque usa `w-[calc(100vw-32px)]` sem considerar o offset do elemento pai

1.5 WHEN o utilizador interage com o LocationInput (GooglePlacesAutocomplete) THEN o menu de sugestões aparece com z-index `1000` que é sobreposto pelo container do BookingEngine com `z-40` e stacking contexts de `backdrop-filter`

1.6 WHEN qualquer dropdown está aberto e o utilizador faz scroll THEN o menu fica fixo na posição original enquanto o trigger se move, causando desalinhamento visual

1.7 WHEN o DatePicker ou TimePicker abre dentro de um container com `transform` aplicado (ex: animações `motion` do Framer Motion) THEN o posicionamento `absolute` do popover é calculado relativamente ao container transformado em vez do viewport, causando deslocamento

1.8 WHEN o utilizador abre o DatePicker no modo roundtrip (segunda linha de data/hora) THEN o calendário abre parcialmente fora do viewport inferior sem collision detection ou smart placement

1.9 WHEN o shadow/glow do dropdown (`shadow-[0_40px_80px_rgba(0,0,0,0.9)]`) é renderizado THEN é cortado pelo `overflow` dos containers pai, perdendo o efeito cinematográfico premium

1.10 WHEN o utilizador abre qualquer select/dropdown THEN o layout do BookingEngine sofre reflow ou shift visual porque o espaço do popover não está isolado do fluxo do documento

### Expected Behavior (Correct)

2.1 WHEN o utilizador clica no DatePicker em qualquer contexto THEN o sistema SHALL renderizar o calendário via portal no `document.body` (ou num portal root dedicado), garantindo que nunca é cortado por nenhum container pai

2.2 WHEN o utilizador clica no TimePicker em qualquer contexto THEN o sistema SHALL renderizar o menu de horas via portal com z-index no topo da hierarquia global (`z-[9999]`), sempre visível sobre todos os outros elementos

2.3 WHEN o utilizador clica no LuxurySelect dentro de qualquer container THEN o sistema SHALL renderizar o dropdown via portal, eliminando a dependência de `overflow` do container pai

2.4 WHEN o painel de Passageiros/Malas abre no BookingEngine THEN o sistema SHALL posicionar o popover com coordenadas calculadas via `getBoundingClientRect()` e `position: fixed`, garantindo alinhamento correto em qualquer viewport

2.5 WHEN o LocationInput renderiza sugestões do Google Places THEN o sistema SHALL aplicar estilos de z-index suficientes (`zIndex: 9999`) no objeto `styles.menu` do react-select para garantir visibilidade sobre todos os elementos

2.6 WHEN qualquer dropdown está aberto e o utilizador faz scroll THEN o sistema SHALL fechar o dropdown (ou reposicioná-lo via scroll listener) para evitar desalinhamento

2.7 WHEN um dropdown abre dentro de um container com `transform` ativo THEN o sistema SHALL usar `position: fixed` com coordenadas absolutas do viewport em vez de `position: absolute` relativo ao pai

2.8 WHEN o DatePicker ou TimePicker abre próximo da borda inferior do viewport THEN o sistema SHALL detetar a colisão e abrir o popover para cima (`top` calculado como `triggerTop - popoverHeight - gap`) em vez de para baixo

2.9 WHEN o shadow/glow de qualquer dropdown é renderizado THEN o sistema SHALL garantir que o elemento está fora de qualquer container com `overflow` restritivo, permitindo que sombras e glows sejam totalmente visíveis

2.10 WHEN o utilizador abre qualquer select/dropdown THEN o sistema SHALL não causar reflow no layout do BookingEngine, mantendo a estrutura visual estável

### Unchanged Behavior (Regression Prevention)

3.1 WHEN o utilizador seleciona uma data válida no DatePicker THEN o sistema SHALL CONTINUE TO chamar `onChange` com o valor no formato `YYYY-MM-DD` e fechar o calendário

3.2 WHEN o utilizador seleciona uma hora no TimePicker THEN o sistema SHALL CONTINUE TO chamar `onChange` com o valor no formato `HH:MM` e fechar o menu

3.3 WHEN o utilizador seleciona um valor no LuxurySelect THEN o sistema SHALL CONTINUE TO atualizar o estado do formulário e fechar o dropdown

3.4 WHEN o utilizador clica fora de qualquer dropdown aberto THEN o sistema SHALL CONTINUE TO fechar o dropdown via o handler `mousedown` existente

3.5 WHEN o DatePicker tem `minDate` definido THEN o sistema SHALL CONTINUE TO desabilitar datas anteriores ao mínimo

3.6 WHEN o utilizador usa o LocationInput com Google Places THEN o sistema SHALL CONTINUE TO mostrar sugestões de autocompletar e chamar `onChange` com o label selecionado

3.7 WHEN o utilizador usa o LocationInput sem API key do Google THEN o sistema SHALL CONTINUE TO renderizar o fallback de input de texto simples

3.8 WHEN o BookingEngine valida o formulário THEN o sistema SHALL CONTINUE TO mostrar estados de erro (bordas vermelhas, labels vermelhos) nos campos obrigatórios em falta

3.9 WHEN o utilizador alterna entre "One Way" e "Round Trip" THEN o sistema SHALL CONTINUE TO mostrar/esconder os campos de data e hora de retorno corretamente

3.10 WHEN o utilizador usa o botão de swap de origem/destino THEN o sistema SHALL CONTINUE TO trocar os valores dos dois campos corretamente

3.11 WHEN qualquer dropdown está aberto THEN o sistema SHALL CONTINUE TO manter o estilo visual premium (fundo dark `#07070A`, bordas `border-white/20`, border-radius `rounded-[32px]`, sombras cinematográficas, transições fluidas)

3.12 WHEN o BookingEngine é renderizado em mobile THEN o sistema SHALL CONTINUE TO funcionar corretamente com o layout responsivo existente
