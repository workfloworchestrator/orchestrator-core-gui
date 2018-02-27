import {isEmpty} from "../utils/Utils";

export function filterProductsByTagAndBandwidth(products, tag, bandwidth) {
    return products.filter(prod => {
        if (prod.tag !== tag) {
            return false;
        }
        const fixedInputs = prod.fixed_inputs;
        if (fixedInputs && !isEmpty(bandwidth)) {
            const speed = fixedInputs.find(fi => fi.name === "port_speed");
            if (speed && parseInt(speed.value, 10) < parseInt(bandwidth, 10)) {
                return false;
            }
        }
        return true;
    });
}
