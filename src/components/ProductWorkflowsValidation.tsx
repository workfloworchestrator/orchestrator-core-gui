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

import "components/ProductWorkflowsValidation.scss";

import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { CodedWorkflow, Product, WorkflowWithProductTags } from "utils/types";
import { isEmpty } from "utils/Utils";
import { TARGET_CREATE, TARGET_MODIFY, TARGET_TERMINATE } from "validations/Products";

type Column = "name" | "target" | "product_tags_string" | "description";

interface IProps extends WrappedComponentProps {
    workflowCodeImplementations: CodedWorkflow[];
    workflows: WorkflowWithProductTags[];
}
class ProductWorkflowsValidation extends React.Component<IProps> {
    renderWorkflows(
        workflows: WorkflowWithProductTags[],
        msg: JSX.Element | string,
        nonPresentMsg: JSX.Element | string
    ) {
        const columns: Column[] = ["name", "target", "product_tags_string", "description"];
        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name}>
                    <span>
                        <FormattedMessage id={`metadata.workflows.${name}`} />
                    </span>
                </th>
            );
        };
        if (workflows.length === 0) {
            return <h3>{nonPresentMsg}</h3>;
        }
        return (
            <section>
                <h3>{msg}</h3>
                <table className="workflows">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {workflows.map((wf, index) => (
                            <tr key={index}>
                                <td>{wf.name}</td>
                                <td>{wf.target}</td>
                                <td>{wf.product_tags.join(", ")}</td>
                                <td>{wf.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        );
    }

    renderWorkflowImplementations(
        workflows: CodedWorkflow[],
        msg: JSX.Element | string,
        nonPresentMsg: JSX.Element | string
    ) {
        const columns = ["implementation", "name", "target"];
        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name}>
                    <span>
                        <FormattedMessage id={`metadata.workflows.${name}`} />
                    </span>
                </th>
            );
        };
        if (workflows.length === 0) {
            return <h3>{nonPresentMsg}</h3>;
        }
        return (
            <section>
                <h3>{msg}</h3>
                <table className="workflows">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {workflows.map((wf, index) => (
                            <tr key={index}>
                                <td>{wf.implementation}</td>
                                <td>{wf.name}</td>
                                <td>{wf.target}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        );
    }

    renderProducts(products: Product[], productsMsg: JSX.Element | string, noProductsMsg: JSX.Element | string) {
        const { intl } = this.props;
        const columns = ["name", "description", "tag", "product_type", "workflows_string", "status"];
        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name}>
                    <span>
                        <FormattedMessage id={`metadata.products.${name}`} />
                    </span>
                </th>
            );
        };
        const td = (name: keyof Product, product: Product) => (
            <td key={name} data-label={intl.formatMessage({ id: `metadata.products.${name}` })} className={name}>
                {product[name]}
            </td>
        );
        if (products.length === 0) {
            return <h3>{noProductsMsg}</h3>;
        }
        return (
            <section>
                <h3>{productsMsg}</h3>
                <table className="products">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={index}>
                                <td>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`/product/${product.product_id}`}
                                    >
                                        {product.name}
                                    </a>
                                </td>
                                <td>{product.description}</td>
                                <td>{product.tag}</td>
                                <td>{product.product_type}</td>
                                <td>{product.workflows.map((wf) => wf.name).join(", ")}</td>
                                <td>{product.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        );
    }

    renderProductsWithoutTargetWorkflow = (products: Product[]) => {
        return (
            <section className="product-target-validation">
                {[TARGET_CREATE, TARGET_MODIFY, TARGET_TERMINATE].map((target, index) => (
                    <section className="validation" key={index}>
                        {this.renderProducts(
                            products.filter((prod) => !prod.workflows.some((wf) => wf.target === target)),
                            <FormattedMessage
                                id="validations.productWorkflows.productsWithoutWorkflow"
                                values={{ target: target }}
                            />,
                            <FormattedMessage
                                id="validations.productWorkflows.productsWithWorkflow"
                                values={{ target: target }}
                            />
                        )}
                    </section>
                ))}
            </section>
        );
    };

    renderProductsWithMultipleTargetWorkflow = (products: Product[]) => {
        return (
            <section className="product-target-validation">
                {[TARGET_CREATE, TARGET_TERMINATE].map((target, index) => (
                    <section className="validation" key={index}>
                        {this.renderProducts(
                            products.filter((prod) => prod.workflows.filter((wf) => wf.target === target).length > 1),
                            <FormattedMessage
                                id="validations.productWorkflows.productsWithMultipleWorkflow"
                                values={{ target: target }}
                            />,
                            <FormattedMessage
                                id="validations.productWorkflows.productsWithoutMultipleWorkflow"
                                values={{ target: target }}
                            />
                        )}
                    </section>
                ))}
            </section>
        );
    };

    renderWorkflowsWithoutProducts = (workflows: WorkflowWithProductTags[]) => {
        return (
            <section className="workflow-validation">
                {this.renderWorkflows(
                    workflows.filter((wf) => wf.target !== "SYSTEM").filter((wf) => isEmpty(wf.product_tags)),
                    <FormattedMessage id="validations.productWorkflows.workflowsWithoutProducts" />,
                    <FormattedMessage id="validations.productWorkflows.workflowsWithProducts" />
                )}
            </section>
        );
    };

    renderDatabaseWorkflowsWithNoImplementation = (
        workflowCodeImplementations: CodedWorkflow[],
        workflows: WorkflowWithProductTags[]
    ) => {
        return (
            <section className="workflow-validation">
                {this.renderWorkflows(
                    workflows.filter(
                        (wf) => !workflowCodeImplementations.some((wfImpl) => wfImpl.implementation === wf.name)
                    ),
                    <FormattedMessage id="validations.productWorkflows.workflowsWithoutImplementations" />,
                    <FormattedMessage id="validations.productWorkflows.workflowsWithImplementations" />
                )}
            </section>
        );
    };

    renderCodeWorkflowsWithNoDatabaseRecord = (
        workflowCodeImplementations: CodedWorkflow[],
        workflows: WorkflowWithProductTags[]
    ) => {
        return (
            <section className="workflow-validation">
                {this.renderWorkflowImplementations(
                    workflowCodeImplementations.filter(
                        (wfImpl) => !workflows.some((wf) => wfImpl.implementation === wf.name)
                    ),
                    <FormattedMessage id="validations.productWorkflows.workflowsWithoutRecords" />,
                    <FormattedMessage id="validations.productWorkflows.workflowsWithRecords" />
                )}
            </section>
        );
    };

    render() {
        const { workflowCodeImplementations, workflows } = this.props;
        const { products } = this.context;
        return (
            <section className="products-workflows-validation">
                {this.renderProductsWithoutTargetWorkflow(products)}
                {this.renderProductsWithMultipleTargetWorkflow(products)}
                {this.renderWorkflowsWithoutProducts(workflows)}
                {this.renderDatabaseWorkflowsWithNoImplementation(workflowCodeImplementations, workflows)}
                {this.renderCodeWorkflowsWithNoDatabaseRecord(workflowCodeImplementations, workflows)}
            </section>
        );
    }
}

ProductWorkflowsValidation.contextType = ApplicationContext;

export default injectIntl(ProductWorkflowsValidation);
