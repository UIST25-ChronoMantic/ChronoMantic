from .constant import FUZZY_FACTOR


class ParseNL_Cases:
    case1 = """
输入：
Find periods in AMZN when price first rose sharply then fell gradually and the price was higher than 100

输出：
{
  "original_text": "Find periods in AMZN when price first rose sharply then fell gradually and the price was higher than 100",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "rose",
      "index": 0
    },
    {
      "text": "sharply",
      "index": 0
    },
    {
      "text": "fell",
      "index": 0
    },
    {
      "text": "gradually",
      "index": 0
    },
    {
      "text": "higher than 100",
      "index": 0
    }
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
    "text_source_id": 5
  }
}
"""

    case2 = """
输入：
Find periods in DPZ when price presented a double-bottom shape where the first bottom's slope was steeper than the second bottom's slope

解释：
double-top代表有两次的上升下降趋势，所以应该解析为up->down->up->down；double-bottom代表有两次的下降上升趋势，所以应该解析为down->up->down->up。如果用户输入triple-bottom，则应该解析三组这样的下降上升为down->up->down->up->down->up，同理，triple-top代表有三次的上升下降趋势，所以应该解析为up->down->up->down->up->down。

输出：
{
  "original_text": "Find periods in DPZ when price presented a double-bottom shape where the first bottom's slope was steeper than the second bottom's slope",
  "text_sources": [
    {
      "text": "DPZ",
      "index": 0
    },
    {
      "text": "double-bottom",
      "index": 0
    },
    {
      "text": "first bottom's slope was steeper than the second bottom's slope",
      "index": 0
    }
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
      "attribute": "end_value",
      "comparator": "~=",
      "text_source_id": 1
    },
    {
      "id1": 0,
      "id2": 2,
      "attribute": "slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 2,
      "id2": 4,
      "attribute": "slope",
      "comparator": ">",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case3 = """
输入：
Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got higher and higher and each trend's slope should be steeper than 10 per month

解释：
three consecutive peaks代表有三个连续的上升下降趋势，所以应该解析为up->down->up->down->up->down。趋势有上升下降的区别，所以在处理斜率（slope）时，需要区分上升和下降的斜率，上升的时候应该使用正斜率，并设置最小值为10；下降的时候应该使用负斜率，并设置最大值为-10。

输出：
{
  "original_text": "Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got higher and higher and each trend's slope should be steeper than 10 per month",
  "text_sources": [
    {
      "text": "Amazon stock",
      "index": 0
    },
    {
      "text": "three consecutive peaks",
      "index": 0
    },
    {
      "text": "peaks got higher and higher",
      "index": 0
    },
    {
      "text": "each trend's slope should be steeper than 10 per month",
      "index": 0
    }
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
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 2,
      "id2": 4,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case4 = """
输入：
Find periods in AMZN when price presented a head-and-shoulders shape followed by a cup-with-handle shape

解释：
head-and-shoulders是头肩形，形状为up->down->up->down->up->down；cup-with-handle是杯柄形，形状为down->down->up->up->down，所以解析出来应该是up->down->up->down->up->down->down->down->up->up->down。

输出：
{
  "original_text": "Find periods in AMZN when price presented a head-and-shoulders shape followed by a cup-with-handle shape",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "head-and-shoulders",
      "index": 0
    },
    {
      "text": "cup-with-handle",
      "index": 0
    }
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
        "category": "down",
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
      "attribute": "slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 8,
      "id2": 9,
      "attribute": "slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 7,
      "id2": 10,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """

    case5 = (
        """
输入：
Find periods in AMZN when price first presented a double-bottom shape with a duration of about a week and then presented a double-top shape with a duration higher than the first double-bottom's duration

输出：
{
  "original_text": "Find periods in AMZN when price first presented a double-bottom shape with a duration of about a week and then presented a double-top shape with a duration higher than the first double-bottom's duration",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "a double-bottom",
      "index": 0
    },
    {
      "text": "with a duration of about a week",
      "index": 0
    },
    {
      "text": "a double-top",
      "index": 0
    },
    {
      "text": "with a duration higher than the first double-bottom's duration",
      "index": 0
    }
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
        + str(1 - FUZZY_FACTOR)
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(1 + FUZZY_FACTOR)
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
输入：
Find periods when price presented a high plateau shape with a slope of downtrend is about 20%/week

解释：
趋势需要区分上升和下降，下降的时候应该使用负斜率，并根据模糊程度进行设置。

输出：
{
  "original_text": "Find periods when price presented a high plateau shape with a slope of downtrend is about 20%/week",
  "text_sources": [
    {
      "text": "a high plateau shape",
      "index": 0
    },
    {
      "text": "a slope of downtrend is about 20%/week",
      "index": 0
    }
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
  "single_relations": [],
  "trend_groups": [],
  "group_relations": []
}
"""
    )
