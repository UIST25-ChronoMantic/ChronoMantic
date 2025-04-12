import { Button, Checkbox, Flex, Space, Typography } from "antd";
import { IntentionPopoverProps } from "./types";
import { Comparator, GlobalChoice, GroupChoice, GroupRelationChoice, Segment, SingleChoice, SingleRelationChoice, Unit } from "../../types/QuerySpec";
import { upper } from "../../utils/upper";
import { getSecondsByUnit } from "../../utils/query-spec";

function IntentionPopover<T extends SingleChoice | GroupChoice | SingleRelationChoice | GroupRelationChoice | GlobalChoice>({ type, choices, selected, onChange, onCancel, onConfirm, onDelete, isExisting, segment, xDataType = Unit.NUMBER, comparison }: IntentionPopoverProps<T>) {
	const unit = getSecondsByUnit(xDataType);

	const formatSegmentValue = (value: number, isSlope = false) => {
		if (isSlope) {
			return (value * unit).toFixed(4);
		}
		return (value / unit).toFixed(2);
	};

	const formatValue = (value: number | undefined, fixed = 2, isPercentage = false) => {
		if (value === undefined) return null;
		return isPercentage ? `${value.toFixed(fixed)}%` : value.toFixed(fixed);
	};

	const getSingleRelationInfo = (segments: Segment[], choice: SingleRelationChoice) => {
		if (!segments[1]) return null;
		if (!comparison) return null;

		const values = {
			[SingleRelationChoice.SLOPE]: (comparator: Comparator) => `(${formatSegmentValue(segments[0].slope, true)}${comparator}${formatSegmentValue(segments[1].slope, true)})[/${xDataType}]`,
			[SingleRelationChoice.DURATION]: (comparator: Comparator) => (segments[0].duration && segments[1].duration ? `(${formatSegmentValue(segments[0].duration)}${comparator}${formatSegmentValue(segments[1].duration)})[${xDataType}]` : null),
			[SingleRelationChoice.START_VALUE]: (comparator: Comparator) => `(${formatValue(segments[0].start_value)}${comparator}${formatValue(segments[1].start_value)})`,
			[SingleRelationChoice.END_VALUE]: (comparator: Comparator) => `(${formatValue(segments[0].end_value)}${comparator}${formatValue(segments[1].end_value)})`,
			[SingleRelationChoice.RELATIVE_SLOPE]: (comparator: Comparator) => `(${formatValue(segments[0].relative_slope, 4, true)}${comparator}${formatValue(segments[1].relative_slope, 4, true)})`,
		};

		return values[choice]?.(comparison[choice as keyof typeof comparison]);
	};

	const getSegmentsInfo = (choice: T) => {
		if (!segment) return null;
		const segments = Array.isArray(segment) ? segment : [segment];

		if (type === "SingleRelation") {
			return getSingleRelationInfo(segments, choice as SingleRelationChoice);
		}

		if (type === "GroupRelation") {
			if (!segments[1]) return null;
			const relationChoice = choice as GroupRelationChoice;
			switch (relationChoice) {
				case GroupRelationChoice.DURATION:
					if (!segments[0].duration || !segments[1].duration || !comparison) return null;
					return `(${formatSegmentValue(segments[0].duration)} ${comparison[choice]} ${formatSegmentValue(segments[1].duration)} ${xDataType})`;
			}
		}

		if (type === "SingleSegment") {
			const singleChoice = choice as SingleChoice;
			switch (singleChoice) {
				case SingleChoice.SLOPE:
					return `(${formatSegmentValue(segments[0].slope, true)}/${xDataType})`;
				case SingleChoice.RELATIVE_SLOPE:
					return segments[0].relative_slope !== undefined ? `(${segments[0].relative_slope.toFixed(4)}%)` : null;
				case SingleChoice.DURATION:
					return segments[0].duration !== undefined ? `(${formatSegmentValue(segments[0].duration)} ${xDataType})` : null;
			}
		}

		if (type === "SegmentGroup") {
			const groupChoice = choice as GroupChoice;
			switch (groupChoice) {
				case GroupChoice.DURATION:
					return segments[0].duration !== undefined ? `(${formatSegmentValue(segments[0].duration)} ${xDataType})` : null;
			}
		}

		if (type === "Global") {
			const globalChoice = choice as GlobalChoice;
			switch (globalChoice) {
				case GlobalChoice.DURATION:
					return segments[0].duration !== undefined ? `(${formatSegmentValue(segments[0].duration)} ${xDataType})` : null;
				case GlobalChoice.COMPARE_START_END_VALUE:
					if (!comparison) return null;
					return segments[0].start_value !== undefined && segments[0].end_value !== undefined ? `(${formatValue(segments[0].start_value)}${comparison[choice]}${formatValue(segments[0].end_value)})` : null;
			}
		}

		return null;
	};

	return (
		<div>
			<Flex
				justify="space-between"
				align="center"
			>
				<Typography.Paragraph keyboard>{type}</Typography.Paragraph>
				{isExisting && (
					<Button
						danger
						type="text"
						onClick={onDelete}
						size="small"
					>
						Delete
					</Button>
				)}
			</Flex>

			<Space
				direction="vertical"
				style={{ width: "100%" }}
			>
				{choices.map((choice) => {
					const info = getSegmentsInfo(choice);
					return (
						<Checkbox
							key={choice}
							checked={selected.includes(choice)}
							onChange={() => onChange(choice)}
						>
							<Typography.Text>
								{upper(choice, "_")}
								{info && <Typography.Text type="secondary">{info}</Typography.Text>}
							</Typography.Text>
						</Checkbox>
					);
				})}
			</Space>
			<Flex
				justify="flex-end"
				gap={8}
				style={{ marginTop: 16 }}
			>
				<Button
					onClick={onCancel}
					size="small"
				>
					Cancel
				</Button>
				<Button
					size="small"
					type="primary"
					onClick={onConfirm}
					disabled={selected.length === 0}
				>
					Confirm
				</Button>
			</Flex>
		</div>
	);
}

export default IntentionPopover;
