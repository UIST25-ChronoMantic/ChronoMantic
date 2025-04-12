from typing import List, Dict, Any, Union, TypedDict, Optional
from app.query.config import APPROXIMATELY_EQUAL_THRESHOLD
from app.model.config import FLAT_THRESHOLD
from app.utils.time_units import get_appropriate_unit_and_value, get_seconds_of_unit
from app.ai_agent.constant import FUZZY_FACTOR
from copy import deepcopy


def compare_segments(segments: List[dict], ids: List[List[int]] | None = None) -> dict:
    """比较两个segment的各项指标

    Args:
        segments: 要比较的整体segment
        ids: 要比较的segment的id

    Returns:
        比较结果，包含各项指标的比较
    """
    comparisons = {}
    if ids is None:
        max_range = max([segment["max_value"] for segment in segments])
        min_range = min([segment["min_value"] for segment in segments])
        comparisons["compare_start_end_value"] = get_comparator(segments[0]["start_value"], segments[-1]["end_value"], max_range - min_range)
        return comparisons

    segment1 = [segment for segment in segments if segment["start_idx"] >= ids[0][0] and segment["end_idx"] <= ids[0][1]]
    segment2 = [segment for segment in segments if segment["start_idx"] >= ids[1][0] and segment["end_idx"] <= ids[1][1]]

    if len(segment1) > 1 or len(segment2) > 1:
        if "duration" in segment1[0] and "duration" in segment2[0]:
            ranges = [segment["duration"] for segment in segments]
            comparisons["duration"] = get_comparator(
                sum(segment["duration"] for segment in segment1), sum(segment["duration"] for segment in segment2), max(ranges) - min(ranges)
            )
        return comparisons

    segment1 = segment1[0]
    segment2 = segment2[0]

    if "slope" in segment1 and "slope" in segment2:
        ranges = [segment["slope"] for segment in segments]
        comparisons["slope"] = get_comparator(segment1["slope"], segment2["slope"], max(ranges) - min(ranges))

    if "relative_slope" in segment1 and "relative_slope" in segment2:
        ranges = [segment["relative_slope"] for segment in segments]
        comparisons["relative_slope"] = get_comparator(segment1["relative_slope"], segment2["relative_slope"], max(ranges) - min(ranges))

    if "duration" in segment1 and "duration" in segment2:
        ranges = [segment["duration"] for segment in segments]
        comparisons["duration"] = get_comparator(segment1["duration"], segment2["duration"], max(ranges) - min(ranges))

    if "end_value" in segment1 and "end_value" in segment2:
        ranges = [segment["end_value"] for segment in segments]
        comparisons["end_value"] = get_comparator(segment1["end_value"], segment2["end_value"], max(ranges) - min(ranges))

    if "start_value" in segment1 and "start_value" in segment2:
        ranges = [segment["start_value"] for segment in segments]
        comparisons["start_value"] = get_comparator(segment1["start_value"], segment2["start_value"], max(ranges) - min(ranges))

    return comparisons


def add_category_to_intentions(segments: List[dict], segment_intentions: List[dict]) -> None:
    """
    Add user specified trend's category to intentions
    """
    for idx in range(len(segments)):
        for intention in segment_intentions:
            if intention["id"] == idx:
                intention["single_choices"].append(segments[idx]["source"])
                break
        else:
            segment_intentions.append({"id": idx, "single_choices": [segments[idx]["source"]]})
    return segment_intentions


def fix_text_source_id(queryspec: dict) -> dict:
    original_text: str = queryspec["original_text"]
    text_sources: List[dict] = queryspec["text_sources"]
    start_pos = 0

    for text_source in text_sources:
        text = text_source["text"]
        count = original_text.count(text, 0, start_pos)
        start_pos = original_text.find(text, start_pos) + len(text)
        text_source["index"] = count

    return queryspec


def _get_segment_category(segment: dict) -> str:
    if segment["relative_slope"] <= FLAT_THRESHOLD:
        return "flat"
    return "up" if segment["slope"] > 0 else "down"


def get_segment_info(segments: List[dict]) -> List[dict]:
    min_duration = min([segment["duration"] for segment in segments])
    unit_type, base_value = get_appropriate_unit_and_value(min_duration)
    unit_value = get_seconds_of_unit(unit_type)
    return [
        {
            **segment,
            "category": _get_segment_category(segment),
            "unit": unit_type,
            "duration": round(segment["duration"] / unit_value, 2),
            "slope": round(segment["slope"] * unit_value, 2),
        }
        for segment in segments
    ]


def get_comparator(val1: float | int, val2: float | int, range: float | int) -> str:
    if abs(val1 - val2) < range * APPROXIMATELY_EQUAL_THRESHOLD:
        return "~="
    elif val1 == val2:
        return "="
    elif val1 > val2:
        return ">"
    elif val1 < val2:
        return "<"
    else:
        return "~="


def create_scope_condition(value: float | None, unit: str = "second") -> Dict[str, Any]:
    """Create a scope condition based on segment attribute value"""
    if value is None:
        return {}

    val1 = round(value * (1 + FUZZY_FACTOR), 2)
    val2 = round(value * (1 - FUZZY_FACTOR), 2)

    scope_condition = {"max": {"value": val1 if val1 > val2 else val2, "inclusive": True}, "min": {"value": val2 if val1 > val2 else val1, "inclusive": True}}
    if unit:
        scope_condition["unit"] = unit
    return scope_condition


def _update_or_append(lst: List[dict], new_item: dict, match_fn) -> None:
    """Helper function to update existing item or append new item to list

    Args:
        lst: List to update
        new_item: New item to add or update
        match_fn: Function that takes an existing item and returns True if it matches
    """
    for i, existing_item in enumerate(lst):
        if match_fn(existing_item):
            lst[i] = new_item
            return
    lst.append(new_item)


def remove_text_source_id(data: Any) -> Any:
    """Recursively remove text_source_id from any nested structure"""
    if isinstance(data, dict):
        return {k: remove_text_source_id(v) for k, v in data.items() if k != "text_source_id"}
    elif isinstance(data, list):
        return [remove_text_source_id(item) for item in data]
    else:
        return data


def _shift_ids(queryspec: Dict[str, Any], shift_amount: int, start_pos: int) -> None:
    """Shift all ids in queryspec that are >= start_pos by shift_amount"""
    for relation in queryspec["single_relations"]:
        if relation["id1"] >= start_pos:
            relation["id1"] += shift_amount
        if relation["id2"] >= start_pos:
            relation["id2"] += shift_amount

    for group in queryspec["trend_groups"]:
        if group["ids"][0] >= start_pos:
            group["ids"][0] += shift_amount
        if group["ids"][1] >= start_pos:
            group["ids"][1] += shift_amount

    for relation in queryspec["group_relations"]:
        if relation["group1"][0] >= start_pos:
            relation["group1"][0] += shift_amount
        if relation["group1"][1] >= start_pos:
            relation["group1"][1] += shift_amount
        if relation["group2"][0] >= start_pos:
            relation["group2"][0] += shift_amount
        if relation["group2"][1] >= start_pos:
            relation["group2"][1] += shift_amount


def modify_queryspec_by_intentions(old_queryspec_with_source: Dict[str, Any], segments: List[Dict[str, Any]], intentions: Dict[str, Any]) -> Dict[str, Any]:
    """
    Modify QuerySpecWithSource based on segments and intentions.
    """
    if not old_queryspec_with_source:
        new_queryspec = {
            "original_text": "",
            "text_sources": [],
            "targets": [],
            "trends": [],
            "single_relations": [],
            "trend_groups": [],
            "group_relations": [],
        }
    else:
        new_queryspec = deepcopy(old_queryspec_with_source)

    new_queryspec["original_text"] = ""
    new_queryspec["text_sources"] = []

    for key in ["trends", "trend_groups", "single_relations", "group_relations"]:
        if key not in new_queryspec:
            new_queryspec[key] = []

    trends = [] if all(segment.get("source") == "user" for segment in segments) else new_queryspec["trends"]
    inserted_count = 0
    for i, segment in enumerate(segments):
        if segment.get("source") == "user":
            new_trend = {
                "category": {"category": segment["category"]},
            }
            if i < len(trends):
                trends.insert(i, new_trend)
                _shift_ids(new_queryspec, 1, i)
                inserted_count += 1
            else:
                trends.append(new_trend)

    new_queryspec["trends"] = trends

    for intention in intentions.get("single_segment_intentions", []):
        segment_id = intention["id"]
        if segment_id >= len(segments):
            continue

        segment = segments[segment_id]
        trend = new_queryspec["trends"][segment_id]
        for choice in intention["single_choices"]:
            if choice in ["slope", "relative_slope", "duration"]:
                condition_key = f"{choice}_scope_condition" if choice != "duration" else "duration_condition"
                trend[condition_key] = create_scope_condition(segment[choice], unit=segment["unit"] if choice in ["slope", "duration"] else None)

    for intention in intentions.get("segment_group_intentions", []):
        group_ids = intention["ids"]
        new_group = {"ids": group_ids}

        for choice in intention["group_choices"]:
            if choice == "duration":
                duration = sum(segments[i]["duration"] for i in range(group_ids[0], group_ids[1] + 1))
                new_group["duration_condition"] = create_scope_condition(duration, unit=segments[group_ids[0]]["unit"])

        _update_or_append(new_queryspec["trend_groups"], new_group, lambda x: x["ids"] == group_ids)

    for intention in intentions.get("single_relation_intentions", []):
        id1, id2 = intention["id1"], intention["id2"]
        if id1 >= len(segments) or id2 >= len(segments):
            continue

        for choice in intention["relation_choices"]:
            rg = [segment[choice] for segment in segments]
            new_relation = {
                "id1": id1,
                "id2": id2,
                "attribute": choice,
                "comparator": get_comparator(segments[id1][choice], segments[id2][choice], max(rg) - min(rg)),
            }
            _update_or_append(new_queryspec["single_relations"], new_relation, lambda x: x["id1"] == id1 and x["id2"] == id2 and x["attribute"] == choice)

    for intention in intentions.get("group_relation_intentions", []):
        group1, group2 = intention["group1"], intention["group2"]

        for choice in intention["relation_choices"]:
            rg = [segment[choice] for segment in segments]
            val1 = sum(segments[i][choice] for i in range(group1[0], group1[1] + 1))
            val2 = sum(segments[i][choice] for i in range(group2[0], group2[1] + 1))
            new_relation = {"group1": group1, "group2": group2, "attribute": choice, "comparator": get_comparator(val1, val2, max(rg) - min(rg))}

            _update_or_append(
                new_queryspec["group_relations"], new_relation, lambda x: x["group1"] == group1 and x["group2"] == group2 and x["attribute"] == choice
            )

    for intention in intentions.get("global_intentions", []):
        if intention == "duration":
            new_queryspec["duration_condition"] = create_scope_condition(sum([segment["duration"] for segment in segments]), unit=segments[0]["unit"])
        elif intention == "compare_start_end_value":
            min_value = min([segment["min_value"] for segment in segments])
            max_value = max([segment["max_value"] for segment in segments])
            new_queryspec["comparator_between_start_end_value"] = get_comparator(segments[0]["start_value"], segments[-1]["end_value"], max_value - min_value)

    return remove_text_source_id(new_queryspec)


if __name__ == "__main__":
    example_queryspec = {
        "group_relations": [],
        "original_text": "Find a head-and-shoulders pattern.",
        "single_relations": [
            {"attribute": "end_value", "comparator": "<", "id1": 0, "id2": 2, "text_source_id": 0},
            {"attribute": "end_value", "comparator": ">", "id1": 2, "id2": 4, "text_source_id": 0},
        ],
        "targets": [],
        "text_sources": [{"index": 0, "text": "head-and-shoulders"}],
        "trend_groups": [],
        "trends": [
            {"category": {"category": "up", "text_source_id": 0}},
            {"category": {"category": "down", "text_source_id": 0}},
            {"category": {"category": "up", "text_source_id": 0}},
            {"category": {"category": "down", "text_source_id": 0}},
            {"category": {"category": "up", "text_source_id": 0}},
            {"category": {"category": "down", "text_source_id": 0}},
        ],
    }

    example_segments = get_segment_info(
        [
            {
                "duration": 5,
                "end_idx": 169,
                "end_time": 845,
                "end_value": 613,
                "max_value": 653,
                "min_value": 613,
                "r2": 1,
                "relative_slope": 40.4040404040404,
                "slope": 8,
                "source": "user",
                "start_idx": 168,
                "start_time": 840,
                "start_value": 653,
            },
            {
                "duration": 5,
                "end_idx": 169,
                "end_time": 845,
                "end_value": 613,
                "max_value": 653,
                "min_value": 613,
                "r2": 1,
                "relative_slope": 40.4040404040404,
                "slope": 8,
                "source": "result",
                "start_idx": 168,
                "start_time": 840,
                "start_value": 653,
            },
            {
                "duration": 5,
                "end_idx": 169,
                "end_time": 845,
                "end_value": 613,
                "max_value": 653,
                "min_value": 613,
                "r2": 1,
                "relative_slope": 40.4040404040404,
                "slope": 8,
                "source": "result",
                "start_idx": 168,
                "start_time": 840,
                "start_value": 653,
            },
            {
                "duration": 5,
                "end_idx": 170,
                "end_time": 850,
                "end_value": 629,
                "max_value": 629,
                "min_value": 613,
                "r2": 1,
                "relative_slope": 16.161616161616163,
                "slope": 3.2,
                "source": "result",
                "start_idx": 169,
                "start_time": 845,
                "start_value": 613,
            },
            {
                "duration": 5,
                "end_idx": 171,
                "end_time": 855,
                "end_value": 655,
                "max_value": 655,
                "min_value": 629,
                "r2": 1,
                "relative_slope": 26.262626262626267,
                "slope": -5.2,
                "source": "result",
                "start_idx": 170,
                "start_time": 850,
                "start_value": 629,
            },
            {
                "duration": 5,
                "end_idx": 172,
                "end_time": 860,
                "end_value": 674,
                "max_value": 674,
                "min_value": 655,
                "r2": 1,
                "relative_slope": 19.19191919191919,
                "slope": 3.8,
                "source": "result",
                "start_idx": 171,
                "start_time": 855,
                "start_value": 655,
            },
            {
                "duration": 5,
                "end_idx": 173,
                "end_time": 865,
                "end_value": 644,
                "max_value": 674,
                "min_value": 644,
                "r2": 1,
                "relative_slope": 30.303030303030305,
                "slope": -6,
                "source": "result",
                "start_idx": 172,
                "start_time": 860,
                "start_value": 674,
            },
        ]
    )

    example_intentions = {
        "single_segment_intentions": [],
        "segment_group_intentions": [],
        "single_relation_intentions": [],
        "group_relation_intentions": [],
    }

    # Run the example
    result = modify_queryspec_by_intentions(example_queryspec, example_segments, example_intentions)
    print("Example QuerySpec:")
    print(example_queryspec)
    print("Modified QuerySpec:")
    print(result)
