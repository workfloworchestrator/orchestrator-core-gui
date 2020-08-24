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

import "./Validations.scss";

import I18n from "i18n-js";
import React from "react";
import { RouteComponentProps } from "react-router";
import ScrollUpButton from "react-scroll-up-button";

import {
    allWorkflowCodeImplementations,
    allWorkflows,
    allWorkflowsWithProductTags,
    fixedInputValidations,
    invalidSubscriptions,
    validations
} from "../api";
import CheckBox from "../components/CheckBox";
import FixedInputProductValidation from "../components/FixedInputProductValidation";
import ProductValidationComponent from "../components/ProductValidation";
import ProductWorkflowsValidation from "../components/ProductWorkflowsValidation";
import SubscriptionValidation from "../components/SubscriptionValidation";
import ValidationsExplain from "../components/ValidationsExplain";
import ApplicationContext from "../utils/ApplicationContext";
import {
    CodedWorkflow,
    FixedInputValidation,
    ProductValidation,
    Subscription,
    Workflow,
    WorkflowWithProductTags
} from "../utils/types";
import { applyIdNamingConvention, isEmpty, stop } from "../utils/Utils";

type TabKey = "workflows" | "fixedInputs" | "subscriptions" | "productWorkflows";

interface MatchParams {
    type: TabKey;
}

interface IProps extends RouteComponentProps<MatchParams> {}

interface IState {
    validations: ProductValidation[];
    invalidSubscriptions: { name: string; subscriptions: Subscription[] }[];
    fixedInputs: FixedInputValidation[];
    workflowCodeImplementations: CodedWorkflow[];
    workflows: WorkflowWithProductTags[];
    showExplanation: boolean;
    hideValid: boolean;
    hideValidSubscriptionTypes: boolean;
    tabs: TabKey[];
    selectedTab: TabKey;
}

export default class Validations extends React.Component<IProps, IState> {
    state: IState = {
        validations: [],
        invalidSubscriptions: [],
        fixedInputs: [],
        workflowCodeImplementations: [],
        workflows: [],
        showExplanation: false,
        hideValid: false,
        hideValidSubscriptionTypes: true,

        tabs: ["workflows", "fixedInputs", "subscriptions", "productWorkflows"],
        selectedTab: "workflows"
    };

    componentDidMount() {
        const type = this.props.match?.params.type;
        this.setState({ selectedTab: type });
        Promise.all([
            validations(),
            allWorkflows(),
            fixedInputValidations(),
            allWorkflowCodeImplementations(),
            allWorkflowsWithProductTags()
        ]).then(res => {
            this.setState({
                validations: res[0],
                fixedInputs: res[2],
                workflowCodeImplementations: res[3],
                workflows: res[4]
            });
            const workflows = res[1];
            this.mapWorkflowsToInvalidSubscriptions(workflows);
        });
    }

    mapWorkflowsToInvalidSubscriptions(workflows: Workflow[]) {
        Promise.all(workflows.map(workflow => invalidSubscriptions(workflow.name))).then(results =>
            this.setState({
                invalidSubscriptions: results.map((res, index) => ({
                    name: workflows[index].name,
                    subscriptions: res
                }))
            })
        );
    }

    onSubscriptionsChange = () => allWorkflows().then(workflows => this.mapWorkflowsToInvalidSubscriptions(workflows));

    switchTab = (tab: TabKey) => (e: React.MouseEvent<HTMLSpanElement>) => {
        stop(e);
        this.setState({ selectedTab: tab });
        this.context.redirect(`/validations/${tab}`);
    };

    renderSubscriptionValidations = (
        invalidSubscriptions: { name: string; subscriptions: Subscription[] }[],
        hideValidSubscriptionTypes: boolean
    ) => {
        const filteredSubscriptiops = invalidSubscriptions.filter(
            workflowSubscriptions => !(isEmpty(workflowSubscriptions.subscriptions) && hideValidSubscriptionTypes)
        );
        return (
            <div className="subscriptions">
                <section className="header">
                    <section className="options">
                        <CheckBox
                            name="hideValidSubscriptionTypes"
                            value={hideValidSubscriptionTypes}
                            info={I18n.t("validations.hide_valid_subscriptions_types")}
                            onChange={() =>
                                this.setState({
                                    hideValidSubscriptionTypes: !hideValidSubscriptionTypes
                                })
                            }
                        />
                        {this.renderExplain()}
                    </section>
                </section>
                <section className="validations">
                    {filteredSubscriptiops.map(ws => (
                        <SubscriptionValidation
                            subscriptions={ws.subscriptions}
                            workflow={ws.name}
                            onChange={this.onSubscriptionsChange}
                            key={ws.name}
                        />
                    ))}
                    {isEmpty(filteredSubscriptiops) && (
                        <div>
                            <em>{I18n.t("validations.no_subscriptions")}</em>
                        </div>
                    )}
                </section>
            </div>
        );
    };

    renderFixedInputValidations = (fixedInputValidations: FixedInputValidation[]) => (
        <div className="fixedInputs">
            <section className="header">{this.renderExplain()}</section>
            <section className="validations">
                {fixedInputValidations.map((validation: FixedInputValidation, index: number) => (
                    <FixedInputProductValidation key={index} validation={validation} />
                ))}
                {isEmpty(fixedInputValidations) && (
                    <div className={"no-errors"}>
                        <em>{I18n.t("validations.no_fixed_inputs")}</em>
                    </div>
                )}
            </section>
        </div>
    );

    renderWorkflowValidations = (
        validations: ProductValidation[],
        hideValid: boolean,
        validationsToShow: ProductValidation[]
    ) => (
        <div className="workflows">
            <section className="header">
                <section className="options">
                    <CheckBox
                        name="hideValid"
                        value={hideValid}
                        info={I18n.t("validations.hide_valids")}
                        onChange={() => this.setState({ hideValid: !hideValid })}
                    />
                    {this.renderExplain()}
                </section>
            </section>
            <section className="validations">
                {validationsToShow.map((validation, index) => (
                    <ProductValidationComponent validation={validation} key={index} />
                ))}
            </section>
        </div>
    );

    renderProductWorkflowsValidations = (
        workflowCodeImplementations: CodedWorkflow[],
        workflows: WorkflowWithProductTags[]
    ) => (
        <div className="productWorkflows">
            <section className="header">{this.renderExplain()}</section>
            <section className="validations">
                <ProductWorkflowsValidation
                    workflowCodeImplementations={workflowCodeImplementations}
                    workflows={workflows}
                />
            </section>
        </div>
    );

    renderExplain() {
        return (
            <section className="explain" onClick={() => this.setState({ showExplanation: true })}>
                <i className="fa fa-question-circle" />
            </section>
        );
    }

    isValidValidation = (validation: ProductValidation) =>
        validation.valid && (isEmpty(validation.product) || !isEmpty(validation.mapping));

    renderTab = (tab: TabKey, selectedTab: TabKey) => (
        <span
            id={`${applyIdNamingConvention(tab)}`}
            key={tab}
            className={tab === selectedTab ? "active" : ""}
            onClick={this.switchTab(tab)}
        >
            {I18n.t(`validations.tabs.${tab}`)}
        </span>
    );

    render() {
        const {
            validations,
            showExplanation,
            hideValid,
            tabs,
            selectedTab,
            invalidSubscriptions,
            hideValidSubscriptionTypes,
            fixedInputs,
            workflowCodeImplementations,
            workflows
        } = this.state;
        const validationsToShow = hideValid
            ? [...validations].filter(validation => !this.isValidValidation(validation))
            : validations;
        return (
            <div className="mod-validations">
                <ValidationsExplain
                    close={() => this.setState({ showExplanation: false })}
                    isVisible={showExplanation}
                    isWorkFlows={selectedTab === "workflows"}
                    isFixedInputs={selectedTab === "fixedInputs"}
                    isSubscriptions={selectedTab === "subscriptions"}
                />
                <section className="tabs">{tabs.map(tab => this.renderTab(tab, selectedTab))}</section>
                {selectedTab === "workflows"
                    ? this.renderWorkflowValidations(validations, hideValid, validationsToShow)
                    : selectedTab === "subscriptions"
                    ? this.renderSubscriptionValidations(invalidSubscriptions, hideValidSubscriptionTypes)
                    : selectedTab === "fixedInputs"
                    ? this.renderFixedInputValidations(fixedInputs)
                    : this.renderProductWorkflowsValidations(workflowCodeImplementations, workflows)}
                <ScrollUpButton />
            </div>
        );
    }
}

Validations.contextType = ApplicationContext;
