import { Typography } from "antd";

interface TitleProps {
	title: string;
  level?: 1 | 2 | 3 | 4 | 5;
}

export default function Title({ title, level = 4 }: TitleProps) {
	return <Typography.Title level={level} keyboard>{title}</Typography.Title>;
}