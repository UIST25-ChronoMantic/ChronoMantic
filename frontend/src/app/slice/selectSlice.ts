import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectState {
    range: [number, number],
    brushPosition: [number, number],
    selectPosition: [number, number],
    selectedSplits: number[],
    defaultSplits: number[]
}

const initialState: SelectState = {
    range: [0, 0],
    brushPosition: [0, 0],
    selectPosition: [0, 0],
    selectedSplits: [],
    defaultSplits: []
};

export const selectSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setRange(state, action: PayloadAction<[number, number]>) {
            state.range = action.payload;
        },
        setBrushPosition(state, action: PayloadAction<[number, number]>) {
            state.brushPosition = action.payload;
        },
        setSelectPosition(state, action: PayloadAction<[number, number]>) {
            state.selectPosition = action.payload;
        },
        setSelectedSplits(state, action: PayloadAction<number[]>) {
            state.selectedSplits = [...new Set(action.payload)].sort((a, b) => a - b);
        },
        setDefaultSplits(state, action: PayloadAction<number[]>) {
            state.defaultSplits = [...new Set(action.payload)].sort((a, b) => a - b);
        }
    },
});

export const { setRange, setBrushPosition, setSelectPosition, setSelectedSplits, setDefaultSplits } = selectSlice.actions;

export default selectSlice.reducer;