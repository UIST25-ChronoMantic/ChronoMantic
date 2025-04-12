import { Button, Divider, Empty, Flex, Select, Typography } from "antd";
import { ScopeConditionWithSourceWithUnit, TrendWithSource, Unit } from "../../../types/QuerySpec";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { ReactNode, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setCurTrend } from "../../../app/slice/stateSlice";
import { classnames } from "../../../utils/classname";
import { getColorFromMap } from "../../../utils/color";
import { TrendCategory } from "../../../types/QuerySpec";
import SpanWithUnit from "../SpanWithUnit";
import { TrendTextMap } from "../../../utils/query-spec";
import Span from "../Span";
import TitleCondition from "../TitleCondition";
import Title from "../Title";

interface TrendProps {
	title?: string;
	trends: TrendWithSource[];
	start?: number;
	isEdit?: boolean;
	disabled?: boolean;
	timeStampColumnType?: Unit;
	onChange: (trends: TrendWithSource[]) => void;
}

export default function Trend({ title, trends, onChange, start = 0, isEdit, disabled, timeStampColumnType }: TrendProps) {
	const allTrends = trends;
	const trendRefs = useRef<(HTMLDivElement | null)[]>([]);
	const dispatch = useAppDispatch();
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const curTrend = useAppSelector((state) => state.states.curTrend);

	useEffect(() => {
		if (curTrend) {
			const trendRef = trendRefs.current[curTrend];
			if (trendRef) {
				trendRef.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}, [curTrend]);

	const getAvailableOptions = () => {
		return Object.entries(TrendTextMap)
			.filter(([key]) => key !== "category")
			.map(([key, value]) => ({
				label: value,
				value: key,
			}));
	};

	return (
		<>
			<Flex
				justify="space-between"
				align="center"
			>
				<TitleCondition title={title ?? "Trend"}>
					{isEdit && !disabled && (
						<Button
							icon={<PlusOutlined />}
							onClick={() => {
								const newTrends = [...allTrends];
								newTrends.push({
									category: {
										category: TrendCategory.ARBITRARY,
										text_source_id: -1,
									},
								});
								onChange(newTrends);
							}}
						></Button>
					)}
				</TitleCondition>
			</Flex>
			{!trends.length ? (
				<Empty description="no trends"></Empty>
			) : (
				allTrends.map((trend, index) => {
					return (
						<div
							key={index}
							ref={(el) => (trendRefs.current[index] = el)}
							onClick={() => {
								dispatch(setCurTrend(index));
							}}
							style={{ backgroundColor: curTrend === index ? "#f0f0f0" : "transparent" }}
						>
							<div className="trend-item">
								<Flex
									justify="space-between"
									align="center"
								>
									<Title title={`No.${index + start}`} level={5}></Title>
									{isEdit && !disabled && (
										<Flex
											gap={4}
											className="trend-item-attr"
										>
											<Select
												mode="multiple"
												options={getAvailableOptions()}
												popupMatchSelectWidth={false}
												value={Object.keys(trend).filter((key) => key !== "category")}
												onChange={(values) => {
													const newTrends = [...allTrends];
													newTrends[index] = {
														category: {
															category: trend.category.category,
															text_source_id: trend.category.text_source_id,
														},
													};
													values.forEach((value) => {
														const k = value as keyof TrendWithSource;
														if (k === "category") return;
														newTrends[index][k] = trend[k];
													});
													onChange(newTrends);
												}}
											></Select>
											<Button
												type="primary"
												icon={<MinusOutlined />}
												danger
												onClick={() => {
													const newTrends = [...allTrends];
													newTrends.splice(index, 1);
													onChange(newTrends);
												}}
											></Button>
										</Flex>
									)}
								</Flex>
								{Object.keys(trend).map((key, i) => {
									const k = key as keyof TrendWithSource;
									const components: ReactNode[] = [];
									components.push(<Typography.Paragraph key={i}>{TrendTextMap[k]}</Typography.Paragraph>);
									const condition = trend[k] as ScopeConditionWithSourceWithUnit;
									switch (k) {
										case "category":
											components.push(
												<div
													className="active-component"
													style={{ backgroundColor: getColorFromMap(colorMap, condition.text_source_id) }}
													key={k}
												>
													<Select
														popupMatchSelectWidth={false}
														value={trend[k].category}
														options={[
															{
																label: "flat",
																value: "flat",
															},
															{
																label: "up",
																value: "up",
															},
															{
																label: "down",
																value: "down",
															},
														]}
														onChange={(value) => {
															const newTrends = [...allTrends];
															newTrends[index][k].category = value;
															onChange(newTrends);
														}}
													></Select>
												</div>
											);
											break;
										case "duration_condition":
										case "slope_scope_condition":
											components.push(
												<SpanWithUnit
													key={k}
													isSlope={k === "slope_scope_condition"}
													disabled={disabled}
													min={condition?.min?.value ?? null}
													max={condition?.max?.value ?? null}
													activeColor={getColorFromMap(colorMap, condition?.text_source_id)}
													minInclusive={!!condition?.min?.inclusive}
													maxInclusive={!!condition?.max?.inclusive}
													unit={condition?.unit ?? timeStampColumnType}
													onChange={(min, max, unit) => {
														const newTrends = [...allTrends];
														newTrends[index][k] = {
															min: min ?? undefined,
															max: max ?? undefined,
															unit: unit,
															text_source_id: condition?.text_source_id,
														};
														onChange(newTrends);
													}}
												/>
											);
											break;
										case "relative_slope_scope_condition":
											components.push(
												<Span
													key={k}
													disabled={disabled}
													min={condition?.min?.value ?? null}
													max={condition?.max?.value ?? null}
													activeColor={getColorFromMap(colorMap, condition?.text_source_id)}
													minInclusive={!!condition?.min?.inclusive}
													maxInclusive={!!condition?.max?.inclusive}
													addonAfter={"%"}
													onChange={(min, max) => {
														const newTrends = [...allTrends];
														newTrends[index][k] = {
															min: min ?? undefined,
															max: max ?? undefined,
															text_source_id: condition?.text_source_id,
														};
														onChange(newTrends);
													}}
												/>
											);
											break;
										default:
											break;
									}

									return (
										<div
											key={i}
											className={classnames("trend-item-attr")}
										>
											{components}
										</div>
									);
								})}
							</div>
							<Divider></Divider>
						</div>
					);
				})
			)}
		</>
	);
}
