import { Dispatch, SetStateAction } from "react";

export interface ChatThread {
  id: string;
  title: string;
}

export interface ThreadContextType {
  activeThreadId: string | undefined;
  setActiveThreadId: Dispatch<SetStateAction<string | undefined>>;
  isLoading?: boolean;
  threads: ChatThread[]; // Changed from threadIds: string[]
  deleteAllThreads: () => void;
  updateThreadTitle: (id: string, title: string) => void;
}

export interface MarkdownPayload {
  type: "markdown";
  content: string;
  title?: string;
  [k: string]: unknown;
}

export interface TablePayload {
  type: "table";
  columns: string[];
  rows: unknown;
  title?: string;
  [k: string]: unknown;
}


export interface PieChartSlice {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartPayload {
  type: "pie";
  /**
   * Retained for backwards compatibility with existing widgets that expect
   * `data` as the primary series field.
   */
  data: PieChartSlice[];
  /**
   * Preferred alias used by the new pie chart widget; mirrors `data`.
   */
  slices?: PieChartSlice[];
  title?: string;
  description?: string;
  totalLabel?: string;
  [k: string]: unknown;
}

export type WidgetPayload =
  | MarkdownPayload
  | TablePayload
  | PieChartPayload;
export interface Widget {
  id: string; // resourceId
  type: string; // payload type, fallback 'markdown'
  payload: WidgetPayload;
  metadata?: unknown;
}
