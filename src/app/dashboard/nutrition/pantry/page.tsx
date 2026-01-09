import { getPantryItems } from "@/lib/actions/pantry";
import { PantryPageClient } from "./client";

export default async function PantryPage() {
  const items = await getPantryItems();

  return (
    <PantryPageClient items={items} />
  );
}