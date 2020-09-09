import React from "react";
import { EuiButton, EuiForm, EuiFormRow, EuiSpacer, EuiSuggest, EuiSuperSelect, EuiText } from "@elastic/eui";
import { subscriptions } from "../../../api";
import { Subscription } from "../../../utils/types";

interface IProps {
    subscriptions: [];
}

interface IState {
    nodesLoaded: boolean;
    nodes: EuiSuggestItemProps[];
    selectedNode?: string;
    portsLoaded: boolean;
    selectedPort?: string;
    selectedSubscription?: string;
}

export default class ServicePortSelector extends React.PureComponent<IProps, IState> {
    //Todo: we might need some default props here (depending on how we feed in the subscriptions

    constructor(props: IProps) {
        super(props);

        this.state = {
            nodesLoaded: false,
            nodes: [],
            portsLoaded: false,
            selectedNode: undefined,
            selectedPort: undefined,
            selectedSubscription: undefined
        };
    }
    componentDidMount() {
        subscriptions(["Node"], ["provisioning", "active"]).then(result => {
          console.log(result);
            this.setState({ nodesLoaded: true, nodes:  result.map(node => ({ label: node.description });
            });
        });
    }

    render() {
        const { nodesLoaded, nodes, selectedNode, portsLoaded, selectedPort, selectedSubscription } = this.state;

        return (
            <EuiForm component="form">
                {/*{selectedNode && autoSuggestNodes && <EuiText>Selected node: {selectedNode}</EuiText>}*/}
                <EuiFormRow label="Node" helpText="Select a node." fullWidth>
                    <EuiSuggest
                        status={nodesLoaded ? "unchanged" : "loading"}
                        onInputChange={() => {}}
                        // onItemClick={this.onNodeClick}
                        suggestions={nodes.map(node => node.description)}
                    />
                </EuiFormRow>
                <EuiFormRow label="Port" helpText="Select a physical port." fullWidth>
                    <EuiSuperSelect
                        fullWidth
                        options={[]}
                        valueOfSelected={selectedPort}
                        // onChange={value => this.onPortClick(value)}
                        itemLayoutAlign="top"
                        hasDividers
                    />
                </EuiFormRow>
                <EuiFormRow label="Service Port" helpText="Select a service port subscription." fullWidth>
                    <EuiSuperSelect
                        fullWidth
                        options={[]}
                        valueOfSelected={selectedSubscription}
                        // onChange={value => this.onSubscriptionClick(value)}
                        itemLayoutAlign="top"
                        hasDividers
                    />
                </EuiFormRow>
                <EuiSpacer />
                <EuiButton type="submit" fill style={{ marginLeft: "600px" }}>
                    Select service port
                </EuiButton>
            </EuiForm>
        );
    }
}
