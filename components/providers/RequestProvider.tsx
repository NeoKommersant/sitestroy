"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type RequestItem = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  unit: string;
  quantity: number;
  comment?: string;
  custom?: boolean;
};

export type RequestState = {
  items: RequestItem[];
  projectNote: string;
};

const STORAGE_KEY = "sitestroy-request";

const decodeUnit = (value: string) => JSON.parse(`"${value}"`);

const UNIT_LABELS = {
  pcs: "\u0448\u0442",
  meter: "\u043c",
  squareMeter: "\u043c\u00b2",
  cubicMeter: "\u043c\u00b3",
  ton: "\u0442",
  kilogram: "\u043a\u0433",
  liter: "\u043b",
  runningMeter: "\u043f.\u043c.",
  set: "\u043a\u043e\u043c\u043f\u043b.",
  pack: "\u0443\u043f.",
} as const;

const UNIT_OPTIONS = Object.values(UNIT_LABELS);

const DECIMAL_UNITS = new Set([
  decodeUnit(UNIT_LABELS.meter),
  decodeUnit(UNIT_LABELS.squareMeter),
  decodeUnit(UNIT_LABELS.cubicMeter),
  decodeUnit(UNIT_LABELS.ton),
  decodeUnit(UNIT_LABELS.kilogram),
  decodeUnit(UNIT_LABELS.liter),
  decodeUnit(UNIT_LABELS.runningMeter),
]);

const getPrecision = (unit: string) => (DECIMAL_UNITS.has(unit) ? 2 : 0);

const normalizeQuantity = (unit: string, quantity: number) => {
  const safe = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const precision = getPrecision(unit);
  if (precision === 0) {
    return Math.round(safe);
  }
  const factor = 10 ** precision;
  return Math.round(safe * factor) / factor;
};

type RequestContextValue = {
  items: RequestItem[];
  projectNote: string;
  units: readonly string[];
  getUnitPrecision: (unit: string) => number;
  addItem: (payload: {
    id?: string;
    title: string;
    category: string;
    subcategory: string;
    unit?: string;
    quantity?: number;
    comment?: string;
    custom?: boolean;
  }) => void;
  updateItem: (id: string, patch: Partial<Pick<RequestItem, "unit" | "quantity" | "comment" | "title">>) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  addCustomItem: () => void;
  setProjectNote: (note: string) => void;
};

const initialState: RequestState = {
  items: [],
  projectNote: "",
};

const RequestContext = createContext<RequestContextValue | null>(null);

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "custom-" + Date.now() + "-" + Math.random().toString(16).slice(2);
};

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RequestState>(() => initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RequestState;
        const items = Array.isArray(parsed.items)
          ? parsed.items.map((item) => {
              const fallbackUnit = decodeUnit(UNIT_OPTIONS[0]);
              const unit =
                typeof item.unit === "string" && item.unit.trim().length > 0 ? item.unit : fallbackUnit;
              return {
                ...item,
                unit,
                quantity: normalizeQuantity(unit, item.quantity ?? 0),
              };
            })
          : [];
        setState({
          items,
          projectNote: parsed.projectNote ?? "",
        });
      }
    } catch (error) {
      console.warn("Failed to restore request draft", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const addItem: RequestContextValue["addItem"] = useCallback((payload) => {
    setState((prev) => {
      const exists = prev.items.find(
        (item) => !payload.custom && payload.id && item.id === payload.id,
      );

      if (exists) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === exists.id
              ? {
                  ...item,
                  quantity: normalizeQuantity(item.unit, item.quantity + (payload.quantity ?? 1)),
                }
              : item,
          ),
        };
      }

      const id = payload.custom ? generateId() : payload.id ?? generateId();

      const nextItem: RequestItem = {
        id,
        title: payload.title,
        category: payload.category,
        subcategory: payload.subcategory,
        unit: decodeUnit(payload.unit ?? UNIT_OPTIONS[0]),
        quantity: normalizeQuantity(
          decodeUnit(payload.unit ?? UNIT_OPTIONS[0]),
          payload.quantity ?? 1,
        ),
        comment: payload.comment,
        custom: payload.custom ?? false,
      };

      return { ...prev, items: [...prev.items, nextItem] };
    });
  }, []);

  const updateItem: RequestContextValue["updateItem"] = useCallback((id, patch) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const nextUnit = patch.unit ? decodeUnit(patch.unit) : item.unit;
        const nextQuantity = patch.quantity ?? item.quantity;
        return {
          ...item,
          ...patch,
          unit: nextUnit,
          quantity: normalizeQuantity(nextUnit, nextQuantity),
        };
      }),
    }));
  }, []);

  const removeItem: RequestContextValue["removeItem"] = useCallback((id) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  }, []);

  const clear: RequestContextValue["clear"] = useCallback(() => {
    setState(initialState);
  }, []);

  const addCustomItem: RequestContextValue["addCustomItem"] = useCallback(() => {
    setState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: generateId(),
          title: decodeUnit("\u041d\u043e\u0432\u0430\u044f позиция"),
          category: "custom",
          subcategory: "custom",
          unit: decodeUnit(UNIT_OPTIONS[0]),
          quantity: 1,
          custom: true,
        },
      ],
    }));
  }, []);

  const setProjectNote: RequestContextValue["setProjectNote"] = useCallback((note) => {
    setState((prev) => ({ ...prev, projectNote: note }));
  }, []);

  const unitsForUi = useMemo(() => UNIT_OPTIONS.map((value) => decodeUnit(value)), []);

  const value: RequestContextValue = useMemo(
    () => ({
      items: state.items,
      projectNote: state.projectNote,
      units: unitsForUi,
      getUnitPrecision: getPrecision,
      addItem,
      updateItem,
      removeItem,
      clear,
      addCustomItem,
      setProjectNote,
    }),
    [state, addItem, updateItem, removeItem, clear, addCustomItem, setProjectNote, unitsForUi],
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useRequest() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("useRequest must be used within RequestProvider");
  }
  return context;
}
