// services/notifications.api.ts
import { apiGet } from "./api";

export type Notification = {
  id: number;
  laureatId: number;
  message: string;
  type: string;
  sentAt: string;
};

// ✅ Récupérer les notifications d'un lauréat
export async function getNotificationsByLaureat(laureatId: number): Promise<Notification[]> {
  try {
    return await apiGet<Notification[]>(`/api/notifications?laureatId=${laureatId}`);
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des notifications:", error);
    // Retourner un tableau vide en cas d'erreur
    return [];
  }
}
