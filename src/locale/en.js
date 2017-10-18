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
        validations: "Validations"
    },

    processes: {
        changes: "Changes",
        system: "System",
        noc: "NOC Engineers",
        customer_support: "Klant support",
        searchPlaceHolder: "Search for processes...",
        new: "New Process",
        notFound: "No Workflow found",
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
        }
    },
    process: {
        cancel: "Cancel",
        submit: "Submit",
        format_error: "Required input / invalid format",
        userInput: "User input for step {{name}} for product {{product}}",
        tabs: {
            user_input: "User input",
            process: "process"
        },
        port: "Port",
        port_info: "Select a port",
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
        vlan: "VLAN",
        vlan_info: "VLAN range - must be integer",
        emails: "Emails",
        emails_info: "The email addresses to notify when the process is finished. You can add multiple addresses",
        location_code: "Location code",
        location_code_info: "Provide a valid location code",
        crm_port_id: 'The CRM identifier for a port',
        crm_port_id_info: 'Provide a valid CRM Port ID (Surfnet7)',
        ims_id: "IMS identifier",
        ims_invalid_id: "Invalid / empty IMS port ID. The database data is corrupt / invalid",
        ims_id_info: "The IMS identifier stored in the IMS database",
        dienstafname: "Dienstafname",
        dienstafname_info: "The dienstafname of the service - must be valid GUID like 76C5FB05-6D86-4BD2-A56C-124F7F33B1F9",
        ieee_interface_type: "IEEE interface type",
        ieee_interface_type_info: "The IEEE interface type",
        ims_port_id: "IMS port id",
        ims_port_id_info: "The IMS port id",
        service_id: "IMS service id",
        service_id_info: "IMS service id",
        noc_customer_confirmation: "The customer has confirmed the successful delivery of the service",
        new_process: "New process",
        flash: {
            create: "Created process for workflow {{name}}",
            update: "Resumed process for workflow {{name}}"
        }
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
    filter: {
        CHANGES: "Changes",
        NOC: "NOC",
        KLANT_SUPPORT: "Klant Support",
        SYSTEM: "System",
        label: "ASSIGNEE",
        all: "ALL",
        selected: "FILTERED",
        aborted: "Aborted",
        completed: "Completed",
        suspended: "Suspended",
        running: "Running",
        failed: "Failed"
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
