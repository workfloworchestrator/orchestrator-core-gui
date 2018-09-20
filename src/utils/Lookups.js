import {isEmpty} from "./Utils";
import {ims_circuit_id} from "../validations/Subscriptions";
import {imsService, portByImsServiceId} from "../api";
const productLookup = (id, products) => products.find(prod => prod.product_id === id);

export function organisationNameByUuid(uuid, organisations) {
    const organisation = organisations.find(org => org.uuid === uuid);
    return organisation ? organisation.name : uuid;
}

export function enrichSubscription(subscription, organisations, products) {
    subscription.customer_name = organisationNameByUuid(subscription.customer_id, organisations);
    subscription.product_name = productNameById(subscription.product_id, products);
    subscription.end_date_epoch = subscription.end_date ? new Date(subscription.end_date).getTime() : 0;
    subscription.start_date_epoch = subscription.start_date ? new Date(subscription.start_date).getTime() : 0;
}

export function enrichPrimarySubscription(subscription, organisations, products){
    enrichSubscription(subscription, organisations, products);
    const product = productLookup(subscription.product_id, products);
    const fi_service_speed = product.fixed_inputs.find(fi => fi.name === "service_speed");
    subscription.service_speed = fi_service_speed ? fi_service_speed.value : "-";
    const si_primary = subscription.instances.find(si => si.label === 'Primary');
    const si_secondary = subscription.instances.find(si =>si.label === 'Secondary');
    subscription.nms_service_id_p = si_primary.values.find(v => v.resource_type.resource_type === 'nms_service_id').value;
    subscription.nms_service_id_s = si_secondary.values.find(v => v.resource_type.resource_type === 'nms_service_id').value;
}


export function enrichPortSubscription(parentSubscription, subscription){
    // fetch the label by subscription_id
    subscription.label = parentSubscription.instances.find(
        i => i.product_block.name === 'Service Attach Point' && i.values.find(
            rt => rt.resource_type.resource_type === 'port_subscription_id').value === subscription.subscription_id).label;

    //const si = parentSubscription.instances.find(i => i.label === label);
    //const sub_id = si.values.find(rt => rt.resource_type.resource_type === 'port_subscription_id').value;
        //const result = childSubscriptions.find(cs => cs.subscription_id === sub_id);
    // voor elk van de endpoints, haal daar de
    const vc_label_part = subscription.label.split("-")[0];
    const prim_sec_part = (subscription.label.split("-")[1] === 'left') ? 0 : 1;
    const si = parentSubscription.instances.find(i => i.label === vc_label_part);
    const imsCircuitId = si.values.find(v => v.resource_type.resource_type === 'ims_circuit_id').value;
    const imsServicePromise = imsService(ims_circuit_id,imsCircuitId );
    return new Promise((resolve, reject) => {
        imsServicePromise.then(result => {
            portByImsServiceId(result.json.endpoints[prim_sec_part].id).then(
                imsPort => {
                    subscription.ims_circuit_name = imsPort.line_name;
                    subscription.ims_node = imsPort.node;
                    subscription.ims_port = imsPort.port;
                    subscription.ims_iface_type = imsPort.iface_type;
                    subscription.ims_patch_position = imsPort.patchposition;
                    resolve(subscription);
                }
            );
        });
    });


}

export function productNameById(id, products) {
    const product = productLookup(id, products);
    return product ? product.name : id;
}


export function productTagById(id, products) {
    const product = productLookup(id, products);
    return product ? product.tag : id;
}


export function productById(id, products) {
    return productLookup(id, products);
}

export function renderDateTime(epoch) {
    return isEmpty(epoch) ? "" : new Date(epoch * 1000).toLocaleString("nl-NL") + " CET";
}

export function renderDate(epoch) {
    return isEmpty(epoch) ? "" : new Date(epoch * 1000).toLocaleDateString("nl-NL") + " CET";
}

export function capitalize(s) {
    return isEmpty(s) ? "" : s.charAt(0).toUpperCase() + s.slice(1);
}

