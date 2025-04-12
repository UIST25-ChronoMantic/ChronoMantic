export const generateId = (length: number = 10) => {
	return Math.random().toString(36).substring(2, length + 2);
};

export const generateIdWithPrefix = (prefix: string) => {
	return `${prefix}-${generateId()}`;
};
