/**
 * Robust APK Downloader utility
 * Ensures downloading LingoQuest.apk always succeeds on mobile and desktop browsers.
 */
export const downloadApk = (): boolean => {
  try {
    // Synchronous download to prevent mobile browsers from blocking it
    // (Async fetch + blob creation often gets blocked by Safari/Chrome on mobile)
    const link = document.createElement("a");
    link.href = "/LingoQuest.apk";
    link.setAttribute("download", "LingoQuest.apk");
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.warn("APK download failed:", err);
    return false;
  }
};
