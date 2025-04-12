from typing import List, Optional, Dict
import numpy
import pandas as pd
from typeguard import typechecked

from ..MyTypes import ApproximationSegmentsContainer, QuerySpec, Segment, ThresholdCondition, ScopeCondition


@typechecked
def check_double_threshold_condition(
    min_value: float | numpy.int64, max_value: float | numpy.int64, min_thresh: Optional[ThresholdCondition], max_thresh: Optional[ThresholdCondition]
) -> bool:
    """检查双值是否满足阈值条件"""
    if max_thresh:
        if max_thresh.inclusive:
            if max_value > max_thresh.value:
                return False
        else:
            if max_value >= max_thresh.value:
                return False

    if min_thresh:
        if min_thresh.inclusive:
            if min_value < min_thresh.value:
                return False
        else:
            if min_value <= min_thresh.value:
                return False
    return True


@typechecked
def check_single_threshold_condition(value: float | numpy.int64, min_thresh: Optional[ThresholdCondition], max_thresh: Optional[ThresholdCondition]) -> bool:
    """检查单值是否满足阈值条件"""
    if max_thresh:
        if max_thresh.inclusive:
            if value > max_thresh.value:
                return False
        else:
            if value >= max_thresh.value:
                return False
    if min_thresh:
        if min_thresh.inclusive:
            if value < min_thresh.value:
                return False
        else:
            if value <= min_thresh.value:
                return False
    return True


@typechecked
def query_by_no_trends(
    query_spec: QuerySpec, approximation_segments_container: ApproximationSegmentsContainer, df: pd.DataFrame
) -> Dict[int, List[List[Segment]]]:
    """根据无趋势的查询规范查询数据集"""
    duration_condition = query_spec.duration_condition
    time_scope_condition = query_spec.time_scope_condition
    max_value_scope_condition = query_spec.max_value_scope_condition
    min_value_scope_condition = query_spec.min_value_scope_condition

    segments = approximation_segments_container.approximation_segments_list[0].segments

    filtered_results = []

    if max_value_scope_condition or min_value_scope_condition:
        filtered_results = [
            segment
            for segment in segments
            if (
                not max_value_scope_condition
                or check_single_threshold_condition(segment.max_value, max_value_scope_condition.min, max_value_scope_condition.max)
            )
            and (
                not min_value_scope_condition
                or check_single_threshold_condition(segment.min_value, min_value_scope_condition.min, min_value_scope_condition.max)
            )
        ]
    else:
        filtered_results = segments

    if time_scope_condition:
        # 过滤时间范围
        filtered_results = [
            segment
            for segment in filtered_results
            if check_double_threshold_condition(segment.start_time, segment.end_time, time_scope_condition.min, time_scope_condition.max)
        ]

    # 对filtered_results进行拼接，连续的segment合并
    results: List[List[Segment]] = []
    current_result = []
    for segment in filtered_results:
        if not current_result:  # current_result为空
            current_result.append(segment)
        else:
            if current_result[-1].end_idx == segment.start_idx:
                current_result.append(segment)
            else:
                results.append(current_result)
                current_result = [segment]

    if current_result:
        results.append(current_result)

    # 过滤时间跨度
    if duration_condition:
        results = [
            result
            for result in results
            if check_single_threshold_condition(result[-1].end_time - result[0].start_time, duration_condition.min, duration_condition.max)
        ]

    return {0: results}
