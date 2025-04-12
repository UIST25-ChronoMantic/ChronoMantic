from datetime import datetime
from typing import Dict, List, Optional
import pandas as pd
from app.config import Config
from app.model_v1 import generate_fm_dict
from ..MyTypes_v0 import TableInfo, TimeSeriesData


def get_metadata_columns(csv, time_column_name, value_column_name, id_column_name):
    csv_file = pd.read_csv(Config.UPLOAD_FOLDER + csv)
    columns = csv_file.columns
    metadata_columns = []
    for col in columns:
        if col not in [time_column_name, value_column_name, id_column_name]:
            count_per_group = csv_file.groupby(id_column_name)[col].transform("nunique")
            if (count_per_group == 1).all():
                metadata_columns.append(col)
    return metadata_columns


def process_dataset(csv, time_column_name, value_column_name, id_column_name):
    """
    Return:
        table_info: TableInfo,表头信息
        metadata_dict: Dict[str, Dict[str, List[str]]], 元数据字典索引
        time_series_dataset: Dict[str, TimeSeriesData], 时间序列数据集
    """
    csv_file = pd.read_csv(Config.UPLOAD_FOLDER + csv)
    columns = csv_file.columns
    if time_column_name not in columns or value_column_name not in columns or id_column_name not in columns:
        return None, None, None
    metadata_columns = get_metadata_columns(csv, time_column_name, value_column_name, id_column_name)
    table_info: TableInfo = TableInfo(time_column=time_column_name, value_column=value_column_name, id_column=id_column_name, metadata_columns=metadata_columns)

    metadata_dict: Dict[str, Dict[str, List[str]]] = {}
    for col in metadata_columns:
        metadata_dict[col] = {}
        for value in csv_file[col].unique():
            metadata_dict[col][value] = list(csv_file[csv_file[col] == value][id_column_name].unique())

    time_series_dataset: Dict[str, TimeSeriesData] = {}
    for id in csv_file[id_column_name].unique():
        data = csv_file[csv_file[id_column_name] == id]
        time_series_dataset[id] = TimeSeriesData(
            x=[datetime.strptime(time, "%Y-%m-%d").timestamp() for time in list(data[time_column_name])], y=list(data[value_column_name])
        )

    fm_dict = generate_fm_dict(time_series_dataset)

    return table_info, metadata_dict, time_series_dataset, fm_dict
