export function CustomConnection(props: { data: any, path?: string }) {
    const { path } = props;

    if (!path) return null; // Should not happen usually

    return (
        <svg data-testid="connection">
            <path d={path} />
        </svg>
    );
}
