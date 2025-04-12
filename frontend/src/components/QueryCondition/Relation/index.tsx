import { Button, Divider, Empty, Flex, Select } from "antd";
import { Comparator, SingleAttribute, SingleRelationWithSource } from "../../../types/QuerySpec";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { classnames } from "../../../utils/classname";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setCurRelation } from "../../../app/slice/stateSlice";
import { getColorFromMap } from "../../../utils/color";
import TitleCondition from "../TitleCondition";

interface RelationProps {
	title?: string;
	relations: SingleRelationWithSource[];
	idLength: number;
	isEdit?: boolean;
	disabled?: boolean;
	highlight?: number;
	onChange: (relations: SingleRelationWithSource[]) => void;
}

export default function Relation({ title, relations, idLength, isEdit, onChange, disabled, highlight }: RelationProps) {
	const relationRefs = useRef<(HTMLDivElement | null)[]>([]);
	const dispatch = useAppDispatch();
	const colorMap = useAppSelector((state) => state.states.colorMap);

	useEffect(() => {
		if (highlight !== undefined && relationRefs.current[highlight]) {
			relationRefs.current[highlight]?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [highlight]);

	return (
		<>
			<Flex
				justify="space-between"
				align="center"
			>
				<TitleCondition title={title ?? "Relation"}>
					{isEdit && !disabled && (
						<Button
							icon={<PlusOutlined />}
							onClick={() => {
								const newRelations = [...relations];
								newRelations.push({} as SingleRelationWithSource);
								onChange(newRelations);
							}}
						></Button>
					)}
				</TitleCondition>
			</Flex>
			{!relations.length ? (
				<Empty description="no relations"></Empty>
			) : (
				relations.map((relation, index) => (
					<div
						key={index}
						ref={(el) => (relationRefs.current[index] = el)}
						onClick={() => {
							dispatch(setCurRelation(index));
						}}
						className={highlight === index ? "active" : ""}
					>
						<div
							className={classnames("relation-item", "active-component")}
							style={{ backgroundColor: getColorFromMap(colorMap, relation.text_source_id) }}
						>
							<Flex gap={4}>
								<Select
									disabled={disabled}
									placeholder="attribute"
									popupMatchSelectWidth={false}
									options={Object.values(SingleAttribute).map((attr) => ({ value: attr, label: attr }))}
									value={relation.attribute}
									onChange={(value) => {
										const newRelations = [...relations];
										newRelations[index].attribute = value;
										onChange(newRelations);
									}}
								></Select>
								<Select
									disabled={disabled}
									placeholder="id1"
									popupMatchSelectWidth={false}
									value={relation.id1}
									options={Array.from({ length: idLength }, (_, i) => ({ value: i }))}
									onChange={(value) => {
										const newRelations = [...relations];
										newRelations[index].id1 = value;
										onChange(newRelations);
									}}
								></Select>
								<Select
									disabled={disabled}
									popupMatchSelectWidth={false}
									placeholder="comparator"
									options={Object.values(Comparator).map((attr) => ({ value: attr, label: attr }))}
									value={relation.comparator}
									onChange={(value) => {
										const newRelations = [...relations];
										newRelations[index].comparator = value;
										onChange(newRelations);
									}}
								/>
								<Select
									disabled={disabled}
									placeholder="id2"
									popupMatchSelectWidth={false}
									value={relation.id2}
									options={Array.from({ length: idLength }, (_, i) => ({ value: i }))}
									onChange={(value) => {
										const newRelations = [...relations];
										newRelations[index].id2 = value;
										onChange(newRelations);
									}}
								></Select>
								{isEdit && !disabled && (
									<Button
										type="primary"
										style={{ marginLeft: "auto" }}
										icon={<MinusOutlined />}
										danger
										onClick={() => {
											const newRelations = [...relations];
											newRelations.splice(index, 1);
											onChange(newRelations);
										}}
									></Button>
								)}
							</Flex>
						</div>
						<Divider></Divider>
					</div>
				))
			)}
		</>
	);
}
