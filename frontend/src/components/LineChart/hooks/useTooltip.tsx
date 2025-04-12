import * as d3 from "d3";
import { generateId } from "../../../utils/id";
import { getSecondsByUnit } from "../../../utils/query-spec";
import { Unit, Segment } from "../../../types/QuerySpec";

export const setupTooltip = (g: d3.Selection<SVGGElement, unknown, null, undefined>,  lineColor: string, keyData: number[], valueData: number[], x: d3.ScaleTime<number, number, never> | d3.ScaleLinear<number, number, never>, y: d3.ScaleLinear<number, number>, isTime: boolean, xAxisFormatter: (date: Date) => string, innerHeight: number, segments: Segment[], timeStampData: number[], xDataType: Unit) => {
  const id = generateId();
	const tooltip = d3.select("body").append("div").attr("class", `tooltip-${id}`).style("position", "absolute").style("background", "#000a").style("color", "#fff").style("padding", "5px 10px").style("border", "1px solid #ccc").style("border-radius", "6px").style("pointer-events", "none").style("transform", "translate(-50%, -100%)").style("opacity", 0).style("font-weight", "200").style("font-size", "14px");

	const hoverLine = g.append("line").attr("class", "hover-line").attr("stroke", lineColor).attr("stroke-opacity", 0.7).attr("stroke-width", 1.5).style("opacity", 0);

	const hoverCircle = g.append("circle").attr("r", 4).attr("fill", lineColor).style("opacity", 0);

	g.on("mousemove", function (event) {
		const [mouseX] = d3.pointer(event, this);
		const xValue = x.invert(mouseX);
		const closestIndex = d3.bisectCenter(keyData, isTime ? (xValue as Date).getTime() : (xValue as number));
		const closestData = [keyData[closestIndex], valueData[closestIndex]] as [number, number];

		const currentValue = isTime ? (xValue as Date).getTime() : (xValue as number);
		const currentSegment = segments.find((seg) => {
			const segStartValue = timeStampData[seg.start_idx];
			const segEndValue = timeStampData[seg.end_idx];
			return currentValue >= segStartValue && currentValue <= segEndValue;
		});

		hoverLine
			.attr("x1", x(isTime ? new Date(closestData[0]) : closestData[0]))
			.attr("x2", x(isTime ? new Date(closestData[0]) : closestData[0]))
			.attr("y1", 0)
			.attr("y2", innerHeight)
			.style("opacity", 1);
		hoverCircle
			.attr("cx", x(isTime ? new Date(closestData[0]) : closestData[0]))
			.attr("cy", y(closestData[1]))
			.style("opacity", 1);
		tooltip.transition().duration(100).style("opacity", 0.7);
		const tooltipWidth = tooltip.node()?.getBoundingClientRect().width || 0;
		const tooltipHeight = tooltip.node()?.getBoundingClientRect().height || 0;
		const left = Math.min(Math.max(event.pageX, 0), window.innerWidth - tooltipWidth / 2 - 10);
		const top = Math.min(Math.max(event.pageY - 10, 0), window.innerHeight - tooltipHeight);

		const unit = getSecondsByUnit(xDataType);

		let tooltipContent = `${isTime ? "Time" : "X"}: ${isTime ? xAxisFormatter(new Date(closestData[0])) : closestData[0]}<br>${isTime ? "Value" : "Y"}: ${closestData[1]}`;

		if (currentSegment) {
			tooltipContent += `<br><br>Segment Info:<br>`;
			tooltipContent += `<span style="margin-left: 10px; font-size: 12px;">Category: ${currentSegment.category}</span><br>`;
			tooltipContent += `<span style="margin-left: 10px; font-size: 12px;">Slope: ${(currentSegment.slope * unit).toFixed(4)}/${xDataType}</span><br>`;
			tooltipContent += `<span style="margin-left: 10px; font-size: 12px;">Score: ${currentSegment.score?.toFixed(4) || "N/A"}</span><br>`;
			if (currentSegment.relative_slope !== undefined) {
				tooltipContent += `<span style="margin-left: 10px; font-size: 12px;">Relative Slope: ${currentSegment.relative_slope.toFixed(4)}%</span><br>`;
			}
			if (currentSegment.duration !== undefined) {
				tooltipContent += `<span style="margin-left: 10px; font-size: 12px;">Duration: ${currentSegment.duration / unit} ${xDataType}</span><br>`;
			}
		}

		tooltip
			.html(tooltipContent)
			.style("left", left + "px")
			.style("top", top + "px");
	}).on("mouseleave", function () {
		hoverLine.style("opacity", 0);
		hoverCircle.style("opacity", 0);
		tooltip.transition().duration(100).style("opacity", 0);
	});

  return () => {
    tooltip.remove();
    hoverLine.remove();
    hoverCircle.remove();
    g.on("mousemove", null).on("mouseleave", null);
  }
};
