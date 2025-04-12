import Span from "../Span";
import Time from "../Time";
import { ReactNode } from "react";
import { ThresholdCondition } from "../../../types/QuerySpec";
import TitleCondition from "../TitleCondition";

interface ScopeProps {
	title?: string;
	min: number | null;
	max: number | null;
	minValue?: number;
	maxValue?: number;
	activeColor?: string;
	minActiveColor?: string;
	maxActiveColor?: string;
	minInclusive: boolean;
	maxInclusive: boolean;
	disabled?: boolean;
	addonBefore?: [ReactNode, ReactNode];
	addonAfter?: string;
	valueFormatter?: number;
	onChange: (min: ThresholdCondition | null, max: ThresholdCondition | null) => void;
}

export default function Scope({ title, min, max, minValue, maxValue, minInclusive, maxInclusive, addonBefore, addonAfter, onChange, disabled, minActiveColor, maxActiveColor, valueFormatter = 1, activeColor }: ScopeProps) {
	const t = title?.toLowerCase().split(" ").filter(Boolean).join("_");
	return (
		<TitleCondition title={title ?? "Scope"}>
			{t?.includes("time_scope") ? (
				<Time
					disabled={disabled}
					min={min}
					max={max}
					minInclusive={minInclusive}
					maxInclusive={maxInclusive}
					maxValue={maxValue ?? null}
					minValue={minValue ?? null}
					onChange={onChange}
					minActiveColor={minActiveColor}
					maxActiveColor={maxActiveColor}
					activeColor={activeColor}
				></Time>
			) : (
				<Span
					disabled={disabled}
					addonBefore={addonBefore}
					addonAfter={addonAfter}
					valueFormatter={valueFormatter}
					min={min}
					max={max}
					minInclusive={minInclusive}
					maxInclusive={maxInclusive}
					minValue={minValue}
					maxValue={maxValue}
					onChange={onChange}
					minActiveColor={minActiveColor}
					maxActiveColor={maxActiveColor}
					activeColor={activeColor}
				></Span>
			)}
		</TitleCondition>
	);
}
