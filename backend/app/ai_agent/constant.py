from datetime import datetime

FUZZY_FACTOR = 0.1


class Platforms:
    AZURE = "azure"
    DEEPSEEK = "deepseek"
    SILIICONFLOW = "siliconflow"
    QWEN = "qwen"
    TENCENT = "tencent"
    GROQ = "groq"
    OLLAMA = "ollama"
    AICHINA = "aichina"


class Azure:
    API_KEY = "c1812815d31d45aa9b450a22fc875845"
    ENDPOINT = "https://idg-oai.openai.azure.com/"
    API_VERSION = "2024-11-01-preview"

    class MODELS:
        GPT_4O = "gpt-4o"
        GPT_4O_REALTIME = "gpt-4o-realtime-preview"


class DeepSeek:
    API_KEY = "sk-8afa35e69734436e88fec6fb5191e954"
    BASE_URL = "https://api.deepseek.com"

    class MODELS:
        CHAT = "deepseek-chat"
        REASONER = "deepseek-reasoner"


class SiliconFlow:
    API_KEY = "sk-vjgfhfunedghhljnnwfdpvnheuppfktpbxvczttcmygtukxh"
    BASE_URL = "https://api.siliconflow.cn/v1"

    class MODELS:
        DEEPSEEK_V3 = "deepseek-ai/DeepSeek-V3"


class Qwen:
    API_KEY = "sk-36a33471d5da4a468e5121c7273c133d"
    BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    class MODELS:
        QWEN_MAX = "qwen-max-2025-01-25"
        QWEN_TURBO = "qwen-turbo-latest"
        QWEN_2_5_32B = "qwen2.5-32b"
        QWEN_2_5_32B_INSTRUCT = "qwen2.5-32b-instruct"


class Tencent:
    API_KEY = "sk-bWgXpqCRfyC108ugmWMAV8c8mlc9FORV4x7jszWforXf5RPJ"
    BASE_URL = "https://api.lkeap.cloud.tencent.com/v1"

    class MODELS:
        DEEPSEEK_V3 = "deepseek-v3"


class GroqPlatform:
    # API_KEY = "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"
    API_KEY = "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"
    BASE_URL = "https://api.groq.com/v1"

    class MODELS:
        LLAMA3_3 = "llama-3.3-70b-versatile"
        QWEN2_5_32B = "qwen-2.5-32b"


class Ollama:
    BASE_URL = "http://localhost:11434/v1"
    API_KEY = "ollama"

    class MODELS:
        LLAMA3_3 = "llama3.3:70b-it-8192"
        QWEN2_5_32B = "qwen2.5:32b-instruct-fp16"
        GEMMA3_12B = "gemma3:12b-it-fp16"


class Aichina:
    API_KEY = "sk-OMUICYXF9CtERDFhPLDHnTvRqJ2P9QRqlE2Vvge9Qg9dihAC"
    BASE_URL = "https://ai.api.xn--fiqs8s/v1"

    class MODELS:
        QWEN2_5 = "qwen2.5-32b-instruct"
        CLAUDE3_5 = "claude-3-5-sonnet-latest"
        GEMINI2_0 = "gemini-2.0-flash"


PROMPT_SPLITTER = "\n\n"
NOW = datetime.now().strftime("%Y-%m-%d")

if __name__ == "__main__":
    pass
