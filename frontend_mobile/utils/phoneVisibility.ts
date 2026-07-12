/**
 * Utilitaire pour déterminer si un utilisateur peut voir les numéros de téléphone
 * des lauréats publiés.
 * 
 * Règles :
 * - Les utilisateurs en mode "explorer sans compte" (isGuestMode) ne peuvent pas voir les téléphones
 * - Les utilisateurs connectés mais non validés (status !== "published") ne peuvent pas voir les téléphones
 * - Seuls les utilisateurs validés (status === "published") peuvent voir les téléphones
 */

export function canSeePhoneNumbers(
  isGuestMode: boolean,
  isAuthenticated: boolean,
  userStatus?: string | null
): boolean {
  // Si en mode guest, ne pas afficher les téléphones
  if (isGuestMode) {
    return false;
  }
  
  // Si non authentifié, ne pas afficher les téléphones
  if (!isAuthenticated) {
    return false;
  }
  
  // Si authentifié mais non validé (status !== "published"), ne pas afficher les téléphones
  if (userStatus?.toLowerCase() !== "published") {
    return false;
  }
  
  // Seuls les utilisateurs validés peuvent voir les téléphones
  return true;
}

/**
 * Masque un numéro de téléphone si l'utilisateur n'a pas le droit de le voir
 */
export function getPhoneDisplay(
  phone: string | null | undefined,
  canSee: boolean
): string {
  if (!phone) {
    return "—";
  }
  
  if (!canSee) {
    return "*** *** ***"; // Masquer le numéro
  }
  
  return phone;
}
