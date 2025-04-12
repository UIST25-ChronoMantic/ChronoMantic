export function deepClone<T>(value: T): T {
    if (value === null || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(deepClone) as unknown as T;
    }

    if (value instanceof Date) {
        return new Date(value.getTime()) as unknown as T;
    }

    if (value instanceof Map) {
        const result = new Map();
        value.forEach((v, k) => result.set(k, deepClone(v)));
        return result as unknown as T;
    }

    if (value instanceof Set) {
        const result = new Set();
        value.forEach(v => result.add(deepClone(v)));
        return result as unknown as T;
    }

    const result: Record<string, T[keyof T]> = {};
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            result[key] = deepClone(value[key]);
        }
    }
    return result as T;
}

export function deepEqual<T>(obj1: T, obj2: T): boolean {
    if (obj1 === obj2) {
        return true;
    }
    if (obj1 === null || obj2 === null) {
        return false;
    }
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const value1 = (obj1 as Record<string, unknown>)[key];
        const value2 = (obj2 as Record<string, unknown>)[key];
        if (!deepEqual(value1, value2)) {
            return false;
        }
    }
    return true;
}