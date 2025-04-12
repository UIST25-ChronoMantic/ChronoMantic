import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilterState {
  durationScale: [number, number];
  scoreScale: [number, number];
  levelScale: [number, number];
}

const initialState: FilterState = {
  durationScale: [0, 0],
  scoreScale: [0, 0],
  levelScale: [0, 0]
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setDurationScale: (state, action: PayloadAction<[number, number]>) => {
      state.durationScale = action.payload;
    },
    setScoreScale: (state, action: PayloadAction<[number, number]>) => {
      state.scoreScale = action.payload;
    },
    setLevelScale: (state, action: PayloadAction<[number, number]>) => {
      state.levelScale = action.payload;
    }
  },
});

export const { setScoreScale, setDurationScale, setLevelScale } = filterSlice.actions;

export default filterSlice.reducer;
