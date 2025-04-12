from typing import List
from typeguard import typechecked
import numpy as np
import pandas as pd

from .config import FLAT_THRESHOLD
from ..MyTypes import ApproximationSegmentsContainer, DatasetInfo, Segment, TrendCategory
from .bottom_up import bottom_up_merge


@typechecked
def approximate_dataset(dataset: pd.DataFrame, dataset_info: DatasetInfo, k: int = 1):
    """对数据集进行近似化处理"""
    approxiamation_segments_containers: List[ApproximationSegmentsContainer] = []
    time_column = dataset_info.time_column
    value_columns = dataset_info.value_columns

    # 判断time_column是否为时间戳字符串
    if pd.api.types.is_numeric_dtype(dataset[time_column]):
        x = dataset[time_column].to_numpy()
    else:
        try:
            x = pd.to_datetime(dataset[time_column]).astype("int64") // 10**9  # 转换为秒
        except:
            x = dataset[time_column].to_numpy()

    for vc in value_columns:
        y = dataset[vc].values
        approxiamation_segments_container = bottom_up_merge(vc, x, y, k)
        approxiamation_segments_container = update_relative_slope(approxiamation_segments_container)
        approxiamation_segments_containers.append(approxiamation_segments_container)

    return approxiamation_segments_containers


@typechecked
def update_relative_slope(approximation_segments_container: ApproximationSegmentsContainer):
    """更新每个segment的relative_slope"""
    # 只找level为0的segments
    level_0_segments = next((segments for segments in approximation_segments_container.approximation_segments_list if segments.approximation_level == 0), None)

    if level_0_segments:
        # 计算level 0的segments的abs_slope的最大值
        max_abs_slope = max(abs(segment.slope) for segment in level_0_segments.segments)

        # 更新所有level的segments的relative_slope
        for approximation_segments in approximation_segments_container.approximation_segments_list:
            for segment in approximation_segments.segments:
                if max_abs_slope > 0:  # 避免除以0
                    segment.relative_slope = abs(segment.slope) / max_abs_slope * 100
                else:
                    segment.relative_slope = 0
                if segment.relative_slope <= FLAT_THRESHOLD:
                    segment.category = TrendCategory.FLAT
                elif segment.slope > 0:
                    segment.category = TrendCategory.UP
                else:
                    segment.category = TrendCategory.DOWN


    return approximation_segments_container


if __name__ == "__main__":
    df = pd.read_csv("../datasets/portfolio_data.csv")
    dataset_info = DatasetInfo(time_column="Date", value_columns=["AMZN", "DPZ"])
    approxiamation_segments_containers = approximate_dataset(df, dataset_info)
    print(approxiamation_segments_containers)
