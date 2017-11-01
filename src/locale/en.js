// Interpolation works as follows:
//
// Make a key with the translation and enclose the variable with {{}}
// ie "Hello {{name}}" Do not add any spaces around the variable name.
// Provide the values as: I18n.t("key", {name: "John Doe"})
import I18n from "i18n-js";

I18n.translations.en = {
    code: "EN",
    name: "English",
    select_locale: "Select English",
    EntityId: "",

    header: {
        title: "Workflows",
        links: {
            help_html: "<a href=\"https://gitlab.surfnet.nl/SURFnetNOC/workflows/wikis/home\" target=\"_blank\">Help</a>",
            logout: "Logout",
            exit: "Exit"
        },
        role: "Role"
    },

    navigation: {
        processes: "Processes",
        validations: "Validations",
        subscriptions: "Subscriptions"
    },

    processes: {
        changes: "Changes",
        system: "System",
        noc: "NOC Engineers",
        customer_support: "Klant support",
        searchPlaceHolder: "Search for processes...",
        new: "New Process",
        assignee: "Assignee",
        step: "Step",
        status: "Status",
        customer: "Customer",
        product: "product",
        workflow_name: "Workflow",
        started: "started",
        last_modified: "Last modified",
        actions: "",
        none: "",
        submit: "Submit",
        cancel: "Cancel",
        delete: "Delete",
        details: "Details",
        user_input: "User input",
        abort: "Abort",
        retry: "Retry",
        deleteConfirmation: "Are you sure you want to delete {{name}} process for {{customer}}?",
        abortConfirmation: "Are you sure you want to abort {{name}} process for {{customer}}?",
        retryConfirmation: "Are you sure you want to retry {{name}} process for {{customer}}?",
        no_found: "No processes",
        flash: {
            delete: "Process {{name}} is deleted",
            abort: "Process {{name}} is aborted",
            retry: "Process {{name}} has been retried"
        },
        refresh: "Refresh automatically every 3 seconds?"
    },
    process: {
        cancel: "Cancel",
        submit: "Submit",
        notFound: "No Process found (e.g. 404)",
        format_error: "Required input / invalid format",
        userInput: "User input for step {{name}} for product {{product}}",
        tabs: {
            user_input: "User input",
            process: "process"
        },
        port_id: "Port",
        port_id_info: "Select a port",
        port_id_ssp_1: "Port SSP 1",
        port_id_ssp_1_info: "Select a port for SSP 1",
        port_id_ssp_2: "Port SSP 2",
        port_id_ssp_2_info: "Select a port for SSP 2",
        product: "Product",
        product_info: "Search and select the product",
        organisation: "Customer",
        organisation_info: "Search and select the customer for the product",
        source: "Source Multi-service port",
        source_info: "The source MSP",
        destination: "Destination Multi-service port",
        destination_info: "The destination MSP",
        capacity: "Capacity",
        capacity_info: "The capacity / speed of the lightpath in megabit per second",
        source_vlan: "Source port VLAN",
        source_vlan_info: "VLAN range - must be integer",
        destination_vlan: "Destination port VLAN",
        destination_vlan_info: "VLAN range - must be integer",
        ssp_1_vlan: "SSP 1 VLAN",
        ssp_1_vlan_info: "VLAN range - must be integer",
        ssp_2_vlan: "SSP 2 VLAN",
        ssp_2_vlan_info: "VLAN range - must be integer",
        contact_persons: "Customer contact persons",
        contact_persons_info: "The persons to notify when the process is finished. You can add multiple emails, names and phone numbers",
        location_code: "Location code",
        location_code_info: "Provide a valid location code",
        location_code_ssp_1: "Location code SSP 1",
        location_code_ssp_1_info: "Select a location code for the first SSP.",
        location_code_ssp_2: "Location code SSP 2",
        location_code_ssp_2_info: "Select a location code for the second SSP.",
        crm_port_id: 'The CRM identifier for a port',
        crm_port_id_info: 'Provide a valid, 5 digit, CRM Port ID (Surfnet7)',
        ims_id: "IMS identifier",
        ims_id_info: "The IMS identifier stored in the IMS database",
        dienstafname: "Dienstafname",
        dienstafname_info: "The dienstafname of the service - must be valid GUID like 76C5FB05-6D86-4BD2-A56C-124F7F33B1F9",
        ieee_interface_type: "IEEE interface type",
        ieee_interface_type_info: "The IEEE interface type",
        ieee_interface_type_ssp_1: "IEEE SSP 1",
        ieee_interface_type_ssp_1_info: "The IEEE interface for the first SSP",
        ieee_interface_type_ssp_2: "IEEE SSP 2",
        ieee_interface_type_ssp_2_info: "The IEEE interface for the second SSP",
        ims_port_id: "IMS port id",
        ims_port_id_info: "The IMS port id",
        nms_service_id: "NMS service id",
        nms_service_id_info: "The id of the ethernet service on the network",
        noc_customer_confirmation: "The customer has confirmed the successful delivery of the service",
        bandwidth: "Bandwidth",
        bandwidth_info: "Desired bandwidth in Mbit/s",
        new_process: "New process",
        configuration_ready: "Configuration ready",
        product_validation: "Product / Workflow validation",
        ssp_product_1: "SSP 1",
        ssp_product_1_info: "The First SSP",
        ssp_product_2: "SSP 2",
        ssp_product_2_info: "The Second SSP",
        flash: {
            create: "Created process for workflow {{name}}",
            update: "Resumed process for workflow {{name}}"
        },
        subscription_link: "Subscription",
        subscription_link_txt: "Show Subscription created by this Process",
    },
    process_state: {
        copy: "Copy to clipboard",
        copied: "Copied",
        raw: "Show raw JSON",
        details: "Show details",
        stateChanges: "Show state input",
        wording: "Process {{product}} for {{customer}}",
        summary: {
            status: "Status",
            assignee: "Assignee",
            step: "Last step executed",
            started: "Started",
            last_modified: "Last updated"
        }

    },
    validations: {
        help: "Explain",
        product: "Product",
        name: "Name",
        description: "Description",
        workflow: "Workflow",
        valid: "Valid",
        mapping: "Workflow mapping configuration ",
        no_mapping: "The '{{name}}' workflow has no 'workflow_subscription_mapping'. This workflow can not go into production without a mapping",
        product_block: "Product Block",
        resource_type: "Resource Types",
        resource_type_sub: "(Resource type ID vs Workflow ID)",
        errors: "Errors",
        error_name: "Resource block: <span>{{name}}</span>",
        block_missing: "Resource block <span>{{name}}</span> is not configured in the Product <span>{{product}}</span>",
        resource_type_missing: "Resource type <span>{{name}}</span> is not configured in the Resource Block <span>{{block}}</span>",
        hide_valids: "Hide valid product configurations",
        hide_valid_subscriptions_types: "Hide workflows with no invalid subscriptions",
        resource_blocks: "Resource blocks",
        resource_types: "Resource types",
        tabs: {
            subscriptions: "Subscriptions",
            workflows: "Workflows"
        },
        no_subscriptions: "No invalid subscriptions",
        workflow_key: "Invalid subscriptions for workflow {{workflow}}"

    },
    filter: {
        CHANGES: "Changes",
        NOC: "NOC",
        KLANT_SUPPORT: "Klant Support",
        SYSTEM: "System",
        all: "ALL",
        selected: "FILTERED",
        aborted: "Aborted",
        completed: "Completed",
        suspended: "Suspended",
        running: "Running",
        failed: "Failed"
    },
    subscriptions: {
        customer_name: "Customer",
        description: "Description",
        insync: "In sync",
        product_name: "Product",
        status: "Status",
        start_date_epoch: "Start date",
        end_date_epoch: "End date",
        sub_name: "Name",
        no_found: "No subscriptions",
        searchPlaceHolder: "Search for subscriptions...",
        noop: "",
        deleteConfirmation: "Are you sure you want to delete {{name}} subscription for {{customer}}?",
        flash: {
            delete: "Subscription {{name}} was deleted",
        }
    },
    subscription: {
        notFound: "No Subscription found (e.g. 404)",
        subscription: "Subscription",
        child_subscriptions: "The following child subscriptions are used in this parent subscription - {{product}}",
        parent_subscriptions: "The following parent subscriptions are using this child subscription - {{product}}",
        resource_types: "Subscription Resource Types",
        product_title: "Product",
        process_link: "Process",
        process_link_text: "Show related process / workflow",
        ims_services: "IMS Services",
        link_subscription: "Show Subscription",
        product: {
            name: "Name",
            description: "Description",
            workflow: "Workflow-key",
            created: "Created",
            end_date: "End date",
            product_type: "Product type",
            status: "Status",
            tag: "Tag"
        },
        ims_service: {
            id: "IMS service ID ({{index}})",
            customer: "Customer",
            extra_info: "Extra info",
            name: "Name",
            product: "Product",
            speed: "Speed",
            status: "Status"
        },
        terminate: "Terminate Subscription",
        terminateConfirmation: "Are you sure you want to terminate {{name}} subscription for {{customer}}?",
    },
    contact_persons: {
        email: "Email",
        name: "Name",
        tel: "Phone number",
        invalid_email: "Invalid email"
    },
    clipboard: {
        copied: "Copied!",
        copy: "Copy to clipboard"
    },

    error_dialog: {
        title: "Unexpected error",
        body: "This is embarrassing; an unexpected error has occurred. It has been logged and reported. Please try again. Still doesn't work? Please click 'Help'.",
        ok: "Close"
    },

    not_found: {
        title: "404",
        description_html: "The requested page could not be found"
    },
    server_error: {
        title: "500",
        description_html: "An unexpected error occurred. It has been logged and reported. Please try again. Still doesn't" +
        " work? Get Help."
    },
    not_allowed: {
        title: "403",
        description_html: "This page is restricted. You don't have access based on your group memberships and / or SAB roles"
    },
    confirmation_dialog: {
        title: "Please confirm",
        confirm: "Confirm",
        cancel: "Cancel",
        leavePage: "Do you really want to leave this page?",
        leavePageSub: "Changes that you made will not be saved.",
        stay: "Stay",
        leave: "Leave"
    },

};

export default I18n.translations.en;
