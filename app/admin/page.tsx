import { getCategories } from "@/lib/catalog";
import AdminClientPage from "./AdminClientPage";

export default function AdminPage() {
  const categories = getCategories();
  return <AdminClientPage initialCatalog={categories} />;
}
