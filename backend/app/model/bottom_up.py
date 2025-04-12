from dataclasses import dataclass
import time
from typing import List
import numpy as np
import heapq
import matplotlib.pyplot as plt
import pandas as pd
from ..MyTypes import ApproximationSegments, ApproximationSegmentsContainer, DatasetInfo, Segment


@dataclass
class CostWrapper:
    cost: float
    seg1: Segment
    seg2: Segment

    def __lt__(self, other):
        """仅根据 cost 进行比较，避免比较 Segment 对象"""
        return self.cost < other.cost


def segment_error(x: np.ndarray, y: np.ndarray, start: int, end: int) -> tuple[float, float]:
    """计算线性拟合的平方误差和和R2值"""
    if end - start <= 0:
        raise ValueError("段长度必须大于0")

    x1, y1 = x[start], y[start]
    x2, y2 = x[end], y[end]
    m = (y2 - y1) / (x2 - x1)
    b = y1 - m * x1

    x_seg = x[start : end + 1]
    y_pred = m * x_seg + b
    y_actual = y[start : end + 1]

    # 计算误差
    sum_error = np.sum((y_actual - y_pred) ** 2)

    # 计算R2
    y_mean = np.mean(y_actual)
    ss_tot = np.sum((y_actual - y_mean) ** 2)
    r2 = 1 - (sum_error / ss_tot) if ss_tot != 0 else 1.0

    return sum_error, r2


def calculate_merge_cost(x: np.ndarray, y: np.ndarray, segment1: Segment, segment2: Segment):
    """计算合并两段的代价"""
    start1, end1 = segment1.start_idx, segment1.end_idx
    start2, end2 = segment2.start_idx, segment2.end_idx

    error, _ = segment_error(x, y, start1, end2)
    error1, _ = segment_error(x, y, start1, end1)
    error2, _ = segment_error(x, y, start2, end2)

    return error - (error1 + error2)


def calculate_percentage_metrics(start_value: float, end_value: float, duration: float) -> tuple[float | None, float | None]:
    """计算变化率相关的指标"""
    if start_value <= 0:
        return None, None

    delta_percentage = ((end_value - start_value) / start_value) * 100
    days = duration / (24 * 3600)
    daily_average_delta_percentage = (pow(1 + delta_percentage / 100, 1 / days) - 1) * 100

    return delta_percentage, daily_average_delta_percentage


def calculate_segment_score(x: np.ndarray, y: np.ndarray, segment: Segment) -> float:
    return segment.r2
    """计算segment的分数
    
    对于上升趋势：
    - end_time接近max_time且start_time接近min_time时分数高
    - end_value接近max_value且start_value接近min_value时分数高
    
    对于下降趋势：
    - end_time接近min_time且start_time接近max_time时分数高
    - end_value接近min_value且start_value接近max_value时分数高
    
    返回值范围：[0, 1]，越接近1表示匹配度越好
    """
    # 获取segment内的所有时间点和值
    start_idx = segment.start_idx
    end_idx = segment.end_idx + 1

    # 确保使用numpy数组切片
    segment_x = x[start_idx:end_idx]
    segment_y = y[start_idx:end_idx]

    if len(segment_y) <= 1:
        return 1.0

    # 找到最大值和最小值的时间点
    max_value_idx = start_idx + np.argmax(segment_y)
    min_value_idx = start_idx + np.argmin(segment_y)
    max_time = x[max_value_idx]
    min_time = x[min_value_idx]
    max_value = y[max_value_idx]
    min_value = y[min_value_idx]

    # 计算时间跨度和值跨度
    time_span = segment.end_time - segment.start_time
    value_span = max_value - min_value

    if time_span == 0:
        return 1.0

    if value_span == 0:
        value_span = 1.0  # 避免除以零

    # 根据斜率判断趋势
    if segment.slope > 0:  # 上升趋势
        # 时间匹配度评分
        end_time_score = 1 - abs(max_time - segment.end_time) / time_span
        start_time_score = 1 - abs(min_time - segment.start_time) / time_span

        # 值匹配度评分
        end_value_score = 1 - abs(max_value - segment.end_value) / value_span if value_span > 0 else 1.0
        start_value_score = 1 - abs(min_value - segment.start_value) / value_span if value_span > 0 else 1.0
    else:  # 下降趋势
        # 时间匹配度评分
        end_time_score = 1 - abs(min_time - segment.end_time) / time_span
        start_time_score = 1 - abs(max_time - segment.start_time) / time_span

        # 值匹配度评分
        end_value_score = 1 - abs(min_value - segment.end_value) / value_span if value_span > 0 else 1.0
        start_value_score = 1 - abs(max_value - segment.start_value) / value_span if value_span > 0 else 1.0

    time_score = end_time_score * start_time_score
    value_score = end_value_score * start_value_score
    final_score = time_score * value_score

    return max(0.0, min(1.0, final_score))  # 确保分数在0-1之间


def create_segment(x: np.ndarray, y: np.ndarray, start_idx: int, end_idx: int) -> Segment:
    """创建一个线段，避免重复计算"""
    start_value = y[start_idx]
    end_value = y[end_idx]
    start_time = x[start_idx]
    end_time = x[end_idx]
    duration = end_time - start_time
    slope = (end_value - start_value) / (end_time - start_time)

    # 获取线段内的所有值
    segment_y = y[start_idx : end_idx + 1]
    max_value = max(segment_y)
    min_value = min(segment_y)

    # 计算R2值
    _, r2 = segment_error(x, y, start_idx, end_idx)

    # 创建临时段用于计算分数
    temp_segment = Segment(
        start_idx=start_idx,
        end_idx=end_idx,
        slope=slope,
        start_value=start_value,
        end_value=end_value,
        max_value=max_value,
        min_value=min_value,
        start_time=start_time,
        end_time=end_time,
        duration=duration,
        r2=r2,
    )

    # 计算分数
    score = calculate_segment_score(x, y, temp_segment)

    # 创建完整的段
    return Segment(
        start_idx=start_idx,
        end_idx=end_idx,
        slope=slope,
        start_value=start_value,
        end_value=end_value,
        max_value=max_value,
        min_value=min_value,
        start_time=start_time,
        end_time=end_time,
        duration=duration,
        r2=r2,
        score=score,
    )


def bottom_up_merge(value_column: str, x: np.ndarray, y: np.ndarray, k: int):
    """自底向上分段合并"""
    n = len(y)
    if k >= n:
        raise ValueError("k不能大于或等于数据长度")

    # 初始化每个点之间的线段
    segments: List[Segment] = []
    for i in range(n - 1):
        segments.append(create_segment(x, y, i, i + 1))

    # 初始化合并代价堆
    cost_heap: List[CostWrapper] = []

    def update_costs(i: int):
        """更新与索引i相关的合并代价"""
        if i < len(segments) - 1 and segments[i].end_idx == segments[i + 1].start_idx:
            cost = calculate_merge_cost(x, y, segments[i], segments[i + 1])
            heapq.heappush(cost_heap, CostWrapper(cost, segments[i], segments[i + 1]))

    # 初始化所有相邻段的合并代价
    for i in range(len(segments) - 1):
        update_costs(i)

    # 保存不同近似级别的分段结果
    approximation_segments_list: List[ApproximationSegments] = [ApproximationSegments(segments=segments.copy(), approximation_level=0)]
    current_segments_length = len(segments)
    current_level = 0

    # 合并段直到达到目标数量k
    while len(segments) > k:
        # 找到代价最小的合并操作
        while cost_heap:
            wrapper = heapq.heappop(cost_heap)
            seg1, seg2 = wrapper.seg1, wrapper.seg2
            if seg1 in segments and seg2 in segments and seg1.end_idx == seg2.start_idx:
                break
        else:
            # 如果没有找到有效的合并操作，重新计算所有合并代价
            cost_heap = []
            for i in range(len(segments) - 1):
                update_costs(i)
            continue

        # 获取要合并的段的索引
        i = segments.index(seg1)
        j = segments.index(seg2)

        # 合并两个段
        segments[i] = create_segment(x, y, seg1.start_idx, seg2.end_idx)
        segments.pop(j)

        # 当段数减半时，保存当前近似级别的结果
        if len(segments) == current_segments_length // 2:
            current_level += 1
            approximation_segments_list.append(ApproximationSegments(segments=segments.copy(), approximation_level=current_level))
            current_segments_length = len(segments)

        # 更新受影响的合并代价
        if i > 0:
            update_costs(i - 1)
        if i < len(segments) - 1:
            update_costs(i)

    # 创建结果容器
    approximation_segments_container = ApproximationSegmentsContainer(
        source=value_column, approximation_segments_list=approximation_segments_list, max_approximation_level=current_level
    )

    return approximation_segments_container


def visualize_segments(y, segments: List[Segment], level: int = 0):
    """可视化分段结果"""
    fig, ax = plt.subplots(figsize=(15, 3))
    fig.patch.set_alpha(0.0)
    ax.patch.set_alpha(0.0)

    # 原始数据
    x = np.arange(len(y))
    ax.plot(x, y, color="gray", alpha=0.8, linewidth=6)

    # 分段拟合
    for seg in segments:
        start, end = seg.start_idx, seg.end_idx
        ax.plot([start, end], [y[start], y[end]], color="#FF9800", linewidth=6)

    # 隐藏边框和坐标轴
    ax.set_frame_on(False)
    ax.set_xticks([])
    ax.set_yticks([])

    plt.tight_layout()
    plt.savefig(f"segments_{level}.png", transparent=True)
    # plt.show()


if __name__ == "__main__":
    # 加载数据
    data = pd.read_csv("../datasets/portfolio_data.csv")
    x = data["AMZN"].index[1200:]
    y = data["AMZN"].values[1200:]

    # 分段
    start_time = time.time()
    approximation_segments_container = bottom_up_merge("AMZN", x, y, k=1)
    print(f"耗时: {time.time() - start_time:.4f} 秒")

    for approximation_segments in approximation_segments_container.approximation_segments_list:
        print(len(approximation_segments.segments))
        visualize_segments(y, approximation_segments.segments, approximation_segments.approximation_level)
    # print(approximation_segments_container.max_approximation_level)
    # for seg in segments:
    #     print(seg)
    # print(f"耗时: {time.time() - start_time:.4f} 秒")

    # # 输出结果
    # for i, seg in enumerate(segments, 1):
    #     error = segment_error(x, y, seg.start_idx, seg.end_idx)
    #     print(f"段 {i}: [{seg.start_idx}-{seg.end_idx}], 平方误差和={error:.4f}")

    # 可视化
    # visualize_segments(y, approximation_segments.segments)
