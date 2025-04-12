import { configureStore } from "@reduxjs/toolkit";
import datasetSlice from "./slice/datasetSlice";
import stateSlice from "./slice/stateSlice";
import resultSlice from "./slice/resultsSlice";
import filterSlice from "./slice/filterSlice";
import selectSlice from "./slice/selectSlice";
import approximationSlice from "./slice/approximation";
import settingSlice from "./slice/setting";

const store = configureStore({
  reducer: {
    dataset: datasetSlice,
    states: stateSlice,
    results: resultSlice,
    filter: filterSlice,
    select: selectSlice,
    approximation: approximationSlice,
    setting: settingSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
