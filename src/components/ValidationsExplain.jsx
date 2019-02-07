import React from "react";
import PropTypes from "prop-types";
import JSONPretty from 'react-json-pretty';

import "./ValidationsExplain.scss";

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

    explanationFixedInputs = () => <section className="explanation">
        <h3>Explanation</h3>
        <p><span className="code">FixedInputs</span> are fixed product characteristics and the allowed
            <span className="code">FixedInputs</span> and the subsequent values are configured in the code.</p>
    </section>;

    explainProductWorkflows = () => <section className="explanation">
        <h3>Explanation</h3>
        <p><span className="code">Workflows</span> are stored in the database to register the many-to-many relations with <span className="code"> Products </span>
        , but are coded in the Python code. Discrepancies can occur between the database and the code implementation.
        </p>
    </section>;

    details = () => <section className="details">
        <h3>Details</h3>
        <p>The validations consist of each Product validated against the <span className="code">workflow_subscription_mapping </span>
            of the Workflow. All the Resource Blocks with their subsequent Resource Types configured to be present
            in the workflow linked to the Product (e.g. the workflow in the workflows table with target <span className="code">CREATE</span>)
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

    detailsProductWorkflows = () => <section className="details">
        <h3>Details</h3>
            <p>All the <span className="code">Workflow</span> - <span className="code">Product</span> relations are verified to ensure:</p>
            <ul>
                <li>Every product has one and not more then one <span className="code">CREATE</span> workflow.</li>
                <li>Every product has at least one <span className="code">MODIFY</span> workflow.</li>
                <li>Every product has at least one <span className="code">TERMINATE</span> workflow.</li>
                <li>Every workflow that is not a Task has a relation with at least one Product.</li>
                <li>Every workflow in the codebase has a corresponding - based on the name of the workflow - database entry.</li>
                <li>Every workflow in the database has a corresponding - based on the name of the workflow - code implementation.</li>
            </ul>
    </section>;

            detailsFixedInputs = () => <section className="details">
        <h3>Details</h3>
        <p>In the <span className="code">workflows/server/config/fixed_inputs.py</span> all of the allowed <span className="code">FixedInputs</span> are
            described together with the allowed values per <span className="code">Product</span> by <span className="code">tag</span>.
        </p>
        <p>All <span className="code">Products</span> that either miss required <span className="code">FixedInputs </span>or has <span className="code">FixedInputs </span>
            with invalid values or has <span className="code">FixedInputs </span> that are not known / allowed are listed.
        </p>
    </section>;

    example = () => {
        const obj =  {
            "Virtual Circuit": [
                {"nms_service_id": "service_id", "service_speed": "capacity"}
            ]
        };
        return <section className="example">
            <h3>Example</h3>
            <p>A workflow with the following <span className="code">workflow_subscription_mapping</span>:</p>
            <JSONPretty id="json-pretty" json={obj}></JSONPretty>
            <p>Will at a minimal need to populate the state variables <span>service_id</span> and <span>capacity </span>
                during the execution of the various Process steps.</p>
            <p>The corresponding Product configuration of this workflow must at a minimal
                contain the Resource Block <span>Virtual Circuit</span> with the Resource Types
                <span> nms_service_id</span> and <span>service_speed</span>
            </p>
        </section>
    }

    render() {
        const {close, isVisible, isWorkFlows, isSubscriptions, isFixedInputs, isProductWorkflows} = this.props;
        const className = isVisible ? "" : "hide";
        const title = isWorkFlows ? "Product / Workflow Validations" : isSubscriptions ? "Subscription Validations" :
            isFixedInputs ? "Products / FixedInputs" : isProductWorkflows ? "Products / Workflows" : "Dienstafname / Subscription cross-check";
        return (
            <div className={`validation-explain ${className}`}
                 tabIndex="1" onBlur={close} ref={ref => this.main = ref}>
                <section className="container">
                    <section className="title">
                        <p>{title}</p>
                        <button className="close" onClick={close}>
                            <i className="fa fa-remove"></i>
                        </button>
                    </section>
                    {isWorkFlows ? this.explanation() : isSubscriptions ? this.explanationSubscriptions() :
                        isFixedInputs ? this.explanationFixedInputs() : isProductWorkflows ? this.explainProductWorkflows() : this.explanationDienstafnames()}
                    {isWorkFlows ? this.details() : isSubscriptions ? this.detailsSubscriptions() :
                        isFixedInputs ? this.detailsFixedInputs() : isProductWorkflows ? this.detailsProductWorkflows() :this.detailsDienstafnames()}
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
    isSubscriptions: PropTypes.bool.isRequired,
    isFixedInputs: PropTypes.bool.isRequired,
    isProductWorkflows: PropTypes.bool.isRequired
};

