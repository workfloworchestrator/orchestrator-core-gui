export type Override<T, U> = U & Omit<T, keyof U>;

export type _UniformContext = {
    name: never[];
    error: any;
    model: any;
    state: {
        changed: boolean;
        changedMap: any;
        submitting: any;
        label: boolean;
        disabled: boolean;
        placeholder: boolean;
        showInlineError: boolean;
    };
    schema: any;
    onChange: (key: any, value: any) => void;
    onSubmit: (event?: any) => any;
    randomId: any;
};

export type UniformContext = {
    uniforms: _UniformContext;
};
