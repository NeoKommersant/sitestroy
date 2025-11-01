"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ModalVariant = "panel" | "fullscreen";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: ModalVariant;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  style?: CSSProperties;
  preventClose?: boolean;
};

const ANIMATION_DURATION = 220;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useEffect : () => undefined;

const lockScroll = (() => {
  let counter = 0;
  const original: { overflow?: string; paddingRight?: string } = {};
  return {
    lock() {
      if (typeof document === "undefined") return;
      counter += 1;
      if (counter === 1) {
        original.overflow = document.body.style.overflow;
        original.paddingRight = document.body.style.paddingRight;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        if (scrollBarWidth > 0) {
          document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
      }
    },
    unlock() {
      if (typeof document === "undefined") return;
      counter = Math.max(0, counter - 1);
      if (counter === 0) {
        document.body.style.overflow = original.overflow ?? "";
        document.body.style.paddingRight = original.paddingRight ?? "";
      }
    },
  };
})();

export default function Modal({
  isOpen,
  onClose,
  children,
  variant = "panel",
  className = "",
  overlayClassName = "",
  contentClassName = "",
  style,
  preventClose = false,
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;
    setIsMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) return;
    const timer = window.setTimeout(() => setIsVisible(isOpen), 16);
    return () => window.clearTimeout(timer);
  }, [isMounted, isOpen]);

  useEffect(() => {
    if (isOpen) {
      lockScroll.lock();
    }
    return () => {
      lockScroll.unlock();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !preventClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMounted, onClose, preventClose]);

  const handleClickOverlay = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (preventClose) return;
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  useEffect(() => {
    if (!isMounted && !isOpen) {
      const timer = window.setTimeout(() => setIsVisible(false), ANIMATION_DURATION);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isMounted, isOpen]);

  useEffect(() => {
    if (!isOpen && isMounted) {
      const timer = window.setTimeout(() => setIsMounted(false), ANIMATION_DURATION);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isMounted, isOpen]);

  if (!isMounted && !isVisible) return null;

  const baseContentClass =
    variant === "fullscreen"
      ? "w-full max-w-none h-full md:h-auto md:max-w-3xl md:rounded-3xl md:shadow-xl"
      : "w-full max-w-3xl md:max-w-4xl rounded-3xl shadow-[0_30px_120px_rgba(10,18,38,0.35)]";

  return createPortal(
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-950/45 px-4 py-6 backdrop-blur-sm transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      } ${overlayClassName}`}
      onMouseDown={handleClickOverlay}
    >
      <div
        ref={contentRef}
        className={`relative mx-auto flex w-full flex-col bg-white transition-all duration-200 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        } ${baseContentClass} ${className} ${contentClassName}`}
        style={style}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
