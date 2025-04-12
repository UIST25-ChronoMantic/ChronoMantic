import { SwapRightOutlined } from "@ant-design/icons";
import { Checkbox, Flex, InputNumber } from "antd";
import { ReactNode } from "react";
import { classnames } from "../../../utils/classname";
import { ThresholdCondition } from "../../../types/QuerySpec";

export interface SpanProps {
	min: number | null;
	max: number | null;
	minInclusive: boolean;
	maxInclusive: boolean;
	minValue?: number;
	maxValue?: number;
	activeColor?: string;
	minActiveColor?: string;
	maxActiveColor?: string;
	addonBefore?: ReactNode | ReactNode[];
	addonAfter?: ReactNode;
	valueFormatter?: number;
	disabled?: boolean;
	onChange: (min: ThresholdCondition | null, max: ThresholdCondition | null) => void;
}

export default function Span({ min, max, minValue, maxValue, minInclusive, addonBefore, addonAfter, valueFormatter = 1, maxInclusive, onChange, disabled, minActiveColor, maxActiveColor, activeColor }: SpanProps) {
	return (
		<>
			<Flex
				gap={4}
				align="center"
				className={classnames(activeColor ? "active-component" : "")}
				style={{ backgroundColor: activeColor }}
			>
				<Flex
					style={{ backgroundColor: minActiveColor, paddingLeft: "4px" }}
					className={classnames(minActiveColor ? "active-component" : "")}
					align="center"
					gap={8}
				>
					<Checkbox
						checked={minInclusive}
						disabled={disabled || !min}
						onChange={(e) => {
							onChange(min ? { value: min, inclusive: e.target.checked } : null, max ? { value: max, inclusive: maxInclusive } : null);
						}}
					></Checkbox>
					<InputNumber
						disabled={disabled}
						addonBefore={Array.isArray(addonBefore) ? addonBefore[0] : addonBefore}
						addonAfter={addonAfter}
						max={maxValue}
						min={minValue}
						value={min ? min / valueFormatter : min}
						onChange={(value) => {
							onChange(value ? { value: value * valueFormatter, inclusive: minInclusive } : null, max ? { value: max, inclusive: maxInclusive } : null);
						}}
					/>
				</Flex>
				<SwapRightOutlined />
				<Flex
					style={{ backgroundColor: maxActiveColor, paddingRight: "4px" }}
					className={classnames(maxActiveColor ? "active-component" : "")}
					align="center"
					gap={4}
				>
					<InputNumber
						disabled={disabled}
						addonBefore={Array.isArray(addonBefore) ? addonBefore[1] : addonBefore}
						addonAfter={addonAfter}
						max={maxValue}
						min={minValue}
						value={max ? max / valueFormatter : max}
						onChange={(value) => {
							onChange(min ? { value: min, inclusive: minInclusive } : null, value ? { value: value * valueFormatter, inclusive: maxInclusive } : null);
						}}
					/>
					<Checkbox
						checked={maxInclusive}
						disabled={disabled || !max}
						onChange={(e) => {
							onChange(min ? { value: min, inclusive: minInclusive } : null, max ? { value: max, inclusive: e.target.checked } : null);
						}}
					></Checkbox>
				</Flex>
			</Flex>
		</>
	);
}
