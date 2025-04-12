import { classnames } from "../../utils/classname";
import "./index.css";
import PanelHeader, { PanelHeaderProps } from "./PanelHeader";

interface PanelProps extends PanelHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export default function Panel({ children, icon, title, className, right }: PanelProps) {
    return (
        <div className={classnames("panel", className)}>
            <PanelHeader icon={icon} title={title} right={right} />
            <div className="panel-content">{children}</div>
        </div>
    );
}