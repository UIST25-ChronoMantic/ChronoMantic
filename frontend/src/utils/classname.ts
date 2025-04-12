type ClassValue =
    | string
    | string[]
    | undefined
    | { [key: string]: boolean }
    | ClassValue[];

export function classnames(...args: ClassValue[]): string {
    args = args.filter(Boolean);
    const classes: string[] = [];
    const processArg = (arg: ClassValue) => {
        if (typeof arg === 'string') {
            const strClasses = arg.split(' ').filter(Boolean);
            classes.push(...strClasses);
        } else if (Array.isArray(arg)) {
            arg.forEach(processArg);
        } else if (typeof arg === 'object') {
            Object.entries(arg).forEach(([key, value]) => {
                if (value) {
                    classes.push(key);
                }
            });
        }
    };
    args.forEach(processArg);
    return [...new Set(classes)].join(' ');
}