import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuerySpec, QuerySpecWithSource } from "../../types/QuerySpec";
import { TreeNode } from "../../types/Tree";
import { getColor } from "../../utils/color";

export type States = {
  NLQuery: string;
  query: QuerySpecWithSource | null;
  originalQuery: QuerySpecWithSource | null;
  colorMap: Record<string, string>;
  querySpec: QuerySpec | null;
  querySpecIndex: number;
  querySpecList: QuerySpec[];
  fragmentsIndex: number;
  treeData: TreeNode;
  timeStampUnit: string;
  valueUnit: string;
  aspectRatio: number;
  isDrawer: boolean;
  querys: string[];
  modifyPrompts: string[];
  curTrend: number | null,
  curRelation: number | null,
};

// 使用该类型定义初始 state
const initialState: States = {
  NLQuery: "",
  originalQuery: null,
  colorMap: {},
  querySpecIndex: -1,
  querySpecList: [],
  fragmentsIndex: -1,
  treeData: { name: "Source" },
  timeStampUnit: "",
  valueUnit: "",
  aspectRatio: 0.00001,
  query: null,
  querySpec: null,
  isDrawer: false,
  querys: [],
  curRelation: null,
  curTrend: null,
  modifyPrompts: []
};

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    setNLQuery: (state, action: PayloadAction<string>) => {
      state.NLQuery = action.payload;
    },
    setQuery: (state, action: PayloadAction<QuerySpecWithSource | null>) => {
      if (!state.originalQuery) {
        state.originalQuery = action.payload;
      }
      state.query = action.payload;
    },
    resetOriginalQuery: (state) => {
      state.originalQuery = null;
    },
    setOriginalQuery: (state, action: PayloadAction<QuerySpecWithSource | null>) => {
      state.originalQuery = action.payload;
    },
    setColorMap: (state, action: PayloadAction<QuerySpecWithSource | null>) => {
      const colorMap: Record<string, string> = {};
      action.payload?.text_sources.map((_, index) => {
        colorMap[index.toString()] = getColor(index);
      });
      state.colorMap = colorMap;
    },
    addQuerySpec: (state, action: PayloadAction<QuerySpec>) => {
      state.querySpecList = [...state.querySpecList.slice(0, state.querySpecIndex + 1), action.payload];
      state.querySpecIndex = state.querySpecList.length - 1;
    },
    setQuerySpecIndex: (state, action: PayloadAction<number>) => {
      state.querySpecIndex = action.payload;
    },
    setFragmentsIndex: (state, action: PayloadAction<number>) => {
      state.fragmentsIndex = action.payload;
    },
    setTimeStampUnit: (state, action: PayloadAction<string>) => {
      state.timeStampUnit = action.payload;
    },
    setValueUnit: (state, action: PayloadAction<string>) => {
      state.valueUnit = action.payload;
    },
    setAspectRatio: (state, action: PayloadAction<number>) => {
      state.aspectRatio = action.payload;
    },
    setIsDrawer: (state, action: PayloadAction<boolean>) => {
      state.isDrawer = action.payload;
    },
    setQuerys: (state, action: PayloadAction<string[]>) => {
      state.querys = action.payload;
    },
    setQuerySpec: (state, action: PayloadAction<QuerySpec | null>) => {
      state.querySpec = action.payload;
    },
    setCurTrend: (state, action: PayloadAction<number | null>) => {
      state.curTrend = action.payload;
      return state;
    },
    setCurRelation: (state, action: PayloadAction<number | null>) => {
      state.curRelation = action.payload;
      return state;
    },
    setModifyPrompts: (state, action: PayloadAction<string[]>) => {
      state.modifyPrompts = action.payload;
      return state;
    },
  },
});

export const { setNLQuery, setQuery, resetOriginalQuery, setOriginalQuery, setColorMap, setQuerySpec, addQuerySpec, setFragmentsIndex, setQuerySpecIndex, setTimeStampUnit, setValueUnit, setAspectRatio, setIsDrawer, setQuerys, setModifyPrompts, setCurRelation, setCurTrend } = stateSlice.actions;
export default stateSlice.reducer;
