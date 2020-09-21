import { EuiBadge, EuiIcon, EuiInMemoryTable } from "@elastic/eui";
import React from "react";

import { portSubscriptions, subscriptions, subscriptionsDetail } from "../../../api";
import {
    FavoriteSubscriptionStorage,
    Product,
    ServicePortFilterItem,
    Subscription,
    WorkflowReasons
} from "../../../utils/types";

interface IProps {
    handleSelect: any;
    subscriptions: Subscription[];
}

interface IState {
    portsLoaded: boolean;
    portSubscriptionsIds: string[];
    ports: Subscription[];
    selectedPort?: string;
    selectedSubscription?: string;
}

export default class FavoritePortSelector extends React.PureComponent<IProps, IState> {
    //Todo: we might need some default props here (depending on how we feed in the subscriptions

    constructor(props: IProps) {
        super(props);

        this.state = {
            portsLoaded: false,
            portSubscriptionsIds: [],
            ports: [],
            selectedPort: undefined,
            selectedSubscription: undefined
        };
    }

    componentDidMount() {
        const storageKey = "favoritePortsArray-v4";
        let ports: Subscription[] = [];
        let portSubscriptionIds: FavoriteSubscriptionStorage[];
        portSubscriptionIds = JSON.parse(localStorage.getItem(storageKey) as string) || [];
        let promises = portSubscriptionIds.map(subscription => subscriptionsDetail(subscription.subscription_id));
        Promise.all(promises).then((result: [...Subscription[]]) => {
            result.map(r => ports.push(r));
            this.setState({ ports: ports, portsLoaded: true });
        });
    }

    render() {
        const { ports, portsLoaded } = this.state;
        // @ts-ignore
        const columns = [
            {
                field: "subscription_id",
                name: "ID",
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
                field: "description",
                name: "Description",
                sortable: true
            }
            // {
            //     field: "port_mode",
            //     name: "Port mode",
            //     truncateText: true,
            //     sortable: true,
            //     width: "75px",
            //     render: (port: any) => <EuiBadge color="primary">{port}</EuiBadge>
            // },
            // {
            //     field: "port_speed",
            //     name: "Speed",
            //     width: "60px"
            //     // render: (i: any) => <EuiButtonIcon iconType="popout" onClick={() => alert(`Clicked ${i}`)} />
            // },
            // {
            //     field: "subscription_id",
            //     name: "",
            //     width: "20px",
            //     render: (link: any) => <EuiIcon type="pinFilled"></EuiIcon>
            // }
        ];
        return (
            <div>
                {portsLoaded && (
                    <EuiInMemoryTable
                        items={ports}
                        columns={columns}
                        pagination={true}
                        loading={!portsLoaded}
                        sorting={true}
                        search={true}
                    />
                )}
            </div>
        );
    }
}
