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
    EuiFlexGroup,
    EuiFlexItem,
    EuiDescriptionListDescription,
    EuiDescriptionListTitle,
    EuiDescriptionList,
    EuiTitle, EuiSpacer, EuiPageContent, EuiPage, EuiPageBody
} from "@elastic/eui";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import {isDate} from "date-fns";
import {formDate, formInput, formSelect} from "forms/Builder";
import React, {useContext, useEffect, useRef, useState} from "react";
// import {useLocation} from "react-router";
import {FormattedMessage, WrappedComponentProps, injectIntl} from "react-intl";
import {RouteComponentProps} from "react-router";
import {ValueType} from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import {setFlash} from "utils/Flash";
import {Option, ProductBlock, Product as ProductData, Workflow} from "utils/types";
import {isEmpty, stop} from "utils/Utils";

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
    const [errors, setErrors] = useState({});
    const [required, setRequired] = useState(["name", "description", "status", "product_type", "tag"]);
    const [initial, setInitial] = useState(true);
    const [readOnly, setReadOnly] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [duplicateName, setDuplicateName] = useState(false);
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

    const renderButtons = (initial: boolean, product: ProductData) => {
        return (
            <section className="buttons">
                <EuiButton className="button" onClick={() => redirect("/metadata/products")}>
                    <FormattedMessage id="metadata.products.back"/>
                </EuiButton>
            </section>
        );
    };

    if (!product) {
        return null;
    }

    const endDate = !product.end_date
        ? null
        : isDate(product.end_date)
            ? ((product.end_date as unknown) as Date)
            : new Date(product.end_date * 1000);


    const renderProductDetail = (product: ProductData) => {
        return (
            <div>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiDescriptionList>
                            <EuiTitle size="xs">
                                <h1>
                                    Name
                                </h1>
                            </EuiTitle>
                            <EuiDescriptionListDescription>
                                testdescription
                            </EuiDescriptionListDescription>
                            <EuiSpacer size="s"/>
                            <EuiDescriptionListTitle>{product.name}</EuiDescriptionListTitle>
                        </EuiDescriptionList>
                    </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size="xl"/>
            </div>
        );
    };

    return (
        <EuiPage>
            <EuiPageContent>
                {renderProductDetail(product)}
                {renderProductDetail(product)}
                {renderProductDetail(product)}
                {renderProductDetail(product)}
                {renderButtons(initial, product)}
            </EuiPageContent>
        </EuiPage>
    );
    // }
}

// ViewProduct.contextType = ApplicationContext;

export default injectIntl(ViewProduct);
