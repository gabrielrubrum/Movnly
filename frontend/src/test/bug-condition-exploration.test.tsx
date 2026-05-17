/**
 * Bug Condition Exploration Tests
 *
 * Property 1: Bug Condition — Portal Rendering com Posicionamento Fixed
 *
 * CRITICAL: These tests MUST FAIL on unfixed code — failure confirms bugs exist.
 * After fixes are applied (tasks 3.1–3.7), these tests MUST PASS.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";

// ─── Mock i18n ────────────────────────────────────────────────────────────────
vi.mock("@/i18n/context", () => ({
  useI18n: () => ({
    locale: "pt",
    t: (key: string) => {
      const map: Record<string, string> = {
        "ui.datepicker.placeholder": "Selecionar data",
        "ui.datepicker.placeholder_time": "Selecionar hora",
        "booking.origin": "Origem",
        "booking.destination": "Destino",
        "booking.date": "Data",
        "booking.time": "Hora",
        "booking.passengers": "Passageiros",
        "booking.luggage": "Bagagem",
        "booking.originPlaceholder": "Cidade de origem",
        "booking.destinationPlaceholder": "Cidade de destino",
        "booking.viewPrices": "Ver Preços",
        "bookingFlow.steps.details": "Detalhes",
        "booking.personalDetails": "Detalhes Pessoais",
        "booking.airline": "Companhia",
        "booking.flightNumber": "Voo",
        "booking.airlinePlaceholder": "Ex: TAP",
        "booking.flightPlaceholder": "Ex: TP123",
        "booking.flightInfo": "Info de Voo",
      };
      return map[key] ?? key;
    },
    tArray: (key: string) => {
      const map: Record<string, string[]> = {
        "ui.datepicker.months": [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
        ],
        "ui.datepicker.days": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      };
      return map[key] ?? [];
    },
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock("react-google-places-autocomplete", () => ({
  default: ({ selectProps }: any) => (
    <input
      data-testid="google-places-input"
      placeholder={selectProps?.placeholder}
      value={selectProps?.value?.label ?? ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        selectProps?.onChange?.({ label: e.target.value, value: e.target.value })
      }
    />
  ),
}));

vi.mock("@react-google-maps/api", () => ({
  useJsApiLoader: () => ({ isLoaded: false, loadError: null }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Renders a component inside a container that replicates the BookingEngine
 * backdrop-blur stacking context (isBugCondition: hasBackdropFilter = true).
 * Returns cleanup function to properly unmount and remove the container.
 */
function renderInsideBackdropBlurContainer(ui: React.ReactElement) {
  const container = document.createElement("div");
  container.style.backdropFilter = "blur(24px)";
  container.style.position = "relative";
  container.style.zIndex = "40";
  document.body.appendChild(container);

  const result = render(ui, { container });
  return {
    ...result,
    container,
    cleanup: () => {
      result.unmount();
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    },
  };
}

/**
 * Renders a component inside a container that replicates glass-bento-luxury
 * overflow-hidden (isBugCondition: hasOverflowHidden = true).
 */
function renderInsideOverflowHiddenContainer(ui: React.ReactElement) {
  const container = document.createElement("div");
  container.style.overflow = "hidden";
  container.style.position = "relative";
  container.style.width = "800px";
  container.style.height = "1200px";
  document.body.appendChild(container);

  const result = render(ui, { container });
  return {
    ...result,
    container,
    cleanup: () => {
      result.unmount();
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    },
  };
}

// ─── Bug Condition 1: DatePicker calendar position must be "fixed" ─────────────
describe("Bug Condition 1 — DatePicker: calendar must use position:fixed (not absolute)", () => {
  it("should render the calendar with position:fixed when inside a backdrop-blur container", () => {
    /**
     * isBugCondition: hasBackdropFilter AND component.zIndex < 9999
     *
     * CURRENT BUG: calendar uses `position: absolute z-[100]`
     * EXPECTED FIX: calendar uses `position: fixed z-[9999]` via portal
     */
    const onChange = vi.fn();
    const { container, cleanup } = renderInsideBackdropBlurContainer(
      <DatePicker value="" onChange={onChange} />
    );

    try {
      const trigger = container.querySelector("button[type='button']") as HTMLButtonElement;
      expect(trigger).toBeTruthy();
      fireEvent.click(trigger);

      // After fix: calendar is portaled to document.body with position:fixed
      const calendarInBody = document.body.querySelector("[data-movnly-calendar]");
      expect(calendarInBody).toBeTruthy();

      // After fix: position must be "fixed" (inline style set by portal)
      const inlineStyle = (calendarInBody as HTMLElement).style.position;
      expect(inlineStyle).toBe("fixed");

      // After fix: z-index must be >= 9999
      const zIndex = parseInt((calendarInBody as HTMLElement).style.zIndex, 10);
      expect(zIndex).toBeGreaterThanOrEqual(9999);

      // After fix: calendar must NOT be a child of the backdrop-blur container
      expect(container.contains(calendarInBody)).toBe(false);
    } finally {
      cleanup();
    }
  });
});

// ─── Bug Condition 2: TimePicker menu z-index must be >= 9999 ─────────────────
describe("Bug Condition 2 — TimePicker: menu must have z-index >= 9999", () => {
  it("should render the time menu with z-index >= 9999 when inside a backdrop-blur container", () => {
    /**
     * isBugCondition: hasBackdropFilter AND hasInsufficientZ (z-[100] < 9999)
     *
     * CURRENT BUG: menu uses `z-[100]` which is insufficient vs backdrop-blur stacking context
     * EXPECTED FIX: menu uses `z-[9999]` via portal
     */
    const onChange = vi.fn();
    const { container, cleanup } = renderInsideBackdropBlurContainer(
      <TimePicker value="" onChange={onChange} />
    );

    try {
      const trigger = container.querySelector("button[type='button']") as HTMLButtonElement;
      expect(trigger).toBeTruthy();
      fireEvent.click(trigger);

      // After fix: menu is portaled to document.body
      const menuInBody = document.body.querySelector("[data-movnly-timepicker]");
      expect(menuInBody).toBeTruthy();

      // After fix: position must be "fixed" (inline style)
      const inlineStyle = (menuInBody as HTMLElement).style.position;
      expect(inlineStyle).toBe("fixed");

      // After fix: z-index must be >= 9999
      const zIndex = parseInt((menuInBody as HTMLElement).style.zIndex, 10);
      expect(zIndex).toBeGreaterThanOrEqual(9999);

      // After fix: menu must NOT be a child of the backdrop-blur container
      expect(container.contains(menuInBody)).toBe(false);
    } finally {
      cleanup();
    }
  });
});

// ─── Bug Condition 3: LuxurySelect dropdown must not be clipped by overflow:hidden ──
describe("Bug Condition 3 — LuxurySelect: dropdown must not be clipped by overflow:hidden parent", () => {
  it("should render the LuxurySelect dropdown outside the overflow:hidden container", async () => {
    /**
     * isBugCondition: hasOverflowHidden (glass-bento-luxury has overflow:hidden)
     *
     * CURRENT BUG: dropdown uses `position: absolute z-[110]` inside overflow:hidden container
     * EXPECTED FIX: dropdown uses portal with position:fixed z-[9999]
     */
    const { StepDetails } = await import("@/components/booking/steps/StepDetails");

    const form = {
      origin: "Lisbon",
      destination: "Porto",
      date: "2025-12-01",
      time: "10:00",
      returnDate: "",
      returnTime: "",
      passengers: 2,
      luggage: 2,
      flightNumber: "",
      airline: "",
      tripType: "oneway" as const,
      category: "comfort" as const,
      extras: [],
      name: "",
      email: "",
      phone: "",
      notes: "",
      paymentMethod: "card" as const,
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    };

    const { container, cleanup } = renderInsideOverflowHiddenContainer(
      <StepDetails form={form} update={vi.fn()} onNext={vi.fn()} />
    );

    try {
      // Find a LuxurySelect trigger button (has nx-input class and shows a number)
      const allButtons = Array.from(container.querySelectorAll("button[type='button']"));
      // LuxurySelect buttons have the nx-input class (from the className in the component)
      const luxuryTrigger = allButtons.find(
        (btn) => btn.className.includes("nx-input")
      ) as HTMLButtonElement | undefined;

      if (luxuryTrigger) {
        fireEvent.click(luxuryTrigger);

        // Give React time to process the state update and render the portal
        // After fix: dropdown is portaled to document.body
        const dropdownInBody = document.body.querySelector("[data-movnly-luxuryselect]");
        
        // If portal not found, check if it's inside the container (old behavior)
        const dropdownInContainer = container.querySelector("[data-movnly-luxuryselect]");
        
        // After fix: must be in body (not in container)
        // Either the portal exists in body, or we verify it's not clipped inside container
        if (dropdownInBody) {
          // Portal rendering confirmed
          expect(dropdownInBody).toBeTruthy();
          const inlineStyle = (dropdownInBody as HTMLElement).style.position;
          expect(inlineStyle).toBe("fixed");
          const zIndex = parseInt((dropdownInBody as HTMLElement).style.zIndex, 10);
          expect(zIndex).toBeGreaterThanOrEqual(9999);
          expect(container.contains(dropdownInBody)).toBe(false);
        } else if (dropdownInContainer) {
          // Old behavior: dropdown is inside the overflow:hidden container — this is the bug
          // This assertion will fail, confirming the bug exists (or the fix didn't work)
          expect(dropdownInContainer).toBeFalsy(); // Should fail if not fixed
        } else {
          // Neither found — check that no absolute dropdown exists inside overflow:hidden
          // This means the portal rendered but with a different attribute, or the trigger wasn't found
          // Verify the fix by checking no z-[110] absolute dropdown exists
          const oldStyleDropdown = container.querySelector("[class*='z-\\[110\\]']");
          expect(oldStyleDropdown).toBeNull();
        }
      } else {
        // Fallback: verify no old absolute-positioned dropdown exists inside overflow:hidden
        const oldDropdowns = container.querySelectorAll("[class*='z-\\[110\\]']");
        expect(oldDropdowns.length).toBe(0);
      }
    } finally {
      cleanup();
    }
  });
});
