import { EuiDescriptionList, EuiInMemoryTable, EuiTableSortingType } from "@elastic/eui";
import { BackgroundJobLog } from "custom/types";
import { renderIsoDatetime } from "custom/Utils";
import { Fragment } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

interface IProps extends WrappedComponentProps {
    data: BackgroundJobLog[];
}

const make_description_listitem = (
    attr: any,
    json_value: any
): {
    title: string;
    description: string;
} => {
    switch (attr) {
        case "circuits":
            const ciruit_names = JSON.parse(json_value).map((circuit: any) => `"${circuit.ims_circuit_name || "???"}"`);
            ciruit_names.sort();
            return { title: "circuits", description: `[${ciruit_names.join(", ")}]` };
        case "subscription_info":
            const subscription_description = JSON.parse(json_value).description || "???";
            return { title: "description", description: subscription_description };
        default:
            return { title: attr, description: json_value };
    }
};

const render_context = (context: object) => {
    const items = Object.entries(context)
        .map(([attr, value], _i) => make_description_listitem(attr, value))
        .filter((item) => item !== undefined);
    items.sort((a, b) => (a.title < b.title ? -1 : 1));
    return <EuiDescriptionList listItems={items} type="inline" align="left" compressed={true} />;
};

const BackgroundJobLogs = ({ data }: IProps) => {
    let columns = [
        {
            field: "entry_time",
            name: "Date",
            sortable: true,
            render: (entry_time: string, data: any) => renderIsoDatetime(data.entry_time, true),
            width: "13%",
            schema: "date",
        },
        {
            field: "process_state",
            name: "State",
            truncateText: true,
            sortable: true,
            width: "12%",
        },
        {
            field: "message",
            name: "Log message",
            sortable: true,
            truncateText: false,
            width: "35%",
        },
        {
            field: "context",
            name: "Context",
            sortable: false,
            render: (context: object) => render_context(context),
            width: "40%",
        },
    ];

    const sorting: EuiTableSortingType<BackgroundJobLog> = {
        sort: {
            field: "entry_time",
            direction: "desc",
        },
    };

    return (
        <Fragment>
            <EuiInMemoryTable
                tableCaption={`Background jobs log table`}
                items={data}
                // @ts-ignore
                columns={columns}
                pagination={false}
                // @ts-ignore
                sorting={sorting}
            />
        </Fragment>
    );
};
export default injectIntl(BackgroundJobLogs);
