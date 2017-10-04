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
        help: "Help"
    },

    processes: {
        changes: "Changes",
        noc: "NOC",
        customer_support: "Klant support",
        searchPlaceHolder: "Search for processes...",
        new: "New Process",
        notFound: "No Workflow found",
        assignee: "Assignee",
        step: "Step",
        customer: "Customer",
        product: "product",
        workflow_name: "Workflow",
        started: "started",
        last_modified: "Last modified",
        actions: "",
        none: "",
        submit: "Submit",
        cancel: "Cancel",
        remove: "Delete",
        deleteConfirmation: "Are you sure you want to delete {{name}}?",
        no_found: "No processes"
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
        product: "Product",
        product_info: "Search and select the product",
        customer_id: "Customer",
        customer_id_info: "Search and select the customer for the product",
        source_msp: "Source Multi-service punt",
        source_msp_info: "The source MSP",
        destination_msp: "Destination Multi-service punt",
        destination_msp_info: "The destination MSP",
        capacity: "Capacity",
        capacity_info: "Integer marking the capacity of the lightpath",
        vlan_id: "VLAN",
        vlan_id_info: "VLAN range",
        new_process: "New process"
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
