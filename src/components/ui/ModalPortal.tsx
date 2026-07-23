"use client";

import { createPortal } from "react-dom";
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const modalStack: symbol[] = [];
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function ModalPortal({
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  role = "dialog",
  ariaLabel,
  labelledBy,
  describedBy,
  zIndexClassName = "z-[9998]",
  rootClassName = "items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:p-5",
  panelClassName = "w-full max-w-lg rounded-[24px] bg-white shadow-[0_30px_100px_-35px_rgba(0,0,0,0.75)]",
}: {
  children: ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  role?: "dialog" | "alertdialog";
  ariaLabel?: string;
  labelledBy?: string;
  describedBy?: string;
  zIndexClassName?: string;
  rootClassName?: string;
  panelClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const modalIdRef = useRef(Symbol("global-modal"));
  const onCloseRef = useRef(onClose);
  const closeOnEscapeRef = useRef(closeOnEscape);

  useEffect(() => {
    onCloseRef.current = onClose;
    closeOnEscapeRef.current = closeOnEscape;
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    // A body portal cannot be emitted during SSR; reveal it immediately after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const modalId = modalIdRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const backgroundState = new Map<HTMLElement, { inert: boolean; ariaHidden: string | null }>();

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0 && previousOverflow !== "hidden") {
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    const modalRoot = rootRef.current;
    for (const child of Array.from(document.body.children)) {
      if (!(child instanceof HTMLElement) || child === modalRoot) continue;
      backgroundState.set(child, { inert: child.inert, ariaHidden: child.getAttribute("aria-hidden") });
      child.inert = true;
      child.setAttribute("aria-hidden", "true");
    }

    modalStack.push(modalId);
    const focusFrame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const preferred = panel.querySelector<HTMLElement>("[data-modal-autofocus]");
      const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (preferred || firstFocusable || panel).focus({ preventScroll: true });
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (modalStack.at(-1) !== modalId) return;
      if (event.key === "Escape" && closeOnEscapeRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      const stackIndex = modalStack.lastIndexOf(modalId);
      if (stackIndex >= 0) modalStack.splice(stackIndex, 1);
      for (const [element, state] of backgroundState) {
        element.inert = state.inert;
        if (state.ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", state.ariaHidden);
      }
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [mounted]);

  if (!mounted) return null;

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (closeOnBackdrop && event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div
      ref={rootRef}
      className={`support-modal-backdrop-in fixed inset-0 flex overscroll-contain ${zIndexClassName} ${rootClassName}`}
      onMouseDown={handleBackdropMouseDown}
      data-global-modal="true"
    >
      <section
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        dir="rtl"
        className={`support-modal-panel-in relative z-[9999] outline-none ${panelClassName}`}
      >
        {children}
      </section>
    </div>,
    document.body,
  );
}
