import Title from "../Title";
import { ReactNode } from "react";

export interface TitleConditionProps {
	title: string;
	children: ReactNode;
}

export default function TitleCondition({ title, children }: TitleConditionProps) {
	return (
		<>
			{title && <Title title={title} />}
			{children}
		</>
	);
}
