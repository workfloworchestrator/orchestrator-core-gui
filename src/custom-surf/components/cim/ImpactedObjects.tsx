import {
    EuiBadge,
    EuiBasicTable,
    EuiButton,
    EuiButtonIcon,
    EuiFlexGrid,
    EuiFlexItem,
    EuiForm,
    EuiLink,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiScreenReaderOnly,
    EuiTitle,
    RIGHT_ALIGNMENT,
} from "@elastic/eui";
import { HorizontalAlignment } from "@elastic/eui/src/services/alignment";
import ImpactedObjectDetails from "custom/components/cim/ImpactedObjectDetails";
import {
    ImpactedObject,
    ServiceTicketImpactedObject,
    ServiceTicketImpactedObjectImpact,
    ServiceTicketWithDetails,
} from "custom/types";
import { isDate } from "lodash";
import React, { Fragment, ReactNode, useContext, useState } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import ReactSelect from "react-select";
import { getReactSelectTheme } from "stylesheets/emotion/utils";
import ApplicationContext from "utils/ApplicationContext";
import { Option } from "utils/types";
import { isEmpty } from "utils/Utils";

interface IProps extends WrappedComponentProps {
    ticket: ServiceTicketWithDetails;
    updateable: boolean;
    withSubscriptions: boolean;
}

const options: Option[] = (Object.values(ServiceTicketImpactedObjectImpact) as string[]).map((val) => ({
    value: val,
    label: val,
}));

const getFilteredImpactedObjects = (impactedObjects: ServiceTicketImpactedObject[], withSubscriptions: boolean) => {
    let result: ImpactedObject[] = [];
    for (const [index, impactedObject] of impactedObjects.entries()) {
        if (!withSubscriptions && impactedObject.subscription_id) {
            continue;
        }
        if (withSubscriptions && !impactedObject.subscription_id) {
            continue;
        }

        const tempImpactedCircuit: ImpactedObject = {
            id: `item-${index}`,
            customer: impactedObject.owner_customer.customer_name,
            impact: impactedObject.ims_circuits[0].impact,
            type: impactedObject.product_type,
            subscription: impactedObject.subscription_description,
            impact_override: impactedObject.impact_override,
            subscription_id: impactedObject.subscription_id,
            ims_info: impactedObject.ims_circuits,
            owner_customer_contacts: impactedObject.owner_customer_contacts,
            related_customers: impactedObject.related_customers,
        };
        result.push(tempImpactedCircuit);
    }
    return result;
};

const ImpactedObjects = ({ ticket, updateable, withSubscriptions }: IProps) => {
    const { theme, customApiClient } = useContext(ApplicationContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const closeModal = () => setIsModalVisible(false);
    const showModal = () => setIsModalVisible(true);
    const [editImpactedObject, setEditImpactedObject] = useState<ImpactedObject>();
    const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<{ [key: string]: ReactNode }>({});
    const customStyles = getReactSelectTheme(theme);

    const data = getFilteredImpactedObjects(ticket.impacted_objects, withSubscriptions);

    const [items, setItems] = useState(data);

    let allExpandedRows: { [key: string]: ReactNode } = {};
    for (const item of data) {
        allExpandedRows[item.id] = (
            <ImpactedObjectDetails
                imsInfo={item.ims_info}
                ownerCustomerContacts={item.owner_customer_contacts}
                relatedCustomers={item.related_customers}
            />
        );
    }

    const toggleExpandAll = () => {
        if (!isEmpty(itemIdToExpandedRowMap)) {
            setItemIdToExpandedRowMap({});
        } else {
            setItemIdToExpandedRowMap(allExpandedRows);
        }
    };

    const toggleDetails = (item: ImpactedObject) => {
        const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
        if (itemIdToExpandedRowMapValues[item.id]) {
            delete itemIdToExpandedRowMapValues[item.id];
        } else {
            itemIdToExpandedRowMapValues[item.id] = (
                <ImpactedObjectDetails
                    imsInfo={item.ims_info}
                    ownerCustomerContacts={item.owner_customer_contacts}
                    relatedCustomers={item.related_customers}
                />
            );
        }
        setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
    };

    const removeEdit = (): void => {
        setEditImpactedObject(undefined);
    };

    const onChangeImpactOverride = (impactedObject: ImpactedObject) => async (e: any): Promise<void> => {
        let value: any;
        if (isEmpty(e) || isDate(e)) {
            value = e;
        } else {
            value = e.target ? e.target.value : e.value;
        }
        let index = Number(impactedObject.id.replace("item-", ""));

        removeEdit();
        let updatedImpactedObject: ImpactedObject = { ...impactedObject, impact_override: value };
        await submitImpactOverride(index, value);
        setItems(items.map((obj: ImpactedObject) => (obj.id === impactedObject.id ? updatedImpactedObject : obj)));
        closeModal();
    };

    const submitImpactOverride = async (index: number, impact: string): Promise<void> => {
        await customApiClient.cimPatchImpactedObject(ticket._id, index, impact);
    };

    const showImpact = (impact: ImpactedObject): any => {
        return (
            <EuiForm component="form">
                <ReactSelect<Option>
                    className="impact-override__select"
                    onChange={onChangeImpactOverride(impact)}
                    options={options}
                    isSearchable={false}
                    value={options.filter(
                        (option) => impact?.impact_override && option["value"] === impact.impact_override
                    )}
                    isClearable={true}
                    defaultMenuIsOpen={true}
                    autoFocus
                    styles={customStyles}
                />
            </EuiForm>
        );
    };

    const align_right: HorizontalAlignment = RIGHT_ALIGNMENT;
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
            width: "100",
        },
        {
            field: "id",
            name: "Affected services",
            render: (id: string, record: any) => <EuiBadge>{record.ims_info.length}</EuiBadge>,
            width: "150",
        },
        {
            field: "impact",
            name: "Impact",
            truncateText: true,
            width: "120",
        },
        {
            name: "Impact override",
            field: "impact_override",
            render: (id: string, record: any) => (record?.impact_override ? record.impact_override : "-"),
            width: "120",
        },
        {
            name: "",
            field: "edit_impact_override",
            actions: [
                {
                    name: "Edit impact",
                    description: "Override the impact level",
                    type: "icon",
                    icon: "pencil",
                    onClick: (record: any) => {
                        setEditImpactedObject(record);
                        showModal();
                    },
                },
            ],
            width: "30",
        },
        {
            align: align_right,
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
                    aria-label={itemIdToExpandedRowMap[item.id] ? "Collapse" : "Expand"}
                    iconType={itemIdToExpandedRowMap[item.id] ? "arrowUp" : "arrowDown"}
                />
            ),
        },
    ];

    // Hide subscription and other columns when not needed
    if (!withSubscriptions) {
        columns = columns.filter((c) => c.field !== "subscription" && c.field !== "type");
    }

    // Hide impact override when needed
    if (!updateable) {
        columns = columns.filter((c) => c.field !== "edit_impact_override");
    }

    return (
        <Fragment>
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
                            {withSubscriptions ? "Impact on subscriptions" : "Impact on services without subscriptions"}
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
                tableCaption={`Impacted objects table ${
                    withSubscriptions ? "with subscriptions" : "without subscriptions"
                }`}
                items={items}
                itemId="id"
                itemIdToExpandedRowMap={itemIdToExpandedRowMap}
                isExpandable={true}
                hasActions={true}
                columns={columns}
                isSelectable={false}
            />
        </Fragment>
    );
};
export default injectIntl(ImpactedObjects);
