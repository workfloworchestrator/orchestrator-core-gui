import { HTMLProps, Ref } from "react";
import { Override, GuaranteedProps as UniformsGuaranteedProps } from "uniforms";

export type FieldProps<Value, Extra = {}, InputElementType = HTMLInputElement, ElementType = HTMLDivElement> = Override<
    HTMLProps<ElementType>,
    UniformsGuaranteedProps<Value> & {
        inputRef?: Ref<InputElementType>;
        description?: string;
    } & Extra
>;
