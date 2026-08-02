import React, { useState } from "react";
import {
  Smartphone,
  Download,
  Share2,
  X,
  CheckCircle2,
  Sparkles,
  Monitor,
  HelpCircle,
  QrCode,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { playSound } from "../utils/audio";
import { downloadApk } from "../utils/apk";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFrToEn: boolean;
  installPromptEvent: any | null;
  onTriggerInstall: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isFrToEn,
  installPromptEvent,
  onTriggerInstall,
}) => {
  const [activeTab, setActiveTab] = useState<"ios" | "android" | "pc">("ios");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    playSound("pop");
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            playSound("pop");
            onClose();
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5 font-bold" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 border-4 border-white">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {isFrToEn ? "Télécharger LingoQuest" : "Install LingoQuest"}
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1 max-w-xs">
            {isFrToEn
              ? "Installez l'application sur votre téléphone pour apprendre partout, sans navigateur !"
              : "Install the app on your phone to learn anywhere, without a browser!"}
          </p>
        </div>

        {/* Why Install? Benefits Banner */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs font-black text-emerald-900">
              {isFrToEn ? "Accès 1-clic" : "1-Click Access"}
            </div>
            <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
              {isFrToEn ? "Sur votre accueil" : "Home screen"}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-center">
            <div className="text-2xl mb-1">📱</div>
            <div className="text-xs font-black text-sky-900">
              {isFrToEn ? "Plein écran" : "Full Screen"}
            </div>
            <div className="text-[11px] font-bold text-sky-700 mt-0.5">
              {isFrToEn ? "Zéro barre d'URL" : "No browser bar"}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xs font-black text-amber-900">
              {isFrToEn ? "Série active" : "Keep Streak"}
            </div>
            <div className="text-[11px] font-bold text-amber-700 mt-0.5">
              {isFrToEn ? "Pratique rapide" : "Daily habit"}
            </div>
          </div>
        </div>

        {/* Direct APK Download Button (Android) */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-slate-700">
          <div className="flex items-center gap-3">
            <Download className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                {isFrToEn ? "Fichier APK Android (Téléchargement direct)" : "Android APK File (Direct Download)"}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {isFrToEn
                  ? "Téléchargez le fichier LingoQuest.apk pour installer l'application sur Android."
                  : "Download LingoQuest.apk to install the app on Android."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound("pop");
              downloadApk();
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span>📥 {isFrToEn ? "Télécharger l'APK" : "Download APK"}</span>
          </button>
        </div>

        {/* Direct Native Install Button (If supported by browser) */}
        {installPromptEvent ? (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Download className="w-8 h-8 text-white shrink-0 animate-bounce" />
              <div>
                <h3 className="font-black text-base">
                  {isFrToEn
                    ? "Installation rapide disponible !"
                    : "1-Click Installation Available!"}
                </h3>
                <p className="text-xs text-emerald-100 font-medium">
                  {isFrToEn
                    ? "Votre navigateur permet d'installer LingoQuest instantanément."
                    : "Your browser supports instant app installation."}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                playSound("pop");
                onTriggerInstall();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              {isFrToEn ? "📥 Installer maintenant" : "📥 Install Now"}
            </button>
          </div>
        ) : null}

        {/* Manual Installation Guide Tabs */}
        <div className="mb-4">
          <div className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 text-center">
            {isFrToEn
              ? "Guide d'installation pas-à-pas selon votre appareil"
              : "Step-by-step install guide for your device"}
          </div>

          <div className="flex rounded-2xl bg-slate-100 p-1 mb-4">
            <button
              onClick={() => {
                playSound("pop");
                setActiveTab("ios");
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === "ios"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🍎 iPhone / iPad
            </button>
            <button
              onClick={() => {
                playSound("pop");
                setActiveTab("android");
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === "android"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🤖 Android
            </button>
            <button
              onClick={() => {
                playSound("pop");
                setActiveTab("pc");
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === "pc"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💻 PC / Mac
            </button>
          </div>

          {/* iOS Guide */}
          {activeTab === "ios" && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isFrToEn ? (
                    <>
                      Ouvrez cette application dans le navigateur{" "}
                      <span className="text-emerald-700 font-extrabold">Safari</span> sur
                      votre iPhone ou iPad.
                    </>
                  ) : (
                    <>
                      Open this application in the{" "}
                      <span className="text-emerald-700 font-extrabold">Safari</span>{" "}
                      browser on your iPhone or iPad.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isFrToEn ? (
                    <>
                      Appuyez sur le bouton{" "}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-black text-xs">
                        Partager 􀈂
                      </span>{" "}
                      en bas de l'écran.
                    </>
                  ) : (
                    <>
                      Tap the{" "}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-black text-xs">
                        Share 􀈂
                      </span>{" "}
                      button at the bottom of the screen.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isFrToEn ? (
                    <>
                      Faites défiler vers le bas et sélectionnez{" "}
                      <span className="font-extrabold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        « Sur l'écran d'accueil »
                      </span>{" "}
                      puis appuyez sur{" "}
                      <span className="font-extrabold text-emerald-700">« Ajouter »</span>.
                    </>
                  ) : (
                    <>
                      Scroll down and select{" "}
                      <span className="font-extrabold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        "Add to Home Screen"
                      </span>{" "}
                      then tap{" "}
                      <span className="font-extrabold text-emerald-700">"Add"</span>.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Android Guide */}
          {activeTab === "android" && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isFrToEn ? (
                    <>
                      Ouvrez cette application dans{" "}
                      <span className="text-emerald-700 font-extrabold">Google Chrome</span>{" "}
                      sur votre téléphone Android.
                    </>
                  ) : (
                    <>
                      Open this application in{" "}
                      <span className="text-emerald-700 font-extrabold">Google Chrome</span>{" "}
                      on your Android device.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isFrToEn ? (
                    <>
                      Appuyez sur le menu des{" "}
                      <span className="font-extrabold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        3 petits points ⋮
                      </span>{" "}
                      en haut à droite.
                    </>
                  ) : (
                    <>
                      Tap the{" "}
                      <span className="font-extrabold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        3 vertical dots ⋮
                      </span>{" "}
                      in the top right corner.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isFrToEn ? (
                    <>
                      Sélectionnez{" "}
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        « Installer l'application »
                      </span>{" "}
                      ou{" "}
                      <span className="font-extrabold text-slate-900">
                        « Ajouter à l'écran d'accueil »
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      Select{" "}
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        "Install app"
                      </span>{" "}
                      or{" "}
                      <span className="font-extrabold text-slate-900">
                        "Add to Home screen"
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* PC / Mac Guide */}
          {activeTab === "pc" && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isFrToEn ? (
                    <>
                      Sur Chrome ou Edge (ordinateur), regardez dans la{" "}
                      <span className="font-extrabold text-slate-900">barre d'adresse</span>{" "}
                      en haut à droite.
                    </>
                  ) : (
                    <>
                      In Chrome or Edge (desktop), look at the right side of the{" "}
                      <span className="font-extrabold text-slate-900">address bar</span>.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isFrToEn ? (
                    <>
                      Cliquez sur l'icône d'installation{" "}
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        [↓] Installer
                      </span>{" "}
                      ou dans le menu Chrome ⋮ → <span className="font-bold">« Installer LingoQuest »</span>.
                    </>
                  ) : (
                    <>
                      Click the install icon{" "}
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        [↓] Install
                      </span>{" "}
                      or Chrome menu ⋮ → <span className="font-bold">"Install LingoQuest"</span>.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Share / Copy Link for Mobile */}
        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Share2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-xs font-extrabold text-slate-700">
                {isFrToEn ? "Lien de l'application mobile" : "Mobile app link"}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {currentUrl}
              </div>
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
              copiedLink
                ? "bg-emerald-600 text-white"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
            }`}
          >
            {copiedLink
              ? isFrToEn
                ? "✓ Copié !"
                : "✓ Copied!"
              : isFrToEn
              ? "Copier le lien"
              : "Copy link"}
          </button>
        </div>

        {/* Action button */}
        <div className="mt-6">
          <button
            onClick={() => {
              playSound("pop");
              onClose();
            }}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-md transition-all cursor-pointer text-sm uppercase tracking-wide"
          >
            {isFrToEn ? "J'ai compris !" : "Got it!"}
          </button>
        </div>
      </div>
    </div>
  );
};
