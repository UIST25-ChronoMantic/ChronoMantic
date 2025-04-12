import * as d3 from "d3";
import { memo, useCallback, useEffect, useRef } from "react";
import { debounce } from "../../../../utils/debounce";
import { deepClone, deepEqual } from "../../../../utils/deepclone";

interface DataPoint {
	x: number;
	y: number;
}

interface SelectChartProps {
	data: DataPoint[];
	title?: string;
	onBrush?: (minX: number, maxX: number) => void;
	formatter?: (value: number) => string;
}

function formatNumber(value: number): string {
	if (value === 0) return "0";

	const absValue = Math.abs(value);
	if (absValue >= 1000000) {
		return `${(value / 1000000).toFixed(2)}M`;
	} else if (absValue >= 1000) {
		return `${(value / 1000).toFixed(2)}k`;
	} else if (absValue < 0.01) {
		return value.toExponential(2);
	} else {
		return value.toFixed(2);
	}
}

function SelectChart({ data, title, onBrush, formatter = formatNumber }: SelectChartProps) {
	const svgRef = useRef<SVGSVGElement | null>(null);

	const draw = useCallback(() => {
		if (svgRef.current && data.length > 0) {
			const displayData = deepClone(data);
			const width = svgRef.current.clientWidth;
			const height = svgRef.current.clientHeight;
			const margin = { top: title ? 20 : 4, right: 2, bottom: 0, left: 2 };
			const innerWidth = width - margin.left - margin.right;
			const innerHeight = height - margin.top - margin.bottom;

			if (displayData.length === 1) {
				displayData.push({ x: displayData[0].x, y: displayData[0].y });
			}

			const x = d3
				.scaleLinear()
				.domain(d3.extent(displayData, (d) => d.x) as [number, number])
				.range([0, innerWidth]);

			const xMin = d3.min(displayData, (d) => d.x) ?? -Infinity;
			const xMax = d3.max(displayData, (d) => d.x) ?? Infinity;

			const determineScale = () => {
				if (displayData.length <= 10) return "linear";

				const values = displayData.map((d) => d.y);
				const max = Math.max(...values);
				const min = Math.min(...values);

				return max / Math.max(min, 0.0001) > 1000 ? "log" : "linear";
			};

			const scaleType = determineScale();

			const y = d3
				.scaleLinear()
				.domain(scaleType === "log" ? [Math.max(d3.min(displayData, (d) => d.y) ?? 1, 1), d3.max(displayData, (d) => d.y) ?? 1] : [0, d3.max(displayData, (d) => d.y) ?? 0])
				.nice()
				.range([innerHeight, 0]);

			const yScale =
				scaleType === "log"
					? d3
							.scaleLog()
							.domain([Math.max(d3.min(displayData, (d) => d.y) ?? 1, 1), d3.max(displayData, (d) => d.y) ?? 1])
							.range([innerHeight, 0])
					: y;

			const svg = d3.select(svgRef.current);
			svg.selectAll("*").remove();

			const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

			const areaGenerator = d3
				.area<DataPoint>()
				.x((d) => x(d.x))
				.y0(yScale(scaleType === "log" ? 1 : 0))
				.y1((d) => yScale(d.y));

			g.append("path").datum(displayData).attr("class", "area").attr("d", areaGenerator).attr("fill", "steelblue").attr("fill-opacity", 0.3);

			svg.append("text")
				.attr("x", innerWidth / 2)
				.attr("y", 15)
				.attr("text-anchor", "middle")
				.attr("font-size", "14px")
				.attr("fill", "#808080")
				.text(title ?? "");

			function brushFn(event: d3.D3BrushEvent<DataPoint>) {
				svg.selectAll(".area").remove();
				svg.selectAll(".brush-label").remove();

				if (displayData.length < 2) {
					onBrush?.(0, displayData[0].x);
					return;
				}
				const selection = event.selection;
				if (!selection) return;

				g.append("path").datum(displayData).attr("class", "area").attr("d", areaGenerator).attr("fill", "lightgray").attr("fill-opacity", 0.3);

				g.append("path").datum(displayData).attr("class", "area").attr("clip-path", `polygon(${selection[0]}px 0, ${selection[1]}px 0, ${selection[1]}px 100%, ${selection[0]}px 100%)`).attr("d", areaGenerator).attr("fill", "steelblue").attr("fill-opacity", 0.3);

				const [x0, x1] = selection as [number, number];
				const [minX, maxX] = [parseFloat(x.invert(x0).toFixed(2)), parseFloat(x.invert(x1).toFixed(2))];

				const selectionWidth = (x1 as number) - (x0 as number);
				const maxText = formatter(maxX);
				const minText = formatter(minX);
				const textWidth = (maxText.length + minText.length) * 6 + 4;
				const isEnough = textWidth < selectionWidth;

				svg.append("text")
					.attr("class", "brush-label")
					.attr("x", x0 + 5)
					.attr("y", isEnough ? innerHeight : 12)
					.attr("text-anchor", "start")
					.attr("font-size", "12px")
					.attr("fill", "#666")
					.attr("pointer-events", "none")
					.text(minText);

				svg.append("text")
					.attr("class", "brush-label")
					.attr("x", x1 - 3)
					.attr("y", innerHeight)
					.attr("text-anchor", "end")
					.attr("font-size", "12px")
					.attr("fill", "#666")
					.attr("pointer-events", "none")
					.text(maxText);

				onBrush?.(minX, maxX);
			}

			const debouncedBrushFn = debounce(brushFn, 16);

			const brush = d3
				.brushX()
				.extent([
					[0, 0],
					[innerWidth, innerHeight],
				])
				.on("brush", (event) => debouncedBrushFn(event))
				.on("end", function (event) {
					const selection = event.selection;
					if (!selection) {
						svg.selectAll(".area").remove();
						svg.selectAll(".brush-label").remove();
						g.append("path").datum(displayData).attr("class", "area").attr("d", areaGenerator).attr("fill", "steelblue").attr("fill-opacity", 0.3);
						onBrush?.(xMin, xMax);
					}
				});

			svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "brush").call(brush).call(brush.move, [0, innerWidth]);
			svg.select(".selection").attr("fill", "none").attr("stroke", "none").attr("pointer-events", "none");
			svg.select(".brush .overlay").attr("pointer-events", "none");

			svg.selectAll(".handle").attr("fill", "steelblue").attr("stroke", "steelblue").attr("stroke-width", "1").attr("width", "1").style("width", "1px").style("transform", "translate(3px, 0)");

			return () => {
				brush.on("brush", null).on("end", null);
				svg.selectAll("*").remove();
			};
		}
	}, [data, onBrush, title, formatter]);

	useEffect(() => {
		const cancel = draw();
		window.addEventListener("resize", draw);
		return () => {
			window.removeEventListener("resize", draw);
			cancel?.();
		};
	}, [draw]);

	return (
		<svg
			ref={svgRef}
			width="100%"
			height="100%"
		></svg>
	);
}

export default memo(SelectChart, (prevProps, nextProps) => {
	return deepEqual(prevProps.data, nextProps.data) && prevProps.title === nextProps.title;
});
