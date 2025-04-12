import { ConfigProvider, Slider } from "antd";
import "./index.css";

interface LevelControllerProps {
	level: number;
	disabled: boolean;
	maxLevel: number;
	onChange: (value: number) => void;
}

export default function LevelController({ level, disabled, maxLevel, onChange }: LevelControllerProps) {
	return (
		<ConfigProvider
			theme={{
				components: {
					Slider: {
						railSize: 8,
						railBg: "#E0E0E0",
						railHoverBg: "#E0E0E0",
						handleColor: "var(--primary-color)",
						handleActiveColor: "var(--primary-color)",
						trackBg: "var(--primary-color)",
						trackHoverBg: "var(--primary-color)",
					},
				},
			}}
		>
			<div className="level-controller">
				<span className="level-controller-title">Approximation Level</span>
				<Slider
					disabled={disabled}
					value={level}
					max={maxLevel}
					onChange={onChange}
				></Slider>
				<span className="level-controller-value">{level}</span>
			</div>
		</ConfigProvider>
	);
}
