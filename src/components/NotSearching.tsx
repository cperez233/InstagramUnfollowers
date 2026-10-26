/* editorial-ui · Cristian Pérez · cristianperez.me */
import React from "react";
import { Language, t } from "../utils/i18n";
import { UserNode } from "../model/user";
import { formatWhen } from "../utils/format";

interface NotSearchingProps {
  readonly onScan: () => void;
  readonly lang: Language;
  readonly cachedScan: { readonly results: readonly UserNode[]; readonly timestamp: number } | null;
  readonly onLoadCached: () => void;
}

export const NotSearching = ({ onScan, lang, cachedScan, onLoadCached }: NotSearchingProps) => {
  const hasCachedScan = cachedScan !== null && cachedScan.results.length > 0;
  return (
    <section className="iu-start">
      <h1>{t(lang, "launchTitle")}</h1>
      <p className="iu-start__lede">{t(lang, "launchDescription")}</p>
      <div className="iu-start__actions">
        <button type="button" className="iu-button iu-button--primary" onClick={onScan}>
          {t(lang, "runScan")}
        </button>
        {hasCachedScan && (
          <button type="button" className="iu-button iu-button--secondary" onClick={onLoadCached}>
            {t(lang, "loadCachedScan")}
          </button>
        )}
      </div>
      {hasCachedScan && (
        <p className="iu-start__meta">
          {t(lang, "cachedScanMeta", formatWhen(cachedScan.timestamp, lang), cachedScan.results.length)}
        </p>
      )}
      <p className="iu-start__note">{t(lang, "scanTakesTime")}</p>
    </section>
  );
};
