from typing import Tuple, List
import numpy as np
import pandas as pd
from numpy.typing import NDArray
from scipy.optimize import root_scalar


def calculate_slopes_and_lengths(
    x: NDArray[np.float64], y: NDArray[np.float64], cull_slopeless: bool = True
) -> Tuple[NDArray[np.float64], NDArray[np.float64]]:
    """
    计算所有线段的斜率和长度
    Args:
        x: x轴坐标数组
        y: y轴坐标数组
        cull_slopeless: 是否剔除斜率inf的线段

    Returns:
        slopes: 斜率数组
        lengths: 长度数组
    """
    slopes: List[float] = []
    lengths: List[float] = []

    for i in range(len(x) - 1):
        dx: float = x[i + 1] - x[i]
        dy: float = y[i + 1] - y[i]

        if dx != 0:
            slope: float = dy / dx
        else:
            slope: float = float("inf") if dy > 0 else float("-inf")

        length: float = np.sqrt(dx**2 + dy**2)

        if not cull_slopeless or (dx != 0):
            slopes.append(slope)
            lengths.append(length)

    return np.array(slopes), np.array(lengths)


def compute_weighted_orientation(slopes: NDArray[np.float64], lengths: NDArray[np.float64], aspect_ratio: float) -> float:
    """
    计算加权平均绝对方向
    Args:
        slopes: 斜率数组
        lengths: 长度数组
        aspect_ratio: 纵横比

    Returns:
        加权平均绝对方向
    """
    orientations: NDArray[np.float64] = np.arctan(slopes / aspect_ratio)
    lengths_adjusted: NDArray[np.float64] = np.sqrt((lengths * np.cos(orientations)) ** 2 + (lengths * np.sin(orientations) / aspect_ratio) ** 2)
    return float(np.sum(np.abs(orientations) * lengths_adjusted) / np.sum(lengths_adjusted))


def find_optimal_aspect_ratio(x: NDArray[np.float64], y: NDArray[np.float64], bracket: Tuple[float, float] = (0.000000001, 10000)) -> float:
    """
    找到最优的单位长度比
    Args:
        x: x轴坐标数组
        y: y轴坐标数组
        bracket: 搜索区间

    Returns:
        最优纵横比

    Raises:
        ValueError: 当未能找到最优纵横比时
    """
    slopes, lengths = calculate_slopes_and_lengths(x, y)

    def orientation_diff(aspect_ratio: float) -> float:
        return compute_weighted_orientation(slopes, lengths, aspect_ratio) - np.pi / 4

    result: root_scalar = root_scalar(orientation_diff, bracket=bracket, method="brentq")

    if result.converged:
        return float(result.root)
    else:
        raise ValueError("未能找到最优纵横比")


if __name__ == "__main__":
    csv_path: str = "../portfolio_data.csv"
    data: pd.DataFrame = pd.read_csv(csv_path)

    # 将日期字符串转换为datetime，再转换为时间戳
    time_stamp: NDArray[np.float64] = pd.to_datetime(data["Date"]).astype(np.int64) // 10**9
    value: NDArray[np.float64] = data["AMZN"].values

    # 为了避免数值太大，可以减去最小值
    time_stamp = time_stamp - time_stamp.min()

    optimal_ratio: float = find_optimal_aspect_ratio(time_stamp, value)
    print(f"Optimal aspect ratio: {optimal_ratio}")
