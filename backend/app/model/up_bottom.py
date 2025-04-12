import numpy as np
import heapq
import matplotlib.pyplot as plt

def precompute_segment_error(y):
    """使用两个端点确定直线，计算所有点到直线的均方根误差(RMSE)"""
    segment_error_matrix = np.zeros((len(y), len(y)))
    for i in range(len(y) - 1):
        for j in range(i + 1, len(y)):
            # 用两个端点确定直线
            x1, y1 = i, y[i]
            x2, y2 = j, y[j]

            # 计算直线参数 y = mx + b
            m = (y2 - y1) / (x2 - x1)
            b = y1 - m * x1

            # 计算所有点的误差（包括端点）
            x = np.arange(i, j + 1)
            y_pred = m * x + b
            y_actual = y[i : j + 1]
            error = np.mean(np.abs(y_actual - y_pred))

            segment_error_matrix[i, j] = error

    return segment_error_matrix

def up_bottom_split(y: np.ndarray, k: int):
    segment_error_matrix = precompute_segment_error(y)
    length = len(y)
    segments = [(0, length - 1)]
    error_heap = []
    
    # 修正这里：直接使用矩阵值
    for segment in segments:
        error = segment_error_matrix[segment[0], segment[1]]
        heapq.heappush(error_heap, (-error, segment))
        
    while len(segments) < k:
        _, (start, end) = heapq.heappop(error_heap)
        if start >= end - 1:
            continue
        segments.remove((start, end))
        
        sum_error = segment_error_matrix[start, end] * (end - start + 1)
        split = start
        min_sum_error = float('inf')
        
        for temp in range(start + 1, end):
            sum_error1 = segment_error_matrix[start, temp] * (temp - start + 1)
            sum_error2 = segment_error_matrix[temp, end] * (end - temp + 1)
            if sum_error1 + sum_error2 < min_sum_error:
                min_sum_error = sum_error1 + sum_error2
                split = temp
                
        segments.append((start, split))
        segments.append((split, end))
        
        # 添加新段到堆中
        heapq.heappush(error_heap, (-segment_error_matrix[start, split], (start, split)))
        heapq.heappush(error_heap, (-segment_error_matrix[split, end], (split, end)))

    segments.sort(key=lambda x: x[0])
    return segments

def generate_data():
    np.random.seed(42)
    x = np.arange(350)
    y = np.zeros_like(x, dtype=float)
    
    # 第一段：线性上升
    y[:100] = 0.2 * x[:100] + 20 + np.random.normal(0, 0.5, 100)
    
    # 第二段：平稳略降
    y[100:270] = -0.02 * (x[100:270] - 100) + 40 + np.random.normal(0, 0.5, 170)
    
    # 第三段：快速上升
    y[270:] = 0.2 * (x[270:] - 270) + 35 + np.random.normal(0, 0.5, 80)
    
    return x, y

def visualize_segments(x, y, segments, k):
    plt.figure(figsize=(12, 6))
    plt.scatter(x, y, c='blue', s=10, label='原始数据')
    
    colors = ['red', 'green', 'purple', 'orange', 'brown', 'pink']
    for i, (start, end) in enumerate(segments):
        x_seg = x[start:end+1]
        y_seg = y[start:end+1]
        coeffs = np.polyfit(x_seg, y_seg, 1)
        y_fit = np.polyval(coeffs, x_seg)
        plt.plot(x_seg, y_fit, c=colors[i % len(colors)], label=f'段 {i+1}', linewidth=2)
    
    plt.grid(True)
    plt.xlabel('时间')
    plt.ylabel('值')
    plt.title(f'分段拟合结果 (k={k})')
    plt.legend()
    plt.show()

if __name__ == "__main__":
    # 生成测试数据
    x, y = generate_data()
    
    # 测试不同的k值
    for k in [2, 3, 4]:
        segments = up_bottom_split(y, k)
        visualize_segments(x, y, segments, k)