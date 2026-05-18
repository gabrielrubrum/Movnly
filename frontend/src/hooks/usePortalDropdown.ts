"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

export interface PopoverStyle {
  top: number;
  left: number;
  width: number;
}

export interface UsePortalDropdownOptions {
  /** Estimated height of the popover in pixels (used for collision detection) */
  popoverHeight: number;
  /** Estimated width of the popover in pixels (used for horizontal overflow detection) */
  popoverWidth: number;
  /** Gap between trigger bottom and popover top (default: 8px) */
  gap?: number;
  /** data-attribute name used to identify the portal element for click-outside detection */
  portalDataAttribute?: string;
}

export interface UsePortalDropdownReturn {
  /** Ref to attach to the trigger button element */
  triggerRef: React.RefObject<HTMLButtonElement>;
  /** Whether the dropdown is currently open */
  open: boolean;
  /** Setter for open state */
  setOpen: (open: boolean) => void;
  /** Calculated position style for the portal element */
  popoverStyle: PopoverStyle;
  /** Call this in the trigger's onClick to calculate position and open the dropdown */
  openPortal: () => void;
  /** Toggle open/close */
  togglePortal: () => void;
}

/**
 * usePortalDropdown
 *
 * Shared hook for portal-based dropdown positioning.
 * Calculates position via getBoundingClientRect() for correct placement
 * regardless of ancestor transforms, backdrop-filters, or overflow-hidden.
 *
 * Features:
 * - Collision detection: opens upward if not enough space below
 * - Horizontal overflow detection: adjusts left if popover would overflow viewport
 * - Scroll listener: closes dropdown on scroll
 * - Click-outside detection via data-attribute
 */
export function usePortalDropdown({
  popoverHeight,
  popoverWidth,
  gap = 8,
  portalDataAttribute,
}: UsePortalDropdownOptions): UsePortalDropdownReturn {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<PopoverStyle>({
    top: 0,
    left: 0,
    width: 0,
  });

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Vertical: collision detection — open upward if not enough space below
    let top: number;
    if (rect.bottom + gap + popoverHeight > viewportHeight) {
      // Not enough space below — open upward
      top = rect.top - popoverHeight - gap;
      // Clamp to viewport top
      if (top < 0) top = 0;
    } else {
      top = rect.bottom + gap;
    }

    // Horizontal: prevent overflow on the right
    let left = rect.left;
    if (left + popoverWidth > viewportWidth) {
      left = viewportWidth - popoverWidth - 8;
    }
    // Clamp to viewport left
    if (left < 0) left = 0;

    setPopoverStyle({
      top,
      left,
      width: rect.width,
    });
  }, [popoverHeight, popoverWidth, gap]);

  const openPortal = useCallback(() => {
    calculatePosition();
    setOpen(true);
  }, [calculatePosition]);

  const togglePortal = useCallback(() => {
    if (open) {
      setOpen(false);
    } else {
      calculatePosition();
      setOpen(true);
    }
  }, [open, calculatePosition]);



  // Click-outside detection
  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      // Check if click is inside the trigger
      if (triggerRef.current && triggerRef.current.contains(target)) return;

      // Check if click is inside the portal element (identified by data-attribute)
      if (portalDataAttribute) {
        const portalEl = document.querySelector(`[${portalDataAttribute}]`);
        if (portalEl && portalEl.contains(target)) return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, portalDataAttribute]);

  return {
    triggerRef,
    open,
    setOpen,
    popoverStyle,
    openPortal,
    togglePortal,
  };
}
