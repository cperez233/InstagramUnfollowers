export type Language = "en" | "es";

export const LANGUAGE_STORAGE_KEY = "iu_language";

export const translations = {
  en: {
    // Start
    launchTitle: "Who doesn't follow you back?",
    launchDescription: "Checks every account you follow, one by one, from this browser. Nothing leaves your Instagram session.",
    runScan: "Scan",
    loadCachedScan: "See last scan",
    cachedScanMeta: "Last scan %s · %s accounts",
    scanTakesTime: "It takes about a second per account you follow. Keep this tab open.",

    // Header
    close: "Back to Instagram",
    closeConfirm: "The scan will stop. Go back to Instagram?",
    switchLanguage: "Español",

    // Results
    scanningTitle: "Scanning",
    nonFollowersTitle: "%s don't follow you back",
    nonFollowersTitleOne: "1 doesn't follow you back",
    ignoredTitle: "%s ignored",
    checkedMeta: "%s accounts checked",
    scannedMeta: "Scan from %s",
    rescan: "Scan again",
    pause: "Pause",
    resume: "Resume",
    paused: "Paused",
    nonFollowersTab: "Not following back",
    ignoredTab: "Ignored",
    searchPlaceholder: "Search",
    hideVerified: "Hide verified",
    copyList: "Copy list",
    copiedToClipboard: "%s usernames copied",
    showMore: "Show %s more",
    verified: "Verified",
    privateAccount: "Private",
    openProfile: "Open %s on Instagram",
    ignore: "Ignore",
    ignoreHint: "Hide %s from this list",
    restore: "Restore",
    restoreHint: "Show %s in the list again",
    ignoredToast: "%s ignored",
    restoredToast: "%s is back in the list",
    undo: "Undo",
    following: "Following",
    confirmUnfollow: "Unfollow",
    unfollowing: "Unfollowing",
    unfollowedState: "Unfollowed",
    unfollowFailed: "Could not unfollow %s. Try from the profile.",
    emptyNonFollowers: "Everyone you follow follows you back.",
    emptyIgnored: "No ignored accounts.",
    emptyIgnoredHint: "Ignore accounts you're fine with, like brands or friends, and they stop showing up here.",
    emptySearch: "Nothing matches \u201c%s\u201d.",
    clearSearch: "Clear search",
    waitingFirstResults: "Accounts that don't follow you back will show up here as they're found.",
    partialScanWarning: "The scan stopped before checking every account, so this list may be missing some.",

    // Messages from the scan
    scanCompleted: "Scanning completed!",
    scanFailedFollowing: "Scan failed: could not load your following list from Instagram.",
    scanFailedFollowers: "Scan failed: could not load your followers list from Instagram.",
    indexingFollowersProgress: "Indexing followers (%s loaded)...",
    loadingFollowingProgress: "Loading the accounts you follow (%s loaded)...",
    scanningFollowingProgress: "Checking who follows you back (%s/%s)...",
    partialScanInterrupted: "Partial scan: checked %s accounts, but scan was interrupted.",
    rateLimitPause: "Instagram cooldown active. Pausing for %s seconds before retrying...",
    scanBlocked: "Instagram is temporarily limiting requests, so the scan stopped after %s accounts. Wait a few hours before scanning again.",
    sleepingSafety: "Sleeping %s seconds to prevent getting temp blocked",
    loadedFromCache: "Loaded %s accounts from cache!",
    actionBlockedWarning: "Instagram is blocking unfollows for now (feedback_required). Wait a few hours before trying again.",
  },
  es: {
    // Start
    launchTitle: "¿Quién no te sigue de vuelta?",
    launchDescription: "Revisa una a una las cuentas que sigues, desde este navegador. Nada sale de tu sesión de Instagram.",
    runScan: "Escanear",
    loadCachedScan: "Ver último escaneo",
    cachedScanMeta: "Último escaneo %s · %s cuentas",
    scanTakesTime: "Tarda cerca de un segundo por cada cuenta que sigues. Deja esta pestaña abierta.",

    // Header
    close: "Volver a Instagram",
    closeConfirm: "El escaneo se detendrá. ¿Volver a Instagram?",
    switchLanguage: "English",

    // Results
    scanningTitle: "Escaneando",
    nonFollowersTitle: "%s no te siguen",
    nonFollowersTitleOne: "1 no te sigue",
    ignoredTitle: "%s ignoradas",
    checkedMeta: "%s cuentas revisadas",
    scannedMeta: "Escaneo de %s",
    rescan: "Escanear de nuevo",
    pause: "Pausar",
    resume: "Reanudar",
    paused: "En pausa",
    nonFollowersTab: "No te siguen",
    ignoredTab: "Ignoradas",
    searchPlaceholder: "Buscar",
    hideVerified: "Ocultar verificadas",
    copyList: "Copiar lista",
    copiedToClipboard: "%s usuarios copiados",
    showMore: "Mostrar %s más",
    verified: "Verificada",
    privateAccount: "Privada",
    openProfile: "Abrir %s en Instagram",
    ignore: "Ignorar",
    ignoreHint: "Ocultar a %s de esta lista",
    restore: "Restaurar",
    restoreHint: "Volver a mostrar a %s en la lista",
    ignoredToast: "%s ignorada",
    restoredToast: "%s vuelve a la lista",
    undo: "Deshacer",
    following: "Siguiendo",
    confirmUnfollow: "Dejar de seguir",
    unfollowing: "Dejando de seguir",
    unfollowedState: "Ya no la sigues",
    unfollowFailed: "No se pudo dejar de seguir a %s. Inténtalo desde su perfil.",
    emptyNonFollowers: "Todas las cuentas que sigues te siguen de vuelta.",
    emptyIgnored: "No hay cuentas ignoradas.",
    emptyIgnoredHint: "Ignora las cuentas que te dan igual, como marcas o amigos, y dejarán de aparecer aquí.",
    emptySearch: "Nada coincide con «%s».",
    clearSearch: "Borrar búsqueda",
    waitingFirstResults: "Las cuentas que no te siguen aparecerán aquí a medida que se encuentren.",
    partialScanWarning: "El escaneo se detuvo antes de revisar todas las cuentas, así que a esta lista le pueden faltar algunas.",

    // Messages from the scan
    scanCompleted: "¡Escaneo completado!",
    scanFailedFollowing: "Error en el escaneo: no se pudo cargar la lista de seguidos de Instagram.",
    scanFailedFollowers: "Error en el escaneo: no se pudo cargar la lista de seguidores de Instagram.",
    indexingFollowersProgress: "Indexando seguidores (%s cargados)...",
    loadingFollowingProgress: "Cargando las cuentas que sigues (%s cargadas)...",
    scanningFollowingProgress: "Comprobando quién te sigue de vuelta (%s/%s)...",
    partialScanInterrupted: "Escaneo parcial: se revisaron %s cuentas, pero el escaneo fue interrumpido.",
    rateLimitPause: "Enfriamiento de Instagram activo. Pausando %s segundos antes de reintentar...",
    scanBlocked: "Instagram está limitando las peticiones temporalmente, así que el escaneo se detuvo tras %s cuentas. Espera unas horas antes de volver a escanear.",
    sleepingSafety: "Esperando %s segundos para prevenir bloqueos temporales",
    loadedFromCache: "¡Se cargaron %s cuentas del historial!",
    actionBlockedWarning: "Instagram está bloqueando los unfollows por ahora (feedback_required). Espera unas horas antes de volver a intentarlo.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "en" || saved === "es") {
      return saved;
    }
    if (typeof navigator !== "undefined" && navigator.language && navigator.language.toLowerCase().startsWith("es")) {
      return "es";
    }
  } catch {
    // fallback
  }
  return "en";
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export function t(lang: Language, key: TranslationKey, ...args: (string | number)[]): string {
  const dict = translations[lang] || translations.en;
  let text: string = dict[key] || translations.en[key] || (key as string);
  for (const arg of args) {
    text = text.replace("%s", String(arg));
  }
  return text;
}
