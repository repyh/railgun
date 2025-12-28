import React from 'react';

export function InputControl(props: { data: any }) {
    const [value, setValue] = React.useState(props.data.value);

    React.useEffect(() => {
        setValue(props.data.value);
    }, [props.data.value]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue(val);
        props.data.setValue(val);
    };

    return (
        <input
            value={value}
            onChange={onChange}
            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging node when typing
            className="rounded bg-zinc-800 border border-zinc-700 text-xs text-white px-2 py-1 w-full min-w-[120px]"
        />
    );
}
