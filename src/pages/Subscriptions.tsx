/*
 * Copyright 2019 SURF.
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

import React, { RefObject } from "react";
import { withQueryParams, NumberParam, SetQuery, DecodedValueMap } from "use-query-params";
import ReactTable, { Filter, SortingRule } from "react-table-6";
import Modal from "react-modal";
import debounce from "lodash/debounce";
import I18n from "i18n-js";

import { renderDate } from "../utils/Lookups";
import { requestSubscriptionData } from "../utils/SubscriptionData";
import { stop } from "../utils/Utils";
import ApplicationContext from "../utils/ApplicationContext";

import "./Subscriptions.scss";
import "./TableStyle.scss";
import SubscriptionDetail from "./SubscriptionDetail";
import Explain from "../components/Explain";
import { CommaSeparatedNumericArrayParam, CommaSeparatedStringArrayParam } from "../utils/QueryParameters";
import { Subscription } from "../utils/types";

const queryConfig = {
    page: NumberParam,
    pageSize: NumberParam,
    sorted: CommaSeparatedStringArrayParam,
    filtered: CommaSeparatedNumericArrayParam
};

interface TableState {
    page: number;
    pageSize: number;
    sorted: SortingRule[];
    filtered: Filter[];
}

interface IProps {
    query: DecodedValueMap<typeof queryConfig>;
    setQuery: SetQuery<typeof queryConfig>;
}

interface IState {
    subscriptionId?: string;
    subscriptions: Subscription[];
    advancedSearchPhrase: string;
    showExplanation: boolean;
    loading: boolean;
    pages: number;
    sorted: SortingRule[];
    filtered: Filter[];
}

class Subscriptions extends React.PureComponent<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    private filtering: boolean = false; // This state is intentionally left outside the proper state since changing it should not trigger a render
    private refReactTable: RefObject<ReactTable<Subscription>> = React.createRef();

    constructor(props: IProps) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        let sorted = [];

        if (props.query.sorted)
            for (let i = 0; i < props.query.sorted.length; i += 2) {
                if (i + 1 < props.query.sorted.length) {
                    sorted.push({ id: props.query.sorted[i], desc: props.query.sorted[i + 1] === "desc" });
                }
            }
        else {
            sorted.push({ id: "start_date", desc: true });
        }

        this.state = {
            subscriptionId: undefined,
            subscriptions: [],
            advancedSearchPhrase: "",
            showExplanation: false,
            loading: true,
            pages: 99,
            sorted: sorted,
            filtered: []
        };
    }

    fetchStrategy = (tableState: TableState) => {
        if (this.filtering) {
            return this.fetchDataWithDebounce(tableState);
        } else {
            return this.fetchData(tableState);
        }
    };

    onFilteredChange = () => {
        // when the filter changes, that means someone is typing
        this.filtering = true;
    };

    fetchData = (tableState: TableState) => {
        // we've arrived either debounced or not, so filtering can be reset
        let filtered: Filter[] = [...tableState.filtered];
        if (this.state.advancedSearchPhrase) {
            filtered.push({ id: "tsv", value: this.state.advancedSearchPhrase });
        }

        this.filtering = false;
        requestSubscriptionData(tableState.pageSize, tableState.page, tableState.sorted, filtered).then(res => {
            this.setState({
                subscriptions: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    };

    fetchDataWithDebounce = debounce(this.fetchData, 500);

    updateSorted = (newSorted: SortingRule[]) => {
        this.setState({
            sorted: newSorted
        });
        const newSort = newSorted.map(item => {
            return `${item.id},${item.desc ? "desc" : "asc"}`;
        });
        this.props.setQuery({ sorted: newSort }, "replaceIn");
    };

    handleKeyDown = (e: React.KeyboardEvent) => {
        const page = this.props.query.page ? this.props.query.page : 0;
        let new_page;
        if (e.keyCode === 38 && page > 0) {
            new_page = page - 1;
        } else if (e.keyCode === 40) {
            new_page = page + 1;
        }
        this.props.setQuery({ page: new_page }, "replaceIn");
    };

    handleAdvancedSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            this.handleAdvancedSearch();
        }
    };

    handleAdvancedSearch = () => {
        if (this.refReactTable.current) {
            // @ts-ignore
            this.refReactTable.current.fireFetchData();
        }
    };

    showSubscriptionDetail = (subscription_id: string) => (e: React.MouseEvent) => {
        stop(e);
        this.setState({ subscriptionId: subscription_id });
    };

    hideSubscriptionDetail = () => {
        this.setState({ subscriptionId: undefined });
    };

    renderExplain() {
        return (
            <section className="explain" onClick={() => this.setState({ showExplanation: true })}>
                <i className="fa fa-question-circle" />
            </section>
        );
    }

    render() {
        const { pages, sorted, subscriptions, subscriptionId, showExplanation } = this.state;
        const { query, setQuery } = this.props;

        return (
            <div className="subscriptions-page" onKeyDown={this.handleKeyDown}>
                <Explain
                    close={() => this.setState({ showExplanation: false })}
                    render={() => (
                        <React.Fragment>
                            <h1>Using the advanced search</h1>
                            <p>
                                The advanced search allows you to search on all resource types of product types. So if
                                you know an IMS_CIRCUIT_ID or a IPAM_PREFIX_ID, then you can find it by the use of the
                                advanced search. The values in the search boxes above the columns, allow you to
                                refine/narrow these search results. It's important to remember that the advanced search
                                will only find complete words, but it will split words with "-", "," and "_".
                            </p>
                            <p>
                                For example, to search for all subscriptions of a particular customer, the search phrase
                                would be <i>"customer_id:d253130e-0a11-e511-80d0-005056956c1a"</i>. However, as the UUID
                                is unique, simply searching for <i>"d253130e-0a11-e511-80d0-005056956c1a"</i> or even
                                <i>"d253130e"</i> would yield the same results.
                            </p>
                            <p>
                                One can also use the keywords <i>and</i> and <i>or</i>. And one can use <i>-</i> to
                                exclude a keyword. To make sure all words in the search are found in matching order use
                                quotes <i>"</i> around the sentence. Example:{" "}
                                <i>(star wars) or "luke skywalker" -scotty</i> searches for star and wars or luke but
                                excluding scotty.
                            </p>
                            <p>
                                The full text search can contain multiple search criteria that will AND-ed together. For
                                example
                                <i>
                                    "customer_id:d253130e-0a11-e511-80d0-005056956c1a status:active tag:IP_PREFIX"
                                </i>{" "}
                                would only return subscriptions matching the supplied <i>customer_id</i>, <i>status</i>{" "}
                                and <i>tag</i>. Due to how full text search works that query could be simplified to:{" "}
                                <i>"d253130e active ip_prefix"</i>.
                            </p>
                            <h1>Patterns</h1>
                            <p>
                                <b>by customer:</b> customer_id:uuid
                                <br />
                                <b>by ims_circuit_id:</b> ims_circuit_id:int
                                <br />
                                <b>by ipam_prefix_id:</b> ipam_prefix_id:int
                                <br />
                                <b>by nso_service_id:</b> nso_service_ud:int
                                <br />
                                <b>by service_speed:</b> nso_service_ud:int
                                <br />
                                <b>by asn:</b> asn:int
                                <br />
                                <b>by crm_port_id:</b> crm_port_id:int
                                <br />
                            </p>
                        </React.Fragment>
                    )}
                    isVisible={showExplanation}
                    title="Advanced search"
                    content="Blaat"
                />
                <div className="advanced-search-container">
                    <section className="header">{this.renderExplain()}</section>
                    <section className="search">
                        <input
                            className="allowed"
                            placeholder={I18n.t("subscriptions.advancedSearchPlaceHolder")}
                            type="text"
                            name="advancedSearchPhrase"
                            onChange={e => this.setState({ advancedSearchPhrase: e.target.value })}
                            onKeyUp={this.handleAdvancedSearchKeyDown}
                        />
                    </section>
                    <button
                        type="submit"
                        name="advanced-search"
                        id="advanced-search"
                        className="new button green"
                        onClick={this.handleAdvancedSearch}
                    >
                        {I18n.t("subscriptions.submitSearch")} <i className="fa fa-search" />
                    </button>{" "}
                </div>
                <div className="subscriptions-container">
                    {
                        <ReactTable
                            columns={[
                                {
                                    Header: "Id",
                                    id: "subscription_id",
                                    accessor: (d: Subscription) => (
                                        <a
                                            href={`/subscription/${d.subscription_id}`}
                                            onClick={this.showSubscriptionDetail(d.subscription_id)}
                                        >
                                            {d.subscription_id.slice(0, 8)}
                                        </a>
                                    ),
                                    width: 100
                                },
                                {
                                    Header: "Product",
                                    accessor: "product.name",
                                    width: 200
                                },
                                {
                                    Header: "Tag",
                                    accessor: "product.tag",
                                    width: 175
                                },
                                {
                                    Header: "Description",
                                    accessor: "description",
                                    width: 425
                                },
                                {
                                    Header: "In Sync",
                                    id: "insync",
                                    accessor: (d: Subscription) => (d.insync ? "yes" : "no"),
                                    width: 80
                                },
                                {
                                    Header: "Status",
                                    accessor: "status"
                                },
                                {
                                    Header: "Start Date",
                                    id: "start_date",
                                    filterable: false,
                                    accessor: (d: Subscription) => renderDate(d.start_date)
                                },
                                {
                                    Header: "End Date",
                                    id: "end_date",
                                    filterable: false,
                                    accessor: (d: Subscription) => renderDate(d.end_date)
                                }
                            ]}
                            manual // Forces table not to paginate or sort automatically, so we can handle it server-side
                            data={subscriptions}
                            pages={pages} // Display the total number of pages
                            loading={false} // We use the spinner of the core app itself.
                            onFetchData={this.fetchStrategy} // Request new data when things change
                            filterable
                            resizable={false} // Causes bugs when enabled with description columnn
                            defaultPageSize={25}
                            className="-striped -highlight"
                            showPaginationTop
                            showPaginationBottom
                            // Controlled props
                            sorted={sorted}
                            page={query.page}
                            pageSize={query.pageSize}
                            // Call back heaven:
                            onPageChange={(page: number) => setQuery({ page: page }, "replaceIn")}
                            onPageSizeChange={(pageSize: number, pageIndex: number) => {
                                setQuery({ pageSize: pageSize, page: pageIndex }, "replaceIn");
                            }}
                            onSortedChange={this.updateSorted}
                            onFilteredChange={this.onFilteredChange}
                            ref={this.refReactTable}
                        />
                    }

                    {subscriptionId && (
                        <Modal
                            isOpen={true}
                            appElement={document.getElementById("app") || undefined}
                            overlayClassName="overlay"
                            className="subscription-modal"
                            shouldCloseOnOverlayClick={true}
                            onRequestClose={this.hideSubscriptionDetail}
                        >
                            <div style={{ textAlign: "right" }}>
                                <i className="large-icon fa fa-close" onClick={this.hideSubscriptionDetail} />
                            </div>
                            <div className="scroller">
                                <SubscriptionDetail subscriptionId={subscriptionId} />
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        );
    }
}

Subscriptions.contextType = ApplicationContext;

export default withQueryParams(queryConfig, Subscriptions);
