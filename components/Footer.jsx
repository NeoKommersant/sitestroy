export default function Footer() {
  return (
    <footer className="border-t bg-white py-8 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <div className="text-lg font-semibold">ГК «Стройальянс»</div>
          <div className="text-gray-600">© 2025. Все права защищены.</div>
        </div>
        <div className="space-y-1 text-gray-700">
          <div>ИНН / КПП: 0000000000 / 000000000</div>
          <a href="/policy" className="hover:underline">Политика обработки персональных данных</a>
          <a href="/sitemap" className="hover:underline">Карта сайта</a>
        </div>
        <div className="text-gray-700">
          Пресс-служба: <a href="/press" className="font-medium hover:underline">смотреть страницу</a>
        </div>
      </div>
    </footer>
  );
}
