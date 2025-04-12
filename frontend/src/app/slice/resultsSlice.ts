import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FragmentList } from "../../types/QuerySpec";

export type ResultItem = {
  start: number;
  end: number;
  segments: Segment[];
  data: number[];
};

export type Segment = {
  start: number;
  end: number;
  features: string[];
};

export type Results = {
  results: FragmentList;
  others: FragmentList;
};

export type Trend = string[];

export type ResultState = {
  results: Results | null;
  isRequesting: boolean;
  trend: Trend;
};

// 使用该类型定义初始 state
const initialState: ResultState = {
  results: null,
  isRequesting: false,
  trend: [],
}

const resultSlice = createSlice({
  name: "result",
  // `createSlice` 将从 `initialState` 参数推断 state 类型
  initialState,
  reducers: {
    setResults: (state, action: PayloadAction<Results>) => {
      state.results = action.payload;
      return state;
    },
    setIsRequesting: (state, action: PayloadAction<boolean>) => {
      state.isRequesting = action.payload;
      return state;
    },
    setTrend: (state, action: PayloadAction<string[]>) => {
      state.trend = action.payload;
      return state;
    }
  },
});

export const { setResults, setIsRequesting, setTrend } = resultSlice.actions;

export default resultSlice.reducer;
