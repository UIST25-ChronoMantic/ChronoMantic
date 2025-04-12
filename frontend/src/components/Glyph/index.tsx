import { Comparator, GroupRelationWithSource, QuerySpecWithSource, ScopeConditionWithSource, ScopeConditionWithSourceWithUnit, SingleAttribute, SingleRelationWithSource, TargetWithSource, TrendGroupWithSource, TrendWithSource, Unit } from "../../types/QuerySpec";
import { TrendTextMap } from "../../utils/query-spec";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { DefaultArcObject } from "d3-shape";
import { ZoomTransform } from "d3";
import { getColorFromMap } from "../../utils/color";
import { formatTime } from "../../utils/time";

type ClickType = "Trend" | "Relation" | "GroupRelation";

const DISABLED_COLOR = "#ddd";
const DEFAULT_COLOR = "#ccc";

interface GlyphProps {
	targets?: TargetWithSource[];
	trends?: TrendWithSource[];
	trend_groups?: TrendGroupWithSource[];
	single_relations?: SingleRelationWithSource[];
	group_relations?: GroupRelationWithSource[];
	allTrends?: TrendWithSource[];
	height?: number;
	curTrend?: number;
	curRelation?: number;
	colorMap?: Record<string, string>;
	query?: QuerySpecWithSource | null;
	timeStampColumnType?: Unit;
	timeStampColumnUnit?: number;
	onClick?: (type: ClickType, index: number) => void;
}

const comparatorMap = {
	[Comparator.GREATER]: Comparator.LESS,
	[Comparator.LESS]: Comparator.GREATER,
	[Comparator.NO_GREATER]: Comparator.NO_LESS,
	[Comparator.NO_LESS]: Comparator.NO_GREATER,
	[Comparator.EQUAL]: Comparator.EQUAL,
	[Comparator.APPROXIMATELY_EQUAL_TO]: Comparator.APPROXIMATELY_EQUAL_TO,
};

const checkScopeCondition = (scope: ScopeConditionWithSourceWithUnit) => {
	if (!scope) return false;
	const { min, max } = scope;
	const minValue = min?.value;
	const maxValue = max?.value;
	if (minValue || maxValue) return true;
	return false;
};

const getTrendInfo = (trend: TrendWithSource) => {
	if (!trend) return { isFlat: false, isUp: false, isDown: false };
	return {
		isFlat: trend.category.category === "flat",
		isUp: trend.category.category === "up",
		isDown: trend.category.category === "down",
	};
};

const getTextSourceFromQuery = (query: QuerySpecWithSource | null, text_source_id?: number) => {
	if (!query || text_source_id === undefined || text_source_id < 0) return undefined;
	return query.text_sources[text_source_id];
};

const getColorWithDisabled = (colorMap: Record<string, string>, query: QuerySpecWithSource | null, text_source_id?: number) => {
	if (text_source_id === undefined || text_source_id < 0) return DEFAULT_COLOR;
	const textSource = getTextSourceFromQuery(query, text_source_id);
	if (!textSource || textSource.disabled) return DISABLED_COLOR;
	return getColorFromMap(colorMap, text_source_id, "ff");
};

const getScopeText = (scope: ScopeConditionWithSourceWithUnit, unitFormatter: (unit: string) => string = (unit: string) => (unit === "number" ? "" : unit), inner: boolean = false) => {
	if (!scope) return null;
	const { min, max, unit = "" } = scope;
	if (min && max) {
		return inner ? `${min.inclusive ? "[" : "("}${min.value}${unitFormatter(unit)}, ${max.value}${unitFormatter(unit)}${max.inclusive ? "]" : ")"}` : `${min.inclusive ? "[" : "("}${min.value}, ${max.value}${max.inclusive ? "]" : ")"}${unitFormatter(unit)}`;
	} else if (min) {
		return inner ? `${min.inclusive ? "[" : "("}${min.value}${unitFormatter(unit)}, +∞)` : `${min.inclusive ? "[" : "("}${min.value}, +∞)${unitFormatter(unit)}`;
	} else if (max) {
		return inner ? `(-∞, ${max.value}${unitFormatter(unit)}${max.inclusive ? "]" : ")"}` : `(-∞, ${max.value}${max.inclusive ? "]" : ")"}${unitFormatter(unit)}`;
	}
	return "";
};

interface TextWithColor {
	text: string;
	color: string;
}

const getSlopeText = (trend: TrendWithSource, colorMap: Record<string, string>, query: QuerySpecWithSource | null) => {
	const { ...conditions } = trend;
	if (!Object.keys(conditions).length) return null;
	const texts: Record<string, TextWithColor> = {};
	const map = {
		slope_scope_condition: { key: TrendTextMap["slope_scope_condition"], unitFormatter: (unit: string) => (unit && unit !== Unit.NUMBER ? `/${unit}` : "") },
		relative_slope_scope_condition: { key: TrendTextMap["relative_slope_scope_condition"], unitFormatter: () => `%` },
	};
	Object.entries(conditions).forEach(([key, value]) => {
		if (!(key in map)) return;
		const unit = map[key as keyof typeof map];
		if (value && checkScopeCondition(value)) {
			const text = getScopeText(value, unit.unitFormatter, key === "relative_slope_scope_condition");
			texts[key] = {
				text: text ? unit.key + ": " + text : "",
				color: getColorWithDisabled(colorMap, query, value.text_source_id),
			};
		}
	});
	return texts;
};

const hasOverlap = (range1: [number, number], range2: [number, number]) => {
	if (range1[0] > range1[1]) {
		[range1[0], range1[1]] = [range1[1], range1[0]];
	}
	if (range2[0] > range2[1]) {
		[range2[0], range2[1]] = [range2[1], range2[0]];
	}
	const [start1, end1] = range1;
	const [start2, end2] = range2;
	const minStart = Math.max(start1, start2);
	const maxEnd = Math.min(end1, end2);
	return minStart < maxEnd;
};

const calculateTimeRangeLevels = (trends: TrendWithSource[], trend_groups: TrendGroupWithSource[], query: QuerySpecWithSource | null | undefined, trendLength: number) => {
	const timeRanges: {
		type: "trend" | "group" | "global";
		range: [number, number];
		index: number;
		level: number;
	}[] = [];

	trends.forEach((trend, i) => {
		if (trend.duration_condition && checkScopeCondition(trend.duration_condition)) {
			timeRanges.push({
				type: "trend",
				range: [i * trendLength, (i + 1) * trendLength],
				index: i,
				level: 0,
			});
		}
	});

	trend_groups.forEach((group, i) => {
		if (group.duration_condition && checkScopeCondition(group.duration_condition)) {
			const startIndex = group.ids[0];
			const endIndex = group.ids[1];
			timeRanges.push({
				type: "group",
				range: [startIndex * trendLength, (endIndex + 1) * trendLength],
				index: i,
				level: 0,
			});
		}
	});

	if (query?.duration_condition && checkScopeCondition(query.duration_condition)) {
		timeRanges.push({
			type: "global",
			range: [0, trendLength * (query.trends.length + 1)],
			index: -1,
			level: 0,
		});
	}

	timeRanges.forEach((range1, i) => {
		for (let j = 0; j < i; j++) {
			const range2 = timeRanges[j];
			if (hasOverlap(range1.range, range2.range)) {
				range1.level = Math.max(range1.level, range2.level + 1);
			}
		}
	});

	return timeRanges;
};

const Glyph = ({ trends = [], trend_groups = [], single_relations = [], group_relations = [], height = 32, onClick, curTrend, curRelation, query, colorMap = {}, targets = [], timeStampColumnType }: GlyphProps) => {
	const trendLength = height;
	const disabled = curRelation !== -1;
	const width = trends.length * trendLength;
	const levelMap: Record<string, [number, number][]> = {};
	const baseY1 = useRef(0);
	const baseY2 = useRef(height);
	const fontSize = 8;
	const arcRadius = height / 5;

	const getLevel = (x1: number, x2: number, negative: boolean = false) => {
		let level = negative ? -1 : 0;
		const min = Math.min(x1, x2);
		const max = Math.max(x1, x2);
		while (true) {
			if (!levelMap[level]) {
				levelMap[level] = [];
			}
			if (!levelMap[level].some((line) => hasOverlap(line, [min, max]))) {
				break;
			}
			if (negative) {
				level--;
			} else {
				level++;
			}
		}
		levelMap[level].push([min, max]);
		return level;
	};

	const getV = (level: number, negative: boolean = false, step: number = 8) => {
		return negative ? baseY2.current - level * step : baseY1.current - level * step - step / 2;
	};

	const drawTimeIndicator = ({ startX, endX, textY, timeColor, timeText, key, strokeWidth = 2.5, index }: { startX: number; endX: number; textY: number; timeColor: string; timeText?: string; key?: string; strokeWidth?: number; disabled?: boolean; index?: number }) => {
		const textWidth = timeText ? (timeText.length * fontSize) / 2 : 0;
		const isActive = index === curRelation;
		const color = isActive ? timeColor.slice(0, 7) : timeColor;

		return (
			<g key={key}>
				{drawCircle(startX, textY, strokeWidth * 1.2, color)}
				{drawCircle(endX, textY, strokeWidth * 1.2, color)}
				<text
					x={(startX + endX) / 2}
					y={textY + fontSize / 16}
					fontSize={fontSize}
					fill={color}
					textAnchor="middle"
					dominantBaseline="middle"
					letterSpacing={-0.5}
				>
					{timeText}
				</text>
				<line
					x1={startX + strokeWidth / 2}
					y1={textY}
					x2={Math.max(startX, (startX + endX - textWidth) / 2)}
					y2={textY}
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
				<line
					x1={Math.min(endX, (startX + endX + textWidth) / 2)}
					y1={textY}
					x2={endX - strokeWidth / 2}
					y2={textY}
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
			</g>
		);
	};

	const points = useRef<{ x1: number; y1: number; x2: number; y2: number; isUp: boolean; isDown: boolean; isSlope: boolean; isRelative: boolean }[]>(Array(trends.length).fill(null));

	useEffect(() => {
		points.current = Array(trends.length).fill(null);
	}, [trends]);

	const getTrend = (trend: TrendWithSource, i: number, showIndex = false) => {
		if (!query) return null;
		const { isUp, isDown } = getTrendInfo(trend);
		const color = getColorWithDisabled(colorMap, query, trend.category.text_source_id);
		const x1 = i * trendLength;
		const x2 = x1 + trendLength;
		const y = height / 2;
		const prevEndPoint = points.current[i - 1] ?? null;

		const getYPositions = () => {
			if (!prevEndPoint) {
				return {
					y1: isUp ? height : isDown ? 0 : y,
					y2: isUp ? 0 : isDown ? height : y,
				};
			}
			if (!isUp && !isDown) {
				return {
					y1: prevEndPoint.y2,
					y2: prevEndPoint.y2,
				};
			}
			const step = height;
			const startY = prevEndPoint.y2;
			const endY = isUp ? startY - step : startY + step;
			return { y1: startY, y2: endY };
		};

		const { y1, y2 } = getYPositions();
		const id = Math.random().toString(36).substring(2, 7);
		const isSlope = (trend.slope_scope_condition && checkScopeCondition(trend.slope_scope_condition)) || single_relations.some((relation) => relation.attribute === SingleAttribute.SLOPE && (relation.id1 === i || relation.id2 === i));
		const isRelative = (trend.relative_slope_scope_condition && checkScopeCondition(trend.relative_slope_scope_condition)) || single_relations.some((relation) => relation.attribute === SingleAttribute.RELATIVE_SLOPE && (relation.id1 === i || relation.id2 === i));

		const texts = getSlopeText(trend, colorMap, query) ?? {};
		const currentPoint = { x1: prevEndPoint ? prevEndPoint.x2 : x1, y1: prevEndPoint ? prevEndPoint.y2 : y1, x2, y2, isUp, isDown, isSlope, isRelative };
		points.current[i] = currentPoint;
		const font = fontSize * 0.9;

		const createArc = (arcRadius: number) => {
			const arc = d3
				.arc()
				.innerRadius(arcRadius)
				.outerRadius(arcRadius)
				.startAngle(Math.PI / 2)
				.endAngle(Math.atan((currentPoint.y2 - currentPoint.y1) / (currentPoint.x2 - currentPoint.x1)) + Math.PI / 2);
			return arc({} as DefaultArcObject) || "";
		};
		const isAngleLine = isSlope || isRelative;
		const slopeSourceColor = getColorWithDisabled(colorMap, query, trend.slope_scope_condition?.text_source_id);
		const slopeColor = slopeSourceColor === DEFAULT_COLOR ? color : slopeSourceColor;
		const relativeSourceColor = getColorWithDisabled(colorMap, query, trend.relative_slope_scope_condition?.text_source_id);
		const relativeColor = relativeSourceColor === DEFAULT_COLOR ? color : relativeSourceColor;

		return (
			<g
				key={i}
				onClick={() => onClick?.("Trend", i)}
			>
				<rect
					x={x1}
					y={Math.min(currentPoint.y1, currentPoint.y2)}
					width={currentPoint.x2 - currentPoint.x1}
					height={Math.abs(currentPoint.y2 - currentPoint.y1)}
					fill={curTrend === i ? color : "#0000"}
					fillOpacity={0.3}
				/>
				<defs>
					<marker
						id={`arrow-${id}-${i}`}
						markerWidth="4"
						markerHeight="4"
						refX="2.9"
						refY="2"
						orient="auto"
						markerUnits="strokeWidth"
					>
						<path
							d="M0,0 L4,2 L0,4 Z"
							fill={color}
						/>
					</marker>
				</defs>
				<line
					x1={currentPoint.x1}
					y1={currentPoint.y1}
					x2={currentPoint.x2}
					y2={currentPoint.y2}
					strokeLinecap="round"
					stroke={color}
					strokeWidth={2.5}
					fill="none"
					markerEnd={`url(#arrow-${id}-${i})`}
				/>
				{isAngleLine && (
					<line
						x1={currentPoint.x1}
						y1={currentPoint.y1}
						x2={currentPoint.x1 + arcRadius * 1.8}
						y2={currentPoint.y1}
						stroke={color}
						strokeWidth={1}
						strokeLinecap="round"
						strokeDasharray="2,2"
					></line>
				)}
				{isSlope && (
					<path
						d={createArc(arcRadius)}
						fill="none"
						stroke={slopeColor}
						strokeWidth={2.5}
						transform={`translate(${x1},${y1})`}
					></path>
				)}
				{isRelative && (
					<path
						d={createArc(isSlope ? arcRadius * 1.5 : arcRadius)}
						fill="none"
						stroke={relativeColor}
						strokeWidth={2.5}
						transform={`translate(${x1},${y1})`}
						strokeDasharray={"2,2"}
					></path>
				)}
				{Object.entries(texts).map(([key, text], index) => {
					const lineHeight = font * 1.1;
					const textY = isUp ? y1 - index * lineHeight - 2 : y1 + index * lineHeight + lineHeight;
					return (
						<text
							key={key}
							x={x1 + (isRelative && isSlope ? arcRadius * 1.5 : arcRadius) + fontSize / 3}
							y={textY}
							fontSize={font}
							fill={text.color}
							textAnchor="start"
							letterSpacing={-0.5}
						>
							{text.text}
						</text>
					);
				})}
				{showIndex && (
					<text
						x={x1 + height / 16}
						y={y1}
						fontSize={height / 4}
						fill="#000c"
						fontWeight="bold"
					>
						{i}
					</text>
				)}
			</g>
		);
	};

	const trendLines = trends.map((trend, i) => getTrend(trend, i));

	baseY1.current = Math.min(...points.current.map((point) => point?.y1 ?? 0), ...points.current.map((point) => point?.y2 ?? 0)) - 5;
	baseY2.current = Math.max(...points.current.map((point) => point?.y1 ?? 0), ...points.current.map((point) => point?.y2 ?? 0)) + 5;

	useEffect(() => {
		baseY1.current = Math.min(...points.current.map((point) => point?.y1 ?? 0), ...points.current.map((point) => point?.y2 ?? 0)) - 5;
		baseY2.current = Math.max(...points.current.map((point) => point?.y1 ?? 0), ...points.current.map((point) => point?.y2 ?? 0)) + 5;
	}, [trends]);

	const drawCircle = (x: number, y: number, r: number = 1.5, color: string = "#000", disabled: boolean = false) => {
		return (
			<circle
				cx={x}
				cy={y}
				r={r}
				fill={disabled ? DISABLED_COLOR : color}
			/>
		);
	};

	const drawConnect = (x1: number, y1: number, x2: number, y2: number, v: number, index: number, text?: Comparator, reverse: boolean = false, color: string = DEFAULT_COLOR, strokeWidth: number = 2) => {
		if (x1 > x2) {
			[x1, x2] = [x2, x1];
			[y1, y2] = [y2, y1];
		}
		const isCurRelation = curRelation === index;
		const textWidth = text ? text.length * 12 : 0;
		const midX = (x1 + x2) / 2;

		return (
			<>
				<path
					onClick={() => onClick?.("Relation", index)}
					d={`M${x1},${y1} V${v} H${midX - textWidth / 2}`}
					stroke={isCurRelation ? color.slice(0, 7) : color}
					style={{
						animation: isCurRelation ? "dashFlow 1s linear infinite" : "none",
					}}
					fill="none"
					strokeDasharray={"4,4"}
					strokeLinecap="round"
					strokeWidth={strokeWidth}
				/>
				<path
					onClick={() => onClick?.("Relation", index)}
					d={`M${midX + textWidth / 2},${v} H${x2} V${y2}`}
					stroke={isCurRelation ? color.slice(0, 7) : color}
					style={{
						animation: isCurRelation ? "dashFlow 1s linear infinite" : "none",
					}}
					fill="none"
					strokeDasharray={"4,4"}
					strokeLinecap="round"
					strokeWidth={strokeWidth}
				/>
				{text && drawComparator(midX, v, text, index, reverse, color)}
			</>
		);
	};

	const drawComparator = (x: number, y: number, comparator: Comparator, index: number, reverse: boolean = false, color: string = "#000") => {
		if (isNaN(x) || isNaN(y)) return null;
		const newComparator = reverse && comparatorMap[comparator] ? comparatorMap[comparator] : comparator;
		const isCurRelation = curRelation === index;
		const font = fontSize * 1.5;
		return (
			<>
				<text
					onClick={() => onClick?.("Relation", index)}
					x={x}
					y={y}
					fontSize={font}
					fill={isCurRelation ? color.slice(0, 7) : color}
					fontWeight={700}
					textAnchor="middle"
					dominantBaseline="middle"
				>
					{newComparator}
				</text>
			</>
		);
	};

	const timeRangeLevels = calculateTimeRangeLevels(trends, trend_groups, query, trendLength);
	const maxLevel = Math.max(-1, ...timeRangeLevels.map((item) => item.level));
	const space = fontSize * 2;

	const relationLines = single_relations.map((relation, i) => {
		if (!query || !relation.attribute || relation.id1 === undefined || relation.id2 === undefined || relation.id1 === relation.id2) return null;
		const trendIndex1 = relation.id1;
		const trendIndex2 = relation.id2;
		const isReverse = trendIndex1 > trendIndex2;
		const isActive = curRelation === i;

		const isEnd = relation.attribute === SingleAttribute.END_VALUE;
		const isStart = relation.attribute === SingleAttribute.START_VALUE;
		const isSpan = relation.attribute === SingleAttribute.DURATION;

		if (isStart || isEnd) {
			const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id) || DEFAULT_COLOR;
			const activeColor = isActive ? relationColor.slice(0, 7) : disabled ? DISABLED_COLOR : relationColor;
			const x1 = isStart ? points.current[trendIndex1]?.x1 : points.current[trendIndex1]?.x2;
			const x2 = isStart ? points.current[trendIndex2]?.x1 : points.current[trendIndex2]?.x2;
			const y1 = isStart ? points.current[trendIndex1]?.y1 : points.current[trendIndex1]?.y2;
			const y2 = isStart ? points.current[trendIndex2]?.y1 : points.current[trendIndex2]?.y2;
			const level = getLevel(x1, x2);
			const v = getV(level);

			return (
				<g key={i}>
					{drawConnect(x1, y1, x2, y2, v, i, relation.comparator, isReverse, relationColor)}
					{drawCircle(x1, y1, 2, activeColor)}
					{drawCircle(x2, y2, 2, activeColor)}
				</g>
			);
		} else if (isSpan) {
			const offset = trendLength;
			const offsetY = (maxLevel + 1) * fontSize + 2;
			const x11 = trendIndex1 * trendLength;
			const x12 = x11 + offset;
			const x21 = trendIndex2 * trendLength;
			const x22 = x21 + offset;
			const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id) || DEFAULT_COLOR;
			const level = getLevel(Math.min(x11, x21), Math.max(x12, x22), true);
			const y = baseY2.current + offsetY - (level + 1) * space;
			return (
				<g key={i}>
					{drawTimeIndicator({ startX: x11, endX: x12, textY: y, timeColor: relationColor, disabled, index: i })}
					{drawTimeIndicator({ startX: x21, endX: x22, textY: y, timeColor: relationColor, disabled, index: i })}
					{drawConnect((x12 + x11) / 2, y, (x21 + x22) / 2, y, y + space / 2, i, relation.comparator, isReverse, relationColor)}
				</g>
			);
		} else {
			const { x1: x11, y1: y11, isSlope: isSlope1, isRelative: isRelative1, isUp: isUp1 } = points.current[trendIndex1] ?? {};
			const { x1: x21, y1: y21, isSlope: isSlope2, isRelative: isRelative2, isUp: isUp2 } = points.current[trendIndex2] ?? {};

			const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id) || DEFAULT_COLOR;
			const level = getLevel(Math.min(x11, x21), Math.max(x11, x21));
			const v = getV(level);
			const offset1 = isSlope1 && isRelative1 && relation.attribute === SingleAttribute.RELATIVE_SLOPE ? arcRadius * 1.5 : arcRadius;
			const offset2 = isSlope2 && isRelative2 && relation.attribute === SingleAttribute.RELATIVE_SLOPE ? arcRadius * 1.5 : arcRadius;
			const offset3 = isUp1 ? -arcRadius / 2 : 0;
			const offset4 = isUp2 ? -arcRadius / 2 : 0;

			return <g key={i}>{drawConnect(x11 + offset1, y11 + offset3, x21 + offset2, y21 + offset4, v, i, relation.comparator, isReverse, relationColor)}</g>;
		}
	});

	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null);
	const [lastTransform, setLastTransform] = useState<ZoomTransform | null>(null);

	useEffect(() => {
		if (!svgRef.current || !gRef.current) return;

		const svg = d3.select(svgRef.current);
		const g = d3.select(gRef.current);
		const bbox = g.node()?.getBBox();
		if (!bbox) return;

		const width = svgRef.current.clientWidth;
		const height = svgRef.current.clientHeight;

		const scale = Math.min(width / (bbox.width + 20), height / (bbox.height + 20));
		const x = (width - bbox.width * scale) / 2 - bbox.x * scale;
		const y = (height - bbox.height * scale) / 2 - bbox.y * scale;

		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([1, 10])
			.on("zoom", (event) => {
				if (!event.transform) return;
				g.attr("transform", event.transform);
				if (event.sourceEvent) {
					setLastTransform(event.transform);
				}
			});

		svg.call(zoom);

		if (lastTransform) {
			svg.call(zoom.transform, lastTransform);
		} else {
			svg.call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
		}

		return () => {
			svg.on("zoom", null);
		};
	}, [trends, single_relations, group_relations, lastTransform]);

	useEffect(() => {
		if (!query) {
			setLastTransform(null);
		}
	}, [query]);

	const drawTimeRangeIndicator = (params: { type: "trend" | "group" | "global"; index: number; level: number; condition?: ScopeConditionWithSourceWithUnit; ids?: [number, number] }) => {
		const { type, index, level, condition, ids } = params;
		if (!condition || !query) return null;
		let startX: number, endX: number;
		switch (type) {
			case "trend":
				startX = index * trendLength;
				endX = startX + trendLength;
				break;
			case "group":
				if (!ids) return null;
				startX = ids[0] * trendLength;
				endX = ids[1] * trendLength + trendLength;
				break;
			case "global":
				startX = 0;
				endX = (trends.length - 1) * trendLength + trendLength;
				break;
		}

		const textY = baseY2.current + level * fontSize + 2;
		const timeColor = getColorWithDisabled(colorMap, query, condition.text_source_id);
		const timeText = getScopeText(condition);

		if (!timeText) return null;

		return drawTimeIndicator({
			startX,
			endX,
			textY,
			timeColor,
			timeText,
			key: `${type}-time-${index}`,
		});
	};

	const timeIndicators = () => {
		return (
			<>
				{trends.map(
					(trend, i) =>
						trend.duration_condition &&
						checkScopeCondition(trend.duration_condition) &&
						drawTimeRangeIndicator({
							type: "trend",
							index: i,
							level: timeRangeLevels.find((item) => item.type === "trend" && item.index === i)?.level || 0,
							condition: trend.duration_condition,
						})
				)}
				{trend_groups.map(
					(group, i) =>
						group.duration_condition &&
						checkScopeCondition(group.duration_condition) &&
						drawTimeRangeIndicator({
							type: "group",
							index: i,
							level: timeRangeLevels.find((item) => item.type === "group" && item.index === i)?.level || 0,
							condition: group.duration_condition,
							ids: group.ids,
						})
				)}
				{query?.duration_condition &&
					checkScopeCondition(query.duration_condition) &&
					drawTimeRangeIndicator({
						type: "global",
						index: 0,
						level: timeRangeLevels.find((item) => item.type === "global")?.level || 0,
						condition: query.duration_condition,
					})}
			</>
		);
	};

	const drawGroupRelation = (relation: GroupRelationWithSource, i: number, trendLength: number, trends: TrendWithSource[], strokeWidth: number = 2.5) => {
		if (!query) return null;
		const offset = (maxLevel + 1) * fontSize + 2;
		const getGroupInfo = (ids: [number, number]) => {
			if (ids[0] === undefined || ids[1] === undefined || ids[0] >= trends.length || ids[1] >= trends.length) return null;
			const x1 = ids[0] * trendLength;
			const x2 = ids[1] * trendLength + trendLength;
			return {
				center: (x1 + x2) / 2,
				start: x1,
				end: x2,
			};
		};

		const group1Info = getGroupInfo(relation.group1);
		const group2Info = getGroupInfo(relation.group2);

		if (!group1Info || !group2Info) return null;
		const isReverse = group1Info.start > group2Info.start;
		const level = getLevel(Math.min(group1Info.start, group2Info.start), Math.max(group1Info.end, group2Info.end), true);
		const rangeY = baseY2.current + offset - (level + 1) * space;
		const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id);
		const index = i + single_relations.length;

		return (
			<g key={`group-${i}`}>
				{drawTimeIndicator({ startX: group1Info.start, endX: group1Info.end, textY: rangeY, timeColor: relationColor, index, strokeWidth })}
				{drawTimeIndicator({ startX: group2Info.start, endX: group2Info.end, textY: rangeY, timeColor: relationColor, index, strokeWidth })}
				{drawConnect(group1Info.center, rangeY, group2Info.center, rangeY, rangeY + space / 2, index, relation.comparator, isReverse, relationColor, 2)}
			</g>
		);
	};

	const groupRelationLines = group_relations.map((relation, i) => drawGroupRelation(relation, i, trendLength, trends));

	const drawTarget = (targets: TargetWithSource[]) => {
		if (!targets.length) return null;
		if (!query) return null;

		const text = targets.map((target, index) => {
			const targetColor = getColorWithDisabled(colorMap, query, target.text_source_id);
			return (
				<tspan
					key={`${target}-${index}`}
					fill={targetColor}
				>
					{" "}
					{target.target}{" "}
				</tspan>
			);
		});

		return (
			<g>
				<text
					x={10}
					y={10}
					fontSize={20}
					dominantBaseline="hanging"
					textAnchor="start"
					style={{ pointerEvents: "none" }}
				>
					{text}
				</text>
			</g>
		);
	};

	const timeScopeCondition = query?.time_scope_condition ?? null;
	const maxScopeCondition = query?.max_value_scope_condition ?? null;
	const minScopeCondition = query?.min_value_scope_condition ?? null;

	const drawTimeScopeCondition = () => {
		if (!timeScopeCondition || !query) return null;
		const color = getColorWithDisabled(colorMap, query, timeScopeCondition.text_source_id);
		const minText = timeScopeCondition.min?.value ? formatTime(timeScopeCondition.min.value * 1000, timeStampColumnType) : null;
		const maxText = timeScopeCondition.max?.value ? formatTime(timeScopeCondition.max.value * 1000, timeStampColumnType) : null;
		const height = (baseY1.current + baseY2.current) / 2;
		return (
			<>
				{minText && (
					<text
						x={-10}
						y={height}
						fontSize={fontSize}
						fill={color}
						fontWeight={700}
						dominantBaseline="middle"
						textAnchor="end"
					>
						{minText}
					</text>
				)}
				{maxText && (
					<text
						x={width + 10}
						y={height}
						fontSize={fontSize}
						fill={color}
						fontWeight={700}
						dominantBaseline="middle"
						textAnchor="start"
					>
						{maxText}
					</text>
				)}
			</>
		);
	};

	const drawYValueScopeCondition = (x: number, y: number, scopeCondition: ScopeConditionWithSource | null) => {
		if (!scopeCondition || !query) return null;
		const text = getScopeText(scopeCondition);
		if (!text) return null;

		const color = getColorWithDisabled(colorMap, query, scopeCondition.text_source_id);
		const strokeWidth = 2.5;
		const lineHeight = (strokeWidth * 3) / 2;
		return (
			<g transform={`translate(${x - fontSize}, 0)`}>
				{drawCircle(x, y - lineHeight, strokeWidth, color)}
				<line
					x1={x}
					y1={y - lineHeight}
					x2={x}
					y2={y}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<text
					x={x - strokeWidth * 2}
					y={y + strokeWidth / 4}
					fontSize={fontSize}
					fill={color}
					fontWeight={700}
					textAnchor="end"
					dominantBaseline="middle"
				>
					{text}
				</text>
				<line
					x1={x}
					y1={y}
					x2={x}
					y2={y + lineHeight}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				{drawCircle(x, y + lineHeight, strokeWidth, color)}
			</g>
		);
	};

	const drawComparatorBetweenStartEndValue = () => {
		if (!query?.comparator_between_start_end_value?.comparator) return null;
		const color = getColorWithDisabled(colorMap, query, query.comparator_between_start_end_value.text_source_id);
		const comparator = query.comparator_between_start_end_value.comparator;
		const x1 = 0;
		const y1 = points.current[0].y1;
		const x2 = width;
		const y2 = points.current[points.current.length - 1].y2;
		const level = getLevel(x1, x2);
		const v = getV(level);
		const i = single_relations.length + group_relations.length + 1;
		return (
			<g key={i}>
				{drawConnect(x1, y1, x2, y2, v, i, comparator, false, color)}
				{drawCircle(x1, y1, 2, color)}
				{drawCircle(x2, y2, 2, color)}
			</g>
		);
	};

	return (
		<svg
			ref={svgRef}
			width="100%"
			height="100%"
		>
			{drawTarget(targets)}
			<g ref={gRef}>
				{trendLines}
				{relationLines}
				{timeIndicators()}
				{drawTimeScopeCondition()}
				{drawYValueScopeCondition(0, baseY1.current + fontSize / 2, maxScopeCondition)}
				{drawYValueScopeCondition(0, baseY2.current - fontSize / 2, minScopeCondition)}
				{groupRelationLines}
				{drawComparatorBetweenStartEndValue()}
			</g>
		</svg>
	);
};

export default Glyph;
