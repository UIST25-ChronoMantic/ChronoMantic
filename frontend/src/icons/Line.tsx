import Base from "./Base";

export default function LineIcon({ className }: { className?: string }) {
    return (
        <Base className={className}>
            <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 1H10" stroke="black" />
            </svg>
        </Base>
    )
}
