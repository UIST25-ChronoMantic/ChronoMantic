import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApproximationResults, ApproximationSegmentsContainers } from "../../types";
import { ApproximationLevelResult } from "../../components/ResultsPanel/ResultsContent";

interface approximationState {
  results: ApproximationSegmentsContainers | null;
  source: string | null;
  level: number;
  queryResults: ApproximationResults | null;
  current: ApproximationLevelResult | null;
}

const initialState: approximationState = {
  results: null,
  source: null,
  level: 0,
  queryResults: null,
  current: null
};

export const approximationSlice = createSlice({
  name: "approximation",
  initialState,
  reducers: {
    setResults: (state, action: PayloadAction<ApproximationSegmentsContainers>) => {
      state.results = action.payload;
    },
    setSource: (state, action: PayloadAction<string>) => {
      state.source = action.payload;
    },
    setLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
    },
    setQueryResults: (state, action: PayloadAction<ApproximationResults | null>) => {
      state.queryResults = action.payload;
    },
    setCurrent: (state, action: PayloadAction<ApproximationLevelResult | null>) => {
      state.current = action.payload;
    },
  },
});

export const { setResults, setSource, setLevel, setQueryResults, setCurrent } = approximationSlice.actions;

export default approximationSlice.reducer;
