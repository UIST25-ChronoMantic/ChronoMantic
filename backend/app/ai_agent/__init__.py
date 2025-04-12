import json
import os
from app.MyTypes import QuerySpecWithSource
from typeguard import typechecked
from openai import OpenAI, AzureOpenAI
from openai.types.chat import ChatCompletion
from typing import List, Dict, Optional
from groq import Groq

from .prompts import create_parse_nl_info, create_modify_nl_info, parse_nl_system_prompt, modify_nl_system_prompt, QuerySpecWithSource_info
from .constant import Azure, DeepSeek, GroqPlatform, SiliconFlow, Qwen, Platforms, Tencent, Ollama, Aichina
from .debugger import debugger


@typechecked
class myAIClient:
    def __init__(self, model: str, platform: str, if_keep_history: bool = False):
        self.model = model
        self.chatHistory: List[Dict[str, str]] = []
        self.client = self._initialize_client(platform)
        self.if_keep_history = if_keep_history

    def set_system_prompt(self, system_prompt: str):
        self.chatHistory.append({"role": "system", "content": system_prompt})

    def _initialize_client(self, platform: str) -> OpenAI | AzureOpenAI | Groq:
        self.platform = platform
        """Initialize the appropriate client based on platform"""
        if platform == Platforms.AZURE:
            return AzureOpenAI(
                api_key=Azure.API_KEY,
                api_version=Azure.API_VERSION,
                azure_endpoint=Azure.ENDPOINT,
            )
        elif platform == Platforms.DEEPSEEK:
            return OpenAI(api_key=DeepSeek.API_KEY, base_url=DeepSeek.BASE_URL)
        elif platform == Platforms.SILIICONFLOW:
            return OpenAI(api_key=SiliconFlow.API_KEY, base_url=SiliconFlow.BASE_URL)
        elif platform == Platforms.QWEN:
            return OpenAI(api_key=Qwen.API_KEY, base_url=Qwen.BASE_URL)
        elif platform == Platforms.TENCENT:
            return OpenAI(api_key=Tencent.API_KEY, base_url=Tencent.BASE_URL)
        elif platform == Platforms.OLLAMA:
            return OpenAI(api_key=Ollama.API_KEY, base_url=Ollama.BASE_URL)
        elif platform == Platforms.GROQ:
            return Groq(api_key=GroqPlatform.API_KEY)
        elif platform == Platforms.AICHINA:
            return OpenAI(api_key=Aichina.API_KEY, base_url=Aichina.BASE_URL)
        else:
            raise ValueError(f"Invalid platform: {platform}")

    def add_chat_history(self, role: str, content: str) -> None:
        """Add a message to chat history"""
        self.chatHistory.append({"role": role, "content": content})

    def delete_chat_history(self) -> None:
        """Delete chat history"""
        self.chatHistory = []

    def send_prompt(self, user_prompt: str, if_json_format: bool = False) -> str:
        """Send prompt to AI model and get response"""
        debugger.info("--------send prompt---------\n" + user_prompt)
        messages = self.chatHistory.copy()
        messages.append({"role": "user", "content": user_prompt})
        try:
            if self.platform == Platforms.OLLAMA:
                response = self.client.beta.chat.completions.parse(
                    messages=messages,
                    model=self.model,
                    temperature=0,
                    max_tokens=4096,
                    top_p=1,
                    frequency_penalty=0.1,
                    presence_penalty=0.1,
                    stop=None,
                    response_format=QuerySpecWithSource if if_json_format else {"type": "json_object"},
                )
            else:
                response = self.client.chat.completions.create(
                    messages=messages,
                    model=self.model,
                    temperature=0,
                    max_tokens=2048,
                    top_p=1,
                    frequency_penalty=0.1,
                    presence_penalty=0.1,
                    stop=None,
                    response_format={"type": "json_object"} if if_json_format else None,
                )
        except Exception as e:
            debugger.error(f"[sendPrompt] {e}")
            return ""

        if not response or not response.choices[0].message.content:
            raise RuntimeError("No response text provided")

        text = response.choices[0].message.content
        debugger.info("--------response--------\n" + text)
        debugger.info("--------finished--------")

        if self.if_keep_history:
            self.add_chat_history("user", user_prompt)
            self.add_chat_history("assistant", text)

        return text


def test_parse_nl_query():
    # client = myAIClient(model=Azure.MODELS.GPT_4O, platform=Platforms.AZURE)
    dataset_info = """["AMZN", "DPZ", "BTC", "NFLX"]"""
    parse_nl_info = create_parse_nl_info(dataset_info)
    client = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
    client.set_system_prompt(parse_nl_system_prompt)
    # nl_query = "Find periods in AMZN when price first rose sharply then fell gradually"
    # nl_query = "Find periods in DPZ when price first fall sharply then rise gradually, and the whole duration is about 3 months"
    # nl_query = "Find periods in DPZ when price presented a triple-tops shape"
    # nl_query = "Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got lower and lower"
    # nl_query = "Find periods in Amazon stock where prices rose slowly, then rose quickly"
    # nl_query = "Find periods in AMZN when price first rose sharply with a duration of about 4 days and then presented a double-top shape with a duration of about a week."
    # nl_query = "Look up two consecutive rises and the first rise is more gentle than the second rise"
    # nl_query = "Find periods when price first presented a double-bottom shape with a duration of about a week and then presented a double-top shape with a duration higher than the first double-bottom's duration"
    # nl_query = "Look up a high plateau pattern"
    # nl_query = "Look up a flat basin pattern in Amazon and Netflix"
    # nl_query = "Look up a flat basin pattern"
    # nl_query = "Find periods when price rose sharply with a duration of about 4 days"
    # nl_query = "Find periods when price rose sharply with a duration of about 4 days, then fell gradually"
    # nl_query = "Find periods when price present a head-and-shoulders shape"
    # nl_query = "Find periods when price first rise then present a head-and-shoulders shape about 4 weeks then fell"
    # nl_query = "Find periods when price first rise then present a consecutive peaks shape about 4 weeks then fell"
    # nl_query = "找两个连续的上升趋势，第一个上升趋势的斜率大于第二个上升趋势的斜率"
    nl_query = "Find periods when price first rise then fall sharply then rise where the first segment's start value is less than the end of the second segment"
    # print(system_prompt)
    parse_nl_user_prompt = parse_nl_info + "Input:\n" + nl_query + "\n\n" + "Output:"


def test_modify_nl_query():
    client = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
    client.set_system_prompt(modify_nl_system_prompt)
    modify_nl_info = create_modify_nl_info()
    modify_prompt = (
        modify_nl_info
        + "\n"
        + """
输入：
old_queryspec_with_source:
```
{
  "original_text": "Find periods in AMZN when price first fell then presented a flat trend",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "fell",
      "index": 0
    },
    {
      "text": "a flat trend",
      "index": 0
    }
  ],
  "target": {
    "target": "AMZN",
    "text_source_id": 0
  },
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 2
      }
    }
  ],
  "trend_groups": [],
  "single_relations": [],
  "group_relations": [],
}
```

segments:
```
[
  {
    "source": "result",
    "relative_slope": 2.0044006295398686,
    "daily_average_delta_percentage": -0.808347110206753,
    "delta_percentage": -17.699390117203826,
    "end_time": 1397174400,
    "end_value": 311.730011,
    "slope": -0.00003233023630401235,
    "start_time": 1395100800,
    "start_value": 378.769989,
    "duration": 2073600
  },
  {
    "source": "result",
    "relative_slope": 0.00012242216338669335,
    "daily_average_delta_percentage": 0.000054724881026757544,
    "delta_percentage": 0.016035671329695883,
    "end_time": 1422489600,
    "end_value": 311.779999,
    "slope": 1.9746239413468913e-9,
    "start_time": 1397174400,
    "start_value": 311.730011,
    "duration": 25315200
  },
  {
    "source": "user",
    "relative_slope": 30.67595048894415,
    "daily_average_delta_percentage": -13.711591550810166,
    "delta_percentage": -13.711591550810159,
    "end_time": 1422576000,
    "end_value": 306.018299,
    "slope": -0.0004947916666666667,
    "start_time": 1422489600,
    "start_value": 311.779999,
    "duration": 86400
  }
]
```

intentions:
```
{
  "single_segment_intentions": [
    {
      "id": 0,
      "single_choices":["daily_average_delta_percentage"]
    },
    {
      "id": 2,
      "single_choices":["category", "daily_average_delta_percentage"]
    }
  ],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```
输出：
    """
    )
    response = client.send_prompt(modify_prompt, False)
    print(response)


if __name__ == "__main__":
    test_parse_nl_query()
    # test_modify_nl_query()
