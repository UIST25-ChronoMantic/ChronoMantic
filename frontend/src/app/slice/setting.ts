import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingState {
  r2: number;
  isSettingShow: boolean;
}

const initialState: SettingState = {
  r2: 0,
  isSettingShow: false
};

export const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    setR2: (state, action: PayloadAction<number>) => {
      state.r2 = action.payload;
    },
    setIsSettingShow: (state, action: PayloadAction<boolean>) => {
      state.isSettingShow = action.payload;
    }
  },
});

export const { setR2, setIsSettingShow } = settingSlice.actions;

export default settingSlice.reducer;
