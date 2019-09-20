import React from "react";
import PropTypes from "prop-types";
import { addUrlProps, UrlQueryParamTypes } from "react-url-query";

import ReactTable from "react-table";
import Modal from "react-modal";
import { renderDate } from "../utils/Lookups";
import { requestSubscriptionData } from "../utils/SubscriptionData";
import { stop } from "../utils/Utils";
import MessageBox from "../components/MessageBox";
import { debounce } from "lodash";
import ApplicationContext from "../utils/ApplicationContext";

import "./Subscriptions.scss";
import "./TableStyle.scss";
import SubscriptionDetail from "./SubscriptionDetail";
import I18n from "i18n-js";

const urlPropsQueryConfig = {
    page: { type: UrlQueryParamTypes.number },
    pageSize: { type: UrlQueryParamTypes.number },
    sorted: { type: UrlQueryParamTypes.array },
    filtered: { type: UrlQueryParamTypes.array }
};

class Subscriptions extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = {
            subscriptionId: undefined,
            subscriptions: [],
            advancedSearchQuery: [],
            loading: true,
            pages: 99,
            sorted: this.props.sorted
                ? this.props.sorted.map(item => {
                      return { id: item.split(",")[0], value: item.split(",")[1] };
                  })
                : [{ id: "start_date", desc: true }],
            filtered: []
        };

        this.filtering = false;

        this.onFilteredChange = this.onFilteredChange.bind(this);
        this.fetchStrategy = this.fetchStrategy.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.fetchDataWithDebounce = debounce(this.fetchData, 500);
    }

    fetchStrategy(tableState) {
        if (this.filtering) {
            return this.fetchDataWithDebounce(tableState);
        } else {
            return this.fetchData(tableState);
        }
    }

    onFilteredChange(column, value) {
        this.filtering = true; // when the filter changes, that means someone is typing
    }

    fetchData = state => {
        this.filtering = false; // we've arrived either debounced or not, so filtering can be reset
        this.setState({ loading: true });
        requestSubscriptionData(state.pageSize, state.page, state.sorted, state.filtered).then(res => {
            this.setState({
                subscriptions: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    };

    updateSorted = newSorted => {
        this.setState({
            sorted: newSorted
        });
        const newSort = newSorted.map(item => {
            return `${item.id},${item.desc ? "desc" : "asc"}`;
        });
        this.props.onChangeSorted(newSort);
    };

    handleKeyDown(e) {
        const page = this.props.page ? this.props.page : 0;
        if (e.keyCode === 38 && page > 0) {
            this.props.onChangePage(page - 1);
        } else if (e.keyCode === 40) {
            this.props.onChangePage(page + 1);
        }
    }

    showSubscriptionDetail = subscription_id => e => {
        stop(e);
        this.setState({ subscriptionId: subscription_id });
    };

    hideSubscriptionDetail = () => {
        this.setState({ subscriptionId: undefined });
    };

    navigateToOldSubscriptions = () => {
        this.context.redirect("/old-subscriptions/");
    };

    render() {
        const { pages, sorted, subscriptions, initialFiltered, subscriptionId } = this.state;
        const { page, onChangePage, pageSize, onChangePageSize } = this.props;

        return (
            <div className="subscriptions-page" onKeyDown={this.handleKeyDown}>
                <div className="advanced-search-container">
                    <section className="search">
                        <input
                            className="allowed"
                            placeholder={I18n.t("subscriptions.advancedSearchPlaceHolder")}
                            type="text"
                            // onChange={this.search}
                        />
                    </section>
                    <button
                        type="submit"
                        name="new-process"
                        id="new-process"
                        className="new button green"
                        onClick={this.newProcess}
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
                                    accessor: d => (
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
                                    accessor: d => (d.insync ? "yes" : "no"),
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
                                    accessor: d => renderDate(d.start_date)
                                },
                                {
                                    Header: "End Date",
                                    id: "end_date",
                                    filterable: false,
                                    accessor: d => renderDate(d.end_date)
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
                            filtered={initialFiltered} // Will be undefined when no filter was provided in URL
                            // Controlled props
                            sorted={sorted}
                            page={page}
                            pageSize={pageSize}
                            // Call back heaven:
                            onPageChange={page => onChangePage(page)}
                            onPageSizeChange={(pageSize, pageIndex) => {
                                onChangePageSize(pageSize);
                                onChangePage(pageIndex);
                            }}
                            onSortedChange={this.updateSorted}
                            onFilteredChange={this.onFilteredChange}
                        />
                    }

                    {subscriptionId && (
                        <Modal
                            isOpen={true}
                            appElement={document.getElementById("app")}
                            overlayClassName="overlay"
                            className="subscription-modal"
                            closeOnEscape={true}
                            shouldCloseOnOverlayClick={true}
                            onRequestClose={this.hideSubscriptionDetail}
                        >
                            <div align="right">
                                <i className="large-icon fa fa-close" onClick={this.hideSubscriptionDetail} />
                            </div>
                            <div className="scroller">
                                <SubscriptionDetail subscriptionId={subscriptionId} />
                            </div>
                        </Modal>
                    )}
                </div>

                <MessageBox
                    messageHeader="Info"
                    messageText="Experimental new subscriptions page. Tips: search for status 'a' for active subs and
                            hold shift to sort on multiple columns. When an input has focus you can use UP/DOWN arrow to paginate "
                    handleClick={this.navigateToOldSubscriptions}
                    linkName="use old page"
                />
            </div>
        );
    }
}

Subscriptions.propTypes = {
    // Mapped to URL query parameters
    page: PropTypes.number,
    filtered: PropTypes.array,
    sorted: PropTypes.array,
    pageSize: PropTypes.number,

    // Functions to change URL query paramaters
    onChangePage: PropTypes.func,
    onChangeFiltered: PropTypes.func,
    onChangeSorted: PropTypes.func,
    onChangePageSize: PropTypes.func
};

Subscriptions.contextType = ApplicationContext;

export default addUrlProps({ urlPropsQueryConfig })(Subscriptions);
