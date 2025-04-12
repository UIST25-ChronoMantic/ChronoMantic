import "./index.css";

export interface PanelHeaderProps {
    icon?: JSX.Element;
    title?: string;
    right?: JSX.Element;
}

export default function PanelHeader({ icon, title, right }: PanelHeaderProps) {
    return (
        <div className="panel-header">
            <div className="panel-header-icon">{icon}</div>
            <div className="panel-header-title">{title}</div>
            <div className="panel-header-right">{right}</div>
        </div>
    );
}