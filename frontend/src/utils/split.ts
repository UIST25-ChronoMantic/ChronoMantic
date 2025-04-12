import { Segment } from "../types/QuerySpec";

export function getSplit(segments: Segment[]) {
    return [...new Set(segments.map(segment => [segment.start_idx, segment.end_idx]).flat())].sort((a, b) => a - b);
}