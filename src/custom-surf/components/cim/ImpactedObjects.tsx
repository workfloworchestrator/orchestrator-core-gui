import {
    EuiBadge,
    EuiBasicTable,
    EuiButton,
    EuiButtonIcon,
    EuiDescriptionList,
    EuiFlexGrid,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
    EuiHealth,
    EuiLink,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiPanel,
    EuiScreenReaderOnly,
    EuiText,
    EuiTitle,
    RIGHT_ALIGNMENT,
    formatDate,
} from "@elastic/eui";
import { isDate } from "lodash";
import React, { Fragment, useEffect, useState } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import Select from "react-select";

import impactedObjects from "../../../custom/components/cim/ImpactedObjects";
import { Option } from "../../../utils/types";
import { isEmpty } from "../../../utils/Utils";
import {
    ServiceTicketImpactedIMSCircuit,
    ServiceTicketImpactedObjectImpact,
    ServiceTicketWithDetails,
} from "../../types";
import BackgroundJobLogs from "./BackgroundJobLogs";
import ImsCircuitInfo from "./ImsCiruitInfo";
import { ImpactedObject, ImsInfo } from "./ServiceTicketDetailImpactedObjects";

interface IProps extends WrappedComponentProps {
    ticket: ServiceTicketWithDetails;
    // updateable: boolean;
    // acceptImpactedObjects: () => void;
    // showAcceptButton: boolean;
    mode: "withSubscriptions" | "withoutSubscriptions";
}

const options: Option[] = (Object.values(ServiceTicketImpactedObjectImpact) as string[]).map((val) => ({
    value: val,
    label: val,
}));

const ImpactedObjects = ({ ticket, mode }: IProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const closeModal = () => setIsModalVisible(false);
    const showModal = () => setIsModalVisible(true);
    const [sortField, setSortField] = useState("firstName");
    const [sortDirection, setSortDirection] = useState("asc");
    const [selectedItems, setSelectedItems] = useState([]);
    const [editImpactedObject, setEditImpactedObject] = useState<ImpactedObject>();
    const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState({});

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
    }
    console.log(`Working mode: ${mode}. Filtered data: `, data);

    const [items, setItems] = useState(data);

    let allExpandedRows = {};
    for (const item of data) {
        // @ts-ignore
        allExpandedRows[item.id] = <ImsCircuitInfo imsInfo={item.ims_info}></ImsCircuitInfo>;
    }

    const toggleExpandAll = () => {
        if (!isEmpty(itemIdToExpandedRowMap)) {
            setItemIdToExpandedRowMap({});
        } else {
            setItemIdToExpandedRowMap(allExpandedRows);
        }
    };

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
        }
        setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
    };

    const deleteButton = renderDeleteButton();

    const editImpact = (impactedObject: ImpactedObject): (() => void) => {
        debugger;
        // return () => updateable && setItems(impactedObject);
        return () => setEditImpactedObject(impactedObject);
    };

    const removeEdit = (): void => {
        setEditImpactedObject(undefined);
    };

    const onChangeImpactOverride = (impactedObject: ImpactedObject) => async (e: any): Promise<void> => {
        let value: any;
        if (isEmpty(e) || isDate(e)) {
            value = e;
        } else {
            // @ts-ignore
            value = e.target ? e.target.value : e.value;
        }
        removeEdit();
        let updatedImpactedObject: ImpactedObject = { ...impactedObject, impact_override: value };
        // await sumbitImpactOverride(updatedImpactedObject);
        setItems(
            items.map((obj: ImpactedObject) =>
                obj.subscription_id === impactedObject.subscription_id ? updatedImpactedObject : obj
            )
        );
        closeModal();
    };

    const showImpact = (impact: ImpactedObject): any => {
        return (
            <EuiForm component="form">
                <Select<Option>
                    className="impact-override__select"
                    onChange={onChangeImpactOverride(impact)}
                    // onBlur={removeEdit}
                    options={options}
                    isSearchable={false}
                    value={options.filter(
                        (option) => impact?.impact_override && option["value"] === impact.impact_override
                    )}
                    isClearable={true}
                    defaultMenuIsOpen={true}
                    autoFocus
                />
            </EuiForm>
        );
    };

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
            render: (name: string, record: any) =>
                record.subscription_id ? (
                    <EuiLink href={`/subscriptions/${record.subscription_id}`} target="_blank">
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
            render: (id: string, record: any) => <EuiBadge>{record.ims_info.length}</EuiBadge>,
            width: 150,
        },
        {
            field: "impact",
            name: "Impact",
            truncateText: true,
            width: 120,
        },
        {
            name: "Impact override",
            field: "impact_override",
            render: (id: string, record: any) => (record?.impact_override ? record.impact_override : "-"),
            width: 120,
        },
        {
            field: "impact_override",
            // render: (id: string, record: any) => mode === "withSubscriptions" && record ? showImpact(record) : "-",
            actions: [
                {
                    name: "Clone",
                    description: "Clone this person",
                    type: "icon",
                    icon: "pencil",
                    onClick: (record: any) => {
                        setEditImpactedObject(record);
                        showModal();
                    },
                },
            ],
            width: 30,
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

    // Hide subscription and product type column when not needed
    if (mode === "withoutSubscriptions") {
        columns = columns.filter(
            (c) => c.field !== "subscription" && c.field !== "type" && c.field !== "impact_override"
        );
    }

    return (
        <Fragment>
            {deleteButton}
            {isModalVisible && (
                <EuiModal style={{ height: 400 }} onClose={closeModal}>
                    <EuiModalHeader>
                        <EuiModalHeaderTitle>
                            <h1>Override impact</h1>
                        </EuiModalHeaderTitle>
                    </EuiModalHeader>
                    <EuiModalBody>{editImpactedObject && showImpact(editImpactedObject)}</EuiModalBody>
                    <EuiModalFooter>
                        <EuiButton onClick={closeModal} fill>
                            Close
                        </EuiButton>
                    </EuiModalFooter>
                </EuiModal>
            )}
            <EuiFlexGrid>
                <EuiFlexItem>
                    <EuiTitle>
                        <h2>
                            {mode === "withSubscriptions"
                                ? "Impact on subscriptions"
                                : "Impact on services without subscriptions"}
                        </h2>
                    </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem>
                    <EuiButtonIcon
                        size="m"
                        onClick={toggleExpandAll}
                        iconType={!isEmpty(itemIdToExpandedRowMap) ? "arrowUp" : "arrowDown"}
                    ></EuiButtonIcon>
                </EuiFlexItem>
            </EuiFlexGrid>

            <EuiBasicTable
                tableCaption={`Impacted objects table ${mode}`}
                items={items}
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
