import { EuiButtonIcon, EuiInMemoryTable } from "@elastic/eui";
import React from "react";

import { ServicePortFilterItem } from "../../../utils/types";

interface IProps {
    subscriptions: [];
    handleSelect: any;
}

interface IState {
    portsLoaded: boolean;
    ports: ServicePortFilterItem[];
    selectedPort?: string;
    selectedSubscription?: string;
}

export default class FavoritePortSelector extends React.PureComponent<IProps, IState> {
    //Todo: we might need some default props here (depending on how we feed in the subscriptions

    constructor(props: IProps) {
        super(props);

        this.state = {
            portsLoaded: false,
            ports: [],
            selectedPort: undefined,
            selectedSubscription: undefined
        };
    }

    componentDidMount() {
        const storageKey = "favoritePortsArray-v1";
        const ports: ServicePortFilterItem[] = JSON.parse(localStorage.getItem(storageKey) as string) || [];
        this.setState({ ports: ports, portsLoaded: true });
    }

    render() {
        const { ports, portsLoaded } = this.state;
        const columns = [
            {
                field: "port_name",
                name: "Port name",
                sortable: true,
                truncateText: true
            },
            {
                field: "description",
                name: "Subscription description",
                sortable: true,
                truncateText: true
            },
            {
                field: "port_mode",
                name: "Port mode",
                truncateText: true,
                sortable: true
            },
            {
                field: "port_speed",
                name: "Speed",
                width: "100px"
                // render: (i: any) => <EuiButtonIcon iconType="popout" onClick={() => alert(`Clicked ${i}`)} />
            }
        ];
        return (
            <EuiInMemoryTable
                items={ports}
                columns={columns}
                pagination={true}
                loading={!portsLoaded}
                sorting={true}
                search={true}
            />
        );
    }
}
