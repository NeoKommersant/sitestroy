"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";

type EmailCopyLinkProps = {
  email: string;
  children?: ReactNode;
  className?: string;
  title?: string;
};

// Компонент-ссылка для email: копирует адрес в буфер и показывает уведомление
export function EmailCopyLink({ email, children, className = "", title }: EmailCopyLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Не удалось скопировать email", error);
    }
  };

  return (
    <span className="relative inline-flex items-center">
      <a
        href={`mailto:${email}`}
        onClick={handleClick}
        className={`text-blue-700 hover:text-blue-600 ${className}`}
        title={title ?? `Скопировать адрес ${email}`}
      >
        {children ?? email}
      </a>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Скопировано
        </span>
      )}
    </span>
  );
}
