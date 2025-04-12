from dataclasses import fields
from enum import Enum
from typing import Any, Dict, List, Optional, Type, TypeVar, Union, get_args, get_origin

T = TypeVar("T", bound="DictMixin")


class DictMixin:
    @classmethod
    def from_dict(cls: Type[T], data: Any) -> Optional[T]:
        """从字典创建实例，支持嵌套对象和列表"""
        # 处理空值
        if data is None:
            return None

        # 处理非字典和列表类型的数据
        if not isinstance(data, (dict, list)):
            return cls._handle_simple_type(data)

        # 处理列表类型
        if isinstance(data, list):
            return cls._handle_list_type(data)

        # 处理字典类型
        return cls._handle_dict_type(data)

    @classmethod
    def _handle_simple_type(cls, data: Any) -> Any:
        """处理简单类型数据（非字典非列表）"""
        if isinstance(cls, type) and issubclass(cls, Enum):
            return cls._convert_to_enum_type(cls, data)
        return data

    @classmethod
    def _handle_list_type(cls, data: List) -> List:
        """处理列表类型数据"""
        # 获取List泛型参数类型
        if hasattr(cls, "__orig_bases__"):
            for base in cls.__orig_bases__:
                if getattr(base, "_name", None) == "List":
                    item_type = base.__args__[0]
                    return [item_type.from_dict(item) if hasattr(item_type, "from_dict") else item for item in data]
        return data

    @classmethod
    def _handle_dict_type(cls, data: Dict) -> T:
        """处理字典类型数据"""
        # 获取类型注解
        field_types = cls.__annotations__ if hasattr(cls, "__annotations__") else {}

        # 准备构造函数参数
        kwargs = {}
        for key, value in data.items():
            if key not in field_types:
                kwargs[key] = value
                continue

            field_type = field_types[key]
            kwargs[key] = cls._process_field_value(field_type, value)

        return cls(**kwargs)

    @classmethod
    def _process_field_value(cls, field_type: Type, value: Any) -> Any:
        """处理字段值"""
        # 处理 Optional/Union 类型
        origin = get_origin(field_type)
        if origin is Union:
            return cls._process_union_field(field_type, value)

        # 处理 List 类型
        if cls._is_list_type(field_type):
            return cls._process_list_field(field_type, value)

        # 处理枚举类型
        if cls._is_enum_type(field_type):
            return cls._convert_to_enum_type(field_type, value)

        # 处理自定义类型
        if hasattr(field_type, "from_dict"):
            return field_type.from_dict(value)

        return value

    @classmethod
    def _process_union_field(cls, field_type: Type, value: Any) -> Any:
        """处理联合类型字段"""
        types = get_args(field_type)
        
        # 如果值是 None 且 None 在允许的类型中，直接返回 None
        if value is None and type(None) in types:
            return None
            
        # 尝试每个可能的类型
        errors = []
        for t in types:
            if t is type(None):  # 跳过None类型
                continue
                
            try:
                # 处理枚举类型
                if cls._is_enum_type(t):
                    try:
                        return cls._convert_to_enum_type(t, value)
                    except ValueError as e:
                        errors.append(f"Failed to convert to {t.__name__}: {str(e)}")
                        continue
                
                # 处理List类型
                if cls._is_list_type(t) and isinstance(value, list):
                    try:
                        item_type = get_args(t)[0]
                        return [
                            item_type.from_dict(item) if hasattr(item_type, "from_dict") 
                            else item 
                            for item in value
                        ]
                    except Exception as e:
                        errors.append(f"Failed to convert list to {t.__name__}: {str(e)}")
                        continue
                
                # 处理自定义类型
                if hasattr(t, "from_dict"):
                    try:
                        result = t.from_dict(value)
                        if result is not None:
                            return result
                    except Exception as e:
                        errors.append(f"Failed to convert to {t.__name__} using from_dict: {str(e)}")
                        continue
                
                # 处理基本类型
                try:
                    if isinstance(value, t):
                        return value
                    # 尝试类型转换
                    converted = t(value)
                    return converted
                except (ValueError, TypeError) as e:
                    errors.append(f"Failed to convert to {t.__name__}: {str(e)}")
                    continue
                    
            except Exception as e:
                errors.append(f"Unexpected error converting to {t.__name__}: {str(e)}")
                continue
        
        # 如果所有转换都失败，抛出详细的错误信息
        error_msg = (
            f"Could not convert value '{value}' (type: {type(value).__name__}) "
            f"to any of the expected types: {[t.__name__ for t in types if t is not type(None)]}. "
            f"Errors: {'; '.join(errors)}"
        )
        raise ValueError(error_msg)

    @classmethod
    def _is_optional_type(cls, field_type: Type) -> bool:
        """判断是否为Optional类型"""
        origin = get_origin(field_type)
        return origin is Union and type(None) in get_args(field_type)

    @classmethod
    def _get_non_none_type(cls, field_type: Type) -> Type:
        """获取Optional类型中的非None类型"""
        return next(t for t in get_args(field_type) if t is not type(None))

    @classmethod
    def _is_list_type(cls, field_type: Type) -> bool:
        """判断是否为List类型"""
        return get_origin(field_type) is list

    @classmethod
    def _is_enum_type(cls, field_type: Type) -> bool:
        """判断是否为枚举类型"""
        return isinstance(field_type, type) and issubclass(field_type, Enum)

    @classmethod
    def _process_list_field(cls, field_type: Type, value: List) -> List:
        """处理列表类型字段"""
        item_type = get_args(field_type)[0]
        if hasattr(item_type, "from_dict"):
            return [item_type.from_dict(item) for item in value]
        return value

    @classmethod
    def _convert_to_enum_type(cls, enum_type: Type[Enum], value: Any) -> Enum:
        """转换为枚举类型"""
        if isinstance(value, str):
            try:
                return enum_type[value]
            except KeyError:
                for enum_member in enum_type:
                    if enum_member.value == value:
                        return enum_member
                raise ValueError(f"Invalid enum value: {value}")
        return enum_type(value)

    def to_dict(self) -> Dict:
        """将实例转换为字典"""

        def serialize(obj: Any) -> Any:
            if hasattr(obj, "to_dict"):
                return obj.to_dict()
            elif isinstance(obj, list):
                return [serialize(item) for item in obj]
            elif isinstance(obj, Enum):
                return obj.value
            elif hasattr(obj, "item"):  # 处理NumPy类型
                return obj.item()
            return obj

        return {field.name: serialize(getattr(self, field.name)) for field in fields(self)}
