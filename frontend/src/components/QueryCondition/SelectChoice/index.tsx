import { Flex, Select } from "antd";
import TitleCondition from "../TitleCondition";

export interface SelectChoiceProps<T> {
	title: string;
	value: T;
	options: T[];
	activeColor?: string;
	onChange: (value: T) => void;
}

export default function SelectChoice<T>({ title, value, options, activeColor, onChange }: SelectChoiceProps<T>) {

	return (
		<TitleCondition title={title}>
			<Flex className="active-component" style={{ backgroundColor: activeColor }}>
				<Select
					allowClear
					options={options.map((value) => ({ value: value }))}
					popupMatchSelectWidth={false}
					value={value}
					onChange={onChange}
				></Select>
			</Flex>
		</TitleCondition>
	);
}
