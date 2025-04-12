export function upper(str: string, separator: string = " ", isFirstChar: boolean = true, join: string = " ") {
    return str.split(separator).map((s, index) => isFirstChar && index === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s).join(join);
}