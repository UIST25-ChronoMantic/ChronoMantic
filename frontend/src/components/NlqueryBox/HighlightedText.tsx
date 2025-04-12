import { memo } from 'react';
import { QuerySpecWithSource } from '../../types/QuerySpec';
import { getColorFromMap } from '../../utils/color';

interface HighlightedTextProps {
    text: string;
    colorMap: Record<string, string>;
    query: QuerySpecWithSource | null;
    onToggleDisabled: (id: number) => void;
}

const HighlightedText = memo(({ text, colorMap, query, onToggleDisabled }: HighlightedTextProps) => {
    if (!text || !colorMap || !query) return <>{text}</>;

    const highlights = Object.entries(query.text_sources).reduce<Array<{
        index: number;
        length: number;
        text: string;
        color: string;
        text_source_id: number;
        disabled: boolean;
    }>>((acc, [text_source_id, textSource]) => {
        if (!colorMap[text_source_id]) return acc;
        const regex = new RegExp(`${textSource.text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'g');
        let match;
        const matches: number[] = [];

        while ((match = regex.exec(text)) !== null) {
            matches.push(match.index);
        }

        if (matches.length > 0) {
            const targetIndex = matches.length <= textSource.index ? matches.length - 1 : textSource.index;
            acc.push({
                index: matches[targetIndex],
                length: textSource.text.length,
                text: textSource.text,
                color: textSource.disabled ? "#eee" : getColorFromMap(colorMap, parseInt(text_source_id)),
                text_source_id: parseInt(text_source_id),
                disabled: textSource.disabled || false,
            });
        }
        
        return acc;
    }, []);

    highlights.sort((a, b) => a.index - b.index);

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach(highlight => {
        if (highlight.index > lastIndex) {
            elements.push(text.substring(lastIndex, highlight.index));
        }
        elements.push(
            <span
                key={`${highlight.text_source_id}`}
                style={{
                    background: highlight.color,
                    textDecoration: highlight.disabled ? "line-through" : "none",
                    opacity: highlight.disabled ? 0.5 : 1,
                }}
                className="pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleDisabled(highlight.text_source_id);
                }}
            >
                {highlight.text}
            </span>
        );
        lastIndex = highlight.index + highlight.length;
    });

    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }

    return <>{elements}</>;
});

export default HighlightedText; 