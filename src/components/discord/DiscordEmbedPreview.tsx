interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

interface DiscordEmbedPreviewProps {
    title?: string;
    description?: string;
    color?: string; // Hex string
    author?: string;
    footer?: string;
    image?: string;
    thumbnail?: string;
    timestamp?: string; // ISO string
    fields?: EmbedField[];
}

export function DiscordEmbedPreview({
    title,
    description,
    color = '#2f3136', // Default background if no color strip? Actually discord default is grey border
    author,
    footer,
    image,
    thumbnail,
    timestamp,
    fields = []
}: DiscordEmbedPreviewProps) {

    // Parse color. If explicit hex provided, use it for side border. 
    // Embed actual background is always #2f3136 (dark theme) or similar.
    const borderColor = color && color.startsWith('#') ? color : '#202225';

    // Process timestamp
    let formattedTime = '';
    if (timestamp) {
        try {
            // "Today at X:XX PM" style roughly
            const date = new Date(timestamp);
            const isToday = new Date().toDateString() === date.toDateString();
            const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            formattedTime = isToday ? `Today at ${timeStr}` : date.toLocaleString();
        } catch {
            formattedTime = timestamp; // Fallback
        }
    }

    return (
        <div className="bg-[#36393f] p-4 rounded text-left font-sans text-white/90 max-w-[400px] text-[14px]">
            <style>{`
                .embed-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 8px;
                    margin-top: 8px;
                }
                .embed-field-inline {
                    grid-column: span 1;
                }
                .embed-field-block {
                    grid-column: span 3;
                }
            `}</style>

            <div className="flex bg-[#2f3136] rounded border-l-4 shadow-sm" style={{ borderLeftColor: borderColor }}>
                <div className="p-4 flex flex-col gap-2 w-full max-w-full overflow-hidden">

                    {/* Author */}
                    {author && <div className="font-semibold text-xs text-zinc-300 mb-1">{author}</div>}

                    {/* Title + Description + Fields + Image */}
                    <div className="flex gap-4">
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                            {/* Title */}
                            {title && <div className="font-semibold text-blue-400 hover:underline cursor-pointer wrap-break-words">{title}</div>}

                            {/* Description */}
                            {description && <div className="text-zinc-300 whitespace-pre-wrap wrap-break-words text-sm">{description}</div>}

                            {/* Fields */}
                            {fields && fields.length > 0 && (
                                <div className="embed-grid">
                                    {fields.map((f, i) => (
                                        <div key={i} className={f.inline ? 'embed-field-inline' : 'embed-field-block'}>
                                            <div className="font-semibold text-zinc-400 text-xs mb-0.5">{f.name}</div>
                                            <div className="text-zinc-300 text-sm whitespace-pre-wrap">{f.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail (Right side) */}
                        {thumbnail && (
                            <div className="shrink-0 w-[80px] h-[80px] rounded overflow-hidden ml-4">
                                <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Main Image (Full Width) */}
                    {image && (
                        <div className="mt-3 rounded overflow-hidden max-w-full">
                            <img src={image} alt="Embed Image" className="w-full h-auto object-cover max-h-[300px]" />
                        </div>
                    )}

                    {/* Footer + Timestamp */}
                    {(footer || formattedTime) && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                            {/* We could add generic icon if provided, simplistic for now */}
                            {footer && <span>{footer}</span>}
                            {footer && formattedTime && <span>•</span>}
                            {formattedTime && <span>{formattedTime}</span>}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
