from .constant import FUZZY_FACTOR

Segment_info = """
/**
 * Segment - 分段线性拟合的时间序列片段接口定义
 */
export enum Source {
  RESULT = "result", // 来源于查询结果
  USER = "user", // 来源于用户指定
}

export interface Segment {
  source: Source; // 片段的来源，可以是"result"或者"user",分别代表来源于查询结果和用户指定新增的
  slope: number;      // 片段的斜率，表示变化趋势
  start_value: number;  // 片段起始点的值
  end_value: number;    // 片段终止点的值
  start_time: number;  // 片段起始时间，单位是秒
  end_time: number;    // 片段终止时间，单位是秒
  relative_slope: number;  // 片段斜率在所有斜率中的占比，单位是%
  duration: number;  // 片段的时间跨度，单位是秒
  unit: Unit;  // 片段的跨度单位（即duration、slope的范围）
  category: TrendCategory;  // 片段的趋势类别
}
"""

SegmentGroup_info = """
/**
 * SegmentGroup - 分段线性拟合的时间序列片段组接口定义
 */
export interface SegmentGroup {
  ids: [number, number]; // 片段组中包含的片段ID列表，ids[1]>=ids[0]，id是来源于Segments的id
  duration?: number; // 片段组的时间跨度，单位是秒，可选
}
"""

QuerySpecWithSource_info = """
```
export interface ThresholdCondition {
  value: number; // Threshold value used to define specific numeric ranges
  inclusive: boolean; // Whether the threshold is inclusive, true means inclusive, false means exclusive
}

export interface ScopeCondition {
  max?: ThresholdCondition; // Maximum value condition of the range
  min?: ThresholdCondition; // Minimum value condition of the range
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
  GREATER = ">",
  LESS = "<",
  EQUAL = "=",
  NO_GREATER = "<=",
  NO_LESS = ">=",
  APPROXIMATELY_EQUAL_TO = "~=",
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
}

export interface WithSource {
  text_source_id: number; // Source from which TextSource array element this originates, 0 means the first element in the text_sources array, must be a valid index in the text_sources array, shouldn't be negative
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

// Unit types
export type Unit = "number" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year";   

export interface WithUnit {
  unit?: Unit; // Unit
}

// ScopeCondition WithSource version
export interface ScopeConditionWithSource extends WithSource, ScopeCondition {}

export interface ScopeConditionWithSourceWithUnit extends ScopeConditionWithSource, WithUnit {}

export interface CategoryWithSource extends WithSource {
  category: TrendCategory; // Trend category, can be "flat" (steady), "up" (rising), "down" (falling)
}

export interface TrendWithSource {
  category: CategoryWithSource;
  slope_scope_condition?: ScopeConditionWithSourceWithUnit; // Range condition for slope, limiting the slope range of the trend
  relative_slope_scope_condition?: ScopeConditionWithSource; // Range condition for relative slope among all slopes, limiting the relative slope size of the trend, the value is absolute value range of [0, 100], unit is %, e.g., 30 represents 30%
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
  group_relations: GroupRelationWithSource[]; // Group relation list, only used when user compare two trend groups
  duration_condition?: ScopeConditionWithSourceWithUnit; // Total time span range condition
  time_scope_condition?: ScopeConditionWithSource; // Time range condition
  max_value_scope_condition?: ScopeConditionWithSource; // Maximum value range condition
  min_value_scope_condition?: ScopeConditionWithSource; // Minimum value range condition
  comparator_between_start_end_value?: ComparatorWithSource; // The comparator between start_value and end_value
}
```
"""

intentions_info = """
/**
 * Query Modification Intentions Schema
 */

enum SingleChoice {
  // Single segment attributes
  USER = "user",            // User-specified description required
  RESULT = "result",        // Pre-existing in original query (no description needed)
  SLOPE = "slope",          // Trend slope attribute
  RELATIVE_SLOPE = "relative_slope",  // Slope percentage (%)
  DURATION = "duration",    // Time span (seconds)
}

enum GroupChoice {
  DURATION = "duration",    // Trend group duration condition
}

enum SingleRelationChoice {
  SLOPE = "slope",          // Slope relationship
  START_VALUE = "start_value",  // Initial value comparison
  END_VALUE = "end_value",  // Final value comparison
  DURATION = "duration",    // Time span relationship
  RELATIVE_SLOPE = "relative_slope",  // Slope percentage relationship
}

enum GroupRelationChoice {
  DURATION = "duration",    // Group time span relationship
}

interface SingleSegmentIntention {
  id: number;               // Target segment ID
  attributes: SingleChoice[]; // Attributes to consider
}

interface SegmentGroupIntention {
  ids: [number, number];  // Segment ID range [start, end] (inclusive)
  group_choices: GroupChoice[]; // Group-level attributes
}

interface SingleRelationIntention {
  id1: number;         // First segment ID
  id2: number;         // Second segment ID
  relation_choices: SingleRelationChoice[]; // Comparative attributes
}

interface GroupRelationIntention {
  group1: [number, number]; // First segment range [start, end]
  group2: [number, number]; // Second segment range [start, end]
  relation_choices: GroupRelationChoice[]; // Group comparison attributes
}

enum GlobalChoice {
  DURATION = "duration",  // Total time span range condition
  COMPARE_START_END_VALUE = "compare_start_end_value", // The comparator between start_value and end_value
}

interface Intentions {
  single_segment_intentions: SingleSegmentIntention[]; // Individual segment intentions
  segment_group_intentions: SegmentGroupIntention[];   // Segment group intentions
  single_relation_intentions: SingleRelationIntention[]; // Pairwise segment relations
  group_relation_intentions: GroupRelationIntention[]; // Group-to-group relations
  global_intentions: GlobalChoice[]; // Global intentions
}
"""

model_info = """
为了满足对时间序列片段的趋势和形状描述，我们使用线段拟合分割方法对时间序列进行不同模糊等级的分割预处理。分割后的时间序列是许多连续线段组成的数组，它们首尾相连形成整个通过分割模糊化后的时间序列。每一段都是一条以两个分割点为起止点的线段。通过这种线段拟合分段的方式，可以满足基本的趋势和形状查询，只需要从原段序列中匹配出满足趋势或者形状的子段序列即可。
"""


parse_nl_logic_info = f"""## I. Range Expression Parsing
1. Fuzzy Range Handling
- Example Input: "about 2 weeks" → "duration_condition": {{ "min": {(1 - FUZZY_FACTOR) * 2}, "max": {(1 + FUZZY_FACTOR) * 2}, "unit": "week"}}
- Constraints:
  - Must satisfy `min < max`
  - Prefer user-specified units

2. Precise Range Handling
- Example Input: "20~30 days" → "duration_condition": {{"min": {{ "value": 20, "inclusive": true }}, "max": {{ "value": 30, "inclusive": true }}, "unit": "day"}}

## II. Trend Feature Parsing
3. Trend Combination Handling
- Example of Composite Description Breakdown:
  - "rising trend followed by head-and-shoulders" → up->up->down->up->down->up->down
  - Processing Principles:
    - Maintain the original description order
    - Explicit trends take precedence over implicit derivations
    - Each verb/adjective corresponds to an independent trend segment

4. Intensity Description Mapping
- "gradual rise" → "relative_slope_scope_condition": {{"max": {{ "value": 20, "inclusive": true }}}}
- Slope Intensity Semantic Mapping Table:
  - Sharp: >= 80%
  - Moderate: 20%-80%
  - Gradual: <= 20%

## III. Relation Parsing Specification
5. Implicit Morphological Relationships
- Only specific morphological relationships are supported, such as "head-and-shoulders" and "double-bottom".
- "Head-and-shoulders" → 
  "single_relations": [
    {{"id1": 0, "id2": 2, "attribute": "end_value", "comparator": "<"}},
    {{"id1": 2, "id2": 4, "attribute": "end_value", "comparator": ">"}}
  ]
- Note: If there is insufficient confidence to determine a specific relationship, no related description should be generated.

6. Explicit Comparative Relationships
- "left faster than right" → "single_relations": [{{"id1": 0, "id2": 1, "attribute": "slope", "comparator": ">"}}]

7. Start Value vs. End Value Comparison Rules
- Rule Priority Flow:  
  - If user doesn't specify any trend, you should set comparator_between_start_end_value.
  - If comparing `start_value` vs. `start_value` OR `end_value` vs. `end_value` between two trends:
    - Directly compare the specified values (`start_value` or `end_value`) of the two trends.
  - If one trend uses `start_value` and the other uses `end_value`:  
    - Fallback to Previous Trend  
      - For a trend’s `start_value` (e.g., `trend_id=5`):  
        - Set its `start_value` = `end_value` of the previous trend (`trend_id=4`).  
    - Forward to Next Trend 
      - For a trend’s `end_value` (e.g., `trend_id=0`):
        - Set its `end_value` = `start_value` of the next trend (`trend_id=1`).
  - If `prev_id` or `next_id` is out of bounds (e.g., missing adjacent trends):
    - Force `comparator_between_start_end_value` to directly compare the original `start_value` and `end_value` of the two trends. 
- Example:
  - "Find pattern where rise then fall with a lower end value than the uptrend's start value and then followed by another rise" → 
    "single_relations": [
      {{"id1": 0, "id2": 2, "attribute": "start_value", "comparator": ">"}}
    ]
  - "Find periods where has a peak, the uptrend's start value is higher than the peak's end value" → 
    "comparator_between_start_end_value": {{"comparator": ">"}}

## IV. Duration Handling
8. Time Dimension Classification
- Priority Rules:
  1. Single trend description → `trend.duration_condition`
  2. Trend combination → `trend_group.duration_condition`
  3. Overall time period → `duration_condition`

## V. Unit Conversion Specification
9. Unit Handling Process
- Default Unit: Seconds (explicitly annotate the conversion process)
- Example: "falling almost 20/year" → 
  "slope_scope_condition": {{
    "min": {{ "value": {-20 * (1 + FUZZY_FACTOR)}, "inclusive": true }},
    "max": {{ "value": {-20 * (1 - FUZZY_FACTOR)}, "inclusive": true }},
    "unit": "year"
  }}

## VI. Text Traceability Rules
10. Text Fragment Extraction
- Requirements:
  - MUST be a continuous substring
  - MAINTAIN the original ORDER of appearance
  - MAKE SURE THE ORDER IS MAINTAINED
  - NO overlapping coverage
  - You MUST choose substring that appear in the original text.
- Example:
  - Original Sentence: "show a sharp rise then gradual decline in AMZN"
  - Extracted: ["sharp rise", "gradual decline", "AMZN"]

## VII. Slope Direction Handling
11. Direction-Sensitive Calculation
- Rising Trend: "steeper than 10/month" → {{"min": {{ "value": 10, "inclusive": true }}}}
- Falling Trend: "steeper than 30/month" → {{"max": {{ "value": -30, "inclusive": true }}}}
"""

modify_nl_logic_info = """
## Task Description
You are required to generate appropriate textual descriptions and text source mappings for time series queries based on adjustment intentions and new query specifications. This process must maintain the semantic consistency of the query while ensuring the naturalness of the textual description.

## Input and Output
Inputs:
- old_queryspec_with_source: The original query specification, including the original text and mapping relationships.
- new_queryspec_with_source_without_text_sources: The new query specification (without text-related fields).
- intentions: Adjustment intentions, indicating the attributes that need attention and modification.

Outputs:
- new_queryspec_with_source: A complete new query specification, requiring supplementation of:
  - original_text: Natural language text describing the query intent.
  - text_sources: An array of text fragment sources.
  - text_source_id: Text source indices corresponding to each attribute.
- Except for these three elements that need adjustment, all other content must remain identical to new_queryspec_with_source_without_text_sources, with no deviations allowed.

## Processing Pipeline

### Stage 1: Text Generation
Requirements:
1. Semantic Preservation:
- Maintain original_text from old_queryspec_with_source where possible, if the difference is too large, you can generate a new text by no reference to the original text
- You need to preserve as much of the original text as possible
- Consistency of language MUST be ensured (If user use Chinese, you MUST use Chinese; If user use English, you MUST use English)
- Integrate USER-marked attributes from intentions
- Update modified attributes with new parameters
- DO NOT lose any information contained in `new_queryspec_with_source_without_text_sources`, describe attributes ONE BY ONE

2. Linguistic Standards:
- Ensure grammatical correctness
- Maintain technical terminology consistency
- Preserve temporal relationships
- Describing trends one by one, do not mix them together
- DO NOT use `twice` or `four times` etc. to describe the consecutive trends

### Stage 2: Fragment Mapping
Rules:
1. Fragment Extraction:
- text_sources elements MUST be contiguous substrings of original_text
- You MUST choose substring that appear in the original text.
- Maintain original document order
- Zero overlap between fragments

2. Indexing Protocol:
- Duplicate fragments receive incremental indices
- Example: "rise then rise" → [{"text": "rise"}, {"text": "rise"}]

3. Validation:
- Remove unreferenced fragments
- Ensure bidirectional traceability

### Stage 3: Source Binding
Mapping Requirements:
1. Attribute Association:
- Each attribute MUST map to exactly one text_source_id
- Prefer semantically closest fragment
- Maintain legacy mappings where unchanged

## Implementation Guidelines

### Text Mapping Rules

1. Handling Repeated Text:
```json
// Original text: "rise then rises then rise"
{
  "text_sources": [
    {"text": "rise"},
    {"text": "rises"},
    {"text": "rise"}
  ],
  "trends": [
    {"category": {"category": "up", "text_source_id": 0}},
    {"category": {"category": "up", "text_source_id": 1}},
    {"category": {"category": "up", "text_source_id": 2}}
  ]
}
```

2. Handling Different Text:
```json
// Original text: "rises then fall then rise"
{
  "text_sources": [
    {"text": "rises"},
    {"text": "fall"},
    {"text": "rise"}
  ],
  "trends": [
    {"category": {"category": "up", "text_source_id": 0}},
    {"category": {"category": "down", "text_source_id": 1}},
    {"category": {"category": "up", "text_source_id": 2}}
  ]
}
```

3. Special Shape Descriptions:
```json
// Original text: "Find periods when price presented a head-and-shoulders shape"
{
  "text_sources": [
    {"text": "head-and-shoulders"}
  ],
  "trends": [
    {"category": {"category": "up", "text_source_id": 0}},
    {"category": {"category": "down", "text_source_id": 0}},
    {"category": {"category": "up", "text_source_id": 0}},
    {"category": {"category": "down", "text_source_id": 0}},
    {"category": {"category": "up", "text_source_id": 0}},
    {"category": {"category": "down", "text_source_id": 0}}
  ],
  "single_relations": [
    {"id1": 0, "id2": 2, "attribute": "end_value", "comparator": "<"},
    {"id1": 2, "id2": 4, "attribute": "end_value", "comparator": ">"}
  ]
}
```

### ❌ Error Cases
You MUST NOT generate the following text_sources:

1. ❌ NOT describe trends with consecutive words
// Explanation: You MUST describe trends one by one.
```json
❌ Error Case: "Find periods when price rises four consecutive times"
✔️ Correct Case: "Find periods when price rises, then rises, then rises, then rises again"

❌ Error Case: "Find periods with two rises"
✔️ Correct Case: "Find periods when price rises then rises again"
```

2. ❌ Texts that are not related to the given text
// Explanation: You MUST choose words that appear in the original text.
```json
// Original text: "rises followed by a rise then rising"
❌ Error Case:
{
  "text_sources": [
    {"text": "rises"},
    {"text": "rises"},
    {"text": "rises"}
  ]
}
✔️ Correct Case:
{
  "text_sources": [
    {"text": "rises"},
    {"text": "rise"},
    {"text": "rising"}
  ]
}
```

### Attribute Change Principles

1. Adding New Attributes:
   - Add corresponding descriptions in original_text.
   - Ensure the new descriptions naturally connect with existing text.

2. Modifying Attributes:
   - Update corresponding descriptions in original_text.
   - Retain the original text structure as much as possible.

3. Deleting Attributes:
   - Remove corresponding descriptions from original_text.
   - Ensure the remaining text remains coherent.

### Notes

1. Text Consistency:
   - text_sources must be contiguous substrings of original_text.
   - Maintain the original order of text fragments.
   - Avoid text overlaps.

2. Index Integrity:
   - Each attribute must have a corresponding text_source_id.
   - text_source_id must point to a valid text_sources index.

3. Semantic Accuracy:
   - Ensure the generated text accurately expresses the query intent.
   - Avoid introducing ambiguity or redundant descriptions
"""
