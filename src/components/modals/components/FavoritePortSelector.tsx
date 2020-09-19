import { EuiBadge, EuiIcon, EuiInMemoryTable } from "@elastic/eui";
import React from "react";

import { ServicePortFavoriteItem, ServicePortFilterItem, Subscription } from "../../../utils/types";

interface IProps {
    handleSelect: any;
    subscriptions: Subscription[];
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
        const storageKey = "favoritePortsArray-v2";
        const ports: ServicePortFavoriteItem[] = JSON.parse(localStorage.getItem(storageKey) as string) || [];
        this.setState({ ports: ports, portsLoaded: true });
    }

    render() {
        const { ports, portsLoaded } = this.state;
        // @ts-ignore
        const columns = [
            {
                field: "port_name",
                name: "Port name",
                sortable: true,
                truncateText: true,
                width: "60px"
                // render: (subscription_id: any) => {
                //     const item = ports ? ports.find(subscription_id => subscription_id === subscription_id) : undefined
                //     if (!item) {
                //         return null;
                //     }
                //     return (
                //         <div>
                //             {item.port_name}
                //             <br/>
                //             {item.port_mode}
                //         </div>
                //     );
                // }
            },
            {
                field: "node_name",
                name: "Node name",
                sortable: true
            },
            {
                field: "port_mode",
                name: "Port mode",
                truncateText: true,
                sortable: true,
                width: "75px",
                render: (port: any) => <EuiBadge color="primary">{port}</EuiBadge>
            },
            {
                field: "port_speed",
                name: "Speed",
                width: "60px"
                // render: (i: any) => <EuiButtonIcon iconType="popout" onClick={() => alert(`Clicked ${i}`)} />
            },
            {
                field: "subscription_id",
                name: "",
                width: "20px",
                render: (link: any) => <EuiIcon type="pinFilled"></EuiIcon>
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
