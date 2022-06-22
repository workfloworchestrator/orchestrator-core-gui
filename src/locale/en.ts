/*
 * Copyright 2019-2022 SURF.
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
        title: "Orchestrator",
        links: {
            logout: "Logout",
            exit: "Exit",
        },
        role: "Role",
    },

    navigation: {
        processes: "Processes",
        validations: "Validations",
        subscriptions: "Subscriptions",
        tickets: "Service Tickets",
        metadata: "Metadata",
        tasks: "Tasks",
        prefixes: "LIR Prefixes",
        settings: "Settings",
        new_process: "New Process",
    },
    prefixes: {
        customer: "Customer",
        subscription_id: "Sub ID",
        description: "Description",
        family: "Fam",
        prefixlen: "len",
        prefix: "Prefix",
        parent: "Parent",
        state: "State",
        start_date: "Start Date",
        select: "select",
        filters: {
            family: "IP Family",
            root_prefix: "Root Prefix",
            state: "State",
        },
        searchPlaceHolder: "Search for IP prefixes",
    },
    processes: {
        actions: {
            delete: "Delete",
            details: "Details",
            user_input: "User input",
            abort: "Abort",
            retry: "Retry",
        },
        delete: "Delete",
        deleteConfirmation: "Are you sure you want to delete {{name}} process for {{customer}}?",
        abortConfirmation: "Are you sure you want to abort {{name}} process for {{customer}}?",
        retryConfirmation: "Are you sure you want to retry {{name}} process for {{customer}}?",
        flash: {
            delete: "Process {{name}} is deleted",
            abort: "Process {{name}} is aborted",
            retry: "Process {{name}} has been retried",
        },
    },
    forms: {
        widgets: {
            nodePort: {
                selectNode: "Select a node",
                selectNodeFirst: "First select a node",
                selectPort: "Select a port",
                loading: "Loading...",
            },
            contactPersonName: {
                placeholder: "Search and add contact persons...",
            },
            select: {
                placeholder: "Search and select a value...",
            },
            locationCode: {
                placeholder: "Search and select a location code...",
            },
            node_select: {
                select_node: "Select a node",
                nodes_loading: "Loading nodes, please wait...",
                no_nodes_placeholder: "No nodes available",
            },
            organisation: {
                placeholder: "Search and select a customer...",
            },
            product: {
                placeholder: "Search and select a product...",
            },
            subscription: {
                placeholder: "Search and select a subscription...",
                missingDescription: "<No description>",
                missingCrmPortId: "<No CRM port ID>",
                missingPortMode: "<No port_mode>",
            },
            subscriptionSummary: {
                customerName: "Customer",
                name: "Name",
                status: "Status",
                description: "Description",
                subscriptionInUseBy: "Related subscriptions - ports used in {{product}}",
                subscription: "Subscription",
                resourceTypes: "Subscription Instance Values",
                resourceTypesInfo: "The resource types of the associated product block(s) of this subscription",
                productTitle: "Product",
                product: {
                    name: "Name",
                    description: "Description",
                    productType: "Product type",
                    tag: "Tag",
                },
            },
            vlan: {
                vlansInUseError: "VLAN range {{vlans}} are already in use for the selected service port",
                vlansInUse: "Already used VLAN ranges for this service port: {{vlans}}",
                missingInIms: "This service port can not be found in IMS. It may be deleted or in an initial state.",
                nsiVlansAvailable: "Available NSI VLAN ranges for this service port: {{vlans}}",
                nsiNoPortsAvailable: "This service port has no available NSI reserved VLANs (yet).",
                allPortsAvailable: "This service port has no VLANs in use (yet).",
                placeholder: "Enter a valid VLAN range...",
                placeholderNoServicePort: "First select a Service Port...",
                invalidVlan:
                    "Invalid VLAN - must be a range of valid [2-4094] VLAN integers, for example '2, 5-6, 1048-1052'",
                untaggedPortInUse: "This service port is already in use and cannot be chosen",
                taggedOnly:
                    "VLAN is only relevant for SN7 MSP or SN8 SP in tagged mode, not for link_member or untagged ports.",
            },
        },
    },
    process: {
        cancel: "Cancel",
        choose_product: "Choose Product",
        flash: {
            create_create: "Created create process for product {{name}} with pid {{pid}}",
            create_modify: "Created {{name}} process for subscription {{subscriptionId}} with pid {{pid}}",
            update: "Resumed process for workflow {{name}}",
            wizard_next_step: "Navigated to next step in form wizard",
        },
        input_fields_have_validation_errors: "{{nrOfValidationErrors}} input field(s) have validation errors",
        new_process: "Create new process / subscription",
        next: "Next",
        notFound: "No process found (e.g. 404)",
        previous: "Previous",
        product: "Product",
        submit: "Submit",
        subscription_link_txt: "Show Subscription related by this {{target}} Process",
        tabs: {
            user_input: "User input",
            process: "Process",
        },
        userInput: "User input for step {{name}} for product {{product}}",
        workflow: "Process instance of workflow {{name}}",
    },
    process_state: {
        raw: "Raw JSON",
        details: "Summary",
        show_hidden_keys: "Hidden keys",
        stateChanges: "State",
        traceback: "Traceback",
        wording_process: "Process {{product}} of workflow {{workflow}} for {{customer}}",
        wording_task: "Task of workflow {{workflow}}",
        summary: {
            status: "Status",
            assignee: "Assignee",
            created_by: "Created by",
            step: "Current step",
            started: "Started",
            last_modified: "Last updated",
        },
    },
    validations: {
        product: "Product",
        name: "Name",
        description: "Description",
        workflow: "Workflow",
        valid: "Valid",
        mapping: "Workflow mapping configuration ",
        no_mapping:
            "The '{{name}}' workflow has no 'workflow_subscription_mapping'. This workflow can not go into production without a mapping",
        product_block: "Product Block",
        resource_type: "Resource Types",
        resource_type_sub: "(Resource type ID vs Workflow ID)",
        errors: "Errors",
        error_name: "Resource block: <span>{{name}}</span>",
        block_missing: "Resource block <span>{{name}}</span> is not configured in the Product <span>{{product}}</span>",
        resource_type_missing:
            "Resource type <span>{{name}}</span> is not configured in the Resource Block <span>{{block}}</span>",
        hide_valids: "Hide valid product configurations",
        hide_valid_subscriptions_types: "Hide workflows with no invalid subscriptions",
        resource_blocks: "Resource blocks",
        resource_types: "Resource types",
        tabs: {
            subscriptions: "Subscriptions",
            workflows: "Workflows",
            fixedInputs: "Fixed Inputs",
            productWorkflows: "Product ⟺ Workflows",
        },
        no_subscriptions: "No invalid subscriptions",
        workflow_key: "Invalid subscriptions for workflow {{workflow}}",
        no_fixed_inputs:
            "There are no products that are either missing required fixed inputs, have incorrect values or have unknown fixed inputs",
        fetchingCRMData: "Loading CRM data. Hang on tight...",
        fixedInput: {
            title: "Invalid FixedInput settings for product {{name}}",
            fixed_input_name: "Fixed Input name",
            fixed_input_error: "Error",
            error: {
                required_not_present: "Required FixedInput, but not present",
                invalid_value: "Invalid value for FixedInput: {{value}}",
                missing_configuration: "FixedInput for product is not configured",
            },
        },
        productWorkflows: {
            title: "Validation of the Products ⟺ Workflows configuration in the code / database.",
            productsWithoutWorkflow: "The following products do NOT have a {{target}} workflow.",
            productsWithWorkflow: "All products have a {{target}} workflow.",
            workflowsWithoutProducts:
                "The following process workflows have no Product relations. They can never create processes.",
            workflowsWithProducts: "All process workflows have at least one Product relation",
            productsWithMultipleWorkflow:
                "The following products have more then one {{target}} workflow. This is an error.",
            productsWithoutMultipleWorkflow: "There are no products with more then one {{target}} workflow.",
            workflowsWithoutImplementations:
                "The following workflows in the database have no corresponding code implementation. This is an error",
            workflowsWithImplementations: "All workflows in the database have a code implementation",
            workflowsWithoutRecords:
                "The following workflows in the code have no corresponding database record. This is an error",
            workflowsWithRecords: "All implementations of workflows in the code have a corresponding database record",
        },
    },
    filter: {
        CHANGES: "Changes",
        NOC: "NOC",
        KLANT_SUPPORT: "Klant Support",
        SYSTEM: "System",
        MODIFY: "Modify",
        TERMINATE: "Terminate",
        CREATE: "Create",
        all: "ALL",
        selected: "FILTERED",
        created: "Created",
        aborted: "Aborted",
        completed: "Completed",
        suspended: "Suspended",
        running: "Running",
        failed: "Failed",
        api_unavailable: "API Unavailable",
        inconsistent_data: "Inconsistent Data",
        IPS: "IP Static",
        IPBGP: "IP BGP",
        IP_PREFIX: "IP Prefix",
        IPAS: "IPAS",
        Node: "Node",
        Corelink: "Corelink",
        IP: "IP",
        IRBSP: "IRBSP",
        LP: "LP",
        LPNL: "LP NL",
        LR: "Redundant LP",
        LRNL: "Redundant LP NL",
        L2VPN: "L2VPN",
        L2VPNNL: "L2VPN NL",
        MSP1G: "MSP1G",
        MSP10G: "MSP10G",
        MSP40G: "MSP40G",
        MSP100G: "MSP100G",
        PLP50M: "PLP50M",
        RMSP1G: "RMSP1G",
        SSP1G: "SSP1G",
        SSP10G: "SSP10G",
        MSC: "MSC",
        MSCNL: "MSC NL",
        AGGSP: "AGGSP",
        AGGSPNL: "AGGSP NL",
        LightPath: "SN7 Lightpath",
        ELAN: "ELAN Lightpath",
        Port: "Port",
        MSP: "MSP",
        SSP: "SSP",
        LPNLNSI: "NSI Lightpath",
        MSPNL: "MSP NL",
        RMSP: "Redundant MSP",
        initial: "Initial",
        provisioning: "Provisioning",
        active: "Active",
        disabled: "Disabled",
        terminated: "Terminated",
        Free: "Free",
        Allocated: "Allocated",
        Planned: "Planned",
        IPv4: "IPv4",
        IPv6: "IPv6",
        SP: "SN8 Service Port",
        SPNL: "NL8 Service Port",
    },
    subscriptions: {
        customer_name: "Customer",
        customer_id: "Customer UUID",
        dienstafname: "Dienstafname",
        dienstafnameGuid: "Dienstafname Guid",
        dienstafnameCode: "Dienstafname Code",
        dienstafnameStatus: "Dienstafname Status",
        note: "Note",
        id: "Subscription ID",
        subscription_id: "ID",
        description: "Description",
        insync: "In sync",
        product_name: "Product",
        status: "Status",
        start_date: "Start date",
        end_date: "End date",
        start_date_epoch: "Start date",
        end_date_epoch: "End date",
        name: "Product name",
        no_found: "No subscriptions",
        searchPlaceHolder: "Search for subscriptions...",
        advancedSearchPlaceHolder: "Search on resource types",
        submitSearch: "Search",
        fixedInputs: "Fixed Inputs",
        productBlocks: "Product Blocks",
        noop: "",
        deleteConfirmation: "Are you sure you want to delete {{name}} subscription for {{customer}}?",
        product: "Product",
        product_tag: "Type",
        flash: {
            delete: "Subscription {{name}} was deleted",
        },
        fetchingRelatedSubscriptions: "Please wait until we have loaded related subscriptions",
        noRelatedSubscriptions:
            "Standalone subscription: there are no subscriptions connected to the {{description}} subscription.",
        relatedSubscriptionsLP: "The ports used in the {{description}} subscription:",
        relatedSubscriptionsServicePort: "The light-paths using the {{description}} subscription:",
        terminatedWarning: "The info below may be outdated as the subscription they belong to is terminated!",
        failed_task: "See {{pid}}",
        customer_descriptions: "Customer description(s)",
        stats_in_grafana: "Stats",
        go_to_grafana: "Go to Grafana",
        networkdashboard_url: "Networkdashboard url (Customer subscriptions)",
        go_to_networkdashboard_url: "Go to Networkdashboard",
    },
    subscription: {
        external_links: "External Links",
        acquiring_insync_info_about_relations: "Acquiring 'insync' info of related subscriptions...",
        notFound: "No Subscription found (e.g. 404)",
        subscription_title: "Subscription",
        in_use_by_subscriptions: "Related Subscriptions",
        toggle_hide_depends_on_subscriptions: "Hide terminated related subscriptions",
        resource_types: "Subscription Instance Values",
        resource_types_info: "The resource types of the associated product block(s) of this subscription",
        product_title: "Product",
        process_link: "Processes",
        notFoundRelatedObjects: "Subscription resource references NOT found / deleted",
        process_link_text: "Show related {{target}} process for this subscription",
        no_process_link_text: "This subscription has NOT been created by a workflow or the Process has been deleted.",
        ims_services: "IMS Services",
        link_subscription: "Show Subscription",
        network_diagrams: "Network diagram",
        product: {
            name: "Name",
            description: "Description",
            workflow: "Workflow-key",
            created: "Created",
            end_date: "End date",
            product_type: "Product type",
            status: "Status",
            tag: "Tag",
        },
        process: {
            target: "Target",
            name: "Name",
            id: "Id",
            started_at: "Started at",
            status: "Status",
            modified_at: "Modified at",
        },
        ims_service: {
            id: "IMS service ID ({{id}})",
            identifier: "IMS service ID",
            customer: "Customer",
            extra_info: "Extra info",
            name: "Name",
            product: "Product",
            speed: "Speed",
            status: "Status",
            order_id: "Order ID",
            aliases: "Aliases",
            endpoints: "Endpoints",
            removed: "This circuit ID has been removed from IMS",
        },
        ims_port: {
            connector_type: "Connector type",
            fiber_type: "Fiber type",
            id: "IMS Port ID ({{id}})",
            iface_type: "Interface type",
            line_name: "Line name",
            location: "Location",
            node: "Node",
            patchposition: "Patch position",
            port: "Port",
            status: "Status",
            removed: "This port ID has been removed from IMS",
        },
        ipam_address: {
            id: "Assigned IP Address ID",
            fqdn: "FQDN",
            state: "State",
            address: "IP Address",
            tags: "Tags",
            removed: "This address ID has been removed from IPAM",
        },
        ipam_prefix: {
            description: "Description",
            prefix: "IP Prefix",
            afi: "IP Family",
            asn: "Autonomous System Number",
            state: "State",
            address: "Address ({{id}})",
            tags: "Tags",
            removed: "This prefix ID has been removed from IPAM",
        },
        subscription: {
            removed: "This subscription does not exist anymore",
        },
        fetchingImsData: "Please wait until we have loaded all IMS information...",
        terminate: "Terminate Subscription",
        terminateConfirmation: "Are you sure you want to terminate {{name}} subscription for {{customer}}?",
        no_modify_in_use_by_subscription:
            "This subscription can not be {{action}} as it is used in other subscriptions: {{unterminated_in_use_by_subscriptions}}",
        no_termination_workflow: "This subscription can not be terminated as the product has no termination workflows.",
        modifyConfirmation:
            "Are you sure you want to {{change}} of {{name}} subscription for {{customer}}? This will start a new modify process immediately!",
        no_modify_workflow: "This subscription can not be modified as the product has no modify workflows.",
        no_validate_workflow: "This subscription can not be validated as the product has no validate workflows.",
        no_modify_invalid_status:
            "This subscription can not be modified because of the status: {{status}}. Only subscriptions with status {{usable_when}} can be {{action}}.",
        no_modify_deleted_related_objects:
            "This subscription can not be modified because it contains references to other systems (e.g. IMS) that are deleted.",
        not_in_sync:
            "This subscription can not be modified because it is not in sync. This means there is some error in the registration of the subscription or that it is being modified by another workflow.",
        relations_not_in_sync:
            "This subscription can not be modified because some related subscriptions are not insync. Locked subscriptions: {{locked_relations}}",
        selectSubscriptionPlaceholder: "Search and select a subscription...",
        namedSelectSubscriptionPlaceholder: "Select a subscription from {{name}}",
        start: "Start process",
        actions: "Actions",
    },
    terminate_subscription: {
        cancel: "Cancel",
        submit: "Terminate",
        subscription_depends_on: "Depends on subscriptions - ports used in {{product}}",
    },
    clipboard: {
        copied: "Copied!",
        copy: "Copy to clipboard",
    },
    tickets: {
        create: {
            new_ticket: "New Service Ticket",
            create: "Create new Service ticket",
            type: "Service ticket type",
            types: {
                planned: "Planned work ticket",
                incident: "Incident ticket",
            },
            jira_ticket: "Jira ticket",
            ims_pw_ticket: "IMS PW ticket",
            back: "Back",
            cancel: "Cancel",
            continue: "Continue",
            submit: "Submit",
            refresh: "Refresh",
            start_time: "Start time",
            end_time: "End time",
            jira: "Jira",
            ims: "IMS",
        },
        filters: {
            state: "Select process states",
        },
        table: {
            jira_ticket_id: "Jira ticket",
            subject: "Subject",
            title: "Title",
            ticket_state: "Ticket State",
            process_state: "Process State",
            opened_by: "Opened by",
            plandate: "Plandate",
            start_date: "Start Date",
        },
    },
    metadata: {
        tabs: {
            products: "Products",
            product_blocks: "Product Blocks",
            resource_types: "Resource Types",
            fixed_inputs: "Fixed Inputs",
            workflows: "Workflows",
        },
        deleteConfirmation: "Are you sure you want to delete {{type}} {{name}}?",
        flash: {
            updated: "{{type}} {{name}} successfully updated",
            created: "{{type}} {{name}} successfully created.",
            delete: "{{type}} {{name}} successfully deleted.",
        },
        ipBlocks: {
            id: "id",
            prefix: "prefix",
            description: "description",
            state: "state",
            state_repr: "status",
            version: "version",
        },
        products: {
            searchPlaceHolder: "Search for Products",
            new: "New Product",
            product_id: "ID",
            product_id_info: "The ID of this Product",
            name: "Name",
            name_info: "The name of this Product.",
            description: "Description",
            description_info: "Free formatted description of this Product",
            tag: "Tag",
            tag_info: "The Tag of this Product",
            product_type: "Type",
            product_type_info: "The Type of this Product",
            status: "Status",
            status_info: "The status of this Product. This is currently not used",
            create_subscription_workflow_key: "Create Workflow",
            create_subscription_workflow_key_info:
                "The unique reference to the workflow responsible for the creation of a subscription based on this product",
            modify_subscription_workflow_key: "Modify Workflows",
            modify_subscription_workflow_key_info:
                "The references to the workflows responsible for modifications of a subscription based on this product",
            terminate_subscription_workflow_key: "Terminate Workflow",
            terminate_subscription_workflow_key_info:
                "The unique reference to the workflow responsible for the termination of a subscription based on this product",
            created_at: "Create Date",
            created_at_info: "The date this Product was created",
            end_date: "End Date",
            end_date_info: "The end date of this Product. This is currently not used",
            product_blocks: "Product Blocks",
            product_blocks_string: "Product Blocks",
            workflows_string: "Workflows",
            workflows: "Workflows",
            workflows_info: "Workflows related to this Product",
            product_blocks_info:
                "They define which values are stored on the subscriptions of the Products linked to the Product Block(s)",
            fixed_inputs: "Fixed Inputs",
            fixed_inputs_info:
                "These name / value pairs are used in the workflows for this Product" +
                ". Do not change this without syncing the code",
            fixed_inputs_name: "Name",
            fixed_inputs_value: "Value",
            add_fixed_input: "Add Fixed Input",
            duplicate_fixed_input_name: "Duplicate Fixed Input names are not allowed",
            actions: "",
            back: "Back to Products",
            view: "View",
            edit: "Edit",
            submit: "Submit",
            delete: "Delete",
            clone: "Clone",
            select_add_product_block: "Add a Product Block...",
            select_no_more_product_blocks: "No more Product Blocks to add",
            no_found: "No Products",
            duplicate_name: "This name is already taken. Product names need to be unique.",
            select_add_fixed_input: "Add a Fixed Input...",
            select_no_more_fixed_inputs: "No more Fixed Inputs to add",
        },
        productBlocks: {
            searchPlaceHolder: "Search for Product Blocks",
            new: "New Product Block",
            name: "Name",
            name_info:
                "The name of this Product Block. Note that this name is used in the workflow code. Do not change this without syncing the code",
            description: "Description",
            description_info: "Free formatted description of this Product Block",
            tag: "Tag",
            tag_info: "The Tag of this Product Block. This is currently not used",
            resource_types: "Resource Types",
            created_at: "Created",
            created_at_info: "The date this Product Block was created",
            end_date: "End Data",
            end_date_info: "The end data of this Product Block. This is currently not used",
            status: "Status",
            status_info: "The status of this Product Block. This is currently not used",
            actions: "",
            back: "Back to Product Blocks",
            view: "View",
            edit: "Edit",
            submit: "Submit",
            delete: "Delete",
            resourceTypes: "Resource Types",
            resourceTypes_info:
                "The Resource Types of this Product Block. They define which values are stored on the subscriptions of the Products linked to the Product Block(s)",
            select_add_resource_type: "Add a Resource Type...",
            select_no_more_resource_types: "No more Resource Types to add",
            no_found: "No Product Blocks",
            duplicate_name: "This name is already taken. Product Block names need to be unique",
        },
        resourceTypes: {
            searchPlaceHolder: "Search for Resource Types",
            new: "New Resource Type",
            resource_type: "Type",
            resource_type_info:
                "The type of this Resource Type. Note that this value is used in the workflow code. Do not change this without syncing the code",
            description: "Description",
            description_info: "Free formatted description of this Resource Type",
            actions: "",
            back: "Back to Resource Types",
            view: "View",
            edit: "Edit",
            delete: "Delete",
            no_found: "No Resource Types",
            duplicate_name: "This type is already taken. Resource Types types need to be unique",
            resource_type_id: "Resource type ID",
        },
        fixedInputs: {
            tags: "Fixed Inputs for Product tag: {{tag}}",
            inputs: "Fixed Inputs and values",
            description: "Description",
            name: "Name",
            fixedInput: "Fixed Input name",
            values: "Values",
            required: "Required",
        },
        workflows: {
            name: "Unique key",
            implementation: "Method name",
            description: "Description",
            target: "Target",
            product_tags_string: "Product tags",
            created_at: "Created",
            tag: "Product tag",
            searchPlaceHolder: "Search for workflows...",
            no_found: "No workflows found",
            explanation:
                "Workflows that are not the type SYSTEM - e.g. are not Tasks - and do not have a relation with any Product can never be run. These workflows are colored grey and should be subject for investigation.",
        },
        results: "{{type}} found: {{count}}",
    },
    tasks: {
        new: "New Task",
        deleteConfirmation: "Are you sure you want to delete {{name}} task?",
        abortConfirmation: "Are you sure you want to abort {{name}} task?",
        retryConfirmation: "Are you sure you want to retry {{name}} task?",
        runallConfirmation: "Are you sure you want to rerun all failed tasks?",
        flash: {
            delete: "Task {{name}} is deleted",
            abort: "Task {{name}} is aborted",
            retry: "Task {{name}} has been retried",
            runall: "All failed tasks retried",
            runallbulk: "Retried {{count}} failed task(s)",
            runallinprogress: "Already retrying failed tasks",
            runallfailed: "Not all failed tasks could be retried",
        },
        runall: "Rerun all",
    },
    task: {
        workflow: "Workflow",
        workflow_info: "Select a task workflow to run",
        cancel: "Cancel",
        submit: "Submit",
        format_error: "Required input / invalid format",
        userInput: "User input for step {{name}}",
        subscription_link_txt: "Show Subscription related by this task",
        new_task: "New task",
        flash: {
            create: "Created task for workflow {{name}} with pid {{pid}}",
            update: "Resumed task for workflow {{name}}",
        },
    },

    settings: {
        cache: {
            name: {
                ims: "IMS locations",
                crm: "CRM organisations, contacts and locations",
                api: "Workflow endpoints (combined caches)",
                all: "All caches",
            },
            remove: "Flush Settings",
            remove_info: "Select settings to flush",
            clear: "Flush",
            flushed: "Settings {{name}} was flushed",
        },
        status: {
            info: "Modify the engine settings",
            info_detail: "Stop or start workflows through this menu",
            options: {
                true: "Pause the engine",
                false: "Start the engine",
            },
            processes: "Running processes:",
            status: "Engine status:",
            engine: {
                running: "Engine is Running",
                pausing: "Engine is Pausing, unable to submit workflows",
                paused: "Engine is Paused, unable to submit workflows",
                restarted: "The engine has been restarted",
            },
        },
    },
    error_dialog: {
        title: "Unexpected error",
        body:
            "This is embarrassing; an unexpected error has occurred. It has been logged and reported. Please try again. Still doesn't work? Please click 'Help'.",
        ok: "Close",
    },
    not_found: {
        title: "404",
        description: "The requested page could not be found",
    },
    server_error: {
        title: "500",
        description:
            "An unexpected error occurred. It has been logged and reported. Please try again. Still doesn't" +
            " work? Get Help.",
    },
    not_allowed: {
        title: "403",
        description:
            "This page is restricted. You don't have access based on your group memberships and / or SAB roles",
    },
    confirmation_dialog: {
        title: "Please confirm",
        confirm: "Confirm",
        cancel: "Cancel",
        leavePage: "Do you really want to leave this page?",
        leavePageSub: "Changes that you made will not be saved.",
        stay: "Stay",
        leave: "Leave",
    },

    ims_changes: {
        circuit_changed:
            "In LP Circuit {{id}} {{description}} the old endpoint references has been replaced by the new endpoint reference",
        old_endpoint: "The old endpoint",
        new_endpoint: "The new endpoint",
    },
    external: {
        errors: {
            crm_unavailable: "CRM is unresponsive... {{type}} unavailable!!",
        },
    },
    table: {
        is_minimized: " (minimized)",
        preferences: {
            edit: "Edit table preferences",
            reset: "Reset table preferences to defaults",
            autorefresh: "Set autorefresh delay in milliseconds:",
            norefresh: "Autorefresh disabled",
            refresh: "Autorefresh for {{delay}}ms",
            hidden_columns: "Show/Hide columns:",
            show_paginator: "Show Paginator",
            hide_paginator: "Hide Paginator",
            minimize: "Minimize",
        },
        processes: {
            active: "Active Processes",
            completed: "Completed Processes",
            caption: "{{taskOrProcess}}{{statuses}}{{filters}}{{sorted}}.",
            with_status: " with status ",
            filtered_on: " and filtered on ",
            sorted_by: " and sorted by ",
        },
        subscriptions: {
            complete: "Active Subscriptions",
            provisioning: "Initial, Provisioning and Terminated Subscriptions",
            caption: "{{taskOrProcess}}{{statuses}}{{filters}}{{sorted}}.",
            with_status: " with status ",
            filtered_on: " and filtered on ",
            sorted_by: " and sorted by ",
        },
        tasks: "Tasks",
        expanded_row: {
            running: "Currently processing step `{{step}}`.",
            suspended: "Suspended and waiting for input at step `{{step}}`.",
            waiting: "Waiting on resolution for step `{{step}}`.",
            aborted: "Aborted on step `{{step}}`.",
            failed: "Process failed on step `{{step}}` with the following output.",
            api_unavailable: "The following failure could be caused by an unavailable API at step `{{step}}`.",
            inconsistent_data:
                "The following failure was caused by inconsistent data between the orchestrator and another system. This happened at step `{{step}}`. Manual intervention is required.",
            completed: "Completed",
            created: "Created",
        },
        no_results: "No results found.",
        filter_placeholder: {
            assignee: "assignee...",
            description: "description...",
            note: "notes...",
            status: "status...",
            customer: "customer name...",
            customer_id: "customer name...",
            abbrev: "customer abbreviation...",
            product: "product name...",
            tag: "product tag...",
            creator: "creator..",
            workflow: "workflow name...",
            subscriptions: "description...",
            target: "workflow target...",
            subscription_id: "id",
            insync: "yes or no",
        },
        filter_button: {
            on: "on",
            off: "off",
        },
    },
    process_statuses: {
        created: "Created",
        running: "Running",
        suspended: "Suspended",
        waiting: "Waiting",
        aborted: "Aborted",
        failed: "Failed",
        api_unavailable: "API unavailable",
        inconsistent_data: "Inconsistent data",
        completed: "Completed",
    },
    assignees: {
        CHANGES: "Changes",
        NOC: "NOC",
        KLANT_SUPPORT: "Klant Support",
        KLANTSUPPORT: "Klant Support",
        SYSTEM: "System",
    },
    unavailable: "Unavailable",
    unavailable_abbreviated: "N/A",
    favorites: {
        manage: "Manage favorites",
        edit: "Edit favorite",
        trash: "Trash favorite",
        select: "Select favorite",
        add: "Add favorite",
        remove: "Remove favorite",
        toomany: "You can only have 10 favorites. Please remove one before adding a new one.",
    },
};

export default I18n.translations.en;
