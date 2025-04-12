import { SwapRightOutlined } from "@ant-design/icons";
import { Checkbox, DatePicker, Flex } from "antd";
import dayjs from "dayjs";
import { ThresholdCondition } from "../../../types/QuerySpec";

interface TimeProps {
	min: number | null;
	max: number | null;
	minInclusive: boolean;
	maxInclusive: boolean;
	activeColor?: string;
	minActiveColor?: string;
	maxActiveColor?: string;
	minValue: number | null;
	maxValue: number | null;
	disabled?: boolean;
	onChange: (min: ThresholdCondition | null, max: ThresholdCondition | null) => void;
}

export default function Time({ min, max, minInclusive, maxInclusive, maxValue, minValue, onChange, disabled, minActiveColor, maxActiveColor, activeColor }: TimeProps) {
	return (
		<Flex
			gap={4}
			align="center"
			className="active-component"
			style={{ backgroundColor: activeColor }}
		>
			<Checkbox
				checked={minInclusive}
				disabled={disabled || !min}
				onChange={(e) => {
					onChange(min ? { value: min, inclusive: e.target.checked } : null, max ? { value: max, inclusive: maxInclusive } : null);
				}}
			/>
			<Flex
				className="active-component"
				style={{
					backgroundColor: minActiveColor,
				}}
				align="center"
			>
				<DatePicker
					disabled={disabled}
					value={min ? dayjs(min * 1000) : null}
					minDate={dayjs(minValue)}
					maxDate={dayjs(maxValue)}
					defaultValue={min ? dayjs(min * 1000) : null}
					allowClear
					onChange={(date) => {
						onChange(date ? { value: date.valueOf() / 1000, inclusive: true } : null, max ? { value: max, inclusive: true } : null);
					}}
				/>
			</Flex>
			<SwapRightOutlined />
			<Flex
				className="active-component"
				style={{
					backgroundColor: maxActiveColor,
				}}
				align="center"
			>
				<DatePicker
					disabled={disabled}
					value={max ? dayjs(max * 1000) : null}
					minDate={dayjs(minValue)}
					maxDate={dayjs(maxValue)}
					defaultValue={max ? dayjs(max * 1000) : null}
					allowClear
					onChange={(date) => {
						onChange(min ? { value: min, inclusive: true } : null, date ? { value: date.valueOf() / 1000, inclusive: true } : null);
					}}
				/>
			</Flex>
			<Checkbox
				disabled={disabled || !max}
				checked={maxInclusive}
				onChange={(e) => {
					onChange(min ? { value: min, inclusive: minInclusive } : null, max ? { value: max, inclusive: e.target.checked } : null);
				}}
			/>
		</Flex>
	);
}
