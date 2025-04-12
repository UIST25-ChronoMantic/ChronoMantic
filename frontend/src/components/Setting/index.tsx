import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setIsSettingShow, setR2 } from "../../app/slice/setting";
import SettingIcon from "../../icons/Setting";
import Panel from "../Panel";
import "./index.css";
import { Button, InputNumber } from "antd";
import { createPortal } from "react-dom";

function SettingComponent() {
	const dispatch = useAppDispatch();
	const r2 = useAppSelector((state) => state.setting.r2);
	const [r2State, setR2State] = useState(r2);
	const handleSubmit = () => {
		dispatch(setIsSettingShow(false));
		dispatch(setR2(r2State));
	};
    return (
        <div className="setting">
            <div className="modal" onClick={() => dispatch(setIsSettingShow(false))}></div>
            <Panel className="setting__inner" title="Setting" icon={<SettingIcon />}>
                <form className="setting-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="choose-item">
                        <span className="choose-item-title">Min R2</span>
                        <div className="choose-item-content">
                            <InputNumber value={r2State} min={0} onChange={(val) => val && setR2State(val)}></InputNumber>
                        </div>
                    </div>
                    <Button type="primary" htmlType="submit">Confirm!</Button>
                </form>
            </Panel>
        </div>
    )
}

export default function Setting() {
	return createPortal(<SettingComponent />, document.body);
}