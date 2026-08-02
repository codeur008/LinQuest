#!/usr/bin/env node
/**
 * LingoQuest Automated APK Builder
 * Builds a clean Android APK using Bubblewrap with full manifest config.
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD_DIR = path.join(ROOT, "apk-build");
const OUTPUT_APK = path.join(ROOT, "public", "LingoQuest.apk");

console.log("\x1b[36m🤖 LingoQuest Automated APK Builder\x1b[0m");

if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BUILD_DIR, { recursive: true });

// Read APP_URL
let appUrl = "http://localhost:10000";
try {
  const env = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
  const match = env.match(/APP_URL="?([^"\n]+)"?/);
  if (match && match[1] && !match[1].includes("MY_APP")) {
    appUrl = match[1].trim().replace(/\/$/, "");
  }
} catch {}

let host = "localhost";
try {
  host = new URL(appUrl).hostname;
} catch {}

// Write complete twa-manifest.json
const twaManifest = {
  packageId: "com.lingoquest.app",
  host: host,
  name: "LingoQuest - Apprendre les langues",
  launcherName: "LingoQuest",
  display: "standalone",
  themeColor: "#10B981",
  navigationColor: "#10B981",
  navigationColorDark: "#059669",
  navigationDividerColor: "#10B981",
  navigationDividerColorDark: "#059669",
  backgroundColor: "#ffffff",
  enableNotifications: true,
  startUrl: "/",
  iconUrl: `${appUrl}/icon.svg`,
  maskableIconUrl: `${appUrl}/icon.svg`,
  monochromeIconUrl: `${appUrl}/icon.svg`,
  splashScreenFadeOutDuration: 300,
  shortcuts: [],
  generatorApp: "bubblewrap-cli",
  webManifestUrl: `${appUrl}/manifest.json`,
  fallbackType: "customtabs",
  features: {},
  alphaDependencies: { enabled: false },
  enableSiteSettingsShortcut: true,
  isChromeOSOnly: false,
  isMetaQuest: false,
  appVersionName: "1.0.0",
  appVersionCode: 1,
  signingKey: {
    path: path.join(BUILD_DIR, "android.keystore"),
    alias: "android"
  }
};

fs.writeFileSync(
  path.join(BUILD_DIR, "twa-manifest.json"),
  JSON.stringify(twaManifest, null, 2),
  "utf8"
);

console.log("🔨 Generating Android Project via Bubblewrap update...");
spawnSync("npx", ["@bubblewrap/cli", "update"], {
  cwd: BUILD_DIR,
  stdio: "inherit",
  shell: true
});

console.log("🔨 Building APK...");
spawnSync("npx", ["@bubblewrap/cli", "build", "--skipCompatibilityCheck"], {
  cwd: BUILD_DIR,
  stdio: "inherit",
  shell: true
});

// Search APK
const search = (dir) => {
  if (!fs.existsSync(dir)) return null;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isFile() && item.endsWith(".apk")) return full;
    if (stat.isDirectory()) {
      const found = search(full);
      if (found) return found;
    }
  }
  return null;
};

const foundApk = search(BUILD_DIR);

if (foundApk) {
  fs.copyFileSync(foundApk, OUTPUT_APK);
  const sizeMB = (fs.statSync(OUTPUT_APK).size / 1024 / 1024).toFixed(2);
  console.log(`\x1b[32m🎉 APK generated successfully: public/LingoQuest.apk (${sizeMB} MB)\x1b[0m`);
} else {
  console.log("\x1b[33m⚠️ APK build task finished.\x1b[0m");
}
