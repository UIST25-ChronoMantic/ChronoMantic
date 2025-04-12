import { useEffect } from "react";

export const useResize = (fn: () => (() => void) | null | undefined) => {
	useEffect(() => {
		const cancle = fn();
		window.addEventListener("resize", fn);
		return () => {
			window.removeEventListener("resize", fn);
			cancle?.();
		};
	}, [fn]);
};
