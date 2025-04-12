import { Divider } from "antd";
import "./index.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useMemo } from "react";
import { setQuery } from "../../app/slice/stateSlice";
import { deepClone } from "../../utils/deepclone";
import Target from "./Target";
import Scope from "./Scope";
import Relation from "./Relation";
import Trend from "./Trend";
import TrendGroup from "./TrendGroup";
import GroupRelation from "./GroupRelation";
import SpanWithUnit from "./SpanWithUnit";
import { getColorFromMap } from "../../utils/color";
import { Comparator, QuerySpecWithSource, ScopeConditionWithSource, ScopeConditionWithSourceWithUnit, ThresholdCondition, Unit } from "../../types/QuerySpec";
import SelectChoice from "./SelectChoice";

const emptyQuerySpec: QuerySpecWithSource = {
	original_text: "",
	targets: [],
	text_sources: [],
	trends: [],
	single_relations: [],
	trend_groups: [],
	group_relations: [],
	duration_condition: {
		text_source_id: -1,
	},
	time_scope_condition: {
		text_source_id: -1,
	},
	max_value_scope_condition: {
		text_source_id: -1,
	},
	min_value_scope_condition: {
		text_source_id: -1,
	},
};

const updateScopeCondition = (condition: ScopeConditionWithSourceWithUnit, min: ThresholdCondition | null, max: ThresholdCondition | null): ScopeConditionWithSourceWithUnit => {
	return {
		min: min ?? undefined,
		max: max ?? undefined,
		text_source_id: condition.text_source_id,
		unit: condition.unit,
	};
};

type ScopeConditionKeys = Extract<keyof QuerySpecWithSource, `${string}_condition`>;

export default function QueryCondition() {
	const query = useAppSelector((state) => state.states.query);
	const memoizedQuery = useMemo(() => deepClone(query) || emptyQuerySpec, [query]);
	const values = useAppSelector((state) => state.dataset.dataset?.valueColumns) || [];
	const dispatch = useAppDispatch();
	const time = useAppSelector((state) => state.dataset.dataset?.data[state.dataset.dataset.timeStampColumn]) || [];
	const date = time.map((t) => new Date(t).getTime());
	const minDate = date.reduce((min, curr) => (curr < min ? curr : min), date[0]);
	const maxDate = date.reduce((max, curr) => (curr > max ? curr : max), date[0]);
	const curRelation = useAppSelector((state) => state.states.curRelation);
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const timeStampColumnType = useAppSelector((state) => state.dataset.dataset?.timeStampColumnType);
	const timeStampColumnUnitText = useMemo(() => (timeStampColumnType === Unit.NUMBER ? undefined : timeStampColumnType), [timeStampColumnType]);

	const scopeConfigs = [
		{
			title: "Time Scope",
			condition: memoizedQuery.time_scope_condition,
			minValue: minDate,
			maxValue: maxDate,
		},
		{
			title: "Max Value Scope",
			condition: memoizedQuery.max_value_scope_condition,
		},
		{
			title: "Min Value Scope",
			condition: memoizedQuery.min_value_scope_condition,
		},
	];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="query-condition"
		>
			<section>
				<Target
					value={memoizedQuery.targets?.map((target) => target.target) || []}
					options={values}
					colorMap={colorMap}
					sources={memoizedQuery?.targets?.map((target) => target.text_source_id) || []}
					onChange={(val) => {
						const newQuery = { ...memoizedQuery };
						newQuery.targets = val.map((target) => ({ target, text_source_id: query?.targets.find((source) => source.target === target)?.text_source_id ?? -1 }));
						dispatch(setQuery(newQuery));
					}}
				/>
				<Divider />
			</section>

			<section>
				<Trend
					isEdit={true}
					trends={memoizedQuery.trends || []}
					onChange={(trends) => {
						const newQuery = { ...memoizedQuery };
						newQuery.trends = trends;
						dispatch(setQuery(newQuery));
					}}
					timeStampColumnType={timeStampColumnType}
				/>
			</section>

			<section>
				<Relation
					highlight={curRelation ?? -1}
					isEdit={true}
					relations={memoizedQuery.single_relations || []}
					idLength={memoizedQuery.trends?.length || 0}
					onChange={(relations) => {
						const newQuery = { ...memoizedQuery };
						newQuery.single_relations = relations;
						dispatch(setQuery(newQuery));
					}}
				/>
			</section>

			<section>
				<TrendGroup
					isEdit={true}
					groups={memoizedQuery.trend_groups || []}
					idLength={memoizedQuery.trends?.length || 0}
					onChange={(groups) => {
						const newQuery = { ...memoizedQuery };
						newQuery.trend_groups = groups;
						dispatch(setQuery(newQuery));
					}}
					timeStampColumnType={timeStampColumnType}
				/>
				{memoizedQuery.trend_groups.length <= 0 && <Divider />}
			</section>

			<section>
				<GroupRelation
					isEdit={true}
					relations={memoizedQuery.group_relations || []}
					trends={memoizedQuery.trends || []}
					onChange={(relations) => {
						const newQuery = { ...memoizedQuery };
						newQuery.group_relations = relations;
						dispatch(setQuery(newQuery));
					}}
				/>
				{memoizedQuery.group_relations.length <= 0 && <Divider />}
			</section>

			<section>
				<SpanWithUnit
					title="Duration"
					min={memoizedQuery.duration_condition?.min?.value ?? null}
					max={memoizedQuery.duration_condition?.max?.value ?? null}
					activeColor={getColorFromMap(colorMap, memoizedQuery.duration_condition?.text_source_id)}
					minInclusive={!!memoizedQuery.duration_condition?.min?.inclusive}
					maxInclusive={!!memoizedQuery.duration_condition?.max?.inclusive}
					unit={memoizedQuery.duration_condition?.unit ?? timeStampColumnUnitText}
					onChange={(min, max, unit) => {
						const newQuery = { ...memoizedQuery };
						newQuery.duration_condition = {
							min: min ?? undefined,
							max: max ?? undefined,
							unit,
							text_source_id: memoizedQuery.duration_condition?.text_source_id ?? -1,
						};
						dispatch(setQuery(newQuery));
					}}
				/>
				<Divider />
			</section>

			<section>
				<SelectChoice
					title="Start Value and End Value"
					activeColor={getColorFromMap(colorMap, memoizedQuery.comparator_between_start_end_value?.text_source_id)}
					value={memoizedQuery.comparator_between_start_end_value?.comparator}
					options={Object.values(Comparator)}
					onChange={(comparator) => {
						const newQuery = { ...memoizedQuery };
						newQuery.comparator_between_start_end_value = comparator ? {
							comparator: comparator,
							text_source_id: memoizedQuery.duration_condition?.text_source_id ?? -1,
						} : undefined;
						dispatch(setQuery(newQuery));
					}}
				/>
				<Divider />
			</section>

			{scopeConfigs.map(({ title, condition, ...props }, index) => (
				<section key={index}>
					<Scope
						title={title}
						min={condition?.min?.value ?? null}
						max={condition?.max?.value ?? null}
						activeColor={getColorFromMap(colorMap, condition?.text_source_id)}
						minInclusive={!!condition?.min?.inclusive}
						maxInclusive={!!condition?.max?.inclusive}
						{...props}
						onChange={(min, max) => {
							const newQuery = { ...memoizedQuery };
							const key = (title.toLowerCase().replace(/\s/g, "_") + "_condition") as ScopeConditionKeys;
							newQuery[key] = updateScopeCondition(condition || ({} as ScopeConditionWithSource), min, max);
							dispatch(setQuery(newQuery));
						}}
					/>
					<Divider />
				</section>
			))}
		</form>
	);
}
