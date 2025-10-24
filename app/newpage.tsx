import Hero from './home/Hero';
import Products from './home/Products';
import Services from './home/Services';
import Clients from './home/Clients';
import Contacts from './home/Contacts';
// … другие секции …

export default function HomePage() {
  return (
    <>
      <Hero />
      <Products />
      <Services />
      <Clients />
      <Contacts />
      {/* … другие секции по порядку … */}
    </>
  );
}