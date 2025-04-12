from .modify_nl_cases import ModifyNL_Cases
from .parse_nl_cases import ParseNL_Cases
from .shared_info import QuerySpecWithSource_info, SegmentGroup_info, parse_nl_logic_info, Segment_info, modify_nl_logic_info, intentions_info

parse_nl_cases = ParseNL_Cases.get_all_cases()

modify_nl_cases = ModifyNL_Cases.get_all_cases()

parse_nl_system_prompt = f"""You are providing a natural language to structured query(type: QuerySpecWithSource) parsing service for a natural language-driven time series segment querying tool. Below is the relevant background and knowledge.
"""
modify_nl_system_prompt = "You are an AI assistant specialized in handling textual adjustments for time series queries. You need to generate new query text and establish text mapping relationships based on the user's adjustment intentions."


def create_parse_nl_info(dataset_info: str = "[]") -> str:
    parse_nl_info = f"""# QuerySpecWithSource Interface Definition
{QuerySpecWithSource_info}

# Dataset Constraints
- Available time series columns: {dataset_info}
- Target selection rules:
  1. MUST ONLY use columns from the provided list
  2. If user doesn't specify target explicitly, return empty array
  3. Reject any target not present in dataset

# Parsing Protocol
{parse_nl_logic_info}

# Execution Requirements
1. STRICT compliance with QuerySpecWithSource schema
2. ZERO additional content (no explanations/comments/code blocks)
3. MANDATORY output format validation before returning result

# Output Validation Checklist
- JSON structure matches QuerySpecWithSource
- All targets exist in dataset columns
- No extra fields or annotations
- The text_sources must be the substring of original_text

# Reference Examples
## Parse Examples
{parse_nl_cases}
"""
    return parse_nl_info


def create_modify_nl_info() -> str:
    modify_nl_info = f"""# Core Task
Input:
- old_queryspec_with_source: Original query specification
- new_queryspec_with_source_without_text_sources: New query specification (excluding text-related fields)
- intentions: Adjustment intents

Output:
- new_queryspec_with_source: Complete new query specification, including:
  - original_text: New query text
  - text_sources: Text fragment sources
  - text_source_id: Mapping relationship between attributes and text

# Key Interface Definitions
## QuerySpecWithSource Structure
```{QuerySpecWithSource_info}```

## Intentions Structure
```{intentions_info}```

# Text Adjustment Rules
{modify_nl_logic_info}

# Output Requirements
1. Strictly adhere to the QuerySpecWithSource data structure
2. Output only a JSON object
3. Do not include code block markers (``` )
4. Do not add any comments
5. Check data integrity and validity before output
6. The text_sources must be the substring of original_text

# Examples
{modify_nl_cases}

"""
    return modify_nl_info
