import { Comparator, GlobalChoice, GroupChoice, GroupRelationChoice, Intentions, Segment, SingleChoice, SingleRelationChoice, Unit } from "../../types/QuerySpec";

export interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface LineChartProps {
    xData: number[] | string[];
    xDataType?: Unit;
    yData: number[];
    ratio?: number;
    height?: number | string;
    title?: string;
    margin?: Margin;
    isXAxisVisible?: boolean;
    isYAxisVisible?: boolean;
    isXAxisTextVisible?: boolean;
    isYAxisTextVisible?: boolean;
    isBrush?: boolean;
    onBrush?: (start: number, end: number) => void;
    onBrushEnd?: (start: number, end: number) => void;
    brushPosition?: [number, number];
    isFill?: boolean;
    range?: [number, number];
    isShowRange?: boolean;
    split?: number[];
    isExpand?: boolean;
    isZoom?: boolean;
    isActive?: boolean;
    onScroll?: (delta: number, position: number) => void;
    onContextMenu?: (event: MouseEvent) => void;
    children?: React.ReactNode;
    xAxisColor?: string;
    yAxisColor?: string;
    lineColor?: string;
    xAxisTextColor?: string;
    yAxisTextColor?: string;
    textColor?: string;
    xAxisFormatter?: (date: Date) => string;
    brushColor?: string;
    resultsSplit?: {
        segments: [number, number][][];
        colors: string[];
    };
    segments?: Segment[];
    selectedSplits?: number[];
    defaultSplits?: number[];
    isHoverable?: boolean;
    isRequesting?: boolean;
    isSelectable?: boolean;
    onSplitSelect?: (splits: number[]) => void;
    onCancelSplit?: () => void;
    /**
     * @param mode true 表示 refine，false 表示 author
     */
    onSubmitIntentions?: (intentions: Intentions, mode?: boolean) => void;
}

export type ChoiceType = "SingleSegment" | "SegmentGroup" | "SingleRelation" | "GroupRelation" | "Global";

export interface PopoverPosition {
    x: number;
    y: number;
    type: ChoiceType;
    ranges: [number, number][];
    groups?: [[number, number][], [number, number][]];
    rectWidth: number;
    rectHeight: number;
}

export interface IntentionLine {
    type: ChoiceType;
    level: number;
    ranges: [number, number][];
    choices: (SingleChoice | GroupChoice | SingleRelationChoice | GroupRelationChoice | GlobalChoice)[];
}

export interface IntentionPopoverProps<T extends SingleChoice | GroupChoice | SingleRelationChoice | GroupRelationChoice | GlobalChoice> {
    type: ChoiceType;
    choices: T[];
    selected: T[];
    onChange: (choice: T) => void;
    onCancel?: () => void;
    onConfirm: () => void;
    onDelete?: () => void;
    isExisting: boolean;
    segment?: Segment | [Segment, Segment];
    xDataType?: Unit;
    comparison?: Record<T, Comparator>;
} 