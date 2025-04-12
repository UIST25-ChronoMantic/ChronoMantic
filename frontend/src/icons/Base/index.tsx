import { classnames } from "../../utils/classname";
import "./index.css";

export default function Base({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <i className={classnames("icon", className)}>
            {children}
        </i>
    )
}