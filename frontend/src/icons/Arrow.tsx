import Base from "./Base";

export default function ArrowIcon({ className }: { className?: string }) {
    return (
        <Base className={className}>
            <svg width="13" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6.5 7L12 1" stroke="black" />
            </svg>
        </Base>
    )
}
