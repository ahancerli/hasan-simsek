import "server-only";
import { auditLogs } from "@/lib/db/tables";
import { clientIp } from "./request";
import { logError } from "@/lib/logger";

/** Yönetici işlemleri için denetim izi (kim, ne zaman, neyi). İçerik/şifre YAZILMAZ. */
export async function audit(userId: number | null, action: string, entity: string, entityId?: number | string | null) {
  try {
    await auditLogs.insert({
      user_id: userId,
      action,
      entity,
      entity_id: entityId == null ? null : String(entityId),
      ip: await clientIp(),
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    logError("audit", e);
  }
}
