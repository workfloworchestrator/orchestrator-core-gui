import React from "react";
import PropTypes from "prop-types";
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';

import ReactTable from "react-table";
import "react-table/react-table.css"
import {renderDate} from "../utils/Lookups";
import {requestSubscriptionData} from "../utils/SubscriptionData";
import {stop} from "../utils/Utils";
import MessageBox from "../components/MessageBox";

import "./Subscriptions.scss";

const urlPropsQueryConfig = {
    page: { type: UrlQueryParamTypes.number },
    sorted: { type: UrlQueryParamTypes.array },
    filtered: { type: UrlQueryParamTypes.array },
};


class Subscriptions extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            subscriptions: [],
            loading: true,
            pages: 0,
        };
        this.fetchData = this.fetchData.bind(this);
    }

    static propTypes = {
        // URL props are automatically decoded and passed in based on the config
        page: PropTypes.number,
        filtered: PropTypes.array,
        sorted: PropTypes.array,

        // change handlers are automatically generated when given a config.
        // By default they update that single query parameter and maintain existing
        // values in the other parameters.
        onChangePage: PropTypes.func,
        onChangeFiltered: PropTypes.func,
        onChangeSorted: PropTypes.func,
    };



    fetchData(state, instance) {
        // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
        // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
        this.setState({ loading: true });
        // Request the data however you want.  Here, we'll use our mocked service we created earlier
        requestSubscriptionData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered
        ).then(res => {
            // Now just get the rows of data to your React Table (and update anything else like total pages or loading)
            this.setState({
                subscriptions: res.rows,
                pages: res.pages,
                loading: false
            });
        });
    }

    showSubscriptionDetail = subscription_id => e => {
        stop(e);
        this.props.history.push("/subscription/" + subscription_id);
    };

    navigateToOldSubscriptions = () => {
        this.props.history.push("/old-subscriptions/");
    };


    render() {
        const {pages, subscriptions} = this.state;
        const {page, onChangePage, filtered, onChangeFiltered, sorted, onChangeSorted} = this.props;

        return (
            <div className="subscriptions-page">

                <div className="subscriptions-container">
                    <div>
                        page: {this.props.page}<br/>
                        filtered: {this.props.filtered}<br/>
                        sorted: {this.props.sorted}<br/>

                    </div>
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
                            }
                        ]}
                        manual // Forces table not to paginate or sort automatically, so we can handle it server-side
                        data={subscriptions}
                        pages={pages} // Display the total number of pages
                        loading={false} // We use the spinner of the core app itself.
                        onFetchData={this.fetchData} // Request new data when things change
                        filterable
                        resizable={false} // Causes bugs when enabled with description columnn
                        defaultSorted={[{
                            id: "start_date",
                            desc: true,
                        }]}
                        defaultPageSize={25}
                        className="-striped -highlight"
                        showPaginationTop
                        showPaginationBottom
                        // Call back heaven:
                        onSortedChange={sorted => {
                            onChangeSorted(sorted)
                            onChangePage(0)
                        }}
                        onPageChange={page => onChangePage(page)}
                        // onResizedChange={resized => this.setState({ resized })}
                        onFilteredChange={filtered => onChangeFiltered(filtered)}


                    />
                    </div>
                <MessageBox messageHeader="Info"
                            messageText="Experimental new subscriptions page. Tips: search for status 'a' for active subs and hold shift to sort on multiple columns."
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
};

export default addUrlProps({ urlPropsQueryConfig })(Subscriptions)
