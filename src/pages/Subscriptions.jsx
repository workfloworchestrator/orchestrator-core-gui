import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import "./Subscriptions.scss";

import ReactTable from "react-table";
import "react-table/react-table.css"
import {renderDate} from "../utils/Lookups";
import {requestSubscriptionData} from "../utils/SubscriptionData";
import {stop} from "../utils/Utils";


export default class Subscriptions extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            subscriptions: [],
            loading: true,
            pages: 0,
        };
        this.fetchData = this.fetchData.bind(this);
    }

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

    render() {
        const {loading, pages, subscriptions} = this.state;

        return (
            <div className="subscriptions-page">
                <div className="subscriptions-header">
                </div>
                <div className="subscriptions-container">
                    <ReactTable
                        columns={[
                            {
                                Header: "Id",
                                id: "subscription_id",
                                accessor: d => <a href={`/subscription/${d.subscription_id}`} onClick={this.showSubscriptionDetail(d.subscription_id)}>
                                    {d.subscription_id.slice(0,8)}
                                </a>
                            },
                            {
                                Header: "Description",
                                accessor: "description"
                            },
                            {
                                Header: "In Sync",
                                id: "insync",
                                accessor: d => d.insync ? "yes" : "no"
                            },
                            {
                                Header: "Status",
                                accessor: "status"
                            },
                            {
                                Header: "Start Date",
                                id: "start_date",
                                accessor: d => renderDate(d.start_date)
                            }
                        ]}
                        manual // Forces table not to paginate or sort automatically, so we can handle it server-side
                        data={subscriptions}
                        pages={pages} // Display the total number of pages
                        loading={loading} // Display the loading overlay when we need it
                        onFetchData={this.fetchData} // Request new data when things change
                        filterable
                        resizable={false} // Causes bugs when enabled with subscription columnn
                        defaultSorted={[{
                            id   : 'start_date',
                            desc : true,
                        }]}
                        defaultPageSize={20}
                        className="-striped -highlight"
                    />
                    </div>
                </div>
        );
    }
}

Subscriptions.propTypes = {
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
};
