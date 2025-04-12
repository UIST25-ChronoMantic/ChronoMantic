from dataclasses import dataclass, asdict, fields
from enum import Enum
from typing import Dict, List, Optional, Union, get_type_hints
from .DictMixin import DictMixin


"""Foundamental Data"""


@dataclass
class DatasetInfo(DictMixin):
    time_column: str
    value_columns: List[str]
    column_ratio_dict: Dict[str, float]


@dataclass
class Segment(DictMixin):
    start_idx: int
    end_idx: int
    slope: float
    start_value: float
    end_value: float
    max_value: float
    min_value: float
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    angle: Optional[float] = None
    time_span: Optional[int] = None


@dataclass
class ApproximationSegments(DictMixin):  # 近似的连续分段
    segments: List[Segment]
    approximation_level: int


@dataclass
class ApproximationSegmentsContainer(DictMixin):
    source: str
    approximation_segments_list: List[ApproximationSegments]  # 近似的连续分段列表
    max_approximation_level: int


"""QuerySpec"""


@dataclass
class ThresholdCondition(DictMixin):
    value: float
    inclusive: bool  # 是否包含该值


@dataclass
class SlopeScopeCondition(DictMixin):
    max: Optional[ThresholdCondition] = None
    min: Optional[ThresholdCondition] = None


@dataclass
class AngleScopeCondition(DictMixin):
    max: Optional[ThresholdCondition] = None
    min: Optional[ThresholdCondition] = None


@dataclass
class ValueScopeCondition(DictMixin):
    max: Optional[ThresholdCondition] = None
    min: Optional[ThresholdCondition] = None


@dataclass
class TimeScopeCondition(DictMixin):
    max: Optional[ThresholdCondition] = None
    min: Optional[ThresholdCondition] = None


@dataclass
class TimeSpanCondition(DictMixin):
    max: Optional[ThresholdCondition] = None
    min: Optional[ThresholdCondition] = None


@dataclass
class Trend(DictMixin):
    slope_scope_condition: Optional[SlopeScopeCondition] = None  # 斜率的范围条件
    angle_scope_condition: Optional[AngleScopeCondition] = None  # 角度的范围条件
    time_scope_condition: Optional[TimeScopeCondition] = None  # 时间的范围条件
    time_span_condition: Optional[TimeSpanCondition] = None  # 时间跨度的范围条件


class Attribute(Enum):
    SLOPE = "slope"
    ANGLE = "angle"
    START_VALUE = "start_value"
    END_VALUE = "end_value"
    TIME_SPAN = "time_span"


class Comparator(Enum):
    GREATER = ">"
    LESS = "<"
    EQUAL = "="
    NO_GREATER = "<="
    NO_LESS = ">="
    APPROXIMATELY_EQUAL_TO = "~="


@dataclass
class Relation(DictMixin):  # 不同trend之间的关系
    id1: int
    id2: int
    attribute: Attribute
    comparator: Comparator


@dataclass
class QuerySpec(DictMixin):
    target: str
    trends: Optional[List[Trend]] = None
    relations: Optional[List[Relation]] = None
    time_span_condition: Optional[TimeSpanCondition] = None
    time_scope_condition: Optional[TimeScopeCondition] = None
    value_scope_condition: Optional[ValueScopeCondition] = None
