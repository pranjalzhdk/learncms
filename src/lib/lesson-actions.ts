/** Match lesson step actions with sensible aliases. */
export function actionMatchesStep(stepAction: string, firedAction: string): boolean {
  if (stepAction === firedAction) return true;
  if (stepAction === "create-title" && firedAction === "edit-title") return true;
  if (stepAction === "edit-title" && firedAction === "edit-title") return true;
  if (stepAction === "edit-title" && firedAction === "create-title") return false;
  return false;
}
