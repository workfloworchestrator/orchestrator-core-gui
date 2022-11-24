import {
    EuiBadge,
    EuiBasicTable,
    EuiButton,
    EuiButtonIcon,
    EuiDescriptionList,
    EuiHealth,
    EuiLink,
    EuiPanel,
    EuiScreenReaderOnly,
    EuiTitle,
    RIGHT_ALIGNMENT,
    formatDate,
} from "@elastic/eui";
import React, { Fragment, useEffect, useState } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

import impactedObjects from "../../../custom/components/cim/ImpactedObjects";
import { isEmpty } from "../../../utils/Utils";
import { ServiceTicketImpactedIMSCircuit, ServiceTicketWithDetails } from "../../types";
import ImsCircuitInfo from "./ImsCiruitInfo";
import { ImpactedObject, ImsInfo } from "./ServiceTicketDetailImpactedObjects";

interface IProps extends WrappedComponentProps {
    ticket: ServiceTicketWithDetails;
    // updateable: boolean;
    // acceptImpactedObjects: () => void;
    // showAcceptButton: boolean;
    mode: "withSubscriptions" | "withoutSubscriptions";
}

const ImpactedObjects = ({ ticket, mode }: IProps) => {
    const [sortField, setSortField] = useState("firstName");
    const [sortDirection, setSortDirection] = useState("asc");
    const [selectedItems, setSelectedItems] = useState([]);

    let data: ImpactedObject[] = [];
    let itemCounter = 0;
    for (const impactedObject of ticket.impacted_objects) {
        if (mode === "withoutSubscriptions" && impactedObject.subscription_id) {
            console.log("Skipping", impactedObject.subscription_id);
            continue;
        }
        if (mode === "withSubscriptions" && !impactedObject.subscription_id) {
            continue;
        }

        const tempImpactedCircuit: ImpactedObject = {
            id: `item-${itemCounter}`,
            customer: impactedObject.owner_customer.customer_name,
            impact: impactedObject.ims_circuits[0].impact,
            type: impactedObject.product_type,
            subscription: impactedObject.subscription_description,
            impact_override: impactedObject.impact_override,
            subscription_id: impactedObject.subscription_id,
            ims_info: impactedObject.ims_circuits,
        };
        data.push(tempImpactedCircuit);
        itemCounter += 1;
        // for (const impactedCircuit of impactedObject.ims_circuits) {
    }
    console.log(`Working mode: ${mode}. Filtered data: `, data);

    let allExpandedRows = {};
    for (const item of data) {
        // @ts-ignore
        allExpandedRows[item.id] = <ImsCircuitInfo imsInfo={item.ims_info}></ImsCircuitInfo>;
    }

    const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState(allExpandedRows);

    const onTableChange = ({ page = {}, sort = {} }) => {
        // const { index: pageIndex, size: pageSize } = page;
        //
        // const { field: sortField, direction: sortDirection } = sort;
        //
        // setSortField(sortField);
        // setSortDirection(sortDirection);
    };

    const onSelectionChange = (selectedItems: any) => {
        setSelectedItems(selectedItems);
    };

    const onClickDelete = () => {
        // store.deleteUsers(...selectedItems.map((user) => user.id));

        setSelectedItems([]);
    };

    const renderDeleteButton = () => {
        if (selectedItems.length === 0) {
            return;
        }
        return (
            <EuiButton color="danger" iconType="trash" onClick={onClickDelete}>
                Delete {selectedItems.length} Users
            </EuiButton>
        );
    };

    const toggleDetails = (item: ImpactedObject) => {
        const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
        // @ts-ignore
        if (itemIdToExpandedRowMapValues[item.id]) {
            // @ts-ignore
            delete itemIdToExpandedRowMapValues[item.id];
        } else {
            // @ts-ignore
            itemIdToExpandedRowMapValues[item.id] = <ImsCircuitInfo imsInfo={item.ims_info}></ImsCircuitInfo>;
            // const { nationality, online } = item;
            // const country = store.getCountry(nationality);
            // const color = online ? 'success' : 'danger';
            // const label = online ? 'Online' : 'Offline';
            // const listItems = [
            //     {
            //         title: 'Nationality',
            //         description: `${country.flag} ${country.name}`,
            //     },
            //     {
            //         title: 'Online',
            //         description: <EuiHealth color={color}>{label}</EuiHealth>,
            //     },
            // ];
            // itemIdToExpandedRowMapValues[item.id] = (
            //     <EuiDescriptionList listItems={listItems} />
            // );
        }
        setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
    };

    const deleteButton = renderDeleteButton();

    let columns = [
        {
            field: "customer",
            name: "Customer",
            sortable: true,
            truncateText: true,
            width: "20%",
        },
        {
            field: "subscription",
            name: "Subscription",
            // schema: 'date',
            // render: (date) => formatDate(date, 'dobLong'),
            sortable: true,
            render: (name: string, data: any) =>
                data.subscription_id ? (
                    <EuiLink href={`/subscriptions/${data.subscription_id}`} target="_blank">
                        {name}
                    </EuiLink>
                ) : (
                    ""
                ),
            width: "30%",
        },
        {
            field: "type",
            name: "Product type",
            truncateText: true,
            width: 100,
        },
        {
            field: "id",
            name: "Affected services",
            render: (id: string, data: any) => <EuiBadge>{data.ims_info.length}</EuiBadge>,
            width: 150,
        },
        {
            align: RIGHT_ALIGNMENT,
            field: "impact",
            name: "Impact",
            truncateText: true,
        },
        {
            align: RIGHT_ALIGNMENT,
            name: "Impact override",
            actions: [
                {
                    name: "Clone",
                    description: "Clone this person",
                    type: "icon",
                    icon: "copy",
                    onClick: () => "",
                },
            ],
        },
        {
            align: RIGHT_ALIGNMENT,
            width: "40px",
            isExpander: true,
            name: (
                <EuiScreenReaderOnly>
                    <span>Expand rows</span>
                </EuiScreenReaderOnly>
            ),
            render: (item: ImpactedObject) => (
                <EuiButtonIcon
                    onClick={() => toggleDetails(item)}
                    // @ts-ignore
                    aria-label={itemIdToExpandedRowMap[item.id] ? "Collapse" : "Expand"}
                    // @ts-ignore
                    iconType={itemIdToExpandedRowMap[item.id] ? "arrowUp" : "arrowDown"}
                />
            ),
        },
    ];

    // Hide subscription column when not needed
    if (mode === "withoutSubscriptions") {
        columns = columns.filter((c) => c.field !== "subscription");
    }

    return (
        <Fragment>
            {deleteButton}
            <EuiTitle>
                <h2>
                    {mode === "withSubscriptions"
                        ? "Impact on subscriptions"
                        : "Impact on services without subscriptions"}
                </h2>
            </EuiTitle>
            <EuiButton onClick={() => setItemIdToExpandedRowMap({})}>^</EuiButton>
            <EuiBasicTable
                tableCaption={`Impacted objects table ${mode}`}
                items={data}
                itemId="id"
                itemIdToExpandedRowMap={itemIdToExpandedRowMap}
                isExpandable={true}
                hasActions={true}
                // @ts-ignore
                columns={columns}
                // sorting={sorting}
                isSelectable={true}
                // selection={selection}
                onChange={onTableChange}
            />
        </Fragment>
    );
};
export default injectIntl(ImpactedObjects);
