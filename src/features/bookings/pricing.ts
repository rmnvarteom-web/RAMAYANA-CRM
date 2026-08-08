import { db } from "@/lib/db";

export interface PricedItem {
  id: string;
  code: string;
  nameEn: string;
  nameRu: string;
  nameTh: string;
  unit: "PER_PERSON" | "PER_UNIT";
  unitPrice: number;
}

// Only items with a currently-active price (validTo: null) on the agency's
// plan are bookable — this is what "assign one tariff plan per agency" means.
export async function getPricedItemsForTariffPlan(tariffPlanId: string): Promise<PricedItem[]> {
  const prices = await db.tariffPlanPrice.findMany({
    where: { tariffPlanId, validTo: null },
    include: { priceItem: true },
    orderBy: { priceItem: { displayOrder: "asc" } },
  });

  return prices
    .filter((p) => p.priceItem.isActive)
    .map((p) => ({
      id: p.priceItem.id,
      code: p.priceItem.code,
      nameEn: p.priceItem.nameEn,
      nameRu: p.priceItem.nameRu,
      nameTh: p.priceItem.nameTh,
      unit: p.priceItem.unit,
      unitPrice: Number(p.unitPrice),
    }));
}
