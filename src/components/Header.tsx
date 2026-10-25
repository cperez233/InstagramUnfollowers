/* editorial-ui · Cristian Pérez · cristianperez.me */
import React from "react";
import { Logo } from "./icons/Logo";
import { CloseIcon } from "./icons/Icons";
import { Language, t } from "../utils/i18n";

interface HeaderProps {
  readonly lang: Language;
  readonly onLanguageChange: (lang: Language) => void;
  readonly onClose: () => void;
  // Scan progress in percent while a scan runs, null otherwise.
  readonly progress: number | null;
}

export const Header = ({ lang, onLanguageChange, onClose, progress }: HeaderProps) => (
  <header className="iu-header">
    <div className="iu-header__inner">
      <div className="iu-brand">
        <Logo />
        <span>Unfollowers</span>
      </div>
      <div className="iu-header__actions">
        <button
          type="button"
          className="iu-text-button"
          lang={lang === "en" ? "es" : "en"}
          onClick={() => onLanguageChange(lang === "en" ? "es" : "en")}
        >
          {t(lang, "switchLanguage")}
        </button>
        <button type="button" className="iu-icon-button" onClick={onClose} aria-label={t(lang, "close")} title={t(lang, "close")}>
          <CloseIcon />
        </button>
      </div>
    </div>
    <div
      className={`iu-progress ${progress === null ? "" : "is-active"}`}
      role="progressbar"
      aria-hidden={progress === null}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress ?? 0}
    >
      <span style={{ transform: `scaleX(${(progress ?? 0) / 100})` }} />
    </div>
  </header>
);
