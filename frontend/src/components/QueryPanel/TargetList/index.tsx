import { useAppSelector } from "../../../app/hooks";
import FlagIcon from "../../../icons/Flag";
import { classnames } from "../../../utils/classname";
import { getColorFromMap } from "../../../utils/color";
import "./index.css";

export default function TargetList() {
	const query = useAppSelector((state) => state.states.query);
	const colorMap = useAppSelector((state) => state.states.colorMap);
	if (!query || !query.targets || query.targets.length === 0) return null;
	return (
		<div className="target-list">
			<FlagIcon></FlagIcon>
			{query?.targets.map((target) => {
				return (
					<div
						key={target.target}
						className={classnames("target-item", {
							disabled: !!query.text_sources[target.text_source_id]?.disabled,
						})}
						style={{
							backgroundColor: getColorFromMap(colorMap, target.text_source_id) || "#3331",
						}}
					>
						{target.target}
					</div>
				);
			})}
		</div>
	);
}
