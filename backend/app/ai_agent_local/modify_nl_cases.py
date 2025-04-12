from app.utils.queryspec import get_segment_info, modify_queryspec_by_intentions
from .constant import FUZZY_FACTOR

# case3 = {
#     "old_queryspec_with_source": {
#         "group_relations": [],
#         "original_text": "find a head-and-shoulders shape",
#         "single_relations": [
#             {"attribute": "end_value", "comparator": "<", "id1": 0, "id2": 2, "text_source_id": 0},
#             {"attribute": "end_value", "comparator": ">", "id1": 2, "id2": 4, "text_source_id": 0},
#         ],
#         "targets": [],
#         "text_sources": [{"index": 0, "text": "head-and-shoulders"}],
#         "trend_groups": [],
#         "trends": [
#             {"category": {"category": "up", "text_source_id": 0}},
#             {"category": {"category": "down", "text_source_id": 0}},
#             {"category": {"category": "up", "text_source_id": 0}},
#             {"category": {"category": "down", "text_source_id": 0}},
#             {"category": {"category": "up", "text_source_id": 0}},
#             {"category": {"category": "down", "text_source_id": 0}},
#         ],
#     },
#     "segments": [
#         {
#             "duration": 172800,
#             "end_idx": 1161,
#             "end_time": 1512604800,
#             "end_value": 16850.31055,
#             "max_value": 16850.31055,
#             "min_value": 11667.12988,
#             "r2": 0.9809464141702676,
#             "relative_slope": 83.57973046461963,
#             "slope": 0.02999525850694443,
#             "source": "user",
#             "start_idx": 1159,
#             "start_time": 1512432000,
#             "start_value": 11667.12988,
#         },
#         {
#             "duration": 86400,
#             "end_idx": 1162,
#             "end_time": 1512691200,
#             "end_value": 16047.61035,
#             "max_value": 16850.31055,
#             "min_value": 16047.61035,
#             "r2": 1,
#             "relative_slope": 25.887373268003827,
#             "slope": -0.009290511574074045,
#             "source": "user",
#             "start_idx": 1161,
#             "start_time": 1512604800,
#             "start_value": 16850.31055,
#         },
#         {
#             "duration": 345600,
#             "end_idx": 1164,
#             "end_time": 1513036800,
#             "end_value": 17083.90039,
#             "max_value": 17083.90039,
#             "min_value": 16047.61035,
#             "r2": 0.9846441247302951,
#             "relative_slope": 8.355182632131726,
#             "slope": 0.0029985244212962906,
#             "source": "result",
#             "start_idx": 1162,
#             "start_time": 1512691200,
#             "start_value": 16047.61035,
#         },
#         {
#             "duration": 86400,
#             "end_idx": 1165,
#             "end_time": 1513123200,
#             "end_value": 16286.82031,
#             "max_value": 17083.90039,
#             "min_value": 16286.82031,
#             "r2": 1,
#             "relative_slope": 25.70612235483486,
#             "slope": -0.009225463888888886,
#             "source": "result",
#             "start_idx": 1164,
#             "start_time": 1513036800,
#             "start_value": 17083.90039,
#         },
#         {
#             "duration": 432000,
#             "end_idx": 1168,
#             "end_time": 1513555200,
#             "end_value": 18972.32031,
#             "max_value": 18972.32031,
#             "min_value": 16286.82031,
#             "r2": 0.9595590652166507,
#             "relative_slope": 17.321670260260184,
#             "slope": 0.006216435185185185,
#             "source": "result",
#             "start_idx": 1165,
#             "start_time": 1513123200,
#             "start_value": 16286.82031,
#         },
#         {
#             "duration": 345600,
#             "end_idx": 1172,
#             "end_time": 1513900800,
#             "end_value": 13664.96973,
#             "max_value": 18972.32031,
#             "min_value": 13664.96973,
#             "r2": 0.9720600375926487,
#             "relative_slope": 42.79099641703621,
#             "slope": -0.015356917187499996,
#             "source": "result",
#             "start_idx": 1168,
#             "start_time": 1513555200,
#             "start_value": 18972.32031,
#         },
#         {
#             "duration": 345600,
#             "end_idx": 1173,
#             "end_time": 1514246400,
#             "end_value": 15756.55957,
#             "max_value": 15756.55957,
#             "min_value": 13664.96973,
#             "r2": 1,
#             "relative_slope": 16.863633181991403,
#             "slope": 0.006052053935185182,
#             "source": "result",
#             "start_idx": 1172,
#             "start_time": 1513900800,
#             "start_value": 13664.96973,
#         },
#         {
#             "duration": 172800,
#             "end_idx": 1175,
#             "end_time": 1514419200,
#             "end_value": 14398.7002,
#             "max_value": 15756.55957,
#             "min_value": 14398.7002,
#             "r2": 0.8849008179402116,
#             "relative_slope": 21.895729163046575,
#             "slope": -0.00785798246527778,
#             "source": "result",
#             "start_idx": 1173,
#             "start_time": 1514246400,
#             "start_value": 15756.55957,
#         },
#         {
#             "duration": 604800,
#             "end_idx": 1179,
#             "end_time": 1515024000,
#             "end_value": 15180.08008,
#             "max_value": 15180.08008,
#             "min_value": 14392.57031,
#             "r2": 0.8951069597610105,
#             "relative_slope": 3.599969313871233,
#             "slope": 0.0012919640873015879,
#             "source": "user",
#             "start_idx": 1175,
#             "start_time": 1514419200,
#             "start_value": 14398.7002,
#         },
#     ],
#     "segment_group_ids": [],
#     "intentions": {"single_segment_intentions": [], "segment_group_intentions": [], "single_relation_intentions": [], "group_relation_intentions": []},
# }

# case3["segments"] = get_segment_info(case3["segments"])
# case3["new_queryspec_with_source_without_text_sources"] = modify_queryspec_by_intentions(
#     case3["old_queryspec_with_source"], case3["segments"], case3["intentions"]
# )
# print(case3["new_queryspec_with_source_without_text_sources"])


class ModifyNL_Cases:
    case1 = """输入：
old_queryspec_with_source
```{
  "group_relations": [],
  "original_text": "find a double top trend",
  "single_relations": [
    {
      "attribute": "end_value",
      "comparator": "~=",
      "id1": 0,
      "id2": 2,
      "text_source_id": 0
    }
  ],
  "targets": [],
  "text_sources": [
    {
      "index": 0,
      "text": "double top"
    }
  ],
  "trend_groups": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      }
    }
  ]
}
```

new_queryspec_with_source_without_text_sources
```
{
  "group_relations": [],
  "original_text": "",
  "single_relations": [{'attribute': 'end_value', 'comparator': '~=', 'id1': 1, 'id2': 3}],
  "targets": [],
  "text_sources": [],
  "trend_groups": [],
  "trends": [{'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}}
}
```

intentions
```
{
  "single_segment_intentions": [
    { "id": 0, "single_choices": ["user"] },
    { "id": 1, "single_choices": ["result"] },
    { "id": 2, "single_choices": ["result"] },
    { "id": 3, "single_choices": ["result"] },
    { "id": 4, "single_choices": ["result"] }
  ],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

解释：
1. 分析输入数据:
  - old_queryspec_with_source 包含原始的 "double top" 形态
  - new_queryspec_with_source_without_text_sources 包含5个趋势段
  - intentions 显示趋势段的来源(user/result)

2. 分析趋势段来源:
  - id 0: user 指定的新增趋势
  - id 1-4: result 标记，与原始 double top 形态匹配

3. 分析关系:
  - single_relations 保持不变，因为它们来自原始的 double top 形态
  - text_source_id 需要更新以匹配新的文本源

4. 生成自然语言描述:
  - 开始: 描述 user 指定的上升趋势
  - 中间: 保持原始的 double top 形态描述

输出：
{
  "original_text": "find a rising trend followed by a double top trend",
  "text_sources": [
    {
      "index": 0,
      "text": "rising trend"
    },
    {
      "index": 0,
      "text": "double top"
    }
  ],
  "single_relations": [
    {
      "attribute": "end_value",
      "comparator": "~=",
      "id1": 1,
      "id2": 3,
      "text_source_id": 1
    }
  ],
  "targets": [],
  "trend_groups": [],
  "group_relations": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      }
    }
  ]
}
    """

    case2 = """输入：
old_queryspec_with_source
```
{
  "group_relations": [],
  "original_text": "find a head-and-shoulders shape",
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
  ]
}
```

new_queryspec_with_source_without_text_sources
```
{'group_relations': [], 'original_text': '', 'single_relations': [{'attribute': 'end_value', 'comparator': '<', 'id1': 2, 'id2': 4}, {'attribute': 'end_value', 'comparator': '>', 'id1': 4, 'id2': 6}], 'targets': [], 'text_sources': [], 'trend_groups': [], 'trends': [{'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}]}
```

intentions
```
{
  "single_segment_intentions": [
    { "id": 0, "single_choices": ["user"] },
    { "id": 1, "single_choices": ["user"] },
    { "id": 2, "single_choices": ["result"] },
    { "id": 3, "single_choices": ["result"] },
    { "id": 4, "single_choices": ["result"] },
    { "id": 5, "single_choices": ["result"] },
    { "id": 6, "single_choices": ["result"] },
    { "id": 7, "single_choices": ["result"] },
    { "id": 8, "single_choices": ["user"] }
  ],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

解释：
1. 分析输入数据:
  - old_queryspec_with_source 包含原始的 "head-and-shoulders" 形态
  - new_queryspec_with_source_without_text_sources 包含9个趋势段
  - intentions 显示趋势段的来源(user/result)

2. 分析趋势段来源:
  - id 0-1: user 指定的新增趋势
  - id 2-7: result 标记，与原始 head-and-shoulders 形态匹配
  - id 8: user 指定的新增趋势

3. 分析关系:
  - single_relations 保持不变，因为它们来自原始的 head-and-shoulders 形态
  - text_source_id 需要更新以匹配新的文本源

4. 生成自然语言描述:
  - 开始: 描述 user 指定的上升和下降趋势
  - 中间: 保持原始的 head-and-shoulders 形态描述
  - 结束: 描述 user 指定的上升趋势

输出：
{
  "original_text": "find a trend that rises, then falls, followed by a head-and-shoulders shape, and ending with a final rise",
  "targets": [],
  "text_sources": [
    {"index": 0, "text": "rises"},
    {"index": 0, "text": "falls"},
    {"index": 0, "text": "head-and-shoulders"},
    {"index": 0, "text": "rise"}
  ],
  "trends": [
    {"category": {"category": "up", "text_source_id": 0}},
    {"category": {"category": "down", "text_source_id": 1}},
    {"category": {"category": "up", "text_source_id": 2}},
    {"category": {"category": "down", "text_source_id": 2}},
    {"category": {"category": "up", "text_source_id": 2}},
    {"category": {"category": "down", "text_source_id": 2}},
    {"category": {"category": "up", "text_source_id": 2}},
    {"category": {"category": "down", "text_source_id": 2}},
    {"category": {"category": "up", "text_source_id": 3}}
  ],
  "trend_groups": [],
  "single_relations": [
      {"attribute": "end_value", "comparator": "<", "id1": 2, "id2": 4, "text_source_id": 2},
      {"attribute": "end_value", "comparator": ">", "id1": 4, "id2": 6, "text_source_id": 2},
  ],
  "group_relations": []
}
"""

    case3 = """输入：
old_queryspec_with_source
```
null
```
new_queryspec_with_source_without_text_sources
```
{'original_text': '', 'text_sources': [], 'targets': [], 'trends': [{'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}], 'single_relations': [], 'trend_groups': [{'ids': [1, 3], 'duration_condition': {'min': {'value': '22.5', 'inclusive': true}, 'max': {'value': '27.5', 'inclusive': true}, 'unit': 'day'}}], 'group_relations': []}
```

intentions
```
{
  "single_segment_intentions": [
    { "id": 0, "single_choices": ["user"] },
    { "id": 1, "single_choices": ["user"] },
    { "id": 2, "single_choices": ["user"] },
    { "id": 3, "single_choices": ["user"] },
    { "id": 4, "single_choices": ["user"] }
  ],
  "segment_group_intentions": [
    { "ids": [1, 3], "group_choices": ["duration"] }
  ],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "find a trend that falls then rises three times with a duration of about 25 days and falls again",
  "text_sources": [
    {
      "index": 0,
      "text": "falls"
    },
    {
      "index": 0,
      "text": "rises three times"
    },
    {
      "index": 0,
      "text": "about 25 days"
    },
    {
      "index": 1,
      "text": "falls"
    }
  ],
  "targets": [],
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 3
      }
    }
  ],
  "trend_groups": [
    {
      "ids": [1, 3],
      "duration_condition": {
        "min": { "value": "22.5", "inclusive": true },
        "max": { "value": "27.5", "inclusive": true },
        "unit": "day",
        "text_source_id": 2
      }
    }
  ],
  "single_relations": [],
  "group_relations": []
}
"""

    case4 = """输入：
old_queryspec_with_source
```
null
```

new_queryspec_with_source_without_text_sources
```
{'original_text': '', 'text_sources': [], 'targets': [], 'trends': [{'category': {'category': 'up'}}, {'category': {'category': 'down'}, 'slope_scope_condition': {'max': {'value': -28.24, 'inclusive': True}, 'min': {'value': -34.52, 'inclusive': True}, 'unit': 'week'}, 'duration_condition': {'max': {'value': 5.5, 'inclusive': True}, 'min': {'value': 4.5, 'inclusive': True}, 'unit': 'week'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}], 'single_relations': [{'id1': 0, 'id2': 2, 'attribute': 'relative_slope', 'comparator': '>'}], 'trend_groups': [{'ids': [0, 3], 'duration_condition': {'max': {'value': 47.3, 'inclusive': True}, 'min': {'value': 38.7, 'inclusive': True}, 'unit': 'week'}}], 'group_relations': [{'group1': [0, 1], 'group2': [2, 3], 'attribute': 'duration', 'comparator': '<'}]}
```

intentions
```
{
  "single_segment_intentions": [{"id": 0, "single_choices": ["user"]}, {"id": 1, "single_choices": ["user"]}, {"id": 2, "single_choices": ["user"]}, {"id": 3, "single_choices": ["user"]}, {"id": 4, "single_choices": ["user"]}],
  "segment_group_intentions": [{"ids": [1, 3], "group_choices": ["duration"]}],
  "single_relation_intentions": [{"id1": 0, "id2": 2, "relation_choices": ["relative_slope"]}],
  "group_relation_intentions": [{"group1": [0, 1], "group2": [2, 3], "relation_choices": ["duration"]}]
}
```

输出：
{
  "original_text": "find a trend that rises, then falls with a slope between -34.52 and -28.24 per week over 4.5 to 5.5 weeks, then rises again, and finally falls, where the first rising trend's relative slope is greater than the third rising trend's and the total duration of the first to the last trends is about 43 weeks, while the duration of the first two trends is shorter than the duration of the last two trends",
  "targets": [],
  "text_sources": [
    {"index": 0, "text": "rises"},
    {"index": 0, "text": "falls"},
    {"index": 0, "text": "a slope between -34.52 and -28.24 per week"},
    {"index": 0, "text": "over 4.5 to 5.5 weeks"},
    {"index": 1, "text": "rises"},
    {"index": 1, "text": "falls"},
    {"index": 0, "text": "the first rising trend's relative slope is greater than the third rising trend's"},
    {"index": 0, "text": "total duration of the first to the last trends is about 43 weeks"},
    {"index": 0, "text": "the duration of the first two trends is shorter than the duration of the last two trends"},
  ],
  "trends": [
    {"category": {"category": "up", "text_source_id": 0}},
    {
      "category": {"category": "down", "text_source_id": 1},
      "duration_condition": {"max": {"inclusive": true, "value": 5.5}, "min": {"inclusive": true, "value": 4.5}, "text_source_id": 3, "unit": "week"},
      "slope_scope_condition": {
        "max": {"inclusive": true, "value": -28.24},
        "min": {"inclusive": true, "value": -34.52},
        "text_source_id": 2,
        "unit": "week",
      },
    },
    {"category": {"category": "up", "text_source_id": 4}},
    {"category": {"category": "down", "text_source_id": 5}}
  ],
  "trend_groups": [
    {
      "ids": [0, 3],
      "duration_condition": {"max": {"inclusive": True, "value": 47.3}, "min": {"inclusive": True, "value": 38.7}, "text_source_id": 7, "unit": "week"}
    }
  ],
  "single_relations": [{"attribute": "relative_slope", "comparator": ">", "id1": 0, "id2": 2, "text_source_id": 6}],
  "group_relations": [{"attribute": "duration", "comparator": "<", "group1": [0, 1], "group2": [2, 3], "text_source_id": 8}]
}
    """
