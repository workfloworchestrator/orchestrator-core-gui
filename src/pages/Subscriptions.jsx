import React from "react";
import PropTypes from "prop-types";
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';

import ReactTable from "react-table";
import {renderDate} from "../utils/Lookups";
import {requestSubscriptionData} from "../utils/SubscriptionData";
import {stop} from "../utils/Utils";
import MessageBox from "../components/MessageBox";

import "./Subscriptions.scss";
import "./TableStyle.scss";


const urlPropsQueryConfig = {
    page: { type: UrlQueryParamTypes.number },
    pageSize: { type: UrlQueryParamTypes.number },
    sorted: { type: UrlQueryParamTypes.array },
    filtered: { type: UrlQueryParamTypes.array },
};


class Subscriptions extends React.PureComponent {

    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = {
            subscriptions: [],
            loading: true,
            pages: 99,
            sorted: [],
            filtered: [],
            initialFiltered: undefined
        };
    };

    componentDidMount() {
        if (this.props.sorted) {
            console.log("Resort needed")
        }
        if (this.props.filtered) {
            console.log("Re Filter needed")
            const newState= {
                filtered: this.props.filtered ? this.props.filtered.map(item => { return {id:item.split(",")[0], value:item.split(",")[1]}}) : [],
                sorted: [],
                //page: this.props.page ? 0,
                page: 0,
                pageSize: 25
            }
            this.fetchData(newState)
            // debugger;
            this.setState({initialFiltered: newState.filtered})
        }

    }

    fetchData = (state, instance) => {
        this.setState({ loading: true });
        requestSubscriptionData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            this.setState({
                subscriptions: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    };

    handleKeyDown(e) {
        const page = this.props.page ? this.props.page : 0;
        if (e.keyCode === 38 && page > 0) {
            this.props.onChangePage(page-1)
        } else if (e.keyCode === 40) {
            this.props.onChangePage(page+1)
        }
    };

    showSubscriptionDetail = subscription_id => e => {
        stop(e);
        const sortUrlParameters = this.state.sorted.map(item => {return `${item.id},${item.desc ? "desc" : "asc"}`});
        this.props.onChangeSorted(sortUrlParameters);
        const filterUrlParameters = this.state.filtered.map(item => {return `${item.id},${item.value}`});
        this.props.onChangeFiltered(filterUrlParameters);
        this.props.history.push("/subscription/" + subscription_id);
    };

    navigateToOldSubscriptions = () => {
        this.props.history.push("/old-subscriptions/");
    };

    render() {
        const {pages, subscriptions, sorted, filtered, initialFiltered} = this.state;
        const {page, onChangePage, pageSize, onChangePageSize } = this.props;

        return (
            <div className="subscriptions-page" onKeyDown={this.handleKeyDown}>
                <div className="divider"></div>
                <div className="subscriptions-container">
                    <ReactTable
                        columns={[
                            {
                                Header: "Id",
                                id: "subscription_id",
                                accessor: d => <a href={`/subscription/${d.subscription_id}`}
                                                  onClick={this.showSubscriptionDetail(d.subscription_id)}>
                                                {d.subscription_id.slice(0,8)}
                                               </a>,
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
                                accessor: d => d.insync ? "yes" : "no",
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
                        onFetchData={this.fetchData} // Request new data when things change
                        filterable
                        resizable={false} // Causes bugs when enabled with description columnn
                        defaultPageSize={25}
                        className="-striped -highlight"
                        showPaginationTop
                        showPaginationBottom
                        filtered={initialFiltered}

                        // Controlled props
                        page={page}
                        pageSize={pageSize}

                        // Call back heaven:
                        onPageChange={page => onChangePage(page)}
                        onPageSizeChange={(pageSize, pageIndex) => {
                            onChangePageSize(pageSize);
                            onChangePage(pageIndex);
                        }}
                        onSortedChange={sorted => this.setState({ sorted })}
                        onFilteredChange={filtered => this.setState({ filtered: filtered, initialFiltered: undefined })}
                    />
                    </div>
                <MessageBox messageHeader="Info"
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
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,

    // Mapped to URL query parameters
    page: PropTypes.number,
    filtered: PropTypes.array,
    sorted: PropTypes.array,
    pageSize: PropTypes.number,

    // Functions to change URL query paramaters
    onChangePage: PropTypes.func,
    onChangeFiltered: PropTypes.func,
    onChangeSorted: PropTypes.func,
    onChangePageSize: PropTypes.func,
};

export default addUrlProps({ urlPropsQueryConfig })(Subscriptions)
