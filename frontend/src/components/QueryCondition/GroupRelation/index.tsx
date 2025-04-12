import { Button, Divider, Empty, Flex, Select } from "antd";
import { Comparator, GroupAttribute, GroupRelationWithSource, TrendWithSource } from "../../../types/QuerySpec";
import { MinusOutlined, PlusOutlined, SwapRightOutlined } from "@ant-design/icons";
import { deepClone } from "../../../utils/deepclone";
import { getColorFromMap } from "../../../utils/color";
import { useAppSelector } from "../../../app/hooks";
import TitleCondition from "../TitleCondition";

interface GroupRelationProps {
	isEdit?: boolean;
	disabled?: boolean;
	relations: GroupRelationWithSource[];
	trends: TrendWithSource[];
	onChange: (relations: GroupRelationWithSource[]) => void;
}

export default function GroupRelation({ relations, trends = [], onChange, isEdit, disabled }: GroupRelationProps) {
	const allRelations = isEdit ? deepClone(relations) : relations;
	const colorMap = useAppSelector((state) => state.states.colorMap);

	return (
		<>
			<Flex
				justify="space-between"
				align="center"
			>
				<TitleCondition title="Group Relations">
					{isEdit && !disabled && (
						<Button
							icon={<PlusOutlined />}
							onClick={() => {
								const newRelations = [...allRelations];
								newRelations.push({
									group1: [0, 0],
									group2: [0, 0],
									comparator: Comparator.GREATER,
									attribute: GroupAttribute.DURATION,
									text_source_id: -1,
								});
								onChange(newRelations);
							}}
						/>
					)}
				</TitleCondition>
			</Flex>

			{!relations.length ? (
				<Empty description="no group relations" />
			) : (
				allRelations.map((relation, index) => (
					<div key={index}>
						<Flex
							justify="space-between"
							align="center"
							className="relation-item active-component"
							style={{ backgroundColor: getColorFromMap(colorMap, relation.text_source_id) }}
						>
							<Flex gap={8}>
								<Select
									options={Object.values(GroupAttribute).map((attr) => ({ value: attr }))}
									value={relation.attribute}
									placeholder="attribute"
									onChange={(value) => {
										const newRelations = [...allRelations];
										newRelations[index].attribute = value;
										onChange(newRelations);
									}}
								></Select>
								<Select
									disabled={disabled}
									value={relation.group1[0]}
									options={trends.map((_, i) => ({ value: i }))}
									placeholder="group1"
									onChange={(value) => {
										const newRelations = [...allRelations];
										newRelations[index].group1[0] = value;
										onChange(newRelations);
									}}
								/>
								<SwapRightOutlined />
								<Select
									disabled={disabled}
									value={relation.group1[1]}
									options={trends.map((_, i) => ({ value: i }))}
									placeholder="group1"
									onChange={(value) => {
										const newRelations = [...allRelations];
										newRelations[index].group1[1] = value;
										onChange(newRelations);
									}}
								/>
								<Select
									disabled={disabled}
									value={relation.comparator}
									options={Object.values(Comparator).map((comp) => ({ value: comp }))}
									placeholder="comparator"
									onChange={(value) => {
										const newRelations = [...allRelations];
										newRelations[index].comparator = value;
										onChange(newRelations);
									}}
								/>
								<Select
									disabled={disabled}
									value={relation.group2[0]}
									options={trends.map((_, i) => ({ value: i }))}
									placeholder="group2"
									onChange={(value) => {
										const newRelations = [...allRelations];
										newRelations[index].group2[0] = value;
										onChange(newRelations);
									}}
								/>
								<SwapRightOutlined />
								<Select
									disabled={disabled}
									value={relation.group2[1]}
									options={trends.map((_, i) => ({ value: i }))}
									placeholder="group2"
									onChange={(value) => {
										const newRelations = [...allRelations];
										newRelations[index].group2[1] = value;
										onChange(newRelations);
									}}
								/>
							</Flex>
							{isEdit && !disabled && (
								<Button
									type="primary"
									icon={<MinusOutlined />}
									danger
									onClick={() => {
										const newRelations = [...allRelations];
										newRelations.splice(index, 1);
										onChange(newRelations);
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
