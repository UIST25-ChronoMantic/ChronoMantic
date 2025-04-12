import { Button, Divider, Empty, Flex, Select } from "antd";
import { TrendGroupWithSource, Unit } from "../../../types/QuerySpec";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { deepClone } from "../../../utils/deepclone";
import { getColorFromMap } from "../../../utils/color";
import { useAppSelector } from "../../../app/hooks";
import SpanWithUnit from "../SpanWithUnit";
import TitleCondition from "../TitleCondition";

interface TrendGroupProps {
	isEdit?: boolean;
	disabled?: boolean;
	groups: TrendGroupWithSource[];
	idLength: number;
	onChange: (groups: TrendGroupWithSource[]) => void;
	timeStampColumnType?: Unit;
}

export default function TrendGroup({ groups, idLength, onChange, isEdit, disabled, timeStampColumnType }: TrendGroupProps) {
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const allGroups = isEdit ? deepClone(groups) : groups;

	return (
		<>
			<Flex
				justify="space-between"
				align="center"
			>
				<TitleCondition title="Trend Groups">
					{isEdit && !disabled && (
						<Button
							icon={<PlusOutlined />}
							onClick={() => {
								const newGroups = [...allGroups];
								newGroups.push({
									ids: [0, 0],
									duration_condition: {
										text_source_id: -1,
									},
								});
								onChange(newGroups);
							}}
						/>
					)}
				</TitleCondition>
			</Flex>

			{!groups.length ? (
				<Empty description="no trend groups" />
			) : (
				allGroups.map((group, index) => (
					<div key={index}>
						<Flex
							justify="space-between"
							align="center"
							className="group-item active-component"
							style={{ backgroundColor: getColorFromMap(colorMap, group.duration_condition?.text_source_id) }}
						>
							<Flex
								gap={8}
								align="center"
							>
								<SpanWithUnit
									disabled={disabled}
									min={group.duration_condition?.min?.value ?? null}
									max={group.duration_condition?.max?.value ?? null}
									minInclusive={!!group.duration_condition?.min?.inclusive}
									maxInclusive={!!group.duration_condition?.max?.inclusive}
									unit={group.duration_condition?.unit ?? timeStampColumnType}
									addonBefore={[
										<Select
											disabled={disabled}
											value={group.ids[0]}
											options={Array.from({ length: idLength }, (_, i) => ({ value: i }))}
											onChange={(value) => {
												const newGroups = [...allGroups];
												newGroups[index].ids[0] = value;
												onChange(newGroups);
											}}
										/>,
										<Select
											disabled={disabled}
											value={group.ids[1]}
											options={Array.from({ length: idLength }, (_, i) => ({ value: i }))}
											onChange={(value) => {
												const newGroups = [...allGroups];
												newGroups[index].ids[1] = value;
												onChange(newGroups);
											}}
										/>,
									]}
									onChange={(min, max, unit) => {
										const newGroups = [...allGroups];
										newGroups[index].duration_condition = {
											text_source_id: group.duration_condition?.text_source_id ?? -1,
											min: min ?? undefined,
											max: max ?? undefined,
											unit,
										};
										onChange(newGroups);
									}}
								></SpanWithUnit>
							</Flex>
							{isEdit && !disabled && (
								<Button
									type="primary"
									icon={<MinusOutlined />}
									danger
									onClick={() => {
										const newGroups = [...allGroups];
										newGroups.splice(index, 1);
										onChange(newGroups);
									}}
								/>
							)}
						</Flex>
						<Divider />
					</div>
				))
			)}
		</>
	);
}
