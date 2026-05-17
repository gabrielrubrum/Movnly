# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Portal Rendering com Posicionamento Fixed
  - **CRITICAL**: Este teste DEVE FALHAR no código não corrigido — a falha confirma que o bug existe
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: Este teste codifica o comportamento esperado — vai validar a correção quando passar após a implementação
  - **GOAL**: Expor contraexemplos que demonstram os bugs de stacking context e overflow
  - **Scoped PBT Approach**: Para bugs determinísticos, focar nos casos concretos de falha para garantir reprodutibilidade
  - Renderizar DatePicker dentro de container com `backdrop-filter: blur(24px)` e verificar que o calendário tem z-index efetivo inferior ao container (isBugCondition: `hasBackdropFilter AND component.zIndex < 9999`)
  - Renderizar LuxurySelect dentro de container com `overflow: hidden` e verificar que o dropdown é cortado (isBugCondition: `hasOverflowHidden`)
  - Renderizar TimePicker com trigger próximo da borda inferior do viewport e verificar que o menu sai do viewport (isBugCondition: `isNearViewportBottom`)
  - As asserções devem verificar: `dropdown.position != "fixed"`, `dropdown.zIndex < 9999`, `dropdown.getBoundingClientRect().bottom > window.innerHeight`
  - Correr o teste no código NÃO corrigido
  - **EXPECTED OUTCOME**: Teste FALHA (isto é correto — prova que os bugs existem)
  - Documentar contraexemplos encontrados para compreender a root cause
  - Marcar tarefa como completa quando o teste estiver escrito, executado, e a falha documentada
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Comportamento Funcional Inalterado
  - **IMPORTANT**: Seguir metodologia observation-first
  - Observar: `DatePicker.onChange` chamado com formato `YYYY-MM-DD` ao selecionar data no código não corrigido
  - Observar: `TimePicker.onChange` chamado com formato `HH:MM` ao selecionar hora no código não corrigido
  - Observar: `LuxurySelect.onChange` chamado com valor numérico correto no código não corrigido
  - Observar: clicar fora de qualquer dropdown aberto fecha-o via handler `mousedown` no código não corrigido
  - Observar: `minDate` desabilita datas anteriores no código não corrigido
  - Escrever testes property-based: para qualquer data válida selecionada, `onChange` é chamado com formato `YYYY-MM-DD` (isBugCondition retorna false para interações funcionais sem abertura de dropdown em contexto buggy)
  - Escrever testes property-based: para qualquer hora selecionada, `onChange` é chamado com formato `HH:MM`
  - Escrever testes property-based: para qualquer valor de passageiros (1-8) ou malas (0-10), `onChange` é chamado com o valor correto
  - Correr testes no código NÃO corrigido
  - **EXPECTED OUTCOME**: Testes PASSAM (confirma comportamento baseline a preservar)
  - Marcar tarefa como completa quando os testes estiverem escritos, executados, e a passar no código não corrigido
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

- [x] 3. Fix booking visual bugs — portal rendering e posicionamento fixed

  - [x] 3.1 Criar hook `usePortalDropdown` em `frontend/src/hooks/usePortalDropdown.ts`
    - Implementar `triggerRef`, `open`, `setOpen`, `popoverStyle`, `openPortal`
    - `openPortal()`: calcular `rect = triggerRef.current.getBoundingClientRect()`; se `rect.bottom + popoverHeight > window.innerHeight` abrir para cima (`top = rect.top - popoverHeight - gap`), caso contrário para baixo (`top = rect.bottom + gap`); se `left + popoverWidth > window.innerWidth` ajustar para `window.innerWidth - popoverWidth - 8`
    - Adicionar `useEffect` com scroll listener: `window.addEventListener('scroll', () => setOpen(false), { capture: true })` quando `open=true`, remover no cleanup
    - Adicionar `useEffect` com click-outside via `data-attribute` passado como parâmetro
    - _Bug_Condition: isBugCondition(renderContext) onde `hasOverflowHidden OR hasBackdropFilter OR hasTransform OR isNearViewportBottom`_
    - _Expected_Behavior: dropdown renderizado via portal com `position: fixed`, coordenadas via `getBoundingClientRect()`, `z-index: 9999`_
    - _Preservation: hook não altera callbacks, estados de erro, validações nem estilos visuais existentes_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8_

  - [x] 3.2 Corrigir `frontend/src/components/ui/DatePicker.tsx`
    - Usar `usePortalDropdown` com `popoverHeight` adequado ao calendário
    - Substituir o `div` do calendário por `ReactDOM.createPortal` renderizado no `document.body` com `position: fixed`, `top: popoverStyle.top`, `left: popoverStyle.left`, `z-index: 9999`
    - Adicionar `data-movnly-calendar` attribute no portal para o click-outside handler
    - Manter `minDate`, `onChange` com formato `YYYY-MM-DD`, e fecho ao selecionar data
    - _Bug_Condition: isBugCondition onde `hasBackdropFilter` (BookingEngine `backdrop-blur-3xl`) e `isNearViewportBottom` (roundtrip segunda linha)_
    - _Expected_Behavior: calendário totalmente visível, `position: fixed`, `z-index: 9999`, collision detection ativo_
    - _Preservation: `onChange(YYYY-MM-DD)`, fechar ao selecionar, `minDate`, estilos visuais premium_
    - _Requirements: 2.1, 2.7, 2.8, 2.9, 2.10, 3.1, 3.4, 3.5, 3.11_

  - [x] 3.3 Corrigir `frontend/src/components/ui/TimePicker.tsx`
    - Usar `usePortalDropdown` com `popoverHeight` adequado à lista de horas
    - Substituir o `div` do menu por `ReactDOM.createPortal` com `position: fixed` e `z-[9999]`
    - Adicionar `data-movnly-timepicker` attribute no portal para o click-outside handler
    - Manter `onChange` com formato `HH:MM` e fecho ao selecionar hora
    - _Bug_Condition: isBugCondition onde `hasBackdropFilter` e `hasInsufficientZ` (`z-[100]` < 9999)_
    - _Expected_Behavior: lista de horas totalmente visível, `position: fixed`, `z-index: 9999`_
    - _Preservation: `onChange(HH:MM)`, fechar ao selecionar, estilos visuais premium_
    - _Requirements: 2.2, 2.6, 2.7, 2.10, 3.2, 3.4, 3.11_

  - [x] 3.4 Corrigir `LuxurySelect` em `frontend/src/components/booking/steps/StepDetails.tsx`
    - Usar `usePortalDropdown` com `popoverHeight` adequado ao dropdown numérico
    - Substituir o `div` do dropdown por `ReactDOM.createPortal` com `position: fixed` e `z-[9999]`
    - Adicionar `data-movnly-luxuryselect` attribute no portal para o click-outside handler
    - Manter `onChange` com valor numérico e fecho ao selecionar
    - _Bug_Condition: isBugCondition onde `hasOverflowHidden` (`glass-bento-luxury` tem `overflow-hidden`)_
    - _Expected_Behavior: dropdown totalmente visível fora do container `glass-bento-luxury`, `position: fixed`, `z-index: 9999`_
    - _Preservation: `onChange(number)`, fechar ao selecionar, estilos visuais premium_
    - _Requirements: 2.3, 2.6, 2.9, 2.10, 3.3, 3.4, 3.11_

  - [x] 3.5 Corrigir `frontend/src/components/booking/LocationInput.tsx`
    - Atualizar `styles.menu`: mudar `zIndex: 1000` para `zIndex: 9999`
    - Adicionar `menuPortalTarget={document.body}` no `selectProps` do `GooglePlacesAutocomplete`
    - Adicionar `menuPosition: 'fixed'` no `selectProps`
    - Manter fallback de input simples quando sem API key
    - _Bug_Condition: isBugCondition onde `hasInsufficientZ` (`zIndex: 1000` < 9999) e `hasBackdropFilter` do BookingEngine_
    - _Expected_Behavior: sugestões Google Places visíveis sobre todos os elementos, `z-index: 9999`_
    - _Preservation: `onChange` com label selecionado, fallback sem API key, estilos visuais_
    - _Requirements: 2.5, 3.6, 3.7, 3.11_

  - [x] 3.6 Corrigir `PassengersBaggagePanel` em `frontend/src/components/booking/BookingEngine.tsx`
    - Adicionar `paxTriggerRef` para o button trigger do painel
    - Calcular `paxPopoverStyle` via `getBoundingClientRect()` no `onClick`
    - Substituir o `div` do painel por `ReactDOM.createPortal` com `position: fixed`, coordenadas calculadas, `z-[9999]`
    - Remover `w-[calc(100vw-32px)]` — usar `Math.min(288, window.innerWidth - 32)` para largura
    - Adicionar scroll listener para fechar ao scroll
    - _Bug_Condition: isBugCondition onde `hasBackdropFilter` do BookingEngine e posicionamento `absolute` sem considerar `offsetLeft`_
    - _Expected_Behavior: painel alinhado ao trigger via `getBoundingClientRect()`, `position: fixed`, `z-index: 9999`, sem desalinhamento em mobile_
    - _Preservation: contadores de passageiros e malas, callbacks de incremento/decremento, estilos visuais, layout responsivo_
    - _Requirements: 2.4, 2.6, 2.7, 2.10, 3.4, 3.11, 3.12_

  - [x] 3.7 Corrigir `.glass-bento-luxury` em `frontend/src/app/globals.css`
    - Remover `overflow-hidden` do `@apply`: mudar `@apply relative overflow-hidden` para `@apply relative`
    - Verificar que os glows internos (elementos `absolute` com `pointer-events-none`) não dependem do `overflow-hidden` do container para o seu efeito visual — se necessário, adicionar `overflow: hidden` nesses elementos específicos em vez do container
    - _Bug_Condition: isBugCondition onde `hasOverflowHidden` corta dropdowns filhos do `glass-bento-luxury`_
    - _Expected_Behavior: dropdowns filhos do `glass-bento-luxury` não são cortados; glows internos mantêm efeito visual_
    - _Preservation: estilo visual premium do bento, glows, backdrop-filter, border-radius_
    - _Requirements: 2.3, 2.9, 3.11_

  - [x] 3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Portal Rendering com Posicionamento Fixed
    - **IMPORTANT**: Re-correr o MESMO teste da tarefa 1 — NÃO escrever um novo teste
    - O teste da tarefa 1 codifica o comportamento esperado
    - Quando este teste passa, confirma que o comportamento esperado está satisfeito
    - Correr o teste de bug condition da tarefa 1
    - **EXPECTED OUTCOME**: Teste PASSA (confirma que os bugs estão corrigidos)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - Comportamento Funcional Inalterado
    - **IMPORTANT**: Re-correr os MESMOS testes da tarefa 2 — NÃO escrever novos testes
    - Correr os testes de preservation da tarefa 2
    - **EXPECTED OUTCOME**: Testes PASSAM (confirma que não há regressões)
    - Confirmar que todos os testes passam após a correção (sem regressões)

- [x] 4. Checkpoint — Garantir que todos os testes passam
  - Correr a suite completa de testes
  - Verificar que Property 1 (Bug Condition) passa — bugs corrigidos
  - Verificar que Property 2 (Preservation) passa — sem regressões
  - Confirmar visualmente no browser: DatePicker, TimePicker, LuxurySelect, LocationInput e PassengersBaggagePanel abrem corretamente dentro do BookingEngine
  - Perguntar ao utilizador se surgirem dúvidas
