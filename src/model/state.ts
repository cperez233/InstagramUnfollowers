import { UserNode } from "./user";
import { ScanningTab } from "./scanning-tab";
import { ScanningFilter } from "./scanning-filter";

type ScanningState = {
  readonly status: 'scanning';
  readonly page: number;
  readonly currentTab: ScanningTab;
  readonly searchTerm: string;
  readonly percentage: number;
  readonly results: readonly UserNode[];
  readonly whitelistedResults: readonly UserNode[];
  readonly filter: ScanningFilter;
  readonly scanIncomplete?: boolean;
  readonly isScanningActive?: boolean;
  readonly totalScanned?: number;
  // When the results were scanned; set when they come from the saved scan.
  readonly scannedAt?: number;
};

export type State = { readonly status: 'initial' } | ScanningState;
