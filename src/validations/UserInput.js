import { isEmpty } from "../utils/Utils";
import { validEmailRegExp } from "./Subscriptions";

const inValidVlan = vlan => {
    const value = vlan || "";

    const stripped = value.toString().replace(/ /g, "");
    return !/^\d{1,4}(?:-\d{1,4})?(?:,\d{1,4}(?:-\d{1,4})?)*$/.test(stripped) || stripped.split(",").some(inValidRange);
};

const inValidRange = range => {
    if (range.indexOf("-") > -1) {
        const ranges = range.split("-");
        return ranges.some(inValidRange) || parseInt(ranges[0], 10) >= parseInt(ranges[1], 10);
    }
    return range < 2 || range > 4094;
};

const inValidServicePort = (sp, isElan) => {
    if ((sp.tag === "SSP" || sp.port_mode === "untagged") && (isEmpty(sp.vlan) || sp.vlan === "0" || sp.vlan === "")) {
        return false;
    }
    if (isEmpty(sp)) {
        return true;
    }
    return isElan ? inValidVlan(sp.vlan) || isEmpty(sp.bandwidth) : inValidVlan(sp.vlan);
};

export function doValidateUserInput(userInput, val, errors) {
    const type = userInput.type;
    const name = userInput.name;
    const value = val || "";
    if (type === "vlan_range") {
        errors[name] = inValidVlan(value);
    } else if (type === "uuid") {
        errors[name] = !/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}$/.test(
            value
        );
    } else if (type === "nms_service_id") {
        errors[name] = !/^[0-9]{4}$/.test(value);
    } else if (type === "contact_persons") {
        errors[name] = isEmpty(value) || value.some(p => !validEmailRegExp.test(p.email));
    } else if (type === "service_ports" || type === "service_ports_sn8") {
        errors[name] =
            isEmpty(value) || (Array.isArray(value) && value.some(sp => inValidServicePort(sp, userInput.elan)));
    } else if (type === "accept") {
        errors[name] = !value;
    } else if (type === "boolean") {
        errors[name] = isEmpty(!!value);
    } else if (type === "crm_port_id") {
        errors[name] = !/^\d{5}$/.test(value);
    } else if (type === "ip_prefix") {
        errors[name] = isEmpty(value);
    } else if (type === "stp") {
        if (isEmpty(value)) {
            errors[name] = true;
        } else {
            const ogf_network = /^urn:ogf:network:/;
            const label = /\?vlan=\d+(?:-\d+)?$/;
            const localpart = value.replace(ogf_network, "").replace(label);
            errors[name] = !(ogf_network.test(value) && localpart.includes(":") && label.test(value));
        }
    } else if (type === "label" || type === "ims_changes" || type === "table_summary" || type === "migration_summary") {
        errors[name] = false;
    } else if (type === "jira_ticket") {
        errors[name] = !/^[A-Z]{4}-[0-9]{4,10}$/i.test(value);
    } else {
        errors[name] = userInput.required === false ? false : isEmpty(value);
    }
}
