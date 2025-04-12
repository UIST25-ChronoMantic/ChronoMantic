import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setIsSettingShow } from "../../app/slice/setting";
import Logo from "../../icons/Logo";
import SettingIcon from "../../icons/Setting";
import Text from "../../icons/Text";
import CsvLoader from "../CsvLoader";
import Setting from "../Setting";
import "./index.css";
import { useRef } from "react";

function AppHeader() {
	const dispatch = useAppDispatch();
	const isSettingShow = useAppSelector((state) => state.setting.isSettingShow);
	const csvLoaderRef = useRef<HTMLDivElement>(null);

	const handleUploadClick = () => {
		csvLoaderRef.current?.click();
	};

	return (
		<>
			<header className="header">
				<h1 className="header-title">
					<Logo />
					<Text className="text" />
				</h1>
				<div className="header-center">
					<button 
						className="header-button header-button__upload pointer"
						onClick={handleUploadClick}
					>
						<CsvLoader ref={csvLoaderRef}></CsvLoader>
						<b>Upload</b>
					</button>
					<button
						className="header-button header-button__setting pointer"
						onClick={() => dispatch(setIsSettingShow(true))}
					>
						<SettingIcon />
						<b>Setting</b>
					</button>
				</div>
			</header>
			{isSettingShow && <Setting></Setting>}
		</>
	);
}

export default AppHeader;
