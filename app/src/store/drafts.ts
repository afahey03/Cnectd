import { create } from 'zustand';

type DraftState = {
  drafts: Record<string, string>;
  setDraft: (cid: string, text: string) => void;
  getDraft: (cid: string) => string;
  clearDraft: (cid: string) => void;
};

export const useDrafts = create<DraftState>((set, get) => ({
  drafts: {},
  setDraft: (cid, text) => set(state => ({ drafts: { ...state.drafts, [cid]: text } })),
  getDraft: (cid) => get().drafts[cid] ?? '',
  clearDraft: (cid) => set(state => {
    const next = { ...state.drafts }; delete next[cid]; return { drafts: next };
  }),
}));
