import {
    EuiBadge,
    EuiButton,
    EuiButtonIcon,
    EuiCallOut,
    EuiFieldText,
    EuiForm,
    EuiFormRow,
    EuiInMemoryTable,
    EuiSpacer,
    EuiText,
} from "@elastic/eui";
import { subscriptionsDetailWithModel } from "api";
import React, { MouseEvent } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { FavoriteSubscriptionStorage, Subscription, SubscriptionModel } from "utils/types";

export const FAVORITE_STORAGE_KEY = "favoritePortsArray-v4";

interface IProps extends WrappedComponentProps {
    handleSelect: any;
    subscriptions: Subscription[];
    managementOnly: boolean;
}

interface IState {
    errors: boolean;
    message?: string;
    messageHelp?: string;
    // forms
    editMode: boolean;
    editName: string;
    // ports
    portsLoaded: boolean;
    portSubscriptionsIds: string[];
    ports: SubscriptionModel[];
    selectedPort?: string;
    selectedSubscription?: string;
}

class FavoritePortSelector extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            errors: true,
            message: undefined,
            messageHelp: undefined,
            editMode: false,
            editName: "",
            portsLoaded: false,
            portSubscriptionsIds: [],
            ports: [],
            selectedPort: undefined,
            selectedSubscription: undefined,
        };
    }

    componentDidMount = () => {
        this.loadData();
    };

    loadData = () => {
        let portSubscriptionIds: FavoriteSubscriptionStorage[];
        portSubscriptionIds = JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) as string) || [];
        let promises = portSubscriptionIds.map((subscription) =>
            subscriptionsDetailWithModel(subscription.subscription_id)
        );
        Promise.all(promises).then((result) => {
            this.setState({ ports: result, portsLoaded: true });
        });
    };

    onChangeEditMode = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, subscription_id: string) => {
        event.preventDefault();
        const { editMode } = this.state;
        let portSubscriptionIds: FavoriteSubscriptionStorage[];
        portSubscriptionIds = JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) as string) || [];
        const editName = portSubscriptionIds.find((item) => item.subscription_id === subscription_id)?.customName ?? "";
        this.setState({
            selectedSubscription: subscription_id,
            editMode: !editMode,
            editName: editName,
        });
    };

    onDelete = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, subscription_id: string) => {
        event.preventDefault();
        const oldPorts: FavoriteSubscriptionStorage[] =
            JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) as string) || [];
        const newPorts: FavoriteSubscriptionStorage[] = oldPorts.filter(
            (item) => item.subscription_id !== subscription_id
        );
        localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(newPorts));
        this.loadData();
    };

    onUpdateName = (event: any) => {
        this.setState({ editName: event.target.value });
    };

    onSaveName = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        event.preventDefault();
        const { selectedSubscription, editName } = this.state;
        let oldPorts: FavoriteSubscriptionStorage[] =
            JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) as string) || [];
        const portIndex = oldPorts.findIndex((port) => port.subscription_id === selectedSubscription);

        oldPorts[portIndex].customName = editName;
        console.log(oldPorts);
        localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(oldPorts));
        this.setState({ selectedSubscription: undefined, editName: "", editMode: false });
        this.loadData();
    };

    onSubscriptionSelect = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, subscription_id: string) => {
        event.preventDefault();
        const { subscriptions } = this.props;

        if (subscriptions.find((subscription) => subscription.subscription_id === subscription_id)) {
            this.props.handleSelect(subscription_id);
        } else {
            this.setState({
                message: `The selected subscription is not in the allowed list.`,
                messageHelp: `Check the bandwidth in the workflow form.`,
                errors: true,
            });
            setTimeout(() => {
                this.setState({ message: undefined, errors: false });
            }, 3000);
        }
    };

    render() {
        const {
            errors,
            message,
            messageHelp,
            editMode,
            editName,
            ports,
            portsLoaded,
            selectedSubscription,
        } = this.state;
        const { intl } = this.props;
        let portSubscriptionIds: FavoriteSubscriptionStorage[];
        portSubscriptionIds = JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) as string) || [];

        const columns = [
            {
                field: "subscription_id",
                name: "ID",
                sortable: true,
                truncateText: true,
                width: "90px",
            },
            {
                field: "description",
                name: "Description",
                sortable: true,
            },
            {
                field: "port_mode",
                name: "Mode",
                sortable: true,
                render: (port_mode: any) => <EuiBadge color="primary">{port_mode}</EuiBadge>,
                width: "80px",
            },
            {
                field: "subscription_id",
                name: "My name",
                sortable: true,
                render: (subscription_id: any) =>
                    portSubscriptionIds.find((item) => item.subscription_id === subscription_id)?.customName ?? "",
            },
            {
                field: "subscription_id",
                name: "",
                width: "77px",
                render: (subscription_id: any) => (
                    <>
                        <EuiButtonIcon
                            id={`favorite-port-selector-modal-${subscription_id}-edit`}
                            iconType="pencil"
                            aria-label={intl.formatMessage({ id: "favorites.edit" })}
                            onClick={(
                                event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, globalThis.MouseEvent>
                            ) => this.onChangeEditMode(event, subscription_id)}
                        />
                        <EuiButtonIcon
                            id={`favorite-port-selector-modal-${subscription_id}-delete`}
                            iconType="trash"
                            aria-label={intl.formatMessage({ id: "favorites.trash" })}
                            onClick={(
                                event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, globalThis.MouseEvent>
                            ) => this.onDelete(event, subscription_id)}
                        />
                        {!this.props.managementOnly && (
                            <EuiButtonIcon
                                id={`favorite-port-selector-modal-${subscription_id}-select`}
                                iconType="pinFilled"
                                aria-label={intl.formatMessage({ id: "favorites.select" })}
                                onClick={(
                                    event: React.MouseEvent<
                                        HTMLButtonElement | HTMLAnchorElement,
                                        globalThis.MouseEvent
                                    >
                                ) => this.onSubscriptionSelect(event, subscription_id)}
                            />
                        )}
                    </>
                ),
            },
        ];

        let subscriptionDescription = "";
        if (editMode) {
            subscriptionDescription =
                ports.find((port) => port.subscription_id === selectedSubscription)?.description ?? "";
        }

        return (
            <div>
                {message && (
                    <>
                        <EuiCallOut
                            title={message}
                            color={errors ? "danger" : "primary"}
                            iconType={errors ? "alert" : "notebookApp"}
                        >
                            {messageHelp && <p>{messageHelp}</p>}
                        </EuiCallOut>
                        <EuiSpacer />
                    </>
                )}

                {!editMode && (
                    <EuiInMemoryTable
                        id="favorite-port-modal-table"
                        items={ports}
                        columns={columns}
                        pagination={{ pageSizeOptions: [5, 10] }}
                        loading={!portsLoaded}
                        sorting={true}
                        search={true}
                    />
                )}

                {portsLoaded && editMode && (
                    <div>
                        <EuiText grow={true}>
                            <h3>Add a personal name to this subscription</h3>
                        </EuiText>
                        <EuiText grow={true}>
                            <p>
                                Subscription: <i>{subscriptionDescription}</i>
                            </p>
                        </EuiText>
                        <EuiSpacer />
                        <EuiForm>
                            <EuiFormRow
                                id="favorite-port-modal-custom-name-input"
                                label="Custom name"
                                helpText="Enter a short personal name that can be used to find this subscription"
                            >
                                <EuiFieldText onChange={this.onUpdateName} value={editName} />
                            </EuiFormRow>
                            <EuiButton
                                id="favorite-port-modal-custom-name-submit"
                                type="submit"
                                fill
                                onClick={this.onSaveName}
                            >
                                Save name
                            </EuiButton>
                        </EuiForm>
                    </div>
                )}
            </div>
        );
    }
}

export default injectIntl(FavoritePortSelector);
