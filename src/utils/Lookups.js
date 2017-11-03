import {isEmpty} from "./Utils";

export function organisationNameByUuid(uuid, organisations) {
    const organisation = organisations.find(org => org.uuid === uuid);
    return organisation ? organisation.name : uuid;
}

export function enrichSubscription(subscription, organisations, products) {
    subscription.customer_name = organisationNameByUuid(subscription.client_id, organisations);
    subscription.product_name = productNameById(subscription.product_id, products);
    subscription.end_date_epoch = subscription.end_date ? new Date(subscription.end_date).getTime() : 0;
    subscription.start_date_epoch = subscription.start_date ? new Date(subscription.start_date).getTime() : 0;
}


export function productNameById(id, products) {
    const product = products.find(prod => prod.identifier === id);
    return product ? product.name : id;
}

export function productById(id, products) {
    const product = products.find(prod => prod.identifier === id);
    return product;
}

export function renderDateTime(epoch) {
    return new Date(epoch * 1000).toLocaleString();
}

export function renderDate(s) {
    return isEmpty(s) ? "" : new Date(s).toLocaleDateString();
}

export function capitalize(s) {
    return isEmpty(s) ? "" : s.charAt(0).toUpperCase() + s.slice(1);
}

