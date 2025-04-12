from typing import Tuple, List

TIME_UNITS = {"year": 86400 * 365, "month": 86400 * 30, "week": 86400 * 7, "day": 86400, "hour": 3600, "minute": 60, "second": 1}

ORDERED_UNITS: List[Tuple[str, int]] = [(unit, seconds) for unit, seconds in sorted(TIME_UNITS.items(), key=lambda x: x[1], reverse=True)]


def get_seconds_of_unit(unit: str) -> int:
    """获取指定时间单位对应的秒数"""
    return TIME_UNITS.get(unit, 1)


def get_unit_of_seconds(seconds: int) -> str:
    """根据秒数获取最大的合适时间单位"""
    for unit, unit_seconds in ORDERED_UNITS:
        if seconds >= unit_seconds:
            return unit
    return "second"


def get_appropriate_unit_and_value(seconds: float) -> Tuple[str, float]:
    """智能选择最合适的时间单位和对应的值

    选择策略：
    1. 优先选择能得到较为整齐数值的较大单位
    2. 对于接近整数或0.5的值进行舍入

    Args:
        seconds: 秒数

    Returns:
        Tuple[str, float]: (单位, 转换后的值)
        例如：
        - 14 * 86400 秒 -> ("week", 2.0)  # 14天转换为2周
        - 90 * 86400 秒 -> ("month", 3.0)  # 90天转换为3个月
    """
    for unit, unit_seconds in ORDERED_UNITS:
        value = seconds / unit_seconds
        if value >= 1:
            rounded = round(value, 1)
            if abs(rounded - value) < 0.1:
                return unit, round(rounded, 2)

    return "second", round(seconds, 2)
