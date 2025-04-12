import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Unit } from "../../types/QuerySpec";

export type ColumnType = string | number;

export interface DatasetColumn {
  timeStampColumn: string;
  timeStampColumnType: Unit;
  valueColumns: string[];
}

export interface Dataset extends DatasetColumn {
  filename: string;
  data: Record<string, ColumnType[]>;
};

interface DatasetState {
  dataset: Dataset | null;
  level: number;
}

const initialState: DatasetState = {
  dataset: null,
  level: 0,
};

const datasetSlice = createSlice({
  name: "dataset",
  initialState,
  reducers: {
    setDataset: (state, action: PayloadAction<Dataset>) => {
      state.dataset = action.payload;
    },
    setLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
    },
  },
});

export const { setDataset, setLevel } = datasetSlice.actions;
export default datasetSlice.reducer;
