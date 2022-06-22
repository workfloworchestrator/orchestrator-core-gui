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

import {
    EuiButton,
    EuiCopy,
    EuiFlexGroup,
    EuiFlexItem,
    EuiHorizontalRule,
    EuiPage,
    EuiPageBody,
    EuiPanel,
    EuiSpacer,
    EuiText,
    EuiTitle,
    formatDate, EuiBasicTable, EuiLink, EuiHealth,
} from "@elastic/eui";
import { ShowConfirmDialogType } from "contextProviders/ConfirmationDialogProvider";
import React, { useContext } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import { DecodedValueMap, NumberParam, QueryParamConfigMap, SetQuery, withQueryParams } from "use-query-params";
import ApplicationContext from "utils/ApplicationContext";
import { CommaSeparatedNumericArrayParam } from "utils/QueryParameters";
import {
    InputForm,
    ProcessSubscription,
    ProcessWithDetails,
    Product,
    ServiceTicketImpactedIMSCircuit,
    ServiceTicketImpactedObject,
    ServiceTicketLog,
    ServiceTicketWithDetails,
    TabView,
    WsProcessV2,
} from "utils/types";
import { renderDate, renderDateTime } from "utils/Lookups";
import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import { ticketDetail } from "./ServiceTicketDetailStyling";

const queryConfig: QueryParamConfigMap = { collapsed: CommaSeparatedNumericArrayParam, scrollToStep: NumberParam };

interface MatchParams {
    id: string;
}
interface IProps extends RouteComponentProps<MatchParams>, WrappedComponentProps {
    query: DecodedValueMap<typeof queryConfig>;
    setQuery: SetQuery<typeof queryConfig>;
}

interface IState {
    ticket?: ServiceTicketWithDetails;
    notFound: boolean;
    loaded: boolean;
}

// TODO temporary, there must be a better way
interface ImpactedCircuit {
    object: ServiceTicketImpactedObject;
    circuit: ServiceTicketImpactedIMSCircuit;
}

type Column = "subscription_id" | "subscription_name" | "ims_circuit_id";

class ServiceTicketDetail extends React.PureComponent<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    constructor(props: IProps) {
        super(props);
        this.state = {
            ticket: undefined,
            notFound: false,
            loaded: false,
        };
    }

    componentDidMount = () => {
        this.context.customApiClient
            .ticketById(this.props.match.params.id)
            .then((res) => {
                this.setState({ ticket: res, loaded: true });
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    this.setState({ notFound: true, loaded: true });
                } else {
                    throw err;
                }
            });
    };

    render() {
        if (!this.state.ticket) return null;

        const { ticket } = this.state;
        const { theme } = this.context;

        // TODO entry time should be a number, currently a datetime string
        ticket.logs.sort((a: ServiceTicketLog, b: ServiceTicketLog) => (a.entry_time - b.entry_time));

        const logitem_tabs: TabView[] = ticket.logs.map((logitem: ServiceTicketLog, index:number) => (
            {
                id: `mod-ticket-logitem-${index}`,
                name: logitem.logtype,
                disabled: false,
                content: (
                    <EuiPanel hasBorder={true}>
                        {logitem.entry_time}
                        <EuiHorizontalRule margin="xs"></EuiHorizontalRule>
                        {logitem.update_nl}
                        <EuiHorizontalRule margin="xs"></EuiHorizontalRule>
                        {logitem.update_en}
                    </EuiPanel>
                )
            }
        ));

        // TODO REMOVE THIS THERE MUST BE A BETTER WAY
        const impactedCircuits: ImpactedCircuit[] = [];
        for (const impacted of ticket.impacted_objects) {
            for (const circuit of impacted.ims_circuits) {
                impactedCircuits.push({object: impacted, circuit:circuit});
            }
        }
        console.log("IMPACTED CIRCUITS");
        console.log(impactedCircuits);

        const columns: any = [
            {
              field: 'object.subscription_id',
              name: 'Subscription ID',
              sortable: true,
              render: (subscription_id: string) => (
                      <span>
                        <EuiLink href={`/subscriptions/${subscription_id}`} target="_blank">
                          {subscription_id}
                        </EuiLink>
                      </span>
                    ),
            //   'data-test-subj': 'subscriptionIdCell',
            //   mobileOptions: {
            //     render: (item: ImpactedCircuit) => (
            //       <span>
            //         {item.object.subscription_id}{' '}
            //         <EuiLink href="#" target="_blank">
            //           {item.object.subscription_id}
            //         </EuiLink>
            //       </span>
            //     ),
            //     header: false,
            //     truncateText: false,
            //     enlarge: true,
            //     width: '100%',
            //   },
            },
            {
              field: 'object.subscriptionDescription',
              name: 'Subscription Desc',
              truncateText: true,
            //   render: (item: ImpactedCircuit) => (
            //     <EuiLink href="#" target="_blank">
            //       {item.object.subscription_description}
            //     </EuiLink>
            //   ),
            //   mobileOptions: {
            //     show: false,
            //   },
            },
            {
              field: 'circuit.ims_circuit_id',
              name: 'Circuit ID',
            },
          ];

        const getRowProps = (item: ImpactedCircuit) => {
            const { object } = item;
            return {
              'data-test-subj': `row-${object.subscription_id}`,
              className: 'customRowClass',
              onClick: () => {},
            };
          };
        const getCellProps = (item: ImpactedCircuit, column: any) => {
            const { object } = item;
            const { field } = column;
            return {
              className: 'customCellClass',
              'data-test-subj': `cell-${object.subscription_id}-${field}`,
              textOnly: true,
            };
          };

        return (
            <EuiPage css={ticketDetail}>
                <EuiPageBody component="div">
                    <EuiPanel>
                        <EuiFlexGroup>
                            <EuiFlexItem grow={true}>
                                <EuiTitle size="m">
                                    <h1>Service ticket</h1>
                                </EuiTitle>
                            </EuiFlexItem>
                        </EuiFlexGroup>

                        <div className="mod-ticket-detail">
                            <div className="ticket-details">
                                <table className={`detail-block`}>
                                    <thead />
                                    <tbody>
                                        <tr className={theme}>
                                            <td id="ticket-title-k">
                                                <FormattedMessage id="tickets.table.title" />
                                            </td>
                                            <td id="ticket-title-v">{ticket.title}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td id="ticket-jira_ticket_id-k">
                                                <FormattedMessage id="tickets.table.jira_ticket_id" />
                                            </td>
                                            <td id="ticket-jira_ticket_id-v">{ticket.jira_ticket_id}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td id="ticket-type-k">
                                                <FormattedMessage id="tickets.table.type" />
                                            </td>
                                            <td id="ticket-type-v">{ticket.type}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td id="ticket-start_date-k">
                                                <FormattedMessage id="tickets.table.start_date" />
                                            </td>
                                            <td id="ticket-start_date-v">{ticket.start_date}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td id="ticket-end_date-k">
                                                <FormattedMessage id="tickets.table.end_date" />
                                            </td>
                                            <td id="ticket-end_date-v">{ticket.start_date}</td>
                                        </tr>
                                        {/* {customer_name && customer_name !== subscription.customer_id && (
                            <tr className={theme}>
                                <td id="subscriptions-customer-name-k">
                                    <FormattedMessage id="subscriptions.customer_name" />
                                </td>
                                <td id="subscriptions-customer-name-v">{customer_name}</td>
                            </tr>
                        )} */}
                                        {/* <tr className={theme}>
                            <td id="subscriptions-customer-id-k">
                                <FormattedMessage id="subscriptions.customer_id" />
                            </td>
                            <td id="subscriptions-customer-id-v">{subscription.customer_id}</td>
                        </tr>
                        {subscription.customer_descriptions && (
                            <tr className={theme}>
                                <td id="subscriptions-customer-descriptions-k">
                                    <FormattedMessage id="subscriptions.customer_descriptions" />
                                </td>
                                <td id="subscriptions-customer-descriptions-v">
                                    <dl>
                                        {subscription.customer_descriptions.map((description, index) => (
                                            <React.Fragment key={index}>
                                                <dt>{organisationNameByUuid(description.customer_id, organisations)}</dt>
                                                <dd>{description.description}</dd>
                                            </React.Fragment>
                                        ))}
                                    </dl>
                                </td>
                            </tr>
                        )} */}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <EuiFlexGroup>
                            <EuiFlexItem grow={true}>
                                <EuiTitle size="m">
                                    <h1>Log items</h1>
                                </EuiTitle>
                            </EuiFlexItem>
                        </EuiFlexGroup>

                        <div className="mod-ticket-logitems">
                            <div className="ticket-logitems">
                                <TabbedSection
                                    id="ticket-logitems-tabs"
                                    tabs={logitem_tabs}
                                    className="tabbed-logitems-parent"
                                    name={<FormattedMessage id="tickets.logitems"/>}
                                ></TabbedSection>
                            </div> {/* ticket-logitems */}
                        </div> {/* mod-ticket-logitems */}


                        <EuiFlexGroup>
                            <EuiFlexItem grow={true}>
                                <EuiTitle size="m">
                                    <h1>Impacted services</h1>
                                </EuiTitle>
                            </EuiFlexItem>
                        </EuiFlexGroup>

                        <div className="mod-ticket-impactedobjects">
                            <div className="ticket-impactedobjects">
                            <EuiBasicTable
                                tableCaption="Demo of EuiBasicTable"
                                items={impactedCircuits}
                                rowHeader="firstName"
                                columns={columns}
                                rowProps={getRowProps}
                                cellProps={getCellProps}
                                className="detail-block"
                                />
                            </div> {/* ticket-impactedobjects */}
                        </div> {/* mod-ticket-impactedobjects */}

                    </EuiPanel>
                </EuiPageBody>
            </EuiPage>
        );
    }
}

ServiceTicketDetail.contextType = ApplicationContext;

export default injectIntl(withQueryParams(queryConfig, ServiceTicketDetail));
