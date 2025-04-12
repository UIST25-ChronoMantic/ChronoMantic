from .constant import FUZZY_FACTOR


class ParseNL_Cases:
    case1 = """
Input:
Find periods in AMZN when price first rose sharply then fell gradually with a lower end value than the uptrend's start value and the price was higher than 100

Explanation:
1. You can't find a valid trend of other trend_id(uptrend's previous id is equal to -1, and fell trend's next id is out of range), so you should set comparator_between_start_end_value.

Output:
{
  "original_text": "Find periods in AMZN when price first rose sharply then fell gradually with a lower end value than the uptrend's start value and the price was higher than 100",
  "text_sources": [
    { "text": "AMZN" },
    { "text": "rose" },
    { "text": "sharply" },
    { "text": "fell" },
    { "text": "gradually" },
    { "text": "lower end value than the uptrend's start value" },
    { "text": "higher than 100" }
  ],
  "targets": [
    {
      "target": "AMZN",
      "text_source_id": 0
    }
  ],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      },
      "relative_slope_scope_condition": {
        "min": {
          "value": 80,
          "inclusive": true
        },
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 3
      },
      "relative_slope_scope_condition": {
        "max": {
          "value": 20,
          "inclusive": true
        },
        "text_source_id": 4
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": [],
  "min_value_scope_condition": {
    "min": {
      "value": 100,
      "inclusive": true
    },
    "text_source_id": 6
  },
  "comparator_between_start_end_value": {
    "comparator": ">",
    "text_source_id": 5
  }
}
"""

    case2 = """
Input:
Find periods in DPZ when price presented consecutive valleys shape where the first bottom's slope was steeper than the second bottom's slope

Explanation:
1. Consecutive valleys represents two falling-rising trends, so it should be parsed as down->up->down->up.
2. The user's query specifies that the first bottom's slope was steeper than the second bottom's slope, so it means the relative slope of `trend_id=0` > `trend_id=2` and `trend_id=1` > `trend_id=3`.
3. Note: If the user inputs triple-bottom (or triple-valley or three consecutive valleys), it should be parsed as three groups of such falling-rising patterns: down->up->down->up->down->up.

Output:
{
  "original_text": "Find periods in DPZ when price presented consecutive valleys shape where the first bottom's slope was steeper than the second bottom's slope",
  "text_sources": [
    { "text": "DPZ" },
    { "text": "consecutive valleys" },
    { "text": "first bottom's slope was steeper than the second bottom's slope" }
  ],
  "targets": [
    {
      "target": "DPZ",
      "text_source_id": 0
    }
  ],
  "trends": [
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
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      }
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "relative_slope",
      "comparator": ">",
      "text_source_id": 2
    },
    {
      "id1": 1,
      "id2": 3,
      "attribute": "relative_slope",
      "comparator": ">",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case3 = """
Input:
Find the time periods in Amazon stock when the price showed three consecutive peaks with the first rising trend's end value is greater than the last falling trend's start value and each trend's slope should be steeper than 10 per month

Explanation:
1. Three consecutive peaks represent three consecutive rising-falling trends, so it should be parsed as up->down->up->down->up->down.

Output:
{
  "original_text": "Find the time periods in Amazon stock when the price showed three consecutive peaks with the first rising trend's end value is greater than the last falling trend's start value and each trend's slope should be steeper than 10 per month",
  "text_sources": [
    { "text": "Amazon stock" },
    { "text": "three consecutive peaks" },
    { "text": "the first rising trend's end value is greater than the last falling trend's start value" },
    { "text": "each trend's slope should be steeper than 10 per month" }
  ],
  "targets": [
    {
      "target": "AMZN",
      "text_source_id": 0
    }
  ],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "min": {
          "value": 10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "max": {
          "value": -10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "min": {
          "value": 10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "max": {
          "value": -10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "min": {
          "value": 10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "max": {
          "value": -10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    }
  ],
  "single_relations": [{
      "id1": 1,
      "id2": 5,
      "attribute": "start_value",
      "comparator": ">",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case4 = """
Input:
Find periods in AMZN when price presented a head-and-shoulders shape followed by a cup-with-handle shape

Explanation:
1. Head-and-shoulders is a head-and-shoulders pattern, shaped as up->down->up->down->up->down, with the "head" (`trend_id=2`) being higher than the "shoulders" (`trend_id=0` and `trend_id=4`).
2. Cup-with-handle is a cup-and-handle pattern, shaped as down->down->up->up->flat, with start value of the "handle" (`trend_id=5`) should similar to the start value of the "cup" (`trend_id=0`).
3. The user's query is about a head-and-shoulders shape followed by a cup-with-handle shape, so it should be parsed as up->down->up->down->up->down->down->down->up->up->flat.

Output:
{
  "original_text": "Find periods in AMZN when price presented a head-and-shoulders shape followed by a cup-with-handle shape",
  "text_sources": [
    { "text": "AMZN" },
    { "text": "head-and-shoulders" },
    { "text": "cup-with-handle" }
  ],
  "targets": [
    {
      "target": "AMZN",
      "text_source_id": 0
    }
  ],
  "trends": [
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
        "category": "down",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 2
      }
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 1
    },
    {
      "id1": 2,
      "id2": 4,
      "attribute": "end_value",
      "comparator": ">",
      "text_source_id": 1
    },
    {
      "id1": 6,
      "id2": 7,
      "attribute": "relative_slope",
      "comparator": ">",
      "text_source_id": 2
    },
    {
      "id1": 8,
      "id2": 9,
      "attribute": "relative_slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 6,
      "id2": 10,
      "attribute": "start_value",
      "comparator": "~=",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """

    case5 = (
        """
Input:
Find periods in AMZN when price first presented a double-bottom shape with a duration of about two weeks and then presented a double-top shape with a duration higher than the first double-bottom's duration

Explanation:
1. The user's query is about a double-bottom shape, which means a downtrend followed by a rising trend repeated twice (down->up->down->up).
2. The user's query is also about a double-top shape, which means a rising trend followed by a falling trend repeated twice (up->down->up->down).
3. The user's query is about a duration of about two weeks, which means the duration of the first double-bottom shape(trend_id=0 to trend_id=3) is about two weeks.
4. The user's query is also about a duration higher than the first double-bottom's duration, which means the duration of the second double-top shape(trend_id=4 to trend_id=7) is higher than the first double-bottom shape(trend_id=0 to trend_id=3).

Output:
{
  "original_text": "Find periods in AMZN when price first presented a double-bottom shape with a duration of about two weeks and then presented a double-top shape with a duration higher than the first double-bottom's duration",
  "text_sources": [
    { "text": "AMZN" },
    { "text": "a double-bottom" },
    { "text": "with a duration of about two weeks" },
    { "text": "a double-top" },
    { "text": "with a duration higher than the first double-bottom's duration" }
  ],
  "targets": [
    {
      "target": "AMZN",
      "text_source_id": 0
    }
  ],
  "trends": [
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
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 3
      }
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source_id": 1
    },
    {
      "id1": 4,
      "id2": 6,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source_id": 3
    }
  ],
  "trend_groups": [
    {
      "ids": [0, 3],
      "duration_condition": {
        "min": {
          "value": """
        + str(2 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(2 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 2
      }
    }
  ],
  "group_relations": [
    {
      "group1": [0, 3],
      "group2": [4, 7],
      "attribute": "duration",
      "comparator": "<",
      "text_source_id": 4
    }
  ]
}
    """
    )

    case6 = (
        """
Input:
Find periods when price presented a high plateau shape with a slope of downtrend is about 20%/week, and totally the uptrend's start value is approximately equal to the end value of the flat trend

Explanation:
1. The user's query is about a high plateau shape, which means a rising trend followed by a flat trend followed by a downtrend (up->flat->down).
2. Trends need to be distinguished between rising and falling, and negative slopes should be used when falling. Because user didn't specify the slope, the slope should be set according to the fuzzy factor.
3. You can't compare the start value and end value of the uptrend and downtrend directly, so you should transform the end value of the flat trend(trend_id=1) to the start value of the next trend(trend_id=2).

Output:
{
  "original_text": "Find periods when price presented a high plateau shape with a slope of downtrend is about 20%/week, and totally the uptrend's start value is approximately equal to the end value of the flat trend",
  "text_sources": [
    { "text": "a high plateau shape" },
    { "text": "a slope of downtrend is about 20%/week" },
    { "text": "totally the uptrend's start value is approximately equal to the end value of the flat trend" }
  ],
  "targets": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      },
      "slope_scope_condition": {
        "min": {
          "value": """
        + str(-0.2 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(-0.2 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 1
      }
    }
  ],
  "single_relations": [
    {"id1": 0, "id2": 2, "attribute": "start_value", "comparator": "~=", "text_source_id": 2}
  ],
  "trend_groups": [],
  "group_relations": []
}
"""
    )

    case7 = (
        """
Input:
look for a pattern that rises, then rises again with a smaller relative slope and a smaller slope compared to the first rise, then rises once more with a duration approximately equal to the first rise, and the overall duration of the pattern is about 25 months, and the start value of this pattern is greater than the end value

Explanation:
1. The user specifies the start value of this pattern is greater than the end value, so you should set comparator_between_start_end_value.

Output:
{
  "original_text": "look for a pattern that rises, then rises again with a smaller relative slope and a smaller slope compared to the first rise, then rises once more with a duration approximately equal to the first rise, and the overall duration of the pattern is about 25 months, and the start value of this pattern is greater than the end value",
  "text_sources": [
    { "text": "rises" },
    { "text": "rises again with a smaller relative slope and a smaller slope compared to the first rise" },
    { "text": "rises once more with a duration approximately equal to the first rise" },
    { "text": "overall duration of the pattern is about 25 months" },
    { "text": "the start value of this pattern is greater than the end value" }
  ],
  "targets": [],
  "single_relations": [
    {
      "attribute": "relative_slope",
      "comparator": ">",
      "id1": 0,
      "id2": 1,
      "text_source_id": 1
    },
    {
      "attribute": "slope",
      "comparator": ">",
      "id1": 0,
      "id2": 1,
      "text_source_id": 1
    },
    {
      "attribute": "duration",
      "comparator": "~=",
      "id1": 0,
      "id2": 2,
      "text_source_id": 2
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
        "category": "up",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 2
      }
    }
  ],
  "duration_condition": {
    "max": {
      "inclusive": true,
      "value": """
        + str(25 * (1 + FUZZY_FACTOR))
        + """
    },
    "min": {
      "inclusive": true,
      "value": """
        + str(25 * (1 - FUZZY_FACTOR))
        + """
    },
    "text_source_id": 3,
    "unit": "month"
  },
  "comparator_between_start_end_value": {
    "comparator": "<",
    "text_source_id": 4
  },
  "group_relations": []
}
"""
    )

    case8 = """
Input:
First rise, then fall, the start value of the rise is higher than the end value of the fall, then rise again to the same level as the first rise's start value, and then remain flat.

Explanation:
1. Trend Sequence Identification :
  The user wants to identify a specific sequence of trends in the data: rise -> fall -> rise -> flat.
2. Single Relations (Value Comparisons) :
  The user specifies certain relationships between the values of these trends. However, direct comparisons between starting and ending values of trends are not possible. To address this, we use transformation rules to make indirect comparisons:
  Rule 1: Comparing Upward and Downward Trends
    The user wants `the start value of the rise is higher than the end value of the fall`.
    Since the ending value of the downward trend cannot be directly compared to the starting value of the upward trend, we transform it into the starting value of the next trend.
    Specifically, we compare the starting value of trend_id = 0 (first upward trend) with the starting value of trend_id = 2 (the trend after the downward trend).
  Rule 2: Comparing Two Upward Trends
    The user wants `the start value of the rise is higher than the end value of the fall`.
    Since the ending value of the third upward trend cannot be directly compared to the starting value of the first upward trend , we transform it into the starting value of the next trend .
    Specifically, we compare the starting value of trend_id = 0 (first upward trend) with the starting value of trend_id = 3 (the trend after the third upward trend).

Output:
{
  "original_text": "First rise, then fall, the start value of the rise is higher than the end value of the fall, then rise again to the same level as the first rise's start value, and then remain flat.",
  "text_sources": [
    { "text": "rise" },
    { "text": "fall" },
    { "text": "the start value of the rise is higher than the end value of the fall" },
    { "text": "rise again to the same level as the first rise's start value" },
    { "text": "flat" }
  ],
  "targets": [],
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
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 4
      }
    }
  ],
  "single_relations": [
    {
      "attribute": "start_value",
      "comparator": ">",
      "id1": 0,
      "id2": 2,
      "text_source_id": 2
    },
    {
      "attribute": "start_value",
      "comparator": "~=",
      "id1": 0,
      "id2": 3,
      "text_source_id": 3
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
"""

    case9 = """
Input:
Find pattern that first rises and then stays flat and then falls, the flat trend's duration is longer than others, and the uptrend's start value is similar to the end value of the downtrend, besides, these two trends' slope extent is approximately equal

Output:
{
  "original_text": "Find pattern that first rises and then stays flat and then falls, the flat trend's duration is longer than others, and the uptrend's start value is similar to the end value of the downtrend, besides, these two trends' slope extent is approximately equal",
  "text_sources": [
    { "text": "rises" },
    { "text": "flat" },
    { "text": "falls" },
    { "text": "the flat trend's duration is longer than others" },
    { "text": "the uptrend's start value is similar to the end value of the downtrend" },
    { "text": "these two trends' slope extent is approximately equal" }
  ],
  "targets": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 2
      }
    }
  ],
  "single_relations": [
    {"id1": 1, "id2": 0, "attribute": "duration", "comparator": ">", "text_source_id": 3},
    {"id1": 1, "id2": 2, "attribute": "duration", "comparator": ">", "text_source_id": 3},
    {"id1": 0, "id2": 2, "attribute": "relative_slope", "comparator": "~=", "text_source_id": 5}
  ],
  "trend_groups": [],
  "group_relations": [],
  "comparator_between_start_end_value": {"comparator": "~=", "text_source_id": 4}
}
"""

    case10 = """
Input:
帮我找到一个下降然后平坦，最后上升的片段，要求起始值和结束值相等，并且平坦时间比其他两段长

Output:
{
  "original_text": "帮我找到一个下降然后平坦，最后上升的片段，要求起始值和结束值相等，并且平坦时间比其他两段长",
  "text_sources": [
    { "text": "下降" },
    { "text": "平坦" },
    { "text": "上升" },
    { "text": "起始值和结束值相等" },
    { "text": "平坦时间比其他两段长" }
  ],
  "targets": [],
  "trends": [
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "flat", "text_source_id": 1}},
    { "category": {"category": "up", "text_source_id": 2}}
  ],
  "single_relations": [
    {"id1": 1, "id2": 0, "attribute": "duration", "comparator": ">", "text_source_id": 4},
    {"id1": 1, "id2": 2, "attribute": "duration", "comparator": ">", "text_source_id": 4}
  ],
  "trend_groups": [],
  "group_relations": [],
  "comparator_between_start_end_value": {"comparator": "~=", "text_source_id": 4}
}
"""

    case11 = """
Input:
连续山峰并且峰值几乎相等，低点也几乎相等

Explanation:
1. 连续山峰：two upward and then downward trends
2. 峰值几乎相等：the two upward ends are almost equal in value 
3. 低点也几乎相等：三个低点（第一段的开始，第三段的开始(或者第二段的结束)以及最后一段的结束）几乎相等，需要两两比较：
  1. 第一段的开始和第三段的开始（start_value）
  2. 第一段的开始和最后一段的结束（comparator_between_start_end_value）
  3. 第二段的结束和最后一段的结束（end_value）

Output:
{
  "original_text": "连续山峰并且峰值几乎相等，低点也几乎相等",
  "text_sources": [
    { "text": "连续山峰" },
    { "text": "峰值几乎相等" },
    { "text": "低点也几乎相等" }
  ],
  "targets": [],
  "trends": [
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}}
  ],
  "single_relations": [
    {"id1": 0, "id2": 2, "attribute": "end_value", "comparator": "~=", "text_source_id": 1},
    {"id1": 0, "id2": 2, "attribute": "start_value", "comparator": "~=", "text_source_id": 2},
    {"id1": 1, "id2": 3, "attribute": "end_value", "comparator": "~=", "text_source_id": 2}
  ],
  "trend_groups": [],
  "group_relations": [],
  "comparator_between_start_end_value": {"comparator": "~=", "text_source_id": 2}
}
    """

    case12 = """
Input:
三个山峰，中间的山峰更高

Output:
{
  "original_text": "三个山峰，中间的山峰更高",
  "text_sources": [
    { "text": "三个山峰" },
    { "text": "中间的山峰更高" }
  ],
  "trends": [
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}}
  ],
  "single_relations": [
    {"id1": 0, "id2": 2, "attribute": "end_value", "comparator": "<", "text_source_id": 1},
    {"id1": 2, "id2": 4, "attribute": "end_value", "comparator": ">", "text_source_id": 1}
  ],
  "trend_groups": [],
  "group_relations": []
}
"""

    case13 = """
Input:
找到三个连续的山谷，中间的山谷低于左右两个谷

Output:
{
  "original_text": "找到三个连续的山谷，中间的山谷低于左右两个谷",
  "text_sources": [
    { "text": "三个连续的山谷" },
    { "text": "中间的山谷低于左右两个谷" }
  ],
  "trends": [
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}}
  ],
  "single_relations": [
    {"id1": 0, "id2": 2, "attribute": "end_value", "comparator": ">", "text_source_id": 1},
    {"id1": 2, "id2": 4, "attribute": "end_value", "comparator": "<", "text_source_id": 1}
  ],
  "trend_groups": [],
  "group_relations": []
}
"""

    case14 = """
Input:
找到三个连续的下降然后上升，第二个的最低值比别的更小

Output:
{
  "original_text": "找到三个连续的下降然后上升，第二个的最低值比别的更小",
  "text_sources": [
    { "text": "三个连续的下降然后上升" },
    { "text": "第二个的最低值比别的更小" }
  ],
  "trends": [
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 0}},
    { "category": {"category": "up", "text_source_id": 0}}
  ],
  "single_relations": [
    {"id1": 0, "id2": 2, "attribute": "end_value", "comparator": ">", "text_source_id": 1},
    {"id1": 2, "id2": 4, "attribute": "end_value", "comparator": "<", "text_source_id": 1}
  ],
  "trend_groups": [],
  "group_relations": []
}
"""

    case15 = """
Input:
先上升后下降，并且下降趋势更加剧烈

Output:
{
  "original_text": "先上升后下降，并且下降趋势更加剧烈",
  "text_sources": [
    { "text": "上升" },
    { "text": "下降" },
    { "text": "下降趋势更加剧烈" }
  ],
  "trends": [
    { "category": {"category": "up", "text_source_id": 0}},
    { "category": {"category": "down", "text_source_id": 1}}
  ],
  "single_relations": [
    {"id1": 0, "id2": 1, "attribute": "relative_slope", "comparator": "<", "text_source_id": 2}
  ],
  "trend_groups": [],
  "group_relations": []
}
"""

    case16 = """
Input:Find patterns that exhibit a stable trend in global active power

Output:
{
  "original_text": "Find patterns that exhibit a stable trend in global active power",
  "text_sources": [
    { "text": "stable" },
    { "text": "global active power" }
  ],
  "targets": [
    {
      "target": "Global_active_power",
      "text_source_id": 1
    }
  ],
  "trends": [
    {
      "category": {
        "category": "flat",
        "text_source_id": 0
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": []
}
"""

    @classmethod
    def get_all_cases(cls):
        cases = [
            cls.case1,
            cls.case2,
            cls.case3,
            cls.case4,
            cls.case5,
            cls.case6,
            cls.case7,
            cls.case8,
            cls.case9,
            cls.case10,
            cls.case11,
            cls.case12,
            cls.case13,
            cls.case14,
            cls.case15,
            cls.case16,
        ]
        return "\n".join([f"### Case {i+1}\n{case}\n" for i, case in enumerate(cases)])
