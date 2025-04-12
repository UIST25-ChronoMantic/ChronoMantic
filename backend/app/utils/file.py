import os
import pandas as pd
from app.config import Config


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS


def process_csv_file(file):
    if file.filename == "":
        raise ValueError("No file selected")

    if not allowed_file(file.filename):
        raise ValueError("Invalid file type. Only CSV files are allowed.")

    # 确保上传目录存在
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)

    # 保存文件
    file_path = os.path.join(Config.UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # 读取CSV文件内容
    df = pd.read_csv(file_path)

    return df, {"filename": file.filename, "row_count": len(df)}
