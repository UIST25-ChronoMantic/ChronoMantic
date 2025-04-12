from dataclasses import dataclass, asdict, fields
from enum import Enum
from typing import Dict, List, Optional, Tuple, Union, get_type_hints
from .DictMixin import DictMixin
from pydantic import BaseModel


"""Foundamental Data"""


@dataclass
class DatasetInfo(DictMixin):
    time_column: str
    value_columns: List[str]


@dataclass
class Source(Enum):
    RESULT = "result"  # 来源于查询结果
    USER = "user"  # 来源于用户指定


class TrendCategory(Enum):
    FLAT = "flat"  # 平坦
    UP = "up"  # 上升
    DOWN = "down"  # 下降
    ARBITRARY = "arbitrary"  # 任意


@dataclass
class Segment(DictMixin):
    slope: float
    start_value: float
    end_value: float
    start_idx: Optional[int] = None
    end_idx: Optional[int] = None
    max_value: Optional[float] = None
    min_value: Optional[float] = None
    start_time: Optional[int] = None
    end_time: Optional[int] = None
    relative_slope: Optional[float] = None  # Changed from relative_slope
    duration: Optional[int] = None
    source: Optional[Source] = None
    r2: Optional[float] = None
    score: Optional[float] = None
    category: Optional[TrendCategory] = None


@dataclass
class SegmentGroup(DictMixin):
    ids: Tuple[int, int]  # 组内趋势的id列表，ids[1]>=ids[0]
    duration: int  # Changed from duration


@dataclass
class ApproximationSegments(DictMixin):
    segments: List[Segment]  # 近似的连续分段列表
    approximation_level: int  # 近似程度


@dataclass
class ApproximationSegmentsContainer(DictMixin):
    source: str  # 数据来源
    approximation_segments_list: List[ApproximationSegments]  # 近似的连续分段列表
    max_approximation_level: int  # 最大近似程度


"""QuerySpec"""


@dataclass
class ThresholdCondition(DictMixin):
    value: float  # 阈值
    inclusive: bool  # 是否包含该值


@dataclass
class ScopeCondition(DictMixin):
    max: Optional[ThresholdCondition] = None  # 最大值条件
    min: Optional[ThresholdCondition] = None  # 最小值条件


@dataclass
class Trend(DictMixin):
    category: TrendCategory
    slope_scope_condition: Optional[ScopeCondition] = None
    relative_slope_scope_condition: Optional[ScopeCondition] = None  # Changed from relative_slope_scope_condition
    duration_condition: Optional[ScopeCondition] = None


class SingleAttribute(Enum):
    SLOPE = "slope"  # 斜率
    START_VALUE = "start_value"  # 起始值
    END_VALUE = "end_value"  # 结束值
    DURATION = "duration"  # 持续时间,单位是秒
    RELATIVE_SLOPE = "relative_slope"  # 相对斜率,单位是%


class GroupAttribute(Enum):
    DURATION = "duration"  # 持续时间,单位是秒


class Comparator(Enum):
    GREATER = ">"  # 大于
    LESS = "<"  # 小于
    EQUAL = "="  # 等于
    NO_GREATER = "<="  # 小于等于
    NO_LESS = ">="  # 大于等于
    APPROXIMATELY_EQUAL_TO = "~="  # 近似等于


@dataclass
class SingleRelation(DictMixin):  # 两个单趋势之间的比较关系
    id1: int  # 趋势1的id
    id2: int  # 趋势2的id
    attribute: SingleAttribute  # 比较的属性
    comparator: Comparator  # 比较关系


@dataclass
class TrendGroup(DictMixin):  # 趋势组合
    ids: Tuple[int, int]  # 组内趋势的id列表，ids[1]>=ids[0]
    duration_condition: Optional[ScopeCondition] = None  # Changed from duration_condition


@dataclass
class GroupRelation(DictMixin):
    group1: Tuple[int, int]  # 第一个组合的趋势id列表
    group2: Tuple[int, int]  # 第二个组合的趋势id列表
    comparator: Comparator  # 比较关系
    attribute: GroupAttribute  # 比较的属性


@dataclass
class QuerySpec(DictMixin):
    targets: List[str]  # 查询的目标时间序列名列表
    trends: List[Trend]  # 趋势列表
    single_relations: List[SingleRelation]  # 不同趋势之间的属性比较关系列表
    trend_groups: List[TrendGroup]  # 趋势组合列表
    group_relations: List[GroupRelation]  # 组合之间的关系列表
    duration_condition: Optional[ScopeCondition] = None  # Changed from duration_condition
    time_scope_condition: Optional[ScopeCondition] = None  # 时间范围的范围条件
    max_value_scope_condition: Optional[ScopeCondition] = None  # 最大值的范围条件
    min_value_scope_condition: Optional[ScopeCondition] = None  # 最小值的范围条件
    comparator_between_start_end_value: Optional[Comparator] = None  # 起始值和结束值的比较关系


class TextSource(BaseModel):
    text: str  # 原始文本片段


class WithSource(BaseModel):
    text_source_id: int


class CategoryWithSource(BaseModel):
    text_source_id: int
    category: TrendCategory


class Unit(Enum):
    NUMBER = "number"
    SECOND = "second"
    MINUTE = "minute"
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"


class ScopeConditionWithSource(BaseModel):
    text_source_id: int  # 从 WithSource 继承
    max: Optional[ThresholdCondition] = None  # 从 ScopeCondition 继承
    min: Optional[ThresholdCondition] = None  # 从 ScopeCondition 继承


class ScopeConditionWithSourceWithUnit(BaseModel):
    text_source_id: int  # 从 WithSource 继承
    max: Optional[ThresholdCondition] = None  # 从 ScopeCondition 继承
    min: Optional[ThresholdCondition] = None  # 从 ScopeCondition 继承
    unit: Optional[Unit] = None  # 从 WithUnit 继承


class TrendWithSource(BaseModel):
    category: CategoryWithSource
    slope_scope_condition: Optional[ScopeConditionWithSourceWithUnit] = None
    relative_slope_scope_condition: Optional[ScopeConditionWithSource] = None
    duration_condition: Optional[ScopeConditionWithSourceWithUnit] = None


class SingleRelationWithSource(BaseModel):
    text_source_id: int  # 从 WithSource 继承
    id1: int  # 从 SingleRelation 继承
    id2: int  # 从 SingleRelation 继承
    attribute: SingleAttribute  # 从 SingleRelation 继承
    comparator: Comparator  # 从 SingleRelation 继承


class TrendGroupWithSource(BaseModel):
    ids: Tuple[int, int]
    duration_condition: Optional[ScopeConditionWithSourceWithUnit] = None


class GroupRelationWithSource(BaseModel):
    text_source_id: int  # 从 WithSource 继承
    group1: Tuple[int, int]  # 从 GroupRelation 继承
    group2: Tuple[int, int]  # 从 GroupRelation 继承
    comparator: Comparator  # 从 GroupRelation 继承
    attribute: GroupAttribute  # 从 GroupRelation 继承


class TargetWithSource(BaseModel):
    text_source_id: int  # 从 WithSource 继承
    target: str


class ComparatorWithSource(BaseModel):
    text_source_id: int  # 从 WithSource 继承
    comparator: Comparator


class QuerySpecWithSource(BaseModel):
    original_text: str  # 原始查询文本
    text_sources: List[TextSource]  # QuerySpec中涉及到的所有文本来源
    targets: List[TargetWithSource]  # 查询目标列表
    trends: List[TrendWithSource]  # 趋势列表
    single_relations: List[SingleRelationWithSource]  # 单趋势关系列表
    trend_groups: List[TrendGroupWithSource]  # 趋势组合列表
    group_relations: List[GroupRelationWithSource]  # 组合关系列表
    duration_condition: Optional[ScopeConditionWithSourceWithUnit] = None  # 总时间跨度的范围条件
    time_scope_condition: Optional[ScopeConditionWithSource] = None  # 时间范围的范围条件
    max_value_scope_condition: Optional[ScopeConditionWithSource] = None  # 最大值的范围条件
    min_value_scope_condition: Optional[ScopeConditionWithSource] = None  # 最小值的范围条件
    comparator_between_start_end_value: Optional[ComparatorWithSource] = None  # 起始值和结束值的比较关系
