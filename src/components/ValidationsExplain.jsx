import React from "react";
import PropTypes from "prop-types";
import JSONPretty from 'react-json-pretty';

import "./ValidationsExplain.css";

export default class ValidationsExplain extends React.PureComponent {

    componentWillReceiveProps(nextProps) {
        if (this.props.isVisible === false && nextProps.isVisible === true) {
            setTimeout(() => this.main.focus(), 50);
        }
    }

    explanation = () => <section className="explanation">
        <h3>Explanation</h3>
        <p>The Product Configuration in <span>core-db</span> must match the corresponding workflow implementation for
            that Product.</p>
        <p>Processes described / implemented in workflows that result in a subscription will populate
            the subscription instance values. These subscription instance values are linked to Resource types which
            are configured in the Resource Blocks of the Product.</p>
    </section>;

    explanationSubscriptions = () => <section className="explanation">
        <h3>Explanation</h3>
        <p>Subscriptions have <span className="code">subscription_instances</span> and <span className="code">subscription_instance_values</span>.
        </p>
        <p>Each subscription with the status <span className="code">active</span> must have the correct instances and
            instance_values according
            to the product definition.</p>
    </section>;

    explanationDienstafnames = () => <section className="explanation">
        <h3>Explanation</h3>
        <p>Dienstafnames are registered in de CRM. Workflow processes resulting in new subscriptions store the Dienstafname reference in the subscription.</p>
    </section>;

    details = () => <section className="details">
        <h3>Details</h3>
        <p>The validations consist of each Product validated against the <span className="code">workflow_subscription_mapping </span>
            of the Workflow. All the Resource Blocks with their subsequent Resource Types configured to be present
            in the workflow linked to the Product (e.g. the column value <span className="code">create_subscription_workflow_key</span>)
            must also be configured in <span>core-db</span>.</p>

        <p>Each mismatch - being a completely missing Resource Block or missing individual Resource Types - is
            reported and results in an invalid Product configuration.</p>
    </section>;

    detailsSubscriptions = () => <section className="details">
        <h3>Details</h3>
        <p>The Subscription validation consist of each Subscription validated against the <span className="code">workflow_subscription_mapping </span>
            of the Workflow linked to the product of the Subscription. Each invalid Subscription - due to lacking <span
                className="code">subscription_instance_values </span>
            - is listed per workflow.</p>
    </section>;

    detailsDienstafnames = () => <section className="details">
        <h3>Details</h3>
        <p>Every subscription in the workflows database should have a corresponding CRM dienstafname. The column <span className="code">SUBSCRIPTION </span>
            in the Dienstafnames table is the <span className="code">nw_subscription_uuid</span> in the CRM database. For most dienstafnames this is
            <span className="code">null</span>.
        </p>
    </section>;

    example = () => {
        const obj =  {
            "Ethernet Circuit": [
                {"nms_service_id": "service_id", "servicespeed": "capacity"}
            ]
        };
        return <section className="example">
            <h3>Example</h3>
            <p>A workflow with the following <span className="code">workflow_subscription_mapping</span>:</p>
            <JSONPretty id="json-pretty" json={obj}></JSONPretty>
            <p>Will at a minimal need to populate the state variables <span>service_id</span> and <span>capacity </span>
                during the execution of the various Process steps.</p>
            <p>The corresponding Product configuration of this workflow must at a minimal
                contain the Resource Block <span>Ethernet Circuit</span> with the Resource Types
                <span> nms_service_id</span> and <span>servicespeed</span>
            </p>
        </section>
    }

    render() {
        const {close, isVisible, isWorkFlows, isSubscriptions} = this.props;
        const className = isVisible ? "" : "hide";
        const title = isWorkFlows ? "Product / Workflow Validations" : isSubscriptions ? "Subscription Validations" : "Dienstafname / Subscription cross-check";
        return (
            <div className={`validation-explain ${className}`}
                 tabIndex="1" onBlur={close} ref={ref => this.main = ref}>
                <section className="container">
                    <section className="title">
                        <p>{title}</p>
                        <a className="close" onClick={close}>
                            <i className="fa fa-remove"></i>
                        </a>
                    </section>
                    {isWorkFlows ? this.explanation() : isSubscriptions ? this.explanationSubscriptions() : this.explanationDienstafnames()}
                    {isWorkFlows ? this.details() : isSubscriptions ? this.detailsSubscriptions() : this.detailsDienstafnames()}
                    {isWorkFlows && this.example()}
                </section>
            </div>
        );
    }
}

ValidationsExplain.propTypes = {
    close: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
    isWorkFlows: PropTypes.bool.isRequired,
    isSubscriptions: PropTypes.bool.isRequired
};
