import Panel from "../Panel";
import TableIcon from "../../icons/Table";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { ChartView } from "./ChartView";
import LevelController from "../LevelController";
import { setLevel } from "../../app/slice/datasetSlice";
import { Empty } from "antd";

enum TableState {
	EMPTY,
	CHART,
}

export default function TableView() {
	const dataset = useAppSelector((state) => state.dataset.dataset);
	const level = useAppSelector((state) => state.dataset.level);
	const dispatch = useAppDispatch();
	const state = !dataset ? TableState.EMPTY : TableState.CHART;

	const renderComponent = (state: TableState) => {
		switch (state) {
			case TableState.EMPTY:
				return (
					<div className="table-empty">
						<Empty description="No data available" />
					</div>
				);
			case TableState.CHART:
				return (
					<div className="table-content">
						<ChartView></ChartView>
					</div>
				);
		}
	};

	const maxLevel = useAppSelector((state) => Object.values(state.approximation.results ?? {}).at(-1)?.max_approximation_level);

	return (
		<Panel
			className="table-view"
			icon={<TableIcon />}
			title="Data Overview"
			right={
				<LevelController
					level={level}
					disabled={!maxLevel}
					maxLevel={maxLevel ?? 0}
					onChange={(level) => dispatch(setLevel(level))}
				/>
			}
		>
			<LevelController
				level={level}
				disabled={!maxLevel}
				maxLevel={maxLevel ?? 0}
				onChange={(level) => dispatch(setLevel(level))}
			/>
			{renderComponent(state)}
		</Panel>
	);
}
