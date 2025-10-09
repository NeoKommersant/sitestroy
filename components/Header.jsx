export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <a href="/" className="text-lg font-semibold">ГК «Стройальянс»</a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/catalog" className="hover:text-blue-700">Каталог</a>
          <a href="/services" className="hover:text-blue-700">Услуги</a>
          <a href="/clients" className="hover:text-blue-700">Клиенты</a>
          <a href="/certs" className="hover:text-blue-700">Сертификаты</a>
          <a href="/contacts" className="hover:text-blue-700">Контакты</a>
        </nav>
      </div>
    </header>
  );
}
