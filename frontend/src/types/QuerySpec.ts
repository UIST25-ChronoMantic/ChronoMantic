/**
 * Foundamental Data
 */

export interface DatasetInfo {
  time_column: string;
  value_columns: string[];
}

/**
 * Foundamental Data
 */

export enum Source {
  RESULT = "result", // 来源于查询结果
  USER = "user", // 来源于用户指定
}

// 单个分段信息
export interface Segment {
  source: Source; // 来源，"result"代表来源于查询结果，"user"代表来源于用户指定
  start_idx: number; // 起始索引
  end_idx: number; // 结束索引
  slope: number; // 斜率
  start_value: number; // 起始值
  end_value: number; // 结束值
  max_value?: number; // 最大值
  min_value?: number; // 最小值
  start_time?: number; // 起始时间,单位是秒
  end_time?: number; // 结束时间,单位是秒
  relative_slope?: number; // 相对斜率,单位是%
  duration?: number; // 时间跨度,单位是秒
  r2?: number; // 拟合优度,范围是[0,1]
  score?: number; // 分数,范围是[0,1]
  category?: TrendCategory; // 趋势类别
}

export interface SimplifiedSegment {
  source: string; // 片段的来源，可以是"result"或者"user",分别代表来源于查询结果和用户指定新增的
  slope: number;      // 片段的斜率，表示变化趋势
  start_value: number;  // 片段起始点的值
  end_value: number;    // 片段终止点的值
  start_time?: number;  // 片段起始时间，单位是秒，可选
  end_time?: number;    // 片段终止时间，单位是秒，可选
  relative_slope?: number;  // 片段斜率在所有斜率中的占比，单位是%，可选
  duration?: number;  // 片段的时间跨度，单位是秒，可选
}

// 趋势组合
export interface SegmentGroup {
  ids: [number, number]; // 组内趋势的id列表,ids[1]>=ids[0]
  duration: number; // 时间跨度,单位是秒
}

// 近似的连续分段信息
export interface ApproximationSegments {
  segments: Segment[]; // 近似的连续分段列表
  approximation_level: number; // 近似程度
}

// 近似的连续分段信息容器
export interface ApproximationSegmentsContainer {
  source: string; // 数据来源
  approximation_segments_list: ApproximationSegments[]; // 近似的连续分段列表
  max_approximation_level: number; // 最大近似程度
}

/**
 * QuerySpec
 */

// 阈值条件
export interface ThresholdCondition {
  value: number; // 阈值
  inclusive: boolean; // 是否包含该值
}

// 范围条件
export interface ScopeCondition {
  max?: ThresholdCondition; // 最大值条件
  min?: ThresholdCondition; // 最小值条件
}

export enum TrendCategory {
  FLAT = "flat", // 平坦
  UP = "up", // 上升
  DOWN = "down", // 下降
  ARBITRARY = "arbitrary", // 任意
}

// 趋势
export interface Trend {
  category: TrendCategory;
  slope_scope_condition?: ScopeCondition;
  relative_slope_scope_condition?: ScopeCondition;
  duration_condition?: ScopeCondition;
}

// 单趋势可比较属性
export enum SingleAttribute {
  SLOPE = "slope",
  START_VALUE = "start_value",
  END_VALUE = "end_value",
  DURATION = "duration",
  RELATIVE_SLOPE = "relative_slope"
}

// 趋势组合可比较属性
export enum GroupAttribute {
  DURATION = "duration"
}

// 比较关系
export enum Comparator {
  GREATER = ">", // 大于
  LESS = "<", // 小于
  EQUAL = "=", // 等于
  NO_GREATER = "<=", // 小于等于
  NO_LESS = ">=", // 大于等于
  APPROXIMATELY_EQUAL_TO = "~=", // 近似等于
}

// 两个单趋势之间的比较关系
export interface SingleRelation {
  id1: number; // 趋势1的id
  id2: number; // 趋势2的id
  attribute: SingleAttribute; // 比较的属性
  comparator: Comparator; // 比较关系
}

// 趋势组合
export interface TrendGroup {
  ids: [number, number];
  duration_condition?: ScopeCondition;
}

export interface GroupRelation {
  group1: [number, number]; // 第一个组合的趋势id列表
  group2: [number, number]; // 第二个组合的趋势id列表
  comparator: Comparator; // 比较关系
  attribute: GroupAttribute; // 比较的属性
}

export interface QuerySpec {
  targets: string[];
  trends: Trend[];
  single_relations: SingleRelation[];
  trend_groups: TrendGroup[];
  group_relations: GroupRelation[];
  duration_condition?: ScopeCondition;
  time_scope_condition?: ScopeCondition;
  max_value_scope_condition?: ScopeCondition;
  min_value_scope_condition?: ScopeCondition;
  comparator_between_start_end_value?: Comparator;
}

/**
 * QuerySpecWithSource
 */

export interface TextSource {
  text: string; // 原始文本片段
  index: number; // 用于区分text相同但是在原文中位置不同的文本片段，index=0表示第一个，index=1表示第二个，以此类推
  disabled?: boolean; // 是否禁用
}

export interface WithSource {
  text_source_id: number;
}

// 基础条件的 WithSource 版本
export interface CategoryWithSource extends WithSource {
  category: TrendCategory; // 趋势类别
}

// 单位
export enum Unit {
  NUMBER = "number",
  SECOND = "second",
  MINUTE = "minute",
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export interface WithUnit {
  unit?: Unit; // 单位
}


export interface ScopeConditionWithSource extends WithSource, ScopeCondition { }

export interface ScopeConditionWithSourceWithUnit extends ScopeConditionWithSource, WithUnit { }

// 单趋势的 WithSource 版本
export interface TrendWithSource {
  category: CategoryWithSource; // 趋势类别
  slope_scope_condition?: ScopeConditionWithSourceWithUnit; // 斜率的范围条件
  relative_slope_scope_condition?: ScopeConditionWithSource; // 斜率占比的范围条件
  duration_condition?: ScopeConditionWithSourceWithUnit; // 时间跨度的范围条件
}

// 单趋势关系的 WithSource 版本
export interface SingleRelationWithSource extends SingleRelation, WithSource { }

// 趋势组合的 WithSource 版本
export interface TrendGroupWithSource {
  ids: [number, number]; // 组内趋势的id列表,ids[1]>=ids[0]
  duration_condition?: ScopeConditionWithSourceWithUnit; // 该组的时间跨度条件
}

// 组合关系的 WithSource 版本
export interface GroupRelationWithSource extends GroupRelation, WithSource { }

export interface TargetWithSource extends WithSource {
  target: string; // 目标时间序列名
}

export interface ComparatorWithSource extends WithSource {
  comparator: Comparator; // 比较关系
}

export interface QuerySpecWithSource {
  original_text: string; // 原始查询文本
  text_sources: TextSource[]; // QuerySpec中涉及到的所有文本来源
  targets: TargetWithSource[]; // 查询目标列表
  trends: TrendWithSource[]; // 趋势列表
  single_relations: SingleRelationWithSource[]; // 单趋势关系列表
  trend_groups: TrendGroupWithSource[]; // 趋势组合列表
  group_relations: GroupRelationWithSource[]; // 组合关系列表
  duration_condition?: ScopeConditionWithSourceWithUnit; // 总时间跨度的范围条件
  time_scope_condition?: ScopeConditionWithSource; // 时间范围的范围条件
  max_value_scope_condition?: ScopeConditionWithSource; // 最大值的范围条件
  min_value_scope_condition?: ScopeConditionWithSource; // 最小值的范围条件
  comparator_between_start_end_value?: ComparatorWithSource; // 起始值和结束值的比较关系
}


/**
 * Intentions
 */

export enum SingleChoice {
  SLOPE = "slope", // 斜率属性
  RELATIVE_SLOPE = "relative_slope", // 相对斜率属性,单位是%
  DURATION = "duration", // 时间跨度属性,单位是秒
}

export enum GroupChoice {
  DURATION = "duration", // 趋势组合的时间跨度条件
}

export enum SingleRelationChoice {
  SLOPE = "slope", // 斜率关系
  START_VALUE = "start_value", // 起始值关系
  END_VALUE = "end_value", // 结束值关系
  DURATION = "duration", // 时间跨度关系
  RELATIVE_SLOPE = "relative_slope", // 相对斜率关系
}

export enum GroupRelationChoice {
  DURATION = "duration", // 时间跨度关系
}

export enum GlobalChoice {
  DURATION = "duration",
  COMPARE_START_END_VALUE = "compare_start_end_value",
}

export interface SingleSegmentIntention {
  id: number; // 趋势的ID标识
  single_choices: SingleChoice[]; // 该趋势需要考虑的属性列表
}

export interface SegmentGroupIntention {
  ids: [number, number]; // 组合中包含的趋势ID列表
  group_choices: GroupChoice[]; // 该组合需要考虑用作自然语言查询调整的属性列表
}

export interface SingleRelationIntention {
  id1: number; // 第一个趋势的ID
  id2: number; // 第二个趋势的ID
  relation_choices: SingleRelationChoice[]; // 需要比较的关系属性
}

// 趋势组合关系的意图接口定义
export interface GroupRelationIntention {
  group1: [number, number]; // 第一个趋势组合的ID列表,group1[1]>=group1[0]
  group2: [number, number]; // 第二个趋势组合的ID列表,group2[1]>=group2[0]
  relation_choices: GroupRelationChoice[]; // 需要比较的关系属性
}

// 整体查询意图的接口定义
export interface Intentions {
  single_segment_intentions: SingleSegmentIntention[]; // 单个趋势的意图列表
  segment_group_intentions: SegmentGroupIntention[]; // 趋势组合的意图列表
  single_relation_intentions: SingleRelationIntention[]; // 单个趋势关系的意图列表
  group_relation_intentions: GroupRelationIntention[]; // 趋势组合关系的意图列表
  global_intentions: GlobalChoice[]; // 全局意图列表
}