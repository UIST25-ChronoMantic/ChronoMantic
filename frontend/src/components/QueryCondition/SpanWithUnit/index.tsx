import { Select } from "antd";
import { ThresholdCondition, Unit } from "../../../types/QuerySpec";
import Span from "../Span";
import { getSecondsByUnit } from "../../../utils/query-spec";
import { ReactNode } from "react";
import TitleCondition from "../TitleCondition";

interface SpanWithUnitProps {
	disabled?: boolean;
	title?: string;
	min?: number | null;
	max?: number | null;
	minInclusive?: boolean;
	maxInclusive?: boolean;
	activeColor?: string;
	addonBefore?: ReactNode | ReactNode[];
	unit?: Unit;
	isSlope?: boolean;
	onChange: (min: ThresholdCondition | null, max: ThresholdCondition | null, unit?: Unit) => void;
}

const UNIT_OPTIONS = Object.values(Unit)
	.filter((unit) => unit !== Unit.NUMBER)
	.map((unit) => ({
		label: unit,
		value: unit,
	}));

const convertValue = (value: number | null, fromUnit: Unit, toUnit: Unit, isSlope = false): number | null => {
	if (value === null) return null;
	const fromSeconds = getSecondsByUnit(fromUnit);
	const toSeconds = getSecondsByUnit(toUnit);

	if (isSlope) {
		return value * (toSeconds / fromSeconds);
	} else {
		return value * (fromSeconds / toSeconds);
	}
};

export default function SpanWithUnit({ title, disabled, min, max, minInclusive, maxInclusive, activeColor, unit, onChange, addonBefore, isSlope = false }: SpanWithUnitProps) {
	return (
		<>
			<TitleCondition title={title ?? ""}>
				<Span
					disabled={disabled}
					min={min ?? null}
					max={max ?? null}
					addonBefore={addonBefore ?? undefined}
					activeColor={activeColor}
					minInclusive={minInclusive ?? false}
					maxInclusive={maxInclusive ?? false}
					addonAfter={
						unit && unit !== Unit.NUMBER && (
							<Select
								disabled={disabled}
								value={unit}
								popupMatchSelectWidth={false}
								options={UNIT_OPTIONS}
								onChange={(newUnit) => {
									const oldUnit = unit;
									const newMin = min !== null ? convertValue(min ?? 0, oldUnit, newUnit, isSlope) : null;
									const newMax = max !== null ? convertValue(max ?? 0, oldUnit, newUnit, isSlope) : null;
									onChange(newMin ? { value: newMin, inclusive: minInclusive ?? false } : null, newMax ? { value: newMax, inclusive: maxInclusive ?? false } : null, newUnit);
								}}
							/>
						)
					}
					onChange={(min, max) => {
						onChange(min, max, unit);
					}}
				/>
			</TitleCondition>
		</>
	);
}
