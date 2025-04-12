import { Flex, Select, SelectProps, Tag } from "antd";
import { getColorFromMap } from "../../../utils/color";
import TitleCondition from "../TitleCondition";

interface TargetProps {
	title?: string;
	disabled?: boolean;
	value: string[];
	options: string[];
	sources: number[];
	colorMap: Record<string, string>;
	onChange: (value: string[]) => void;
}

const createTagRender = (colorMap: Record<string, string>, sources: number[], values: string[]): SelectProps['tagRender'] => {
  return (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <Tag
        color={getColorFromMap(colorMap, sources[values.indexOf(value)])}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
        key={value}
      >
        {label}
      </Tag>
    );
  };
};

export default function Target({ disabled, title, value, options, onChange, colorMap, sources }: TargetProps) {
	return (
		<Flex
			align="center"
			justify="space-between"
			gap={16}
		>
			<TitleCondition title={title ?? "Target"}>
				<Flex className="active-component">
				<Select
					disabled={disabled}
					allowClear
					mode="multiple"
					tagRender={createTagRender(colorMap, sources, value)}
					popupMatchSelectWidth={false}
					value={value}
					onChange={onChange}
					options={options.map((value) => ({ value: value }))}
					></Select>
				</Flex>
			</TitleCondition>	
		</Flex>
	);
}
