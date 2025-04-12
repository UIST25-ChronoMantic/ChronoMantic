import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { deepEqual } from "../../utils/deepclone";
import { Popover } from "antd";
import { Comparator, GlobalChoice, GroupChoice, GroupRelationChoice, Intentions, Segment, SingleChoice, SingleRelationChoice, Unit } from "../../types/QuerySpec";
import { flushSync } from "react-dom";
import { formatTime } from "../../utils/time";
import IntentionPopover from "./IntentionPopover";
import { IntentionLine, LineChartProps, PopoverPosition } from "./types";
import { generateId } from "../../utils/id";
import { queryApi } from "../../api";
import { setupTooltip } from "./hooks/useTooltip";
import { useResize } from "./hooks/useResize";
import { useScroll } from "./hooks/useScroll";

function LineChart({ xData, yData, ratio, isFill = false, title = "", isXAxisVisible = false, isYAxisVisible = false, isXAxisTextVisible = false, isYAxisTextVisible = false, isBrush = false, onBrush, onBrushEnd, range, height, split, brushPosition, isExpand = true, isShowRange = true, isActive, children, onScroll, onContextMenu, xAxisColor = "#C5C5C5", yAxisColor = "#C5C5C5", lineColor = "#A6A6A6", xAxisTextColor = "#C5C5C5", yAxisTextColor = "#C5C5C5", textColor = "#C5C5C5", xAxisFormatter = (date: Date) => formatTime(date, xDataType === Unit.NUMBER ? undefined : xDataType), brushColor = "#546BB633", resultsSplit, selectedSplits, defaultSplits = [], isSelectable = false, onSplitSelect, onSubmitIntentions, margin, isHoverable = false, xDataType = Unit.NUMBER, isRequesting = false, onCancelSplit, segments = [] }: LineChartProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const id = generateId();
	const isTime = useMemo(() => xDataType !== Unit.NUMBER, [xDataType]);
	const [userSplits, setUserSplits] = useState<number[]>([]);

	useEffect(() => {
		setUserSplits([]);
	}, [split]);

	const isMargin = useMemo(() => isXAxisVisible || isXAxisTextVisible || isYAxisVisible || isYAxisTextVisible, [isXAxisVisible, isXAxisTextVisible, isYAxisVisible, isYAxisTextVisible]);
	const timeStampData = useMemo(() => (xData.every((x) => typeof x === "string") ? xData.map((d) => new Date(d).getTime()) : xData.slice()), [xData]);
	const computedMargin = useMemo(() => ({ top: isMargin ? margin?.top ?? 30 : 0, right: isMargin ? margin?.right ?? 40 : 0, bottom: isMargin ? margin?.bottom ?? 30 : 0, left: isMargin ? margin?.left ?? 40 : 0 }), [isMargin, margin]);

	useEffect(() => {
		setUserSplits([]);
	}, [xData, yData]);

	const splits = useMemo(() => (defaultSplits?.length ? defaultSplits : userSplits), [defaultSplits, userSplits]);
	const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
	const [selectedChoices, setSelectedChoices] = useState<SingleChoice[]>([]);
	const [selectedGroups, setSelectedGroups] = useState<GroupChoice[]>([]);
	const [selectedRelations, setSelectedRelations] = useState<SingleRelationChoice[]>([]);
	const [selectedGroupRelations, setSelectedGroupRelations] = useState<GroupRelationChoice[]>([]);
	const [selectedGlobal, setSelectedGlobal] = useState<GlobalChoice[]>([]);
	const [dragStart, setDragStart] = useState<[number, number] | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [segmentIds, setSegmentIds] = useState<number[][]>([]);
	const [relationIds, setRelationIds] = useState<number[][]>([]);
	const [intentions, setIntentions] = useState<Intentions>({
		single_segment_intentions: [],
		segment_group_intentions: [],
		single_relation_intentions: [],
		group_relation_intentions: [],
		global_intentions: [],
	});

	const [comparison, setComparison] = useState<Record<string, Comparator> | null>(null);

	useScroll(onScroll, svgRef.current, range, computedMargin, xData.length);

	const handleContextMenu = useCallback(
		(event: MouseEvent) => {
			if (!onContextMenu) return;
			event.preventDefault();
			onContextMenu(event);
		},
		[onContextMenu]
	);

	useEffect(() => {
		if (!svgRef.current) return;
		const svg = svgRef.current;
		svg.addEventListener("contextmenu", handleContextMenu);
		return () => {
			svg?.removeEventListener("contextmenu", handleContextMenu);
		};
	}, [handleContextMenu]);

	const handlePopoverClose = useCallback(() => {
		setPopoverPosition(null);
		setSegmentIds([]);
		setRelationIds([]);
		setComparison(null);
	}, []);

	useEffect(() => {
		handlePopoverClose();
		setIntentions({
			single_segment_intentions: [],
			segment_group_intentions: [],
			single_relation_intentions: [],
			group_relation_intentions: [],
			global_intentions: [],
		});
	}, [splits, selectedSplits, xData, yData, split, handlePopoverClose]);

	const handleChoicesChange = useCallback((choice: SingleChoice) => {
		setSelectedChoices((prev) => {
			if (prev.includes(choice)) {
				return prev.filter((c) => c !== choice);
			}
			return [...prev, choice];
		});
	}, []);

	const handleGroupChoicesChange = useCallback((choice: GroupChoice) => {
		setSelectedGroups((prev) => {
			if (prev.includes(choice)) {
				return prev.filter((c) => c !== choice);
			}
			return [...prev, choice];
		});
	}, []);

	const handleRelationsChange = useCallback((choice: SingleRelationChoice) => {
		setSelectedRelations((prev) => {
			if (prev.includes(choice)) {
				return prev.filter((c) => c !== choice);
			}
			return [...prev, choice];
		});
	}, []);

	const handleGroupRelationsChange = useCallback((choice: GroupRelationChoice) => {
		setSelectedGroupRelations((prev) => {
			if (prev.includes(choice)) {
				return prev.filter((c) => c !== choice);
			}
			return [...prev, choice];
		});
	}, []);

	const handleGlobalChoicesChange = useCallback((choice: GlobalChoice) => {
		setSelectedGlobal((prev) => {
			if (prev.includes(choice)) {
				return prev.filter((c) => c !== choice);
			}
			return [...prev, choice];
		});
	}, []);

	const createIntention = useMemo(
		() => ({
			SingleSegment: (ranges: [number, number][], choices: SingleChoice[]) => ({
				id: selectedSplits?.findIndex((split) => split === ranges[0][0]) ?? -1,
				single_choices: choices,
			}),
			SegmentGroup: (ranges: [number, number][], choices: GroupChoice[]) => ({
				ids: [selectedSplits?.findIndex((split) => split === ranges[0][0]) ?? -1, selectedSplits?.findIndex((split) => split === ranges[ranges.length - 1][0]) ?? -1] as [number, number],
				group_choices: choices,
			}),
		}),
		[selectedSplits]
	);

	const handleConfirm = useCallback(() => {
		if (!popoverPosition) return;

		const { type, ranges, groups } = popoverPosition;
		const newIntentions = { ...intentions };

		switch (type) {
			case "SingleSegment": {
				if (selectedChoices.length === 0) return;
				const existingIndex = newIntentions.single_segment_intentions.findIndex((intention) => deepEqual([[selectedSplits?.[intention.id], selectedSplits?.[intention.id + 1]]], ranges));

				if (existingIndex !== -1) {
					newIntentions.single_segment_intentions[existingIndex] = {
						...newIntentions.single_segment_intentions[existingIndex],
						single_choices: selectedChoices,
					};
				} else {
					newIntentions.single_segment_intentions.push(createIntention.SingleSegment(ranges, selectedChoices));
				}
				break;
			}

			case "SegmentGroup": {
				if (selectedGroups.length === 0) return;

				const existingIndex = newIntentions.segment_group_intentions.findIndex((intention) => deepEqual([[selectedSplits?.[intention.ids[0]], selectedSplits?.[intention.ids[1] + 1]]], ranges));

				if (existingIndex !== -1) {
					newIntentions.segment_group_intentions[existingIndex] = {
						...newIntentions.segment_group_intentions[existingIndex],
						group_choices: selectedGroups,
					};
				} else {
					newIntentions.segment_group_intentions.push(createIntention.SegmentGroup(ranges, selectedGroups));
				}
				break;
			}
			case "Global": {
				if (selectedGlobal.length === 0) return;
				newIntentions.global_intentions = selectedGlobal;
				break;
			}

			case "SingleRelation": {
				if (selectedRelations.length === 0) return;
				const id1 = selectedSplits?.findIndex((split) => split === ranges[0][0]);
				const id2 = selectedSplits?.findIndex((split) => split === ranges[1][0]);
				if (id1 === undefined || id2 === undefined) return;
				const is1 = id1 < id2;
				const existingIndex = newIntentions.single_relation_intentions.findIndex((intention) => intention.id1 === (is1 ? id1 : id2) && intention.id2 === (is1 ? id2 : id1));

				if (existingIndex !== -1) {
					newIntentions.single_relation_intentions[existingIndex] = {
						...newIntentions.single_relation_intentions[existingIndex],
						relation_choices: selectedRelations,
					};
				} else {
					newIntentions.single_relation_intentions.push({
						id1: is1 ? id1 : id2,
						id2: is1 ? id2 : id1,
						relation_choices: selectedRelations,
					});
				}
				break;
			}

			case "GroupRelation": {
				if (selectedGroupRelations.length === 0 || !groups?.length) return;
				const [range1, range2] = groups;
				const range1Id1 = selectedSplits?.findIndex((split) => deepEqual(split, range1[0][0]));
				const range1Id2 = selectedSplits?.findIndex((split) => deepEqual(split, range1[range1.length - 1][0]));
				const range2Id1 = selectedSplits?.findIndex((split) => deepEqual(split, range2[0][0]));
				const range2Id2 = selectedSplits?.findIndex((split) => deepEqual(split, range2[range2.length - 1][0]));
				if (range1Id1 === undefined || range1Id2 === undefined || range2Id1 === undefined || range2Id2 === undefined) return;
				const is1 = range1Id1 < range2Id1;
				const existingIndex = newIntentions.group_relation_intentions.findIndex((intention) => intention.group1[0] === (is1 ? range1Id1 : range2Id1) && intention.group1[1] === (is1 ? range1Id2 : range2Id2) && intention.group2[0] === (is1 ? range2Id1 : range1Id1) && intention.group2[1] === (is1 ? range2Id2 : range1Id2));
				if (existingIndex !== -1) {
					newIntentions.group_relation_intentions[existingIndex] = {
						...newIntentions.group_relation_intentions[existingIndex],
						relation_choices: selectedGroupRelations,
					};
				} else {
					newIntentions.group_relation_intentions.push({
						group1: is1 ? [range1Id1, range1Id2] : [range2Id1, range2Id2],
						group2: is1 ? [range2Id1, range2Id2] : [range1Id1, range1Id2],
						relation_choices: selectedGroupRelations,
					});
				}
				break;
			}

			default:
				return;
		}

		setIntentions(newIntentions);
		handlePopoverClose();
		setSelectedChoices([]);
		setSelectedGroups([]);
		setSelectedRelations([]);
		setSelectedGroupRelations([]);
		setSelectedGlobal([]);
		setRelationIds([]);
		setSegmentIds([]);
	}, [popoverPosition, intentions, selectedChoices, selectedGroups, createIntention, handlePopoverClose, selectedSplits, selectedRelations, selectedGroupRelations, selectedGlobal]);

	const handleSplitClick = useCallback(
		(event: MouseEvent, clickRange: [number, number]) => {
			if (!onSplitSelect || !split) return;
			const [start, end] = clickRange;

			if (!splits.length) {
				setDragStart(clickRange);
				setIsDragging(true);
				return;
			}

			if (!selectedSplits) return;
			const minSplit = Math.min(...selectedSplits);
			const maxSplit = Math.max(...selectedSplits);

			if (event.button === 0) {
				if (start >= minSplit && end <= maxSplit) {
					setDragStart(clickRange);
					setIsDragging(true);
					return;
				}

				const left = Math.min(start, minSplit);
				const right = Math.max(end, maxSplit);
				if (popoverPosition && (popoverPosition.ranges[0][0] < left || popoverPosition.ranges[popoverPosition.ranges.length - 1][1] > right)) {
					setPopoverPosition(null);
				}
				onSplitSelect(split.filter((point) => point >= left && point <= right));
			} else if (event.button === 2) {
				const defaultMaxSplit = Math.max(...splits);
				const defaultMinSplit = Math.min(...splits);
				if (start >= defaultMaxSplit) {
					const left = Math.min(defaultMinSplit, minSplit);
					const right = start;
					const newSelectedSplits = selectedSplits.filter((point) => point <= right && point >= left);
					if (popoverPosition && (popoverPosition.ranges[0][0] < left || popoverPosition.ranges[popoverPosition.ranges.length - 1][1] > right)) {
						setPopoverPosition(null);
					}
					onSplitSelect(newSelectedSplits);
				} else if (end <= defaultMinSplit) {
					const left = end;
					const right = Math.max(defaultMaxSplit, maxSplit);
					const newSelectedSplits = selectedSplits.filter((point) => point >= left && point <= right);
					if (popoverPosition && (popoverPosition.ranges[0][0] < left || popoverPosition.ranges[popoverPosition.ranges.length - 1][1] > right)) {
						setPopoverPosition(null);
					}
					onSplitSelect(newSelectedSplits);
				}
			}
		},
		[split, selectedSplits, splits, onSplitSelect, popoverPosition]
	);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const isRelation = event.shiftKey || event.ctrlKey;
			if (isRelation && segmentIds.length > 0) {
				const ranges = segmentIds;
				setRelationIds(ranges);
				setSegmentIds([]);
				setPopoverPosition(null);
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			const isRelation = event.shiftKey || event.ctrlKey;
			if (!isRelation && relationIds.length > 0) {
				const ranges = relationIds as [number, number][];
				setSegmentIds(ranges);
				setRelationIds([]);

				if (!selectedSplits) return;
				const minSplit = Math.min(...selectedSplits!);
				const maxSplit = Math.max(...selectedSplits!);
				const highlightedRects = Array.from(d3.selectAll(".split-interaction rect").nodes()).filter((node) => {
					const rangeAttr = (node as SVGRectElement).getAttribute("data-range");
					if (!rangeAttr) return false;
					const [s, e] = JSON.parse(rangeAttr);
					return s >= ranges[0][0] && e <= ranges[ranges.length - 1][1] && s >= minSplit && e <= maxSplit;
				}) as SVGRectElement[];

				const svgRect = svgRef.current?.getBoundingClientRect();
				if (svgRect && highlightedRects.length > 0) {
					const bounds = highlightedRects.reduce(
						(acc, rect) => {
							const rectBounds = rect.getBoundingClientRect();
							return {
								left: Math.min(acc.left, rectBounds.left),
								right: Math.max(acc.right, rectBounds.right),
								top: Math.min(acc.top, rectBounds.top),
								bottom: Math.max(acc.bottom, rectBounds.bottom),
							};
						},
						{
							left: Infinity,
							right: -Infinity,
							top: Infinity,
							bottom: -Infinity,
						}
					);

					const centerX = (bounds.left + bounds.right) / 2;
					const centerY = bounds.top;

					const existingIntentions = intentions.single_segment_intentions.filter((intention) => ranges[0][0] === selectedSplits[intention.id] && ranges[ranges.length - 1][1] === selectedSplits[intention.id + 1]);
					const existingGroups = intentions.segment_group_intentions.filter((intention) => ranges[0][0] === selectedSplits[intention.ids[0]] && ranges[ranges.length - 1][0] === selectedSplits[intention.ids[1]]);

					setSelectedChoices(existingIntentions.flatMap((intention) => intention.single_choices));
					setSelectedGroups(existingGroups.flatMap((intention) => intention.group_choices));
					setSelectedGlobal(intentions.global_intentions);

					setPopoverPosition({
						x: centerX - svgRect.left,
						y: centerY - svgRect.top,
						type: ranges.length === selectedSplits.length - 1 ? "Global" : ranges.length > 1 ? "SegmentGroup" : "SingleSegment",
						ranges,
						rectWidth: bounds.right - bounds.left,
						rectHeight: bounds.bottom - bounds.top,
					});
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [segmentIds, relationIds, selectedSplits, intentions, svgRef]);

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !dragStart || !split) return;
			setPopoverPosition(null);

			const rect = event.target as SVGRectElement;
			const range = rect.getAttribute("data-range");
			if (!range) return;

			const currentRange = JSON.parse(range) as [number, number];

			const startIdx = Math.min(dragStart[0], currentRange[0]);
			const endIdx = Math.max(dragStart[1], currentRange[1]);

			if (!splits.length) {
				d3.selectAll(".split-interaction rect").attr("fill", function () {
					const rangeAttr = (this as SVGRectElement)?.getAttribute?.("data-range");
					if (!rangeAttr) return "transparent";
					const [s, e] = JSON.parse(rangeAttr);
					return s >= startIdx && e <= endIdx ? "#3331" : "transparent";
				});
				return;
			}

			const minSplit = Math.min(...selectedSplits!);
			const maxSplit = Math.max(...selectedSplits!);

			d3.selectAll(".split-interaction rect").attr("fill", function () {
				const rangeAttr = (this as SVGRectElement)?.getAttribute?.("data-range");
				if (!rangeAttr) return "transparent";
				const [s, e] = JSON.parse(rangeAttr);

				if (relationIds.some((range) => range[0] === s && range[1] === e)) {
					return "#00800033";
				}

				if (popoverPosition?.ranges.some(([rs, re]) => rs === s && re === e)) {
					return popoverPosition.type === "SingleRelation" || popoverPosition.type === "GroupRelation" ? "#00800033" : "#1890ff33";
				}

				if (s >= startIdx && e <= endIdx && s >= minSplit && e <= maxSplit) {
					return event.shiftKey || event.ctrlKey ? "#00800033" : "#1890ff33";
				}

				if (selectedSplits?.includes(s) && selectedSplits?.includes(e)) {
					return "#3331";
				}

				return "transparent";
			});
		},
		[isDragging, dragStart, split, selectedSplits, splits, relationIds, popoverPosition]
	);

	const handleMouseUp = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !dragStart || !split) return;
			const isRelation = event.shiftKey || event.ctrlKey;

			const rect = event.target as SVGRectElement;
			const range = rect.getAttribute("data-range");
			if (!range) return;

			const currentRange = JSON.parse(range) as [number, number];

			if (!splits.length) {
				const startIdx = Math.min(dragStart[0], currentRange[0]);
				const endIdx = Math.max(dragStart[1], currentRange[1]);
				const splits = split.filter((s) => s >= startIdx && s <= endIdx);
				setUserSplits(splits);
				onSplitSelect?.(splits);
				setIsDragging(false);
				setDragStart(null);
				return;
			}

			if (!selectedSplits) return;
			const ranges: [number, number][] = [];
			const minSplit = Math.min(...selectedSplits!);
			const maxSplit = Math.max(...selectedSplits!);
			const startIdx = Math.max(minSplit, Math.min(dragStart[0], currentRange[0]));
			const endIdx = Math.min(maxSplit, Math.max(dragStart[1], currentRange[1]));

			for (let i = 0; i < split.length - 1; i++) {
				if (split[i] >= startIdx && split[i + 1] <= endIdx && split[i] >= minSplit && split[i + 1] <= maxSplit) {
					ranges.push([split[i], split[i + 1]]);
				}
			}

			if (ranges.length > 0) {
				if (isRelation) {
					if (relationIds.length === 0) {
						setPopoverPosition(null);
						setRelationIds([...ranges]);
						setSegmentIds([]);
					} else {
						const allRanges = [[...relationIds], [...ranges]].sort((a, b) => a[0][0] - b[0][0]);
						const isGroupRelation = allRanges.some((group) => group.length > 1);

						const highlightedRects = Array.from(d3.selectAll(".split-interaction rect").nodes()).filter((node) => {
							const rangeAttr = (node as SVGRectElement).getAttribute("data-range");
							if (!rangeAttr) return false;
							const [s, e] = JSON.parse(rangeAttr);
							return allRanges.some((group) => group.some(([rs, re]) => s === rs && e === re));
						}) as SVGRectElement[];

						if (highlightedRects.length > 0) {
							const bounds = highlightedRects.reduce(
								(acc, rect) => {
									const rectBounds = rect.getBoundingClientRect();
									return {
										left: Math.min(acc.left, rectBounds.left),
										right: Math.max(acc.right, rectBounds.right),
										top: Math.min(acc.top, rectBounds.top),
										bottom: Math.max(acc.bottom, rectBounds.bottom),
									};
								},
								{
									left: Infinity,
									right: -Infinity,
									top: Infinity,
									bottom: -Infinity,
								}
							);

							const svgRect = svgRef.current?.getBoundingClientRect();
							if (svgRect) {
								const centerX = (bounds.left + bounds.right) / 2;
								const centerY = bounds.top;

								setPopoverPosition(null);

								const existingRelations = intentions.single_relation_intentions.filter((intention) => allRanges?.[0][0][0] === selectedSplits?.[intention.id1] && allRanges?.[1][0][0] === selectedSplits?.[intention.id2]);
								const existingGroupRelations = intentions.group_relation_intentions.filter((intention) => allRanges?.[0][0][0] === selectedSplits?.[intention.group1[0]] && allRanges?.[0][allRanges[0].length - 1][0] === selectedSplits?.[intention.group1[1]] && allRanges?.[1][0][0] === selectedSplits?.[intention.group2[0]] && allRanges?.[1][allRanges[1].length - 1][0] === selectedSplits?.[intention.group2[1]]);

								setSelectedRelations(existingRelations.flatMap((intention) => intention.relation_choices));
								setSelectedGroupRelations(existingGroupRelations.flatMap((intention) => intention.relation_choices));

								setPopoverPosition({
									x: centerX - svgRect.left,
									y: centerY - svgRect.top,
									type: isGroupRelation ? "GroupRelation" : "SingleRelation",
									ranges: allRanges.flat() as [number, number][],
									groups: allRanges as [[number, number][], [number, number][]],
									rectWidth: bounds.right - bounds.left,
									rectHeight: bounds.bottom - bounds.top,
								});
								setRelationIds([]);
								setSegmentIds([]);
							}
						}
					}
				} else {
					setRelationIds([]);
					const highlightedRects = Array.from(d3.selectAll(".split-interaction rect").nodes()).filter((node) => {
						const rangeAttr = (node as SVGRectElement).getAttribute("data-range");
						if (!rangeAttr) return false;
						const [s, e] = JSON.parse(rangeAttr);
						return s >= startIdx && e <= endIdx && s >= minSplit && e <= maxSplit;
					}) as SVGRectElement[];

					const svgRect = svgRef.current?.getBoundingClientRect();
					if (svgRect && highlightedRects.length > 0) {
						const bounds = highlightedRects.reduce(
							(acc, rect) => {
								const rectBounds = rect.getBoundingClientRect();
								return {
									left: Math.min(acc.left, rectBounds.left),
									right: Math.max(acc.right, rectBounds.right),
									top: Math.min(acc.top, rectBounds.top),
									bottom: Math.max(acc.bottom, rectBounds.bottom),
								};
							},
							{
								left: Infinity,
								right: -Infinity,
								top: Infinity,
								bottom: -Infinity,
							}
						);

						const centerX = (bounds.left + bounds.right) / 2;
						const centerY = bounds.top;

						flushSync(() => setPopoverPosition(null));

						const existingIntentions = intentions.single_segment_intentions.filter((intention) => ranges[0][0] === selectedSplits[intention.id] && ranges[ranges.length - 1][1] === selectedSplits[intention.id + 1]);
						const existingGroups = intentions.segment_group_intentions.filter((intention) => ranges[0][0] === selectedSplits[intention.ids[0]] && ranges[ranges.length - 1][0] === selectedSplits[intention.ids[1]]);

						setSelectedChoices(existingIntentions.flatMap((intention) => intention.single_choices));
						setSelectedGroups(existingGroups.flatMap((intention) => intention.group_choices));
						setSelectedGlobal(intentions.global_intentions);
						setSegmentIds(ranges);

						setPopoverPosition({
							x: centerX - svgRect.left,
							y: centerY - svgRect.top,
							type: ranges.length === selectedSplits.length - 1 && ranges.length > 1 ? "Global" : ranges.length > 1 ? "SegmentGroup" : "SingleSegment",
							ranges,
							rectWidth: bounds.right - bounds.left,
							rectHeight: bounds.bottom - bounds.top,
						});
					}
				}
			}

			setIsDragging(false);
			setDragStart(null);
		},
		[isDragging, dragStart, split, selectedSplits, relationIds, svgRef, intentions, splits, onSplitSelect]
	);

	const handleDelete = useCallback(() => {
		if (!popoverPosition) return;
		const { type, ranges, groups } = popoverPosition;
		const newIntentions = { ...intentions };

		switch (type) {
			case "SingleSegment": {
				const existingIndex = newIntentions.single_segment_intentions.findIndex((intention) => deepEqual([[selectedSplits?.[intention.id], selectedSplits?.[intention.id + 1]]], ranges));
				if (existingIndex !== -1) {
					newIntentions.single_segment_intentions.splice(existingIndex, 1);
				}
				break;
			}
			case "SegmentGroup": {
				const existingIndex = newIntentions.segment_group_intentions.findIndex((intention) => ranges[0][0] === selectedSplits?.[intention.ids[0]] && ranges[ranges.length - 1][0] === selectedSplits?.[intention.ids[1]]);
				if (existingIndex !== -1) {
					newIntentions.segment_group_intentions.splice(existingIndex, 1);
				}
				break;
			}
			case "Global": {
				newIntentions.global_intentions = [];
				break;
			}
			case "SingleRelation": {
				const existingIndex = newIntentions.single_relation_intentions.findIndex((intention) => groups?.[0][0][0] === selectedSplits?.[intention.id1] && groups?.[1][0][0] === selectedSplits?.[intention.id2]);
				if (existingIndex !== -1) {
					newIntentions.single_relation_intentions.splice(existingIndex, 1);
				}
				break;
			}
			case "GroupRelation": {
				const existingIndex = newIntentions.group_relation_intentions.findIndex((intention) => groups?.[0][0][0] === selectedSplits?.[intention.group1[0]] && groups?.[0][groups[0].length - 1][0] === selectedSplits?.[intention.group1[1]] && groups?.[1][0][0] === selectedSplits?.[intention.group2[0]] && groups?.[1][groups[1].length - 1][0] === selectedSplits?.[intention.group2[1]]);
				if (existingIndex !== -1) {
					newIntentions.group_relation_intentions.splice(existingIndex, 1);
				}
				break;
			}
		}

		setIntentions(newIntentions);
		handlePopoverClose();
	}, [popoverPosition, intentions, selectedSplits, handlePopoverClose]);

	const draw = useCallback(() => {
		if (!svgRef.current || xData?.length === 0 || yData?.length === 0) return;
		const cleanups: (() => void)[] = [];

		let start = range?.[0] ?? 0;
		let end = range?.[1] ? range[1] + 1 : xData.length;
		let keyData = range ? timeStampData.slice(start, end) : timeStampData.slice();
		let valueData = range ? yData.slice(start, end) : yData.slice();
		let data = keyData.map((x, i) => [x, valueData[i]] as [number, number]);

		const svg = d3.select(svgRef.current);
		svg.attr("width", "100%");
		svg.attr("height", "100%");
		const width = Math.max(10, svgRef.current.clientWidth - computedMargin.left - computedMargin.right);
		let iHeight: number = typeof height === "string" ? (svgRef.current.clientHeight * parseFloat(height)) / 100 : height ?? 200;
		iHeight -= computedMargin.top + computedMargin.bottom;
		const xMin = d3.min(keyData)!;
		const xMax = d3.max(keyData)!;
		const yMin = d3.min(valueData)!;
		const yMax = d3.max(valueData)!;
		const xRange = Math.max(1, xMax - xMin);
		const yRange = Math.max(1, yMax - yMin);
		const xScale = [xMin, xMax];
		const yScale = [yMin, yMax];
		let innerWidth = width;
		let innerHeight: number = 0;
		if (height && ratio) {
			const yUnitPixel = iHeight / yRange;
			const xUnitPixel = yUnitPixel * ratio;
			innerWidth = (xUnitPixel * xRange) / 1000;
			if (innerWidth > width) {
				const scale = width / innerWidth;
				const delta = yRange / scale - yRange;
				yScale[0] -= delta / 2;
				yScale[1] += delta / 2;
			} else {
				const scale = width / innerWidth;
				const delta = xRange * scale - xRange;
				xScale[0] -= delta / 2;
				xScale[1] += delta / 2;
				if (isExpand) {
					const extentData = timeStampData.map((d, i) => [d, i]).filter((v) => v[0] >= xScale[0] && v[0] <= xScale[1]);
					keyData = extentData.map((v) => v[0]);
					valueData = extentData.map((v) => yData[v[1]]);
					data = keyData.map((x, i) => [x, valueData[i]] as [number, number]);
					start = Math.max(0, Math.min(...extentData.map((v) => v[1])));
					end = Math.min(xData.length, Math.max(...extentData.map((v) => v[1])) + 1);
				}
			}
			innerHeight = iHeight;
			innerWidth = width;
			svg.attr("width", innerWidth + computedMargin.left + computedMargin.right);
		} else if (ratio) {
			const xUnitPixel = width / xRange;
			const yUnitPixel = xUnitPixel / ratio;
			innerHeight = yRange * yUnitPixel * 1000;
		} else {
			innerHeight = iHeight;
		}
		const outerHeight = innerHeight + computedMargin.top + computedMargin.bottom;

		svg.attr("height", outerHeight);

		const x = isTime
			? d3
					.scaleTime()
					.domain(xScale.map((d) => new Date(d)))
					.range([0, innerWidth])
			: d3.scaleLinear().domain(xScale).range([0, innerWidth]);

		const y = d3.scaleLinear().domain(yScale).range([innerHeight, 0]);

		const lineGenerator = d3
			.line<[number, number]>()
			.x((d) => (isTime ? x(new Date(d[0]))! : x(d[0])!))
			.y((d) => y(d[1]));

		svg.selectAll("*").remove();

		svg.append("defs").append("clipPath").attr("id", `clip-path-${id}`).append("rect").attr("x", 0).attr("y", 0).attr("width", innerWidth).attr("height", innerHeight);

		const g = svg.append("g").attr("transform", `translate(${computedMargin.left},${computedMargin.top})`);
		g.append("rect").attr("x", 0).attr("y", 0).attr("width", innerWidth).attr("height", innerHeight).attr("fill", "transparent");

		if (isActive) {
			svg.append("rect").attr("x", 0).attr("y", 0).attr("width", outerWidth).attr("height", outerHeight).attr("fill", "#82C4FF33");
		}

		g.append("text").attr("x", 5).attr("y", 0).attr("text-anchor", "start").attr("font-size", 12).attr("fill", textColor).text(title);

		svg.append("defs")
			.append("marker")
			.attr("id", `arrow-${id}`)
			.attr("viewBox", "0 -10 20 20")
			.attr("refX", 18)
			.attr("refY", 0)
			.attr("markerWidth", 8)
			.attr("markerHeight", 8)
			.attr("orient", "auto")
			.append("g")
			.call((g) => {
				g.append("path").attr("d", "M0,-10 L18,0 L0,10").attr("fill", "none").attr("stroke", xAxisColor).attr("stroke-width", 1);

				g.append("path").attr("d", "M2,-10 L20,0 L2,10").attr("fill", "none").attr("stroke", xAxisColor).attr("stroke-width", 1);
			});

		if (isXAxisVisible) {
			const xAxis = d3
				.axisBottom(x)
				.tickFormat((d) => (isTime ? xAxisFormatter(new Date(+d)) : String(+d)))
				.tickSize(isXAxisTextVisible ? 6 : 0);

			const sampleText = isTime ? xAxisFormatter(new Date(timeStampData[0])) : String(timeStampData[0]);
			const approximateTextWidth = sampleText.length * 8;
			const maxTicks = Math.floor(innerWidth / (approximateTextWidth * 1.5));
			const tickCount = Math.max(2, Math.min(maxTicks, 10));

			xAxis.ticks(tickCount).tickSize(isXAxisTextVisible ? 6 : 0);

			const xAxisG = g
				.append("g")
				.attr("transform", `translate(0,${innerHeight})`)
				.call(xAxis)
				.call((g) => {
					g.selectAll("path, line").attr("stroke", xAxisColor);
					g.selectAll("text")
						.attr("fill", xAxisTextColor)
						.style("display", isXAxisTextVisible ? "block" : "none");
				});

			xAxisG
				.append("line")
				.attr("x1", innerWidth)
				.attr("y1", 0.5)
				.attr("x2", innerWidth + 10)
				.attr("y2", 0.5)
				.attr("stroke", xAxisColor)
				.attr("marker-end", `url(#arrow-${id})`);
		}

		if (isYAxisVisible) {
			const yAxis = d3.axisLeft(y).tickSize(isYAxisTextVisible ? 6 : 0);

			if (innerHeight < 100) {
				yAxis.tickValues([yMin, yMax]);
			}

			const yAxisG = g
				.append("g")
				.call(yAxis)
				.call((g) => {
					g.selectAll("path, line").attr("stroke", yAxisColor);
					g.selectAll("text")
						.attr("fill", yAxisTextColor)
						.style("display", isYAxisTextVisible ? "block" : "none");
				});

			yAxisG.append("line").attr("x1", 0.5).attr("y1", 0).attr("x2", 0.5).attr("y2", -8).attr("stroke", yAxisColor).attr("marker-end", `url(#arrow-${id})`);
		}

		if ((range && start !== end) || !range) {
			const pathG = g.append("g").attr("class", "line-path").raise();

			pathG
				.append("path")
				.datum(keyData.map((t, i) => [t, valueData[i]] as [number, number]))
				.attr("d", lineGenerator)
				.attr("fill", "none")
				.attr("stroke", lineColor)
				.attr("stroke-opacity", "0.7")
				.attr("clip-path", `url(#clip-path-${id})`)
				.attr("stroke-width", 0.5);

			if (isHoverable) {
				cleanups.push(setupTooltip(g, lineColor, keyData, valueData, x, y, isTime, xAxisFormatter, innerHeight, segments, timeStampData, xDataType));
			}
		}

		if (range && isShowRange) {
			g.append("rect")
				.attr("x", x(xMin))
				.attr("y", 0)
				.attr("width", x(xMax) - x(xMin))
				.attr("height", innerHeight)
				.attr("fill", "#3331");
		}

		if (split && keyData.length > 1) {
			const splitLinesG = g.append("g").attr("class", "split-lines").attr("clip-path", `url(#clip-path-${id})`);

			const splitInteractionG = g.append("g").attr("class", "split-interaction").attr("clip-path", `url(#clip-path-${id})`).style("pointer-events", "all");

			const color = d3.color(lineColor);
			const darkerColor = color ? d3.hsl(color).darker(10).toString() : lineColor;
			for (let i = 0; i < split.length - 1; i++) {
				const x1 = x(timeStampData[split[i]]);
				const x2 = x(timeStampData[split[i + 1]]);
				if (timeStampData[split[i]] > xScale[1] || timeStampData[split[i + 1]] < xScale[0]) {
					continue;
				}
				const y1 = y(yData[split[i]]);
				const y2 = y(yData[split[i + 1]]);

				splitLinesG.append("line").attr("class", "split-line").attr("x1", x1).attr("x2", x2).attr("y1", y1).attr("y2", y2).attr("stroke", darkerColor).attr("stroke-opacity", "0.5").attr("stroke-width", 2).attr("pointer-events", "none");

				if (isSelectable && selectedSplits) {
					const fillColor = popoverPosition?.ranges.some(([s, e]) => s === split[i] && e === split[i + 1]) || relationIds.some(([s, e]) => s === split[i] && e === split[i + 1]) ? (relationIds.length > 0 || popoverPosition?.type === "SingleRelation" || popoverPosition?.type === "GroupRelation" ? "#00800033" : "#1890ff33") : selectedSplits?.includes(split[i]) && selectedSplits?.includes(split[i + 1]) ? "#3331" : "transparent";
					splitInteractionG
						.append("rect")
						.attr("x", x1)
						.attr("y", 0)
						.attr("width", x2 - x1)
						.attr("height", innerHeight)
						.attr("fill", fillColor)
						.attr("cursor", "pointer")
						.attr("data-range", JSON.stringify([split[i], split[i + 1]]))
						.style("pointer-events", "all")
						.on("pointerdown", function (event) {
							if (!isRequesting) {
								handleSplitClick(event, [split[i], split[i + 1]]);
							}
						})
						.on("mousemove", handleMouseMove)
						.on("mouseup", handleMouseUp);

					if (popoverPosition?.groups && popoverPosition.groups.length >= 2) {
						const firstGroup = popoverPosition.groups[0];
						const lastGroup = popoverPosition.groups[1];
						if (firstGroup[firstGroup.length - 1][1] === lastGroup[0][0] && lastGroup[0][0] === split[i]) {
							splitInteractionG.append("line").attr("x1", x1).attr("x2", x1).attr("y1", 0).attr("y2", innerHeight).attr("stroke", fillColor.slice(0, 7)).attr("stroke-dasharray", "4, 4");
						}
					}
				}
			}

			if (resultsSplit && keyData.length > 1) {
				const resultsG = g.append("g").attr("class", "results-split-line");

				for (let i = 0; i < resultsSplit.segments.length; i++) {
					for (let j = 0; j < resultsSplit.segments[i].length; j++) {
						const x1 = x(timeStampData[resultsSplit.segments[i][j][0]]);
						const x2 = x(timeStampData[resultsSplit.segments[i][j][1]]);
						if (timeStampData[resultsSplit.segments[i][j][0]] > xScale[1] || timeStampData[resultsSplit.segments[i][j][1]] < xScale[0]) {
							continue;
						}
						const y1 = y(yData[resultsSplit.segments[i][j][0]]);
						const y2 = y(yData[resultsSplit.segments[i][j][1]]);
						resultsG
							.append("line")
							.attr("class", "results-split-line")
							.attr("x1", x1)
							.attr("x2", x2)
							.attr("y1", y1)
							.attr("y2", y2)
							.attr("clip-path", `url(#clip-path-${id})`)
							.attr("stroke", resultsSplit.colors[j] || "#666")
							.attr("stroke-opacity", defaultSplits.includes(resultsSplit.segments[i][j][0]) && defaultSplits.includes(resultsSplit.segments[i][j][1]) ? "1" : "0.7")
							.attr("stroke-width", defaultSplits.includes(resultsSplit.segments[i][j][0]) && defaultSplits.includes(resultsSplit.segments[i][j][1]) ? 4 : 2.5);
					}
				}
			}
		}

		const areaGenerator = d3
			.area<[number, number]>()
			.x((d) => x(d[0]))
			.y0(y(yMin))
			.y1((d) => y(d[1]));

		if (isFill) {
			g.append("path").datum(data).attr("d", areaGenerator).attr("fill", "#82C4FF99");
		}

		if (split && intentions && isSelectable && selectedSplits) {
			const intentionLinesG = svg.append("g").attr("class", "intention-lines").attr("transform", `translate(${computedMargin.left},0)`).attr("clip-path", `url(#clip-path-${id})`);
			const lines: Record<number, IntentionLine[]> = {};
			let maxLevel = -1;

			intentions.single_segment_intentions.forEach((intention) => {
				const range = [selectedSplits[intention.id], selectedSplits[intention.id + 1]] as [number, number];
				let level = 0;
				while (true) {
					if (!lines[level]) {
						lines[level] = [];
					}
					if (lines[level].some((line) => hasOverlap(line.ranges, [range]))) {
						level++;
					} else {
						break;
					}
				}
				lines[level].push({
					type: "SingleSegment",
					ranges: [range],
					choices: intention.single_choices,
					level,
				});
				maxLevel = Math.max(maxLevel, level);
			});

			function hasOverlap(ranges1: [number, number][], ranges2: [number, number][]) {
				const [start1, end1] = [ranges1[0][0], ranges1[ranges1.length - 1][1]];
				const [start2, end2] = [ranges2[0][0], ranges2[ranges2.length - 1][1]];
				const minStart = Math.max(start1, start2);
				const maxEnd = Math.min(end1, end2);
				return minStart < maxEnd;
			}

			intentions.segment_group_intentions.forEach((intention) => {
				const ranges: [number, number][] = [];
				for (let i = intention.ids[0]; i <= intention.ids[1]; i++) {
					ranges.push([selectedSplits[i], selectedSplits[i + 1]]);
				}
				let level = 0;
				while (true) {
					if (!lines[level]) {
						lines[level] = [];
					}
					if (lines[level].some((line) => hasOverlap(line.ranges, ranges))) {
						level++;
					} else {
						break;
					}
				}
				lines[level].push({
					type: "SegmentGroup",
					ranges,
					choices: intention.group_choices,
					level,
				});
				maxLevel = Math.max(maxLevel, level);
			});

			if (intentions.global_intentions.length > 0) {
				lines[maxLevel + 1] = [
					{
						type: "Global",
						ranges: [[selectedSplits[0], selectedSplits[selectedSplits.length - 1]]],
						choices: intentions.global_intentions,
						level: maxLevel + 1,
					},
				];
			}

			intentions.single_relation_intentions.forEach((intention) => {
				const range = [
					[selectedSplits[intention.id1], selectedSplits[intention.id1 + 1]],
					[selectedSplits[intention.id2], selectedSplits[intention.id2 + 1]],
				] as [[number, number], [number, number]];
				let level = 0;
				while (true) {
					if (!lines[level]) {
						lines[level] = [];
					}
					if (lines[level].some((line) => hasOverlap(line.ranges, range))) {
						level++;
					} else {
						break;
					}
				}
				lines[level].push({
					type: "SingleRelation",
					ranges: range,
					choices: intention.relation_choices,
					level,
				});
			});

			intentions.group_relation_intentions.forEach((intention) => {
				const ranges: [number, number][] = [
					[selectedSplits[intention.group1[0]], selectedSplits[intention.group1[1] + 1]],
					[selectedSplits[intention.group2[0]], selectedSplits[intention.group2[1] + 1]],
				];
				let level = 0;
				while (true) {
					if (!lines[level]) {
						lines[level] = [];
					}
					if (lines[level].some((line) => hasOverlap(line.ranges, ranges))) {
						level++;
					} else {
						break;
					}
				}
				lines[level].push({
					type: "GroupRelation",
					ranges,
					choices: intention.relation_choices,
					level,
				});
			});

			Object.values(lines)
				.flat()
				.forEach((intention) => {
					const y = computedMargin.top - intention.level * 8 < 0 ? (intention.level + 1) * 8 : computedMargin.top - intention.level * 8;
					const isRelation = intention.type === "SingleRelation" || intention.type === "GroupRelation";
					const startX1 = x(timeStampData[intention.ranges[0][0]]);
					const endX1 = isRelation ? x(timeStampData[intention.ranges[0][1]]) : x(timeStampData[intention.ranges[intention.ranges.length - 1][1]]);

					const line = intentionLinesG.append("g").attr("class", "intention-line").style("cursor", "pointer");
					const blue = "#000";
					const green = "#bbb";

					line.append("line")
						.attr("x1", startX1)
						.attr("x2", endX1)
						.attr("y1", y)
						.attr("y2", y)
						.attr("stroke", isRelation ? green : blue)
						.attr("stroke-width", 2);

					line.append("line")
						.attr("x1", startX1)
						.attr("x2", startX1)
						.attr("y1", y - 3)
						.attr("y2", y + 3)
						.attr("stroke", isRelation ? green : blue)
						.attr("stroke-width", 2);

					line.append("line")
						.attr("x1", endX1)
						.attr("x2", endX1)
						.attr("y1", y - 3)
						.attr("y2", y + 3)
						.attr("stroke", isRelation ? green : blue)
						.attr("stroke-width", 2);

					if (isRelation) {
						const startX2 = x(timeStampData[intention.ranges[1][0]]);
						const endX2 = x(timeStampData[intention.ranges[1][1]]);
						line.append("line")
							.attr("x1", startX2)
							.attr("x2", endX2)
							.attr("y1", y)
							.attr("y2", y)
							.attr("stroke", isRelation ? green : blue)
							.attr("stroke-width", 2);
						line.append("line")
							.attr("x1", startX2)
							.attr("x2", endX1)
							.attr("y1", y)
							.attr("y2", y)
							.attr("stroke", isRelation ? green : blue)
							.attr("stroke-width", 2)
							.attr("stroke-dasharray", "4, 4");
						line.append("line")
							.attr("x1", startX2)
							.attr("x2", startX2)
							.attr("y1", y - 3)
							.attr("y2", y + 3)
							.attr("stroke", isRelation ? green : blue)
							.attr("stroke-width", 2);

						line.append("line")
							.attr("x1", endX2)
							.attr("x2", endX2)
							.attr("y1", y - 3)
							.attr("y2", y + 3)
							.attr("stroke", isRelation ? green : blue)
							.attr("stroke-width", 2);
					}

					line.on("click", () => {
						if (popoverPosition) {
							setPopoverPosition(null);
							setSelectedChoices([]);
							setSelectedGroups([]);
							setSelectedRelations([]);
							setSelectedGroupRelations([]);
							setSelectedGlobal([]);
						}
						function splitRanges(ranges: [number, number][], selectedSplit: number[]) {
							return ranges.map(([start, end]) => {
								const splitPoints = [start, ...selectedSplit.filter((v) => v > start && v < end), end];
								const result = [];
								for (let i = 0; i < splitPoints.length - 1; i++) {
									result.push([splitPoints[i], splitPoints[i + 1]]);
								}
								return result;
							});
						}

						const groups = splitRanges(intention.ranges, selectedSplits) as [[number, number][], [number, number][]];

						setPopoverPosition({
							x: (startX1 + endX1) / 2 + (endX1 - startX1),
							y: y,
							type: intention.type,
							ranges: intention.ranges.length > 1 ? groups.flat(1) : intention.ranges,
							groups: intention.ranges.length > 1 ? groups : undefined,
							rectWidth: endX1 - startX1,
							rectHeight: 10,
						});

						if (intention.type === "SingleSegment") {
							setSelectedChoices(intention.choices as SingleChoice[]);
						} else if (intention.type === "SegmentGroup") {
							setSelectedGroups(intention.choices as GroupChoice[]);
						} else if (intention.type === "SingleRelation") {
							setSelectedRelations(intention.choices as SingleRelationChoice[]);
						} else if (intention.type === "GroupRelation") {
							setSelectedGroupRelations(intention.choices as GroupRelationChoice[]);
						} else if (intention.type === "Global") {
							setSelectedGlobal(intention.choices as GlobalChoice[]);
						}
					});
				});

			if (selectedSplits && selectedSplits.length > 0) {
				const buttonX = x(timeStampData[selectedSplits[selectedSplits.length - 1]]) + 10;

				const loadingDefs = svg.append("defs");
				loadingDefs
					.append("linearGradient")
					.attr("id", `loading-gradient-${id}`)
					.attr("gradientUnits", "userSpaceOnUse")
					.selectAll("stop")
					.data([
						{ offset: "0%", color: "#ffffff" },
						{ offset: "100%", color: "#1890ff" },
					])
					.enter()
					.append("stop")
					.attr("offset", (d) => d.offset)
					.attr("stop-color", (d) => d.color);

				const animateRotate = loadingDefs.append("animateTransform").attr("attributeName", "transform").attr("type", "rotate").attr("from", "0 12 12").attr("to", "360 12 12").attr("dur", "1s").attr("repeatCount", "indefinite");

				const submitButton = intentionLinesG
					.append("g")
					.attr("class", "submit-button")
					.attr("transform", `translate(${buttonX}, ${computedMargin.top})`)
					.style("cursor", isRequesting ? "not-allowed" : "pointer");

				submitButton
					.append("rect")
					.attr("width", isRequesting ? 90 : defaultSplits?.length ? 60 : 60)
					.attr("height", 24)
					.attr("rx", 4)
					.attr("fill", "var(--primary-color)")
					.attr("opacity", isRequesting ? 0.6 : 1);

				const cancelButton = intentionLinesG
					.append("g")
					.attr("transform", `translate(${buttonX}, ${computedMargin.top + 32})`)
					.attr("class", "cancle-button")
					.style("cursor", isRequesting ? "not-allowed" : "pointer");

				cancelButton
					.append("rect")
					.attr("width", 60)
					.attr("height", 24)
					.attr("rx", 4)
					.attr("fill", "#ff4d4f")
					.attr("opacity", isRequesting ? 0.6 : 1);

				cancelButton.append("text").attr("x", 30).attr("y", 16).attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "12px").text("Cancel");

				cancelButton.on("click", () => {
					if (isRequesting) return;
					onSplitSelect?.([]);
					onCancelSplit?.();
					setUserSplits([]);
				});

				if (isRequesting) {
					const loadingGroup = submitButton.append("g").attr("transform", "translate(15, 12)");

					loadingGroup
						.append("circle")
						.attr("r", 4)
						.attr("fill", "none")
						.attr("stroke", `url(#loading-gradient-${id})`)
						.attr("stroke-width", 2)
						.attr("stroke-dasharray", "12.5 12.5")
						.attr("transform-origin", "-12px -12px")
						.call((g) => g.node()?.appendChild(animateRotate.node()!.cloneNode()));

					submitButton.append("text").attr("x", 30).attr("y", 16).attr("text-anchor", "start").attr("fill", "white").attr("font-size", "12px").text("Loading");
				} else {
					submitButton
						.append("text")
						.attr("x", 30)
						.attr("y", 16)
						.attr("text-anchor", "middle")
						.attr("fill", "white")
						.attr("font-size", "12px")
						.text(defaultSplits?.length ? "Refine" : "Author");
				}

				submitButton
					.on("click", () => {
						if (!isRequesting && onSubmitIntentions) {
							onSubmitIntentions(intentions, !!defaultSplits?.length);
						}
					})
					.on("mouseenter", function () {
						if (!isRequesting) {
							d3.select(this).select("rect").transition().duration(200).attr("opacity", 0.8);
						}
					})
					.on("mouseleave", function () {
						if (!isRequesting) {
							d3.select(this).select("rect").transition().duration(200).attr("opacity", 1);
						}
					});
			}
		}

		if (isBrush) {
			function brushFn(event: d3.D3BrushEvent<[number, number]>) {
				svg.select(".area").remove();
				const selection = event.selection;
				if (!selection) return;
				const [x0, x1] = selection;
				const [minX, maxX] = [x.invert(x0 as number), x.invert(x1 as number)];
				const filteredIndices = getFilteredIndices([minX, maxX]);
				if (isFill) highlightBrush([minX, maxX]);
				onBrush?.((filteredIndices.at(0) || 0) + start, (filteredIndices.at(-1) || 0) + start);
			}

			const brush = d3.brushX().extent([
				[0, 0],
				[innerWidth, innerHeight],
			]);

			const brushG = svg.append("g").attr("transform", `translate(${computedMargin.left},${computedMargin.top})`).attr("class", "brush").call(brush);

			function getFilteredIndices(selection: [number | Date, number | Date]) {
				const [minX, maxX] = selection;
				const minValue = minX instanceof Date ? minX.getTime() : minX;
				const maxValue = maxX instanceof Date ? maxX.getTime() : maxX;
				return data
					.map((d, i) => ({ index: i, value: d }))
					.filter((d) => d.value[0] >= minValue && d.value[0] <= maxValue)
					.map((d) => d.index);
			}

			function highlightBrush(selection: [number | Date, number | Date]) {
				g.selectAll(".area").remove();
				const filteredIndices = getFilteredIndices(selection);
				g.append("path")
					.attr("class", "area")
					.datum(filteredIndices.map((i) => data[i]))
					.attr("d", areaGenerator)
					.attr("fill", "#82C4FF99");
			}

			if (brushPosition) {
				brushG.call(brush.move!, [x(timeStampData[brushPosition[0]]), x(timeStampData[brushPosition[1]])]);
				const minX = new Date(timeStampData[brushPosition[0]]);
				const maxX = new Date(timeStampData[brushPosition[1]]);
				if (isFill) highlightBrush([minX, maxX]);
			}

			brush
				.on("brush", (event) => brushFn(event))
				.on("end", function (event) {
					svg.select(".area").remove();
					const selection = event.selection;
					if (!selection) {
						onBrush?.(start, start);
						onBrushEnd?.(start, start);
						return;
					}
					const [x0, x1] = selection;
					const [minX, maxX] = [x.invert(x0 as number), x.invert(x1 as number)];
					const filteredIndices = getFilteredIndices([minX, maxX]);
					onBrush?.(start + (filteredIndices.at(0) || 0), start + (filteredIndices.at(-1) || 0));
					onBrushEnd?.(start + (filteredIndices.at(0) || 0), start + (filteredIndices.at(-1) || 0));
				});

			brushG.select(".selection").attr("fill", brushColor).attr("clip-path", `url(#clip-path-${id})`).attr("stroke", "none").style("pointer-events", "all");

			cleanups.push(() => {
				brush.on("brush", null).on("end", null);
			});
		}

		return () => {
			svg.selectAll("*").remove();
			cleanups.forEach((cleanup) => cleanup());
		};
	}, [xData, yData, ratio, title, isXAxisVisible, isYAxisVisible, isXAxisTextVisible, isYAxisTextVisible, isBrush, onBrush, isFill, range, height, split, brushPosition, isExpand, isShowRange, id, onBrushEnd, isActive, xAxisColor, yAxisColor, lineColor, textColor, xAxisFormatter, brushColor, resultsSplit, handleSplitClick, selectedSplits, popoverPosition, handleMouseMove, handleMouseUp, intentions, defaultSplits, onSubmitIntentions, relationIds, computedMargin, isHoverable, timeStampData, isTime, isRequesting, isSelectable, onSplitSelect, onCancelSplit, segments, xDataType, xAxisTextColor, yAxisTextColor]);

	useResize(draw);

	useEffect(() => {
		if (!isDragging) return;

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	useEffect(() => {
		if (!popoverPosition || !selectedSplits) return;

		const selectedSegments = segments.filter((seg) => seg.start_idx >= (selectedSplits[0] ?? 0) && seg.end_idx <= (selectedSplits[selectedSplits.length - 1] ?? 0));

		const fetchComparison = async () => {
			if (popoverPosition.type === "Global") {
				const result = await queryApi.getSegmentComparison(selectedSegments);
				setComparison(result);
			} else if (popoverPosition.groups) {
				const result = await queryApi.getSegmentComparison(
					selectedSegments,
					popoverPosition.groups.map((group) => [group[0][0], group[group.length - 1][1]])
				);
				setComparison(result);
			}
		};

		fetchComparison();
	}, [popoverPosition, segments, selectedSplits]);

	const group1Start = useMemo(() => popoverPosition?.groups?.[0]?.[0][0] ?? 0, [popoverPosition]);
	const group1End = useMemo(() => popoverPosition?.groups?.[0]?.[popoverPosition.groups[0].length - 1][1] ?? 0, [popoverPosition]);
	const group2Start = useMemo(() => popoverPosition?.groups?.[1]?.[0][0] ?? 0, [popoverPosition]);
	const group2End = useMemo(() => popoverPosition?.groups?.[1]?.[popoverPosition.groups[1].length - 1][1] ?? 0, [popoverPosition]);

	const renderPopover = useCallback(() => {
		if (!popoverPosition) return null;
		let isExisting = false;
		const currentSegments = segments.filter((seg) => {
			return popoverPosition.ranges[0][0] <= seg.start_idx && popoverPosition.ranges[popoverPosition.ranges.length - 1][1] >= seg.end_idx;
		});
		if (currentSegments.length === 0) return null;
		const currentSegment = currentSegments.length === 1 ? currentSegments[0] : ({ start_value: currentSegments[0].start_value, end_value: currentSegments[currentSegments.length - 1].end_value, duration: currentSegments.reduce((acc, seg) => acc + (seg.duration ?? 0), 0) } as Segment);
		const groupSegments = [segments.filter((seg) => seg.start_idx >= group1Start && seg.end_idx <= group1End), segments.filter((seg) => seg.start_idx >= group2Start && seg.end_idx <= group2End)];
		const currentGroupSegment: [Segment, Segment] = groupSegments.every((seg) => seg.length === 1) ? [groupSegments[0][0], groupSegments[1][0]] : [{ duration: groupSegments[0].reduce((acc, seg) => acc + (seg.duration ?? 0), 0) } as Segment, { duration: groupSegments[1].reduce((acc, seg) => acc + (seg.duration ?? 0), 0) } as Segment];

		switch (popoverPosition.type) {
			case "SingleSegment":
				isExisting = intentions.single_segment_intentions.some((intention) => deepEqual([[selectedSplits?.[intention.id], selectedSplits?.[intention.id + 1]]], popoverPosition.ranges));
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(SingleChoice)}
						selected={selectedChoices}
						onChange={handleChoicesChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
						segment={currentSegment}
						xDataType={xDataType}
					/>
				);
			case "SegmentGroup":
				isExisting = intentions.segment_group_intentions.some((intention) => popoverPosition.ranges[0][0] === selectedSplits?.[intention.ids[0]] && popoverPosition.ranges[popoverPosition.ranges.length - 1][0] === selectedSplits?.[intention.ids[1]]);
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(GroupChoice)}
						selected={selectedGroups}
						onChange={handleGroupChoicesChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
						segment={currentSegment}
						xDataType={xDataType}
					/>
				);
			case "SingleRelation":
				isExisting = intentions.single_relation_intentions.some((intention) => popoverPosition.ranges[0][0] === selectedSplits?.[intention.id1] && popoverPosition.ranges[popoverPosition.ranges.length - 1][0] === selectedSplits[intention.id2]);
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(SingleRelationChoice)}
						selected={selectedRelations}
						onChange={handleRelationsChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
						segment={currentGroupSegment}
						xDataType={xDataType}
						comparison={comparison as Record<SingleRelationChoice, Comparator>}
					/>
				);
			case "GroupRelation":
				isExisting = intentions.group_relation_intentions.some((intention) => group1Start === selectedSplits?.[intention.group1[0]] && group1End === selectedSplits?.[intention.group1[1] + 1] && group2Start === selectedSplits?.[intention.group2[0]] && group2End === selectedSplits?.[intention.group2[1] + 1]);
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(GroupRelationChoice)}
						selected={selectedGroupRelations}
						onChange={handleGroupRelationsChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
						segment={currentGroupSegment}
						xDataType={xDataType}
						comparison={comparison as Record<GroupRelationChoice, Comparator>}
					/>
				);
			case "Global":
				isExisting = intentions.global_intentions.length > 0;
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(GlobalChoice)}
						selected={selectedGlobal}
						onChange={handleGlobalChoicesChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
						segment={currentSegment}
						xDataType={xDataType}
						comparison={comparison as Record<GlobalChoice, Comparator>}
					/>
				);
			default:
				return null;
		}
	}, [popoverPosition, selectedChoices, selectedGroups, handleChoicesChange, handleGroupChoicesChange, handlePopoverClose, handleConfirm, handleDelete, intentions, selectedSplits, selectedRelations, selectedGroupRelations, handleRelationsChange, handleGroupRelationsChange, segments, xDataType, group1Start, group1End, group2Start, group2End, comparison, selectedGlobal, handleGlobalChoicesChange]);

	return (
		<>
			<svg
				ref={svgRef}
				width="100%"
				height="100%"
			></svg>
			{children}
			{popoverPosition && (
				<Popover
					open={!!popoverPosition}
					content={renderPopover()}
					trigger="click"
				>
					<div style={{ width: "0", height: "0", position: "absolute", left: `${popoverPosition.x}px`, top: `${popoverPosition.y}px` }}></div>
				</Popover>
			)}
		</>
	);
}

export default memo(LineChart, (prevProps, nextProps) => {
	return Object.keys(prevProps).every((key) => {
		const k = key as keyof LineChartProps;
		if (k === "children") return false;
		return deepEqual(prevProps[k], nextProps[k]);
	});
});
