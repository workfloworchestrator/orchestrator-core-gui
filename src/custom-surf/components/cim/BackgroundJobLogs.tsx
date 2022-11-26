import { EuiBasicTable } from "@elastic/eui";
import React, { Fragment } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

import { BackgroundJobLog } from "../../types";
import { renderStringAsDateTime } from "../../Utils";

interface IProps extends WrappedComponentProps {
    data: BackgroundJobLog[];
}

const BackgroundJobLogs = ({ data }: IProps) => {
    let columns = [
        {
            field: "entry_time",
            name: "Date",
            render: (entry_time: string, data: any) => renderStringAsDateTime(data.entry_time),
            width: 200,
            schema: "date",
        },
        {
            field: "process_state",
            name: "State",
            truncateText: true,
            sortable: true,
            width: 100,
        },
        {
            field: "message",
            name: "Log message",
            sortable: true,
            truncateText: true,
            width: "40%",
        },
        {
            field: "subscription_id",
            name: "Subscription ID",
            sortable: true,
            width: 200,
        },
        {
            field: "customer ID",
            name: "Customer ID",
            sortable: true,
            width: 200,
        },
    ];

    return (
        <Fragment>
            <EuiBasicTable
                tableCaption={`Background jobs log table`}
                items={data}
                // @ts-ignore
                columns={columns}
            />
        </Fragment>
    );
};
export default injectIntl(BackgroundJobLogs);
