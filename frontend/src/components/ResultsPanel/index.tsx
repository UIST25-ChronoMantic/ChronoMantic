import ResultsContent from "./ResultsContent";
import Panel from "../Panel";
import DocumentIcon from "../../icons/Document";
import "./index.css";
import { classnames } from "../../utils/classname";

export default function ResultsPanel({className}: {className?: string}) {
  return (
    <Panel className={classnames("results-panel", className)} icon={<DocumentIcon />} title="Results Panel">
      <ResultsContent />
    </Panel>
  );
}