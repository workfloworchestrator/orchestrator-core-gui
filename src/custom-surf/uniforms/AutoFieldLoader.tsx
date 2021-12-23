import ContactPersonNameField from "custom/uniforms/ContactPersonNameField";
import ImsPortIdField from "custom/uniforms/ImsPortIdField";
import IPvAnyNetworkField from "custom/uniforms/IPvAnyNetworkField";
import ImsNodeIdField from "custom/uniforms/logic/ImsNodeIdField";
import VlanField from "custom/uniforms/VlanField";
import {
    AcceptField,
    BoolField,
    DateField,
    DividerField,
    LabelField,
    ListField,
    LocationCodeField,
    LongTextField,
    NestField,
    NumField,
    OptGroupField,
    OrganisationField,
    ProductField,
    RadioField,
    SelectField,
    SubscriptionField,
    SubscriptionSummaryField,
    SummaryField,
    TextField,
} from "lib/uniforms-surfnet/src";
import { Context, GuaranteedProps } from "uniforms";
import { AutoField } from "uniforms-unstyled";

export function autoFieldFunction(props: GuaranteedProps<unknown> & Record<string, any>, uniforms: Context<unknown>) {
    const { allowedValues, checkboxes, fieldType, field } = props;
    const { format } = field;

    switch (fieldType) {
        case Number:
            switch (format) {
                case "imsPortId":
                    return ImsPortIdField;
                case "imsNodeId":
                    return ImsNodeIdField;
            }

            break;
        case Object:
            switch (format) {
                case "optGroup":
                    return OptGroupField;
            }
            break;
        case String:
            switch (format) {
                case "subscriptionId":
                    return SubscriptionField;
                case "productId":
                    return ProductField;
                case "locationCode":
                    return LocationCodeField;
                case "organisationId":
                    return OrganisationField;
                case "contactPersonName":
                    return ContactPersonNameField;
                case "vlan":
                    return VlanField;
                case "long":
                    return LongTextField;
                case "label":
                    return LabelField;
                case "divider":
                    return DividerField;
                case "summary":
                    return SummaryField;
                case "subscription":
                    return SubscriptionSummaryField;
                case "accept":
                    return AcceptField;
                case "ipvanynetwork":
                    return IPvAnyNetworkField;
            }
            break;
    }

    if (allowedValues && format !== "accept") {
        if (checkboxes && fieldType !== Array) {
            return RadioField;
        } else {
            return SelectField;
        }
    } else {
        switch (fieldType) {
            case Array:
                return ListField;
            case Boolean:
                return BoolField;
            case Date:
                return DateField;
            case Number:
                return NumField;
            case Object:
                return NestField;
            case String:
                return TextField;
        }
    }

    return AutoField.defaultComponentDetector(props, uniforms);
}
