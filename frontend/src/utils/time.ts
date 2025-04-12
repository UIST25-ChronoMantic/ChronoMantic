import { Unit } from "../types/QuerySpec";

export function formatTime(time: Date | number | string, detail: Unit = Unit.SECOND): string {
    const date: Date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    const str = `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    return str.slice(0, detail === Unit.YEAR ? 4 : detail === Unit.MONTH ? 7 : detail === Unit.DAY ? 10 : detail === Unit.HOUR ? 13 : detail === Unit.MINUTE ? 16 : detail === Unit.SECOND ? 19 : 19);
}