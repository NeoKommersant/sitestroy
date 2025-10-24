"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hero from "./home/Hero";
import Products from "./home/Products";
import Services from "./home/Services";
import Clients from "./home/Clients";
import Certificates from "./home/Certificates";
import Contacts from "./home/Contacts";

// К модальным компонентам относятся внутренние модальные окна секций.

// Список идентификаторов секций. Используется для расчёта индексов и навигации.
const PAGE_SECTIONS = [
  "hero",
  "product-directions",
  "service-directions",
  "clients",
  "certificates",
  "contacts",
] as const;
type SectionId = (typeof PAGE_SECTIONS)[number];

export default function Page() {
  // В этом компоненте не хранится состояние сертификатов. Состояние и модальные окна
  // управления сертификатами реализованы внутри секции Certificates.

  // Рефы для секций, чтобы плавно скроллить между ними
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionCallbacks = useMemo(
    () =>
      PAGE_SECTIONS.map((_, index) => (node: HTMLElement | null) => {
        sectionRefs.current[index] = node;
      }),
    [],
  );

  // Управление активной секцией и peek-эффектом
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [peekOffset, setPeekOffset] = useState(0);
  const navigationCooldownRef = useRef(0);
  const peekTimeoutRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const resetPeek = useCallback(() => {
    if (peekTimeoutRef.current) {
      window.clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    setPeekOffset(0);
  }, []);

  const showPeek = useCallback((direction: 1 | -1, duration = 240) => {
    if (peekTimeoutRef.current) {
      window.clearTimeout(peekTimeoutRef.current);
    }
    const offset = direction > 0 ? -32 : 32;
    setPeekOffset(offset);
    peekTimeoutRef.current = window.setTimeout(() => {
      setPeekOffset(0);
      peekTimeoutRef.current = null;
    }, duration);
  }, []);

  const goToSection = useCallback(
    (nextIndex: number) => {
      const sections = sectionRefs.current;
      if (!sections.length) return;
      const clamped = Math.max(0, Math.min(sections.length - 1, nextIndex));
      const target = sections[clamped];
      if (!target) return;
      resetPeek();
      setActiveSectionIndex(clamped);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [resetPeek],
  );

  const triggerNavigation = useCallback(
    (direction: 1 | -1) => {
      const now = Date.now();
      const isDesktop = typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
      const debounce = isDesktop ? 420 : 150;
      if (now - navigationCooldownRef.current < debounce) {
        return;
      }
      navigationCooldownRef.current = now;
      if (isDesktop) {
        showPeek(direction, 220);
        window.setTimeout(() => {
          goToSection(activeSectionIndex + direction);
        }, 120);
      } else {
        resetPeek();
        goToSection(activeSectionIndex + direction);
      }
    },
    [activeSectionIndex, goToSection, resetPeek, showPeek],
  );

  // Обработчики колеса мыши
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (document.body.style.overflow === "hidden") return;
      if (!sectionRefs.current.length) return;
      if (event.deltaY === 0) return;
      event.preventDefault();
      triggerNavigation((event.deltaY > 0 ? 1 : -1) as 1 | -1);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [triggerNavigation]);

  // Обработчики клавиш вверх/вниз
  useEffect(() => {
    const handleSectionKeys = (event: KeyboardEvent) => {
      if (document.body.style.overflow === "hidden") return;
      const activeElement = document.activeElement;
      if (activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)) {
        return;
      }
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        triggerNavigation(1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        triggerNavigation(-1);
      }
    };
    window.addEventListener("keydown", handleSectionKeys);
    return () => window.removeEventListener("keydown", handleSectionKeys);
  }, [triggerNavigation]);

  // Touch events для мобильной навигации
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (document.body.style.overflow === "hidden") return;
      const touch = event.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (document.body.style.overflow === "hidden") return;
      if (!touchStartRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      if (Math.abs(dy) <= Math.abs(dx)) {
        return;
      }
      event.preventDefault();
    };
    const finalizeTouch = (event: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = event.changedTouches[0];
      if (!touch) {
        touchStartRef.current = null;
        resetPeek();
        return;
      }
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touchStartRef.current.y - touch.clientY;
      const absDy = Math.abs(dy);
      const absDx = Math.abs(dx);
      touchStartRef.current = null;
      if (absDy < 40 || absDy <= absDx) {
        resetPeek();
        return;
      }
      triggerNavigation((dy > 0 ? 1 : -1) as 1 | -1);
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", finalizeTouch);
    window.addEventListener("touchcancel", finalizeTouch);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", finalizeTouch);
      window.removeEventListener("touchcancel", finalizeTouch);
    };
  }, [resetPeek, triggerNavigation]);

  // Обновляем индекс активной секции при скролле
  useEffect(() => {
    const updateActiveSection = () => {
      const sections = sectionRefs.current;
      if (!sections.length) return;
      const referenceLine = window.scrollY + window.innerHeight / 2;
      let nextIndex = 0;
      sections.forEach((section, index) => {
        if (!section) return;
        if (referenceLine >= section.offsetTop) {
          nextIndex = index;
        }
      });
      setActiveSectionIndex((prev) => (prev === nextIndex ? prev : nextIndex));
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  // Обработчики открытия и закрытия модальных окон сертификатов удалены, поскольку
  // логика управления модалями реализована в компоненте Certificates.

  const peekStyle = peekOffset !== 0 ? { transform: `translateY(${peekOffset}px)` } : undefined;

  return (
    <>
      <main className="flex flex-col pb-24 transition-transform duration-300 ease-out" style={peekStyle}>
        <Hero sectionRef={sectionCallbacks[0]} />
        <Products sectionRef={sectionCallbacks[1]} />
        <Services sectionRef={sectionCallbacks[2]} />
        <Clients sectionRef={sectionCallbacks[3]} />
        {/* Секция сертификатов реализована отдельным компонентом */}
        <Certificates sectionRef={sectionCallbacks[4]} />
        <Contacts sectionRef={sectionCallbacks[5]} />
      </main>
      {/* Модальное окно для сертификатов удалено, оно находится внутри компонента Certificates */}
    </>
  );
}