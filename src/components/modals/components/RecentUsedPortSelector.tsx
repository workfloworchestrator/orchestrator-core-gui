import { EuiButtonIcon, EuiInMemoryTable } from "@elastic/eui";
import React from "react";

interface IProps {
    subscriptions: [];
}

interface IState {
    nodesLoaded: boolean;
    selectedNode?: string;
    portsLoaded: boolean;
    selectedPort?: string;
    selectedSubscription?: string;
}

export default class RecentUsedPortSelector extends React.PureComponent<IProps, IState> {
    //Todo: we might need some default props here (depending on how we feed in the subscriptions

    constructor(props: IProps) {
        super(props);

        this.state = {
            nodesLoaded: false,
            portsLoaded: false,
            selectedNode: undefined,
            selectedPort: undefined,
            selectedSubscription: undefined
        };
    }

    render() {
        const columns = [
            {
                field: "description",
                name: "Subscription description",
                sortable: true,
                truncateText: true
            },
            {
                field: "workflow",
                name: "Workflow",
                truncateText: true,
                sortable: true
            },
            {
                field: "subscription_id",
                name: "",
                width: "40px",
                render: (i: any) => <EuiButtonIcon iconType="popout" onClick={() => alert(`Clicked ${i}`)} />
            }
        ];
        return <EuiInMemoryTable items={[]} columns={columns} pagination={true} sorting={true} search={true} />;
    }
}
