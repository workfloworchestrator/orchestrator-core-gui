import invariant from "invariant";
import { createElement } from "react";
import { BaseField } from "uniforms";

import BoolField from "./BoolField";
import DateField from "./DateField";
import HiddenField from "./HiddenField";
import ListField from "./ListField";
import LongTextField from "./LongTextField";
import NestField from "./NestField";
import NumField from "./NumField";
import RadioField from "./RadioField";
import SelectField from "./SelectField";
import TextField from "./TextField";

export default class AutoField extends BaseField {
    static displayName = "AutoField";

    getChildContextName() {
        return this.context.uniforms.name;
    }

    render() {
        const props = this.getFieldProps(undefined, { ensureValue: false });
        let { component } = props;

        if (component === undefined) {
            if (props.allowedValues) {
                if (props.checkboxes && props.fieldType !== Array) {
                    component = RadioField;
                } else {
                    component = SelectField;
                }
            } else {
                switch (props.fieldType) {
                    case Date:
                        component = DateField;
                        break;
                    case Array:
                        component = ListField;
                        break;
                    case Number:
                        component = NumField;
                        break;
                    case Object:
                        component = NestField;
                        break;
                    case String:
                        component = TextField;
                        break;
                    case Boolean:
                        component = BoolField;
                        break;
                    case "Hidden":
                        component = HiddenField;
                        break;
                    case "LongText":
                        component = LongTextField;
                        break;
                }

                invariant(component, "Unsupported field type: %s", props.fieldType.toString());
            }
        }

        return createElement(component, this.props);
    }
}
