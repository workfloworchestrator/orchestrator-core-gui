/*
 * Copyright 2019-2022 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
    EuiBadge,
    EuiButton,
    EuiDescriptionList,
    EuiDescriptionListDescription,
    EuiDescriptionListTitle,
    EuiFlexGroup,
    EuiFlexItem,
    EuiInMemoryTable,
    EuiPageContent,
    EuiPanel,
    EuiSpacer,
} from "@elastic/eui";
import { intl } from "locale/i18n";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import ApplicationContext from "utils/ApplicationContext";
import { FixedInput, Product, ProductBlock, ResourceType, Workflow } from "utils/types";

import { renderDateTime } from "../utils/Lookups";

const I18N_KEY_PREFIX = "metadata.products.";

interface MatchParams {
    id: string;
}

interface ProductFields<T> {
    [Key: string]: T;
}

interface ObjectFields {
    fixed_inputs?: FixedInput[];
    product_blocks?: ProductBlock[];
    workflows?: Workflow[];
}

interface IProps extends Partial<RouteComponentProps<MatchParams>>, WrappedComponentProps {}

function ViewProduct({ match }: IProps) {
    const { apiClient, redirect } = useContext(ApplicationContext);
    const [productLoaded, setProductLoaded] = useState(false);
    const [product, setProduct] = useState<Product>({
        create_subscription_workflow_key: "",
        created_at: 0,
        description: "",
        end_date: 0,
        fixed_inputs: [],
        modify_subscription_workflow_key: "",
        name: "",
        product_blocks: [],
        product_id: "",
        product_type: "",
        status: "",
        tag: "",
        terminate_subscription_workflow_key: "",
        workflows: [],
    });

    useEffect(() => {
        const product_id = match?.params.id;
        if (product_id) {
            apiClient.productById(product_id).then((res: Product) => {
                setProduct(res);
                setProductLoaded(true);
            });
        }
    }, [apiClient, match?.params.id]);

    const renderButtons = () => {
        return (
            <section className="buttons">
                <EuiSpacer />
                <EuiButton className="button" onClick={() => redirect("/metadata/products")}>
                    <FormattedMessage id="metadata.products.back" />
                </EuiButton>
            </section>
        );
    };

    const renderProductTables = (i18n_key_prefix: string, object_fields: ProductFields<ObjectFields>) => {
        let tables = [];
        for (let [table_name, table_data] of Object.entries(object_fields)) {
            let columns = [];
            let table_row = Object.values(table_data)[0];
            for (let [column_name, value] of Object.entries(table_row)) {
                let column = {
                    field: column_name,
                    name: column_name,
                    sortable: true,
                    truncateText: false,
                };
                if (column_name === "created_at") {
                    Object.assign(column, {
                        render: () => {
                            return renderDateTime(value as number);
                        },
                        width: "15%",
                    });
                } else if (column_name === "end_date") {
                    Object.assign(column, {
                        render: () => {
                            return renderDateTime(value as number);
                        },
                        width: "15%",
                    });
                } else if (column_name === "resource_types") {
                    Object.assign(column, {
                        render: () => {
                            return (
                                <div>
                                    {(value as ResourceType[]).map((item) => (
                                        <EuiBadge color="primary" isDisabled={false}>
                                            {item.resource_type}
                                        </EuiBadge>
                                    ))}
                                </div>
                            );
                        },
                    });
                } else if (column_name === "tag") {
                    Object.assign(column, { width: "5%" });
                } else if (column_name === "status") {
                    Object.assign(column, { width: "5%" });
                }

                columns.push(column);
            }
            tables.push(
                <EuiDescriptionList key={table_name}>
                    <EuiSpacer size="s" />
                    <EuiPanel>
                        <EuiDescriptionListTitle>
                            <h1>{intl.formatMessage({ id: i18n_key_prefix + table_name })}</h1>
                        </EuiDescriptionListTitle>
                        <EuiDescriptionListDescription>
                            {intl.formatMessage({ id: `${i18n_key_prefix + table_name}_info` })}
                        </EuiDescriptionListDescription>
                        <EuiSpacer size="s" />
                        <EuiInMemoryTable
                            items={table_data as ProductFields<ObjectFields>[]}
                            columns={columns}
                            sorting={true}
                        />
                    </EuiPanel>
                    <EuiSpacer size="s" />
                </EuiDescriptionList>
            );
        }
        return tables;
    };

    const renderProductDetails = (i18n_key_prefix: string, non_object_fields: ProductFields<string>) => {
        let product_details = [];
        for (let [key, value] of Object.entries(non_object_fields)) {
            product_details.push(
                <EuiFlexItem grow={false} style={{ minWidth: "400px" }}>
                    <EuiDescriptionList>
                        <EuiDescriptionListTitle>
                            {intl.formatMessage({ id: i18n_key_prefix + key })}
                        </EuiDescriptionListTitle>
                        <EuiDescriptionListDescription>{value}</EuiDescriptionListDescription>
                    </EuiDescriptionList>
                </EuiFlexItem>
            );
        }
        return (
            <EuiPanel>
                <EuiFlexGroup wrap>{product_details}</EuiFlexGroup>
            </EuiPanel>
        );
    };

    function getNonObjectFields(product: Product): ProductFields<string> {
        let non_object_fields = {};
        for (let [key, value] of Object.entries(product)) {
            if (typeof value !== "object" && value !== null) {
                if (!isNaN(new Date(value).getTime())) {
                    value = renderDateTime(value);
                }
                Object.assign(non_object_fields, { [key]: value.toString() });
            }
        }
        return non_object_fields;
    }

    function getObjectFields(product: Product): ProductFields<ObjectFields> {
        let object_fields: ProductFields<ObjectFields> = {};
        for (let [key, value] of Object.entries(product)) {
            if (typeof value === "object" && value !== null && value.length > 0) {
                Object.assign(object_fields, { [key]: value });
            }
        }
        return object_fields;
    }

    return (
        <EuiPageContent>
            {productLoaded && renderProductDetails(I18N_KEY_PREFIX, getNonObjectFields(product))}
            {productLoaded && renderProductTables(I18N_KEY_PREFIX, getObjectFields(product))}
            {renderButtons()}
        </EuiPageContent>
    );
}

export default injectIntl(ViewProduct);
