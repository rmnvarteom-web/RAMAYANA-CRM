import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// code, nameEn, nameRu, nameTh, unit, price, isFree
const PRICE_ITEMS = [
  ["TICKET_RESIDENT_ADULT", "Resident Adult Ticket", "Билет для резидента (взрослый)", "ตั๋วผู้ใหญ่ (ผู้พำนัก)", "PER_PERSON", 700, false],
  ["TICKET_TOURIST_ADULT", "Tourist Adult Ticket", "Билет для туриста (взрослый)", "ตั๋วผู้ใหญ่ (นักท่องเที่ยว)", "PER_PERSON", 760, false],
  ["TICKET_OTA_TOURIST_ADULT", "(OTA) Tourist Adult Ticket", "Билет для туриста OTA (взрослый)", "ตั๋วผู้ใหญ่ OTA (นักท่องเที่ยว)", "PER_PERSON", 850, false],
  ["TICKET_OTA_RESIDENT_ADULT", "(OTA) Thai Resident Adult Ticket", "Билет для тайского резидента OTA (взрослый)", "ตั๋วผู้ใหญ่ OTA (คนไทย)", "PER_PERSON", 680, false],
  ["TICKET_CHILD", "Child Ticket (below 106 cm)", "Детский билет (рост менее 106 см)", "ตั๋วเด็ก (ต่ำกว่า 106 ซม.)", "PER_PERSON", 0, true],
  ["TICKET_SPECIAL_FREE", "Disabled / overweight 135kg+ / Senior 60+ / Pregnant", "Инвалиды / вес свыше 135 кг / старше 60 лет / беременные", "ผู้พิการ / น้ำหนักเกิน 135 กก. / อายุ 60+ / ตั้งครรภ์", "PER_PERSON", 0, true],
  ["GUIDE_LICENSED", "Licensed Tour Guide (with water activity access)", "Лицензированный гид (с доступом к водным аттракционам)", "ไกด์มีใบอนุญาต (เข้าเล่นกิจกรรมทางน้ำได้)", "PER_PERSON", 0, true],
  ["TOUR_LEADER", "Tour Leader (without water activity access)", "Руководитель группы (без доступа к водным аттракционам)", "หัวหน้าทัวร์ (ไม่รวมกิจกรรมทางน้ำ)", "PER_PERSON", 0, true],
  ["LOCKER_MEDIUM", "Locker (Medium)", "Шкафчик (средний)", "ล็อกเกอร์ขนาดกลาง", "PER_UNIT", 169, false],
  ["LOCKER_LARGE", "Locker (Large)", "Шкафчик (большой)", "ล็อกเกอร์ขนาดใหญ่", "PER_UNIT", 259, false],
  ["CABANA_2_4", "Cabana (2-4 people)", "Кабана (2-4 человека)", "คาบาน่า (2-4 คน)", "PER_UNIT", 999, false],
  ["CABANA_4_8", "Cabana (4-8 people)", "Кабана (4-8 человек)", "คาบาน่า (4-8 คน)", "PER_UNIT", 1799, false],
  ["CABANA_8_12", "Cabana (8-12 people)", "Кабана (8-12 человек)", "คาบาน่า (8-12 คน)", "PER_UNIT", 2999, false],
  ["TRANSFER_ROUND_TRIP", "Transfer Service (round trip, per person)", "Трансфер туда-обратно (с человека)", "บริการรับส่ง ไป-กลับ (ต่อคน)", "PER_PERSON", 240, false],
  ["TRANSFER_ONE_WAY", "Transfer Service (one way, per person)", "Трансфер в одну сторону (с человека)", "บริการรับส่ง เที่ยวเดียว (ต่อคน)", "PER_PERSON", 120, false],
  ["TOWEL", "Towel", "Полотенце", "ผ้าเช็ดตัว", "PER_UNIT", 150, false],
] as const;

const TARIFF_PLANS = ["Standard", "OTA", "Resident"];

async function main() {
  const items = await Promise.all(
    PRICE_ITEMS.map(([code, nameEn, nameRu, nameTh, unit, , isFree], index) =>
      db.priceItem.upsert({
        where: { code },
        update: {},
        create: {
          code,
          nameEn,
          nameRu,
          nameTh,
          unit,
          isFree,
          displayOrder: index,
        },
      }),
    ),
  );

  for (const planName of TARIFF_PLANS) {
    const plan = await db.tariffPlan.upsert({
      where: { id: planName.toLowerCase() },
      update: {},
      create: { id: planName.toLowerCase(), name: planName },
    });

    for (const [item, [, , , , , price]] of items.map(
      (item, i) => [item, PRICE_ITEMS[i]] as const,
    )) {
      const existing = await db.tariffPlanPrice.findFirst({
        where: { tariffPlanId: plan.id, priceItemId: item.id, validTo: null },
      });
      if (!existing) {
        await db.tariffPlanPrice.create({
          data: { tariffPlanId: plan.id, priceItemId: item.id, unitPrice: price },
        });
      }
    }
  }

  const adminEmail = "baroservicellc@gmail.com";
  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, role: "ADMIN", status: "ACTIVE" },
  });

  console.log(`Seeded ${items.length} price items, ${TARIFF_PLANS.length} tariff plans, admin user.`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
