import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setCurrent, setLevel, setSource } from "../../../app/slice/approximation";
import { getSplit } from "../../../utils/split";
import LineChart from "../../LineChart";
import { setBrushPosition, setDefaultSplits, setRange, setSelectedSplits } from "../../../app/slice/selectSlice";

export function ChartView() {
	const dataset = useAppSelector((state) => state.dataset.dataset);
	const timeStampColumn = useAppSelector((state) => state.dataset.dataset?.timeStampColumn) || "";
	const xData = (dataset?.data[timeStampColumn] || []) as string[];
	const dispatch = useAppDispatch();
	const results = useAppSelector((state) => state.approximation.results);
	const level = useAppSelector((state) => state.dataset.level);

	const handleClick = useCallback(
		(col: string) => {
			dispatch(setSource(col));
			dispatch(setLevel(level));
			dispatch(setRange([0, 0]));
			dispatch(setBrushPosition([0, 0]));
			dispatch(setCurrent(null));
			dispatch(setDefaultSplits([]));
			dispatch(setSelectedSplits([]));
		},
		[dispatch, level]
	);

	return dataset?.valueColumns.map((col) => {
		return (
			<div
				key={col}
				className="chart-view-item"
				onClick={() => {
					handleClick(col);
				}}
			>
				<LineChart
					isXAxisVisible
					height={80}
					margin={{ top: 10, right: 15, bottom: 10, left: 40 }}
					isYAxisVisible
					title={col}
					lineColor="#000"
					xAxisColor="#E7E7E7"
					xAxisTextColor="#6E6E6E"
					yAxisColor="#E7E7E7"
					yAxisTextColor="#6E6E6E"
					textColor="#000"
					xData={xData}
					yData={dataset.data[col] as number[]}
					split={getSplit(results?.find((result) => result.source === col)?.approximation_segments_list.find((item) => item.approximation_level === level)?.segments || [])}
					isYAxisTextVisible
				></LineChart>
			</div>
		);
	});
}
