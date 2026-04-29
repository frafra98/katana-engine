import { create } from "zustand";

export type ParamValue = string | number | boolean;

export interface Param {
  id: string;
  value: ParamValue;
  type: "slider" | "color" | "toggle" | "display";  // Match the actual types used
  min?: number;
  max?: number;
  step?: number;
}

interface ParamStore {
  params: Record<string, Param>;
  registerParam: (param: Param) => void;
  setParam: (id: string, value: ParamValue) => void;
  getParam: (id: string) => ParamValue | undefined;
}

export const useParamStore = create<ParamStore>((set, get) => ({
  params: {},

  registerParam: (param) =>
    set((state) => ({
      params: {
        ...state.params,
        [param.id]: param,
      },
    })),

  setParam: (id, value) =>
    set((state) => {
      const existingParam = state.params[id];
      if (!existingParam) return state;
      
      return {
        params: {
          ...state.params,
          [id]: { ...existingParam, value },
        },
      };
    }),

  getParam: (id) => get().params[id]?.value,
}));