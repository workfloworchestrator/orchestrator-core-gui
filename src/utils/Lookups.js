import {isEmpty} from "./Utils";

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

