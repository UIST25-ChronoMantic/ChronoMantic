import requests
import json
from typing import List, Dict, Optional


class ChatAgent:
    def __init__(self, model_name: str, temperature: float = 0, system_prompt: str = None):
        """
        初始化聊天代理

        Args:
            model_name (str): 模型名称
            temperature (float, optional): 温度参数，控制随机性。默认为 0
            system_prompt (str, optional): 系统提示词。默认为 None
        """
        self.model_name = model_name
        self.temperature = temperature
        self.conversation_history: List[Dict[str, str]] = []
        self.api_url = "http://localhost:11434/api/chat"

        # 如果提供了系统提示词，则添加到对话历史中
        if system_prompt:
            self.add_message("system", system_prompt)

    def add_message(self, role: str, content: str) -> None:
        """
        添加消息到对话历史
        Args:
            role (str): 消息角色 ('system', 'user' 或 'assistant')
            content (str): 消息内容
        """
        self.conversation_history.append({"role": role, "content": content})

    def chat(self, user_input: str, stream: bool = False) -> Dict:
        """
        发送聊天请求并更新对话历史

        Args:
            user_input (str): 用户输入的文本
            stream (bool, optional): 是否使用流式响应。默认为 False

        Returns:
            dict: API 的响应结果
        """
        # 添加用户输入到历史记录
        self.add_message("user", user_input)
        # print(self.conversation_history)

        # 构建请求数据
        payload = {
            "model": self.model_name,
            "messages": self.conversation_history,
            "stream": stream,
            "options": {"temperature": self.temperature, "num_ctx": 40960, "top_p": 0.1, "top_k": 10},
        }

        # 发送 POST 请求
        response = requests.post(self.api_url, json=payload)

        # 处理响应
        if response.status_code == 200:
            result = response.json()
            # 如果响应成功，将助手的回复添加到历史记录
            if "message" in result and "content" in result["message"]:
                self.add_message("assistant", result["message"]["content"])
            return result
        else:
            error_response = {"error": f"请求失败，状态码: {response.status_code}", "details": response.text}
            return error_response


system_prompt = """
You are providing a natural language to structured query(type: QuerySpecWithSource) parsing service for a natural language-driven time series segment querying tool. Below is the relevant background and knowledge.

# QuerySpecWithSource Interface Definition

```
export interface ThresholdCondition {
  value: number; // Threshold value used to define specific numeric ranges
  inclusive: boolean; // Whether the threshold is inclusive, true means inclusive, false means exclusive  
}

export interface ScopeCondition {
  max?: ThresholdCondition; // Maximum value condition of the range, optional
  min?: ThresholdCondition; // Minimum value condition of the range, optional
}

export enum SingleAttribute {
  SLOPE = "slope", // Slope attribute, used to compare trend slopes
  START_VALUE = "start_value", // Start value attribute, used to compare starting point values of trends  
  END_VALUE = "end_value", // End value attribute, used to compare ending point values of trends
  DURATION = "duration", // Time span attribute, used to compare duration of trends
  RELATIVE_SLOPE = "relative_slope" // Relative slope percentage attribute, unit is %
}

export enum GroupAttribute {
  DURATION = "duration", // Time span attribute      
}

export enum Comparator {
  GREATER = ">", // Greater than comparison operator 
  LESS = "<", // Less than comparison operator       
  EQUAL = "=", // Equal to comparison operator       
  NO_GREATER = "<=", // Less than or equal to comparison operator
  NO_LESS = ">=", // Greater than or equal to comparison operator
  APPROXIMATELY_EQUAL_TO = "~=", // Approximately equal to comparison operator
}

export interface SingleRelation {
  id1: number; // ID identifier for the first trend used in relation comparisons
  id2: number; // ID identifier for the second trend used in relation comparisons
  attribute: SingleAttribute; // Attribute type to be compared
  comparator: Comparator; // Comparison relationship operator
}

export interface GroupRelation {
  group1: [number, number]; // First trend group's ID list, group1[1] >= group1[0], indicating all segments from group1[0] to group1[1], e.g., [1,4] includes segments 1, 2, 3, 4
  group2: [number, number]; // Second trend group's ID list, group2[1] >= group2[0], indicating all segments from group2[0] to group2[1], e.g., [2,3] includes segments 2, 3
  attribute: GroupAttribute; // Attribute type to be compared
  comparator: Comparator; // Comparison relationship operator
}

export interface TextSource {
  text: string; // Original text fragment
  index: number; // Used to distinguish text fragments that are the same but different in position within the original text; index=0 indicates the first, index=1 indicates the second, etc.
}

export interface WithSource {
  text_source_id: number; // Source from which TextSource array element this originates
}

export enum TrendCategory {
  FLAT = "flat", // Flat
  UP = "up", // Upward
  DOWN = "down" // Downward
}

// Unit types
export type Unit = "number" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

export interface WithUnit {
  unit?: Unit; // Unit
}

export interface ScopeConditionWithSource extends WithSource, ScopeCondition {}

export interface ScopeConditionWithSourceWithUnit extends ScopeConditionWithSource, WithUnit {}

export interface TrendWithSource {
  category: CategoryWithSource; // Trend category, can be "flat" (steady), "up" (rising), "down" (falling)
  slope_scope_condition?: ScopeConditionWithSourceWithUnit; // Range condition for slope, limiting the slope range of the trend
  relative_slope_scope_condition?: ScopeConditionWithSource; // Range condition for relative slope among all slopes, limiting the relative slope size of the trend, the value is absolute value, unit is %, e.g., 30 represents 30%
  duration_condition?: ScopeConditionWithSourceWithUnit; // Range condition for time span, limiting the duration of the trend
}

export interface SingleRelationWithSource extends SingleRelation, WithSource {}

export interface TrendGroupWithSource {
  ids: [number, number]; // List of trend IDs within the group, ids[1] >= ids[0]
  duration_condition?: ScopeConditionWithSource; // Time span condition for the group
}

// Group relation WithSource version
export interface GroupRelationWithSource extends GroupRelation, WithSource {}

export interface TargetWithSource extends WithSource {
  target: string; // Target time series name
}

export interface ComparatorWithSource extends WithSource {
  comparator: Comparator; // The comparator
}

export interface QuerySpecWithSource {
  original_text: string; // Original query text      
  text_sources: TextSource[]; // All text sources involved in QuerySpec, sorted by their order in the original text
  targets: TargetWithSource[]; // Query target list, empty if no explicit target is mentioned in the query text
  trends: TrendWithSource[]; // Trend list
  single_relations: SingleRelationWithSource[]; // Single trend relation list
  trend_groups: TrendGroupWithSource[]; // Trend group list
  group_relations: GroupRelationWithSource[]; // Group relation list
  duration_condition?: ScopeConditionWithSourceWithUnit; // Total time span range condition
  time_scope_condition?: ScopeConditionWithSource; // Time range condition
  max_value_scope_condition?: ScopeConditionWithSource; // Maximum value range condition
  min_value_scope_condition?: ScopeConditionWithSource; // Minimum value range condition
  comparator_between_start_end_value?: ComparatorWithSource; // The comparator between start_value and end_value
}
```
"""

user_prompt = """
# Dataset Constraints

- Available time series columns: ["AMZN", "DPZ", "BTC", "NFLX"]
- Target selection rules:
  1. MUST ONLY use columns from the provided list    
  2. If user doesn't specify target explicitly, return empty array
  3. Reject any target not present in dataset        

# Parsing Protocol

1. Parse vague range expressions (e.g., "about 2 weeks") into `ScopeConditionWithSource`, with `min` and `max` forming a range based on `0.1`. For example, "about 2 weeks" becomes `min=1.8` weeks and `max=2.2` weeks in `ScopeConditionWithSourceWithUnit`. Ensure `min != max`. Use the provided unit if explicitly stated.

2. Parse trend and shape descriptions into `TrendWithSource`. Map `category` to the trend type and `text_source` to the description. Capture characteristics of trends and shapes into corresponding fields.        

3. You should pay attention to all the described trends and not miss any of them. For example, if the user specifies 'a rising trend followed by a head-and-shoulders shape', then you should generate the up->up->down->up->down->up->down trend, because this rising trend is not covered in head-and-shoulders but rather a separate paragraph. Therefore, you should not only resolve the trend inside head-and-shoulders, but all the described trends.

4. Parse precise descriptions (e.g., "20~30 days") into `duration_condition`, setting `min` and `max` accordingly. Accurately identify the condition type.     

5. Parse vague trend intensity descriptions (e.g., "gradual rise") into `relative_slope_scope_condition` based on semantics.

6. Ensure `text` in `TextSource` is a continuous sub-text of the original text. Elements in `text_sources` must follow the original order without overlap. Only include utilized `text_source`.

7. Identify implicit and explicit relations:
  - Implicit: "Head-and-shoulders" means that there are three alternating uptrend and downtrend shape, and the middle "head" (`trend_id=2`) is higher than the "shoulders" (`trend_id=0` and `trend_id=4`).
  - Explicit: "Two consecutive rises, left faster than right" means the slope of `trend_id=0` > `trend_id=1`.
    Avoid redundant relations (e.g., "rise sharply then slowly").

8. For duration descriptions, determine whether to use:
  - Overall `duration_condition` for total time.     
  - `trend_group`'s `duration_condition` for combined times.
  - Individual `trend`'s `duration_condition` for single trends.

9. Differentiate between upward and downward trends when handling slopes:
  - Upward trends: Use positive slopes. For "steeper than 10/month," set `min=10`, do not set `max`.      
  - Downward trends: Use negative slopes. For "steeper than 10/month," set `max=-10`, do not set `min`.   

10. For trend descriptions:
  - Default to seconds if no unit is provided.       
  - If a unit is provided (e.g., "falling almost 20/year"), parse it into `min=-22.0`, `max=-18.0` with the unit as "year" in `ScopeConditionWithSourceWithUnit`.


# Execution Requirements
1. STRICT compliance with QuerySpecWithSource schema 
2. ZERO additional content (no explanations/comments/code blocks)
3. MANDATORY output format validation before returning result

# Output Validation Checklist
- JSON structure matches QuerySpecWithSource        
- All targets exist in dataset columns
- Empty array when target unspecified
- No extra fields or annotations

# Reference Examples
## Example 1

Input:
Find periods in AMZN when price first rose sharply then fell gradually and the price was higher than 100  

Output:
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


## Example 2

Input:
Find periods in DPZ when price presented a double-bottom shape where the first bottom's slope was steeper than the second bottom's slope

Explanation:
1. Double-bottom represents two falling-rising trends, so it should be parsed as down->up->down->up.      
2. The user's query is about a double-bottom shape where the first bottom's slope was steeper than the second bottom's slope, so it means the slope of `trend_id=0` < `trend_id=2` and `trend_id=1` > `trend_id=3`. 
3. Note: If the user inputs triple-bottom, it should be parsed as three groups of such falling-rising patterns: down->up->down->up->down->up.

Output:
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
      "id1": 1,
      "id2": 3,
      "attribute": "slope",
      "comparator": ">",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}


## Example 3

Input:
Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got higher and higher and each trend's slope should be steeper than 10 per month

Explanation:
1. Three consecutive peaks represent three consecutive rising-falling trends, so it should be parsed as up->down->up->down->up->down.
2. Trends have distinctions between rising and falling, so when dealing with slopes (`slope`), differentiate between upward and downward slopes. For upward trends, use positive slopes and set the minimum value to 10. For downward trends, use negative slopes and set the maximum value to -10.

Output:
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


## Example 4

Input:
Find periods in AMZN when price presented a head-and-shoulders shape followed by a cup-with-handle shape  

Explanation:
1. Head-and-shoulders is a head-and-shoulders pattern, shaped as up->down->up->down->up->down, with the "head" (`trend_id=2`) being higher than the "shoulders" (`trend_id=0` and `trend_id=4`).
2. Cup-with-handle is a cup-and-handle pattern, shaped as down->down->up->up->down, with the "handle" (`trend_id=5`) being higher than the "cup" (`trend_id=3`).
3. The user's query is about a head-and-shoulders shape followed by a cup-with-handle shape, so it should be parsed as up->down->up->down->up->down->down->down->up->up->down.

Output:
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


## Example 5

Input:
Find periods in AMZN when price first presented a double-bottom shape with a duration of about a week and then presented a double-top shape with a duration higher than the first double-bottom's duration

Explanation:
1. The user's query is about a double-bottom shape, which means a consecutive downtrend followed by a consecutive rising trend (down->up->down->up).
2. The user's query is also about a double-top shape, which means a consecutive rising trend followed by a consecutive falling trend (up->down->up->down).     
3. The user's query is about a duration of about a week, which means the duration of the first double-bottom shape(trend_id=0 to trend_id=3) is about a week.  
4. The user's query is also about a duration higher than the first double-bottom's duration, which means the duration of the second double-top shape(trend_id=4 to trend_id=7) is higher than the first double-bottom shape(trend_id=0 to trend_id=3).

Output:
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
          "value": 0.9,
          "inclusive": true
        },
        "max": {
          "value": 1.1,
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


## Example 6

Input:
Find periods when price presented a high plateau shape with a slope of downtrend is about 20%/week, and totally the start value is approximately equal to the end value

Explanation:
1. The user's query is about a high plateau shape, which means a rising trend followed by a flat trend followed by a downtrend (up->flat->down).
2. Trends need to be distinguished between rising and falling, and negative slopes should be used when falling. Because user didn't specify the slope, the slope should be set according to the fuzzy factor.       

Output:
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
    },
    {
      "text": "totally the start value is approximately equal to the end value",
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
          "value": -0.22000000000000003,
          "inclusive": true
        },
        "max": {
          "value": -0.18000000000000002,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 1
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": [],
  "comparator_between_start_end_value": {
    "comparator": "~=",
    "text_source_id": 2
  }
}


Input:
查找先出现连续的两个山峰，高度大致相同，再出现连续两个山峰，后面两个山峰的持续时间高于前面两个山峰的持续时间

Output:
"""


if __name__ == "__main__":
    agent = ChatAgent(model_name="qwen2.5:14b-instruct-q4_K_M", temperature=0, system_prompt=system_prompt)
    result = agent.chat(user_prompt)
    print(result["message"]["content"])
