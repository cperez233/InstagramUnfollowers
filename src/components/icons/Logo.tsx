/* editorial-ui · Cristian Pérez · cristianperez.me */
import React, { FC } from "react";

// A person with a minus: someone who left your followers.
export const Logo: FC = () => (
  <svg className="iu-logo" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="11" cy="9" r="4.25" stroke="currentColor" strokeWidth="2" />
    <path d="M3.5 23.5c.6-4.3 3.6-7 7.5-7s6.9 2.7 7.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M19.5 10.5h6" stroke="var(--iu-accent)" strokeWidth="2.25" strokeLinecap="round" />
  </svg>
);
