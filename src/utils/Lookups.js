import {isEmpty} from "./Utils";

export function organisationNameByUuid(uuid, organisations) {
    const organisation = organisations.find(org => org.uuid === uuid);
    return organisation ? organisation.name : uuid;
}

export function productNameById(id, products) {
    const product = products.find(prod => prod.identifier === id);
    return product ? product.name : id;
}

export function productById(id, products) {
    const product = products.find(prod => prod.identifier === id);
    return product;
}


export function renderDate(epoch) {
    return new Date(epoch * 1000).toLocaleString();
}

export function capitalize(s) {
    return isEmpty(s) ? "" : s.charAt(0).toUpperCase() + s.slice(1);
}

