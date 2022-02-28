/*
 * Copyright 2019-2020 SURF.
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

import "components/Product.scss";

import "./Product.scss";

//TODO: show product and product blocks by clicking on it
//TODO: show product blocks and resource types inside EditProduct
import {
    EuiButton,
    EuiDescriptionList,
    EuiDescriptionListDescription,
    EuiDescriptionListTitle,
    EuiFlexGroup,
    EuiFlexItem, EuiHorizontalRule,
    EuiPage,
    EuiPageContent,
    EuiSpacer,
    EuiTitle,
    EuiPanel, EuiText
} from "@elastic/eui";
import React, {useContext, useEffect, useState} from "react";
import {FormattedMessage, injectIntl, WrappedComponentProps} from "react-intl";
import {RouteComponentProps} from "react-router";
import ApplicationContext from "utils/ApplicationContext";
import {Product as ProductData} from "utils/types";
import {intl} from "../locale/i18n";

const I18N_KEY_PREFIX = "metadata.products."

interface MatchParams {
    id: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>>, WrappedComponentProps {
}

interface IState {
    errors: Partial<Record<keyof ProductData, boolean>>;
    required: (keyof ProductData)[];
    initial: boolean;
    readOnly: boolean;
    product?: ProductData;
    processing: boolean;
    duplicateName: boolean;
}

function ViewProduct<IState>({match}: IProps) {
    const {allowed, apiClient, redirect} = useContext(ApplicationContext);
    const [product, setProduct] = useState<ProductData>({
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
        workflows: []
    })

    useEffect(() => {
        const product_id = match?.params.id
        if (product_id) {
            apiClient.productById(product_id).then((res: ProductData) => {
                setProduct(res)
            })
        }
    }, [])

    const renderButtons = () => {
        return (
            <section className="buttons">
                <EuiSpacer/>
                <EuiButton className="button" onClick={() => redirect("/metadata/products")}>
                    <FormattedMessage id="metadata.products.back"/>
                </EuiButton>
            </section>
        );
    };

    if (!product) {
        return null;
    }

    const renderProductDetail = (i18nKey: string, value: any) => {
        return (
                <EuiDescriptionList key={i18nKey}>
                    <EuiPanel>
                        <EuiFlexGroup>
                            <EuiFlexItem style={{maxWidth: '400px'}}>
                                <EuiDescriptionListTitle>
                                    <h1>
                                        {intl.formatMessage({id: i18nKey})}
                                    </h1>
                                </EuiDescriptionListTitle>
                                <EuiDescriptionListDescription>
                                    {intl.formatMessage({id: `${i18nKey}_info`})}
                                </EuiDescriptionListDescription>
                            </EuiFlexItem>
                            <EuiFlexItem style={{marginTop: "auto", marginBottom: "auto"}}>
                                <EuiText color="accent">{value}</EuiText>
                            </EuiFlexItem>
                        </EuiFlexGroup>
                    </EuiPanel>
                    <EuiSpacer size="xs"/>
                </EuiDescriptionList>
        );
    };

    const renderProductInfo = (i18n_key_prefix: string, product: ProductData) => {
        let product_info_list = []
        for (let [key, value] of Object.entries(product)) {
            if (typeof value !== 'object' && value !== null) {
                const i18n_key = i18n_key_prefix + key
                if (!isNaN(new Date(value).getTime())){
                    value = new Date(value * 1000).toString()
                }
                product_info_list.push(renderProductDetail(i18n_key, value))
            } else {
                //TODO tables
            }
        }
        return product_info_list
    }

    return (
        <EuiPage>
            <EuiPageContent>
                {renderProductInfo(I18N_KEY_PREFIX, product)}
                {renderButtons()}
            </EuiPageContent>
        </EuiPage>
    );
}
export default injectIntl(ViewProduct);
