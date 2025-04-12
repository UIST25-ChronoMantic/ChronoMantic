import { classnames } from "../../../utils/classname";
import { Popover } from "antd";
import QueryCondition from "../../QueryCondition";
import Glyph from "../../Glyph";
import { flushSync } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setCurRelation, setCurTrend } from "../../../app/slice/stateSlice";
import { useMemo } from "react";
import { getSecondsByUnit } from "../../../utils/query-spec";
export default function QueryGlyph({ className }: { className?: string }) {
	const dispatch = useAppDispatch();
	const query = useAppSelector((state) => state.states.query);
	const curTrend = useAppSelector((state) => state.states.curTrend);
	const curRelation = useAppSelector((state) => state.states.curRelation);
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const timeStampColumnType = useAppSelector((state) => state.dataset.dataset?.timeStampColumnType);
	const timeStampColumnUnit = useMemo(() => getSecondsByUnit(timeStampColumnType), [timeStampColumnType]);

	return (
		<div className={classnames("glyph", className)}>
			<Popover
				rootClassName="glyph-popover"
				trigger={["contextMenu"]}
				placement="rightBottom"
				content={<QueryCondition></QueryCondition>}
			>
				<div
					className="pointer flex"
					style={{ width: "100%", height: "100%" }}
				>
					<Glyph
						query={query}
						onClick={(type, index) => {
							switch (type) {
								case "Trend":
									flushSync(() => dispatch(setCurTrend(null)));
									if (index !== curTrend) {
										dispatch(setCurTrend(index));
									} else {
										dispatch(setCurTrend(null));
									}
									break;
								case "Relation":
									flushSync(() => dispatch(setCurRelation(null)));
									if (index !== curRelation) {
										dispatch(setCurRelation(index));
									} else {
										dispatch(setCurRelation(null));
									}
									break;
								default:
									break;
							}
						}}
						height={48}
						trends={query?.trends || []}
						allTrends={query?.trends || []}
						single_relations={query?.single_relations || []}
						trend_groups={query?.trend_groups || []}
						group_relations={query?.group_relations || []}
						curTrend={curTrend ?? -1}
						curRelation={curRelation ?? -1}
						colorMap={colorMap}
						timeStampColumnType={timeStampColumnType}
						timeStampColumnUnit={timeStampColumnUnit}
					/>
				</div>
			</Popover>
		</div>
	);
}
