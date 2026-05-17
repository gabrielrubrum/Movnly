# Booking Visual Bugs — Bugfix Design

## Overview

O BookingEngine e os seus componentes interativos (DatePicker, TimePicker, LuxurySelect, LocationInput, PassengersBaggagePanel) sofrem de múltiplos bugs visuais causados por stacking contexts incorretos, `overflow-hidden` em containers pai, e posicionamento `absolute` quebrado por `transform` do Framer Motion. A solução central é migrar todos os dropdowns para **portal rendering** via `ReactDOM.createPortal`, usar `position: fixed` com coordenadas calculadas via `getBoundingClientRect()`, e estabelecer uma hierarquia de z-index global com `z-[9999]`.

## Glossary

- **Bug_Condition (C)**: A condição que despoleta o bug — quando um dropdown/popover é renderizado dentro de um container com `overflow-hidden`, `backdrop-filter`, ou `transform`, causando corte, invisibilidade ou desalinhamento
- **Property (P)**: O comportamento correto esperado — o dropdown deve ser totalmente visível, corretamente posicionado e com z-index superior a todos os outros elementos
- **Preservation**: O comportamento funcional existente (callbacks `onChange`, fechar ao clicar fora, `minDate`, estados de erro, etc.) que não deve ser alterado pela correção
- **Portal Rendering**: Técnica de renderizar um elemento React fora da sua árvore DOM pai, diretamente no `document.body`, usando `ReactDOM.createPortal`
- **Stacking Context**: Contexto de empilhamento CSS criado por propriedades como `transform`, `backdrop-filter`, `opacity < 1`, `position + z-index` — isola z-index dos filhos do resto da página
- **getBoundingClientRect()**: API do DOM que retorna as coordenadas absolutas de um elemento relativamente ao viewport, imune a `transform` dos ancestrais
- **isBugCondition**: Função pseudocódigo que identifica se um dado input/contexto de renderização despoleta o bug
- **DatePicker**: Componente em `frontend/src/components/ui/DatePicker.tsx` — calendário com `position: absolute z-[100]`
- **TimePicker**: Componente em `frontend/src/components/ui/TimePicker.tsx` — lista de horas com `position: absolute z-[100]`
- **LuxurySelect**: Componente inline em `frontend/src/components/booking/steps/StepDetails.tsx` — dropdown numérico com `position: absolute z-[110]`
- **LocationInput**: Componente em `frontend/src/components/booking/LocationInput.tsx` — Google Places Autocomplete com `styles.menu.zIndex: 1000`
- **BookingEngine**: Componente em `frontend/src/components/booking/BookingEngine.tsx` — container principal com `z-40 backdrop-blur-3xl`
- **glass-bento-luxury**: Classe CSS em `globals.css` com `@apply relative overflow-hidden` e `backdrop-filter: blur(24px)`
- **PassengersBaggagePanel**: Popover inline no BookingEngine com `position: absolute z-50 w-[calc(100vw-32px)]`

## Bug Details

### Bug Condition

O bug manifesta-se quando qualquer dropdown/popover é renderizado como filho de um container que cria um stacking context restritivo ou tem `overflow-hidden`. Os componentes afetados usam `position: absolute` com z-index local que é ignorado pelo browser quando o ancestral cria um novo stacking context.

**Formal Specification:**
```
FUNCTION isBugCondition(renderContext)
  INPUT: renderContext = { component, ancestorStyles }
  OUTPUT: boolean

  hasOverflowHidden    := ancestorStyles.includes("overflow-hidden")
  hasBackdropFilter    := ancestorStyles.includes("backdrop-filter") OR
                          ancestorStyles.includes("backdrop-blur")
  hasTransform         := ancestorStyles.includes("transform") AND
                          ancestorStyles.transform != "none"
  hasInsufficientZ     := component.zIndex < 9999 AND
                          (hasBackdropFilter OR hasTransform)
  isNearViewportBottom := component.triggerRect.bottom > (viewport.height - 300)

  RETURN hasOverflowHidden
      OR hasInsufficientZ
      OR (hasTransform AND component.positioning == "absolute")
      OR isNearViewportBottom
END FUNCTION
```

### Examples

- **DatePicker no BookingEngine**: trigger dentro de `backdrop-blur-3xl z-40` → calendário com `z-[100]` fica atrás do backdrop do container pai. Esperado: calendário visível sobre tudo. Atual: cortado/invisível.
- **TimePicker no BookingEngine**: mesmo contexto que DatePicker — `z-[100]` insuficiente face ao stacking context do `backdrop-blur-3xl`. Esperado: lista de horas visível. Atual: atrás de outros elementos.
- **LuxurySelect no StepDetails**: container `glass-bento-luxury` tem `overflow-hidden` → dropdown com `z-[110]` é cortado na borda do bento. Esperado: dropdown sobrepõe o container. Atual: cortado.
- **LocationInput (Google Places)**: `styles.menu.zIndex: 1000` é sobreposto pelo `z-40` do BookingEngine que cria stacking context via `backdrop-blur-3xl`. Esperado: sugestões visíveis. Atual: escondidas atrás do container.
- **PassengersBaggagePanel**: `w-[calc(100vw-32px)]` sem considerar `offsetLeft` do trigger → desalinhado em mobile. Esperado: alinhado ao trigger. Atual: deslocado.
- **DatePicker roundtrip (segunda linha)**: trigger próximo da borda inferior do viewport → calendário abre para baixo e sai do viewport. Esperado: abrir para cima com collision detection. Atual: parcialmente invisível.
- **Scroll com dropdown aberto**: dropdown usa `position: absolute` → ao fazer scroll o trigger move-se mas o dropdown fica fixo. Esperado: fechar ao scroll. Atual: desalinhado.
- **Framer Motion containers**: `motion.div` com `animate` aplica `transform` → `position: absolute` dos dropdowns é calculado relativamente ao container transformado. Esperado: posicionamento correto no viewport. Atual: deslocado.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `onChange` do DatePicker deve continuar a ser chamado com formato `YYYY-MM-DD` e fechar o calendário
- `onChange` do TimePicker deve continuar a ser chamado com formato `HH:MM` e fechar o menu
- `onChange` do LuxurySelect deve continuar a atualizar o estado e fechar o dropdown
- Fechar ao clicar fora (handler `mousedown`) deve continuar a funcionar em todos os componentes
- `minDate` do DatePicker deve continuar a desabilitar datas anteriores
- LocationInput deve continuar a mostrar sugestões Google Places e chamar `onChange` com o label
- LocationInput sem API key deve continuar a renderizar o fallback de input simples
- Estados de erro (bordas vermelhas, labels vermelhos) do BookingEngine devem continuar a funcionar
- Toggle One Way / Round Trip deve continuar a mostrar/esconder campos de retorno
- Botão de swap origem/destino deve continuar a trocar os valores
- Estilo visual premium (fundo `#07070A`, bordas `border-white/20`, `rounded-[32px]`, sombras cinematográficas) deve ser preservado
- Layout responsivo mobile deve continuar a funcionar

**Scope:**
Todos os inputs que NÃO envolvam abertura de dropdown/popover devem ser completamente inalterados. Isto inclui:
- Interações de teclado nos inputs de texto
- Cliques no botão de swap
- Seleção do tipo de viagem (One Way / Round Trip)
- Submissão do formulário
- Animações Framer Motion do HeroSection

## Hypothesized Root Cause

Com base na análise do código:

1. **Stacking Context por `backdrop-filter`**: O container principal do BookingEngine tem `backdrop-blur-3xl` (linha: `className="w-full relative z-40 bg-surface-0/60 backdrop-blur-3xl rounded-[32px]..."`). `backdrop-filter` cria um novo stacking context, isolando os z-index dos filhos. Os dropdowns com `z-[100]` ou `z-[110]` são avaliados dentro deste contexto, não globalmente.

2. **`overflow-hidden` no `glass-bento-luxury`**: A classe CSS tem `@apply relative overflow-hidden` — qualquer filho com `position: absolute` que ultrapasse as bordas do container é cortado, independentemente do z-index.

3. **`transform` do Framer Motion**: O `motion.div` no HeroSection aplica `transform` via animações. `position: absolute` dos dropdowns é calculado relativamente ao ancestral transformado mais próximo, não ao viewport.

4. **Z-index insuficiente no LocationInput**: `styles.menu.zIndex: 1000` é um valor arbitrário que não considera a hierarquia de stacking contexts da página. O BookingEngine com `z-40` (= 40) cria um contexto que isola o menu.

5. **Posicionamento `absolute` sem `position: fixed`**: Todos os dropdowns usam `position: absolute`, que é relativo ao ancestral posicionado mais próximo. Ao fazer scroll, o trigger move-se mas o dropdown (se renderizado no body) ficaria fixo — e se não for portal, fica preso ao container.

6. **Ausência de collision detection**: Nenhum componente verifica se o dropdown vai sair do viewport inferior antes de abrir.

## Correctness Properties

Property 1: Bug Condition — Portal Rendering com Posicionamento Fixed

_For any_ renderContext onde isBugCondition(renderContext) retorna true (dropdown dentro de container com `overflow-hidden`, `backdrop-filter`, `transform`, ou próximo da borda inferior do viewport), o componente corrigido SHALL renderizar o dropdown via `ReactDOM.createPortal` no `document.body` com `position: fixed`, coordenadas calculadas via `getBoundingClientRect()`, e `z-index: 9999`, garantindo visibilidade total e posicionamento correto independentemente dos ancestrais.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.7, 2.8, 2.9, 2.10**

Property 2: Preservation — Comportamento Funcional Inalterado

_For any_ input onde isBugCondition(renderContext) retorna false (interações que não envolvem abertura de dropdown, ou dropdowns já corretamente posicionados), o código corrigido SHALL produzir exatamente o mesmo resultado que o código original, preservando todos os callbacks, estados de erro, validações, estilos visuais e comportamentos de fecho.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12**

## Fix Implementation

### Changes Required

Assumindo que a análise de root cause está correta:

---

**File**: `frontend/src/components/ui/DatePicker.tsx`

**Function**: `DatePicker`

**Specific Changes**:
1. **Adicionar `useRef` para o trigger button** e um `ref` para calcular `getBoundingClientRect()`
2. **Adicionar estado `popoverStyle`** do tipo `{ top: number; left: number; width: number }` calculado no `onClick` do trigger
3. **Implementar `calculatePosition()`**: usa `triggerRef.current.getBoundingClientRect()` para obter coordenadas; se `triggerRect.bottom + POPOVER_HEIGHT > window.innerHeight`, abre para cima (`top = triggerRect.top - POPOVER_HEIGHT - GAP`), caso contrário abre para baixo (`top = triggerRect.bottom + GAP`)
4. **Substituir o `div` do calendário por `ReactDOM.createPortal`**: renderizar o calendário no `document.body` com `position: fixed`, `top: popoverStyle.top`, `left: popoverStyle.left`, `z-index: 9999`
5. **Adicionar scroll listener**: `window.addEventListener('scroll', () => setOpen(false), { capture: true })` no `useEffect`, remover no cleanup
6. **Manter o `ref` no container externo** apenas para o click-outside handler (apontar para o portal via `data-movnly-calendar` attribute)

---

**File**: `frontend/src/components/ui/TimePicker.tsx`

**Function**: `TimePicker`

**Specific Changes**:
1. **Adicionar `triggerRef`** para o button trigger
2. **Adicionar estado `popoverStyle`** calculado no `onClick`
3. **Implementar `calculatePosition()`**: mesma lógica do DatePicker com collision detection
4. **Substituir o `div` do menu por `ReactDOM.createPortal`** com `position: fixed` e `z-[9999]`
5. **Adicionar scroll listener** para fechar ao scroll
6. **Atualizar click-outside handler** para usar `data-movnly-timepicker` attribute no portal

---

**File**: `frontend/src/components/booking/steps/StepDetails.tsx`

**Function**: `LuxurySelect`

**Specific Changes**:
1. **Adicionar `triggerRef`** para o button trigger do LuxurySelect
2. **Adicionar estado `popoverStyle`** calculado no `onClick`
3. **Implementar `calculatePosition()`** com collision detection
4. **Substituir o `div` do dropdown por `ReactDOM.createPortal`** com `position: fixed` e `z-[9999]`
5. **Adicionar scroll listener** para fechar ao scroll
6. **Atualizar click-outside handler** para usar `data-movnly-luxuryselect` attribute

---

**File**: `frontend/src/components/booking/LocationInput.tsx`

**Function**: `LocationInput` (GooglePlacesAutocomplete `styles.menu`)

**Specific Changes**:
1. **Atualizar `styles.menu`**: mudar `zIndex: 1000` para `zIndex: 9999`
2. **Adicionar `menuPortalTarget`**: passar `document.body` como `menuPortalTarget` no `selectProps` do `GooglePlacesAutocomplete` para que o react-select renderize o menu via portal
3. **Adicionar `menuPosition: 'fixed'`** no `selectProps` para usar coordenadas fixed

---

**File**: `frontend/src/components/booking/BookingEngine.tsx`

**Function**: `BookingEngine` (PassengersBaggagePanel)

**Specific Changes**:
1. **Adicionar `paxTriggerRef`** para o button trigger do painel de passageiros
2. **Adicionar estado `paxPopoverStyle`** calculado no `onClick` via `getBoundingClientRect()`
3. **Substituir o `div` do painel por `ReactDOM.createPortal`** com `position: fixed`, coordenadas calculadas, `z-[9999]`
4. **Remover `w-[calc(100vw-32px)]`** — usar largura fixa `w-72` ou calcular via `Math.min(288, window.innerWidth - 32)`
5. **Adicionar scroll listener** para fechar ao scroll

---

**File**: `frontend/src/app/globals.css`

**Class**: `.glass-bento-luxury`

**Specific Changes**:
1. **Remover `overflow-hidden` do `@apply`**: mudar `@apply relative overflow-hidden` para `@apply relative`
2. **Verificar impacto**: confirmar que nenhum componente depende do `overflow-hidden` do `glass-bento-luxury` para efeitos visuais internos (os glows internos usam `absolute` com `pointer-events-none` e podem precisar de `overflow-hidden` no próprio elemento, não no container)
3. **Alternativa se necessário**: adicionar `overflow: visible` explicitamente em vez de remover o `@apply`

---

### Utility Hook: `usePortalDropdown`

Para evitar duplicação de lógica, criar um hook partilhado:

**File**: `frontend/src/hooks/usePortalDropdown.ts`

```
FUNCTION usePortalDropdown(options: { popoverHeight: number; popoverWidth: number; gap?: number })
  RETURNS: { triggerRef, open, setOpen, popoverStyle, openPortal }

  triggerRef = useRef<HTMLElement>()
  [open, setOpen] = useState(false)
  [popoverStyle, setPopoverStyle] = useState({ top: 0, left: 0, width: 0 })

  FUNCTION openPortal()
    rect = triggerRef.current.getBoundingClientRect()
    top = rect.bottom + gap
    IF rect.bottom + popoverHeight > window.innerHeight THEN
      top = rect.top - popoverHeight - gap
    END IF
    left = rect.left
    IF left + popoverWidth > window.innerWidth THEN
      left = window.innerWidth - popoverWidth - 8
    END IF
    setPopoverStyle({ top, left, width: rect.width })
    setOpen(true)
  END FUNCTION

  useEffect: scroll listener → setOpen(false) quando open=true
  useEffect: click-outside via data-attribute → setOpen(false)

  RETURN { triggerRef, open, setOpen, popoverStyle, openPortal }
END FUNCTION
```

## Testing Strategy

### Validation Approach

A estratégia segue duas fases: primeiro, confirmar os bugs no código não corrigido através de testes exploratórios; depois, verificar que a correção funciona e que o comportamento existente é preservado.

### Exploratory Bug Condition Checking

**Goal**: Demonstrar os bugs ANTES de implementar a correção. Confirmar ou refutar a análise de root cause.

**Test Plan**: Renderizar os componentes dentro de containers que replicam as condições de bug (`overflow-hidden`, `backdrop-filter`, `transform`) e verificar que os dropdowns são cortados ou têm z-index insuficiente.

**Test Cases**:
1. **DatePicker dentro de backdrop-blur container**: Renderizar DatePicker dentro de `div` com `backdrop-filter: blur(24px)` e verificar que o calendário tem z-index efetivo inferior ao container (vai falhar no código não corrigido)
2. **LuxurySelect dentro de overflow-hidden**: Renderizar LuxurySelect dentro de `div` com `overflow: hidden` e verificar que o dropdown é cortado (vai falhar no código não corrigido)
3. **TimePicker com scroll**: Abrir TimePicker, fazer scroll, verificar que o menu desalinha (vai falhar no código não corrigido)
4. **DatePicker collision detection**: Renderizar DatePicker com trigger próximo da borda inferior do viewport e verificar que o calendário sai do viewport (vai falhar no código não corrigido)

**Expected Counterexamples**:
- Calendário/menu com `getBoundingClientRect().top` negativo ou `bottom > window.innerHeight` após abertura
- Elemento do dropdown com `getComputedStyle().zIndex` efetivo inferior ao do container pai
- Possíveis causas: stacking context por `backdrop-filter`, `overflow-hidden` a cortar, `transform` a deslocar

### Fix Checking

**Goal**: Verificar que para todos os inputs onde isBugCondition é true, o componente corrigido produz o comportamento esperado.

**Pseudocode:**
```
FOR ALL renderContext WHERE isBugCondition(renderContext) DO
  result := renderComponent_fixed(renderContext)
  ASSERT result.dropdown.isFullyVisible == true
  ASSERT result.dropdown.zIndex == 9999
  ASSERT result.dropdown.position == "fixed"
  ASSERT result.dropdown.isInsideViewport == true
END FOR
```

### Preservation Checking

**Goal**: Verificar que para todos os inputs onde isBugCondition é false, o componente corrigido produz o mesmo resultado que o original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(renderContext) DO
  ASSERT component_original(input).onChange_called == component_fixed(input).onChange_called
  ASSERT component_original(input).value == component_fixed(input).value
  ASSERT component_original(input).closesOnOutsideClick == component_fixed(input).closesOnOutsideClick
END FOR
```

**Testing Approach**: Property-based testing é recomendado para preservation checking porque:
- Gera muitos casos de teste automaticamente (datas, horas, valores de passageiros)
- Apanha edge cases que testes manuais podem perder
- Fornece garantias fortes que o comportamento é inalterado para todos os inputs não-buggy

**Test Plan**: Observar comportamento no código não corrigido para interações funcionais (selecionar data, hora, passageiros), depois escrever testes property-based que capturam esse comportamento.

**Test Cases**:
1. **Preservation — DatePicker onChange**: Para qualquer data válida selecionada, `onChange` é chamado com formato `YYYY-MM-DD`
2. **Preservation — TimePicker onChange**: Para qualquer hora selecionada, `onChange` é chamado com formato `HH:MM`
3. **Preservation — LuxurySelect onChange**: Para qualquer valor numérico selecionado, `onChange` é chamado com o número correto
4. **Preservation — Click outside fecha**: Clicar fora de qualquer dropdown aberto fecha-o
5. **Preservation — minDate**: Datas anteriores ao `minDate` continuam desabilitadas

### Unit Tests

- Testar `calculatePosition()` / `usePortalDropdown` com diferentes posições de trigger (topo, meio, fundo do viewport)
- Testar collision detection: trigger a 100px do fundo → abre para cima; trigger a 500px do fundo → abre para baixo
- Testar que o portal é renderizado no `document.body` e não dentro do container pai
- Testar que o scroll listener fecha o dropdown
- Testar que `styles.menu.zIndex` do LocationInput é 9999

### Property-Based Tests

- Gerar posições aleatórias de trigger no viewport e verificar que o dropdown nunca sai do viewport após collision detection
- Gerar datas aleatórias válidas e verificar que `onChange` é sempre chamado com formato correto após seleção
- Gerar valores aleatórios de passageiros (1-8) e malas (0-10) e verificar que `onChange` é chamado com o valor correto
- Verificar que para qualquer estado de formulário, abrir e fechar um dropdown não altera outros campos

### Integration Tests

- Testar fluxo completo: abrir DatePicker dentro do BookingEngine (com `backdrop-blur-3xl`), selecionar data, verificar que `date` state é atualizado
- Testar LuxurySelect dentro de `glass-bento-luxury`: abrir dropdown, selecionar valor, verificar que não é cortado e que o valor é atualizado
- Testar LocationInput: verificar que sugestões Google Places aparecem sobre o BookingEngine
- Testar PassengersBaggagePanel em mobile: verificar alinhamento correto com o trigger
- Testar DatePicker roundtrip: abrir segunda linha de data próximo da borda inferior, verificar collision detection
