import Panel from "../Panel";
import DocumentIcon from "../../icons/Document";
import NlqueryBox from "../NlqueryBox";
import "./index.css";
import { classnames } from "../../utils/classname";
import QueryGlyph from "./QueryGlyph";
import TargetList from "./TargetList";


export default function QueryPanel({ className }: { className?: string }) {
    return (
        <Panel className={classnames("query-panel", className)} icon={<DocumentIcon />} title="Query Panel">
            <NlqueryBox></NlqueryBox>
            <TargetList></TargetList>
            <QueryGlyph className="query-panel-glyph"></QueryGlyph>
        </Panel>
    );
}