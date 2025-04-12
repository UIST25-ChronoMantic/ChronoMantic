import { useCallback, useEffect } from "react";
import { Margin } from "../types";

export const useScroll = (fn: ((step: number, normalizedPosition: number) => void) | null | undefined, svg: SVGSVGElement | null, range: [number, number] | undefined, computedMargin: Margin, maxLength: number) => {
	const handleScroll = useCallback(
		(event: WheelEvent) => {
			if (!fn || !svg) return;
			event.preventDefault();
			const rect = svg.getBoundingClientRect();
			if (!rect) return;
			const effectiveWidth = rect.width - computedMargin.left - computedMargin.right;
			const relativeX = (event.clientX - rect.left - computedMargin.left) / effectiveWidth;
			const clampedX = Math.max(0, Math.min(1, relativeX));
			const normalizedPosition = clampedX * 2 - 1;
			const total = range ? range?.[1] - range?.[0] : maxLength;
			const step = Math.max(1, Math.round(total / 10));
			fn(event.deltaY > 0 ? step : -step, normalizedPosition);
		},
		[fn, range, computedMargin, maxLength, svg]
	);

	useEffect(() => {
		if (!svg) return;
		svg.addEventListener("wheel", handleScroll, { passive: false });
		return () => {
			svg?.removeEventListener("wheel", handleScroll);
		};
	}, [handleScroll, svg]);
};
