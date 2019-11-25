/*
 * Copyright 2019 SURF.
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

export const randomCrmIdentifier = () => ("0000" + Math.floor(Math.random() * 99999) + 1).slice(-5);

I18n.translations.en = {
    code: "EN",
    name: "English",
    select_locale: "Select English",
    EntityId: "",

    header: {
        title: "Orchestrator",
        links: {
            help: "Help",
            logout: "Logout",
            exit: "Exit"
        },
        role: "Role"
    },

    navigation: {
        processes: "Processes",
        validations: "Validations",
        subscriptions: "Subscriptions",
        metadata: "Metadata",
        tasks: "Tasks",
        prefixes: "LIR Prefixes",
        cache: "Cache",
        new_process: "New Process +"
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
            state: "State"
        },
        searchPlaceHolder: "Search for IP prefixes"
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
        confirm_migrate_sap: "Confirm the migration of the SAP",
        confirm_migrate_sap_info: "Use the info above to confirm the SAP you want to migrate",
        accept: {
            noc_remove_port_confirmation: "Are the port(s) of the subscription removed from the live network?",
            noc_remove_lichtpad_confirmation: "Is the LightPath of the subscription removed?",
            next_step_service_affecting: "Watch out! The next step is service impacting for the customer service",
            check_delete_sn7_service_config: "Delete the SURFnet7 IP service config from Alice and Bob.",
            check_deactivate_bgp_session:
                "Deactivate the BGP sessions (IPv4 & IPv6) of the SAP you are migrating (either on Alice or Bob).",
            check_port_patched_sn7_sn8: "Physically patch the customer port from SN7 to SN8 HW.",
            confirm_migrate_sap: "Confirm the migration of the SAP",
            confirm_migrate_sap_info: "Use the info above to confirm the SAP you want to migrate",
            skip_migrate_sap_workflow:
                "do not continue with the migration and return to the original state, this will end the workflow without making any changes",
            check_sn7_port_terminated: "Terminate SN7 SSP/MSP",
            check_removed_ism_config: "Remove ISM configuration (when applicable remove SN7 node)",
            check_removed_sn7_service_and_tunnel: "Remove SN7 service & tunnel from ISM",
            check_removed_sn7_node_config: "Remove SN7 service config Alice and Bob",
            notify_run_remaining_sap_migrates:
                'If applicable, repeat the "Migrate one SAP" workflow for the other remaining SAPs',
            check_terminate_sn7_subscription:
                "Do not forget to run a terminate workflow for the empty SN7 subscription",
            noc_subtask_confirmation: "Are all subtasks executed correctly?",
            noc_subtask_confirmation_info: "Please check the requirements below:",
            check_service_built: "The new service has been built on the network",
            check_iface_no_errors: "The interface does not give any errors",
            check_cfm_up: "The CFM is up",
            check_ims_defined: "The new path for service has been put in IMS",
            check_ims_circuit: "{{circuit_name}}",
            check_client_confirmed: "The client has confirmed that the new LP is in use (not mandatory)",
            noc_modification_confirmation: "NOC confirms modification of service",
            noc_modification_confirmation_info:
                "Confirm that the modifications are implemented in the network as specified.",
            noc_modification_confirmation_template:
                "Confirm modification of service with NMS service id {{nms_service_id}} from {{human_service_speed}} to {{new_human_service_speed}}",
            noc_network_confirmation: "Confirmation",
            noc_network_confirmation_info: "Confirm implementation of changes in the network",
            noc_upgrade_redundant_confirmation_intro:
                "Follow this link for all details on the new redundant LightPath: ",
            noc_upgrade_redundant_confirmation_steps_intro: "Please execute the following steps:",
            noc_upgrade_redundant_confirmation_LR2_built_info: "LR2 has been built in the network",
            noc_upgrade_redundant_confirmation_LPE_renamed_info: "LPE has been renamed in the network"
        },
        asn_info: "Asn of the customer",
        workflow: "Process instance of workflow {{name}}",
        corelink_interface_type: "Corelink interface type",
        corelink_interface_type_info:
            "Select an interface-type/speed for the first 2 link members of this corelink aggregate",
        cancel: "Cancel",
        submit: "Submit",
        next: "Next",
        previous: "Previous",
        notFound: "No Process found (e.g. 404)",
        format_error: "Required input / invalid format",
        uniquenessViolation: "Value selected more than once",
        userInput: "User input for step {{name}} for product {{product}}",
        tabs: {
            user_input: "User input",
            process: "process"
        },
        port_id: "Port",
        port_id_info: "Select a port",
        port_id_1: "Port",
        port_id_1_info: "Select a port",
        port_id_2: "Second port",
        port_id_2_info: "Select a port",
        port_id_redundant: "Redundant port",
        port_id_redundant_info: "Select a port",
        internetpinnen_prefix_subscriptions: "Internet pinnen prefix",
        internetpinnen_prefix_subscriptions_info: "Please select an Internet pinnen prefix. Leave blank to disable",
        input_fields_have_validation_errors: "input field(s) have validation errors",
        product: "Product",
        product_info: "Search and select the product",
        organisation: "Customer",
        organisation_info: "Search and select the customer for the product",
        lightpath_msp: "The MSP in this LP",
        lightpath_ssp: "The SSP in this LP",
        lightpath_msp_1: "The first MSP in this LP",
        lightpath_ssp_1: "The first SSP in this LP",
        lightpath_msp_2: "The second MSP in this LP",
        lightpath_ssp_2: "The second SSP in this LP",
        first_lightpath: "Primary LP",
        second_lightpath: "Secondary LP",
        first_msp: "The first port in this redundant MSP",
        second_msp: "The second port in this redundant MSP",
        first_service_port: "The first {{product_tag}} in this redundant {{product_tag}}",
        second_service_port: "The second {{product_tag}} in this redundant {{product_tag}}",
        source: "MSP left",
        source_info: "The left MSP in the lightpath",
        source_vlan: "Port VLAN left ",
        source_vlan_info:
            "VLAN range - must be a range of valid [2-4094] VLAN integers, for example '2, 5-6, 1048-1052'",
        destination: "MSP right",
        destination_info: "The right MSP in the lightpath",
        destination_vlan: "Port VLAN Right",
        destination_vlan_info:
            "VLAN range - must be a range of valid [2-4094] VLAN integers, for example '2, 5-6, 1048-1052'",
        source_1: "First Lightpath: MSP left",
        source_1_info: "The left MSP in the first lightpath",
        source_vlan_1: "First Lightpath: Port VLAN Left",
        source_vlan_1_info:
            "VLAN range - must be a range of valid [2-4094] VLAN integers, for example '2, 5-6, 1048-1052'",
        destination_1: "First Lightpath: MSP right",
        destination_1_info: "The right MSP in the first lightpath",
        destination_vlan_1: "First Lightpath: VLAN Port Right",
        destination_vlan_1_info:
            "VLAN range - must be a range of valid [2-4094] VLAN integers, for example '2, 5-6, 1048-1052'",
        source_2: "Second Lightpath: MSP left",
        source_2_info: "The left MSP in the second lightpath",
        source_vlan_2: "Second Lightpath: VLAN Port Left",
        source_vlan_2_info:
            "VLAN range - must be a range of valid [2-4094] VLAN integers, for example '2, 5-6, 1048-1052'",
        destination_2: "Second Lightpath: MSP right",
        destination_2_info: "The right MSP in the second lightpath",
        destination_vlan_2: "Second Lightpath: VLAN Port Right",
        destination_vlan_2_info:
            "VLAN range - must be a range of valid [2-4094] VLAN integers, for example '2, 5-6, 1048-1052'",
        capacity: "Capacity",
        capacity_info: "The capacity / speed of the lightpath in megabit per second",
        contact_persons: "Customer contact persons",
        contact_persons_info:
            "The persons to notify when the process is finished. You can add multiple emails, names and phone numbers",
        customer_ipv4_mtu: "IPv4 MTU",
        customer_ipv4_mtu_info:
            "Customer MTU for IPv4 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
        customer_ipv6_mtu: "IPv6 MTU",
        customer_ipv6_mtu_info:
            "Customer MTU for IPv6 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
        vlan_range: "VLAN Range",
        vlan_range_info: "VLAN Range for the Tagged SP in this subscription",
        service_port: {
            location_code: "Location code",
            location_code_info: "Provide a valid location code",
            crm_port_id: "The CRM identifier for a port",
            crm_port_id_info: "Provide a valid, 5 digit, CRM Port ID (Surfnet7), for example {{example}}",
            ieee_interface_type: "IEEE interface type",
            ieee_interface_type_info: "Choose an IEEE interface type"
        },
        service_port_redundant: {
            location_code: "Location code",
            location_code_info: "Provide a valid location code",
            crm_port_id: "The CRM identifier for a port",
            crm_port_id_info: "Provide a valid, 5 digit, CRM Port ID (Surfnet7), for example {{example}}",
            ieee_interface_type: "IEEE interface type",
            ieee_interface_type_info: "Choose an IEEE interface type"
        },
        msp: {
            location_code: "Location code",
            location_code_info: "Provide a valid location code",
            crm_port_id: "The CRM identifier for a port",
            crm_port_id_info: "Provide a valid, 5 digit, CRM Port ID (Surfnet7), for example {{example}}",
            ieee_interface_type: "IEEE interface type",
            ieee_interface_type_info: "Choose an IEEE interface type"
        },
        ims_info_msp: {
            device_port_name: "Device port name",
            device_port_name_info: "Port name to configure on the physical device"
        },
        ims_info: {
            device_port_name: "Device port name",
            device_port_name_info: "Port name to configure on the physical device"
        },
        msp_1: {
            location_code: "First MSP location code",
            location_code_info: "Provide a valid location code",
            crm_port_id: "First MSP the CRM identifier for a port",
            crm_port_id_info: "Provide a valid, 5 digit, CRM Port ID (Surfnet7), for example {{example}}",
            ieee_interface_type: "First MSP IEEE interface type",
            ieee_interface_type_info: "Choose an IEEE interface type",
            device_port_name: "Device port name",
            device_port_name_info: "Port name to configure on the physical device"
        },
        ims_info_msp_1: {
            device_port_name: "Device port name",
            device_port_name_info: "Port name to configure on the physical device"
        },
        msp_2: {
            location_code: "Second MSP location code",
            location_code_info: "Provide a valid location code",
            crm_port_id: "Second MSP the CRM identifier for a port",
            crm_port_id_info: "Provide a valid, 5 digit, CRM Port ID (Surfnet7), for example {{example}}",
            ieee_interface_type: "Second MSP IEEE interface type",
            ieee_interface_type_info: "Choose an IEEE interface type",
            device_port_name: "Second device port name",
            device_port_name_info: "Port name to configure on the physical device"
        },
        ims_info_msp_2: {
            device_port_name: "Second device port name",
            device_port_name_info: "Port name to configure on the physical device"
        },
        crm_port_id_2: "Second MSP the CRM identifier for a port",
        crm_port_id_2_info: "Provide a valid, 5 digit, CRM Port ID (Surfnet7), for example {{example}}",
        ims_id: "IMS identifier",
        ims_id_info: "The IMS identifier stored in the IMS database",
        ieee_interface_type_select: "First select a product type...",
        ims_port_id: "IMS port id",
        ims_port_id_info: "The IMS port id",
        ip_prefix: "Select a free subnet",
        ip_prefix_info: "In the next step you can allocate any prefix under the subnet you select here",
        isis_metric: "IS-IS metric",
        isis_metric_info: "Enter the desired IS-IS metric for this corelink",
        new_product: "The new Product",
        new_product_info: "Please select the product with the new speed",
        new_interface_type: "The new interface type of the port",
        new_interface_type_info: "Please select the new interface type of the port",
        nms_service_id: "NMS service id",
        nms_service_id_info: "The id of the service on the network (0000-9999)",
        nms_service_id_1: "NMS service id of the first lightpath",
        nms_service_id_1_info: "The id of the service on the network (0000-9999)",
        nms_service_id_2: "NMS service id of the second lightpath",
        nms_service_id_2_info: "The id of the service on the network (0000-9999)",
        noc_customer_confirmation: "The customer has confirmed the successful delivery of the service",
        noc_customer_confirmation_info: "Has the customer confirmed that the service was successfully delivered?",
        noc_remove_static_ip_confirmation: "Confirm removal",
        noc_remove_static_ip_confirmation_info: "Is this Static IP service removed from the network?",
        noc_remove_bgp_confirmation: "Confirm removal",
        noc_remove_bgp_confirmation_info: "Is this BGP IP service removed from the network?",
        noc_downgrade_lichtpad_confirmation: "Confirmation of the downgrade of the redundant LightPath",
        noc_downgrade_lichtpad_confirmation_info: "Is the redundant LightPath downgraded to a non-redundant LightPath?",
        noc_confirmation: "Confirmed",
        bandwidth: "Bandwidth",
        bandwidth_info: "Desired bandwidth in Mbit/s",
        current_bandwidth: "Bandwidth",
        current_bandwidth_info: "Current bandwidth in Mbit/s",
        new_bandwidth: "New bandwidth",
        new_bandwidth_info: "New bandwidth in Mbit/s",
        new_process: "Create new process / subscription",
        configuration_ready: "Configuration ready",
        configuration_ready_info: "All of the work entailed is successfully configured",
        network_changes_ready: "NMS changes ready",
        network_changes_ready_info:
            "All of the work entailed with regards to the changed LightPaths is successfully done in NMS. If IMS needs updating this will happen after this step",
        extra_information: "Extra information",
        extra_information_info: "Additional information to add to the subscription description and IPAM description",
        ims_changes: "Updated in IMS",
        ims_changes_info: "The following changes to LP circuits has been made in the IMS database",
        nms_service_updated: "NMS Service has been updated",
        nms_service_updated_info: "Confirmation that the NMS Service on the physical network has been updated",
        cleanup_ready: "Cleanup ready",
        product_validation: "Product / Workflow validation",
        flash: {
            create: "Created process for workflow {{name}}",
            update: "Resumed process for workflow {{name}}"
        },
        split_prefix: "Split IP Prefix",
        split_prefix_info: "Select the subnet from all subnets of the given prefix length",
        subscription: "Subscription",
        subscription_info: "Subscription GUID",
        subscription_id: "Subscription",
        subscription_id_info: "The subscription for this action",
        subscription_link: "Subscription",
        subscription_link_txt: "Show Subscription related by this {{target}} Process",
        surfcert_filter: "SURFcert filter",
        surfcert_filter_info: "Type of SURFcert filter",
        old_service_port: "Service Port",
        old_service_port_info: "Choose Service Ports to change",
        service_ports: "Service Ports",
        service_ports_info: "Choose Service Ports",
        service_ports_input: "Service Ports",
        service_ports_input_info: "Choose Service Ports",
        service_ports_primary: "Service Ports",
        service_ports_primary_info: "The A1 and B1 side",
        service_ports_secondary: "Service Ports",
        service_ports_secondary_info: "The A2 and B2 side",
        sn7_migrating_service_port: "SURFnet7 SAP",
        sn7_migrating_service_port_info: "SN7 service port to be migrated",
        sn8_migrating_service_port: "SURFnet8 SAP",
        sn8_migrating_service_port_info: "SN8 service port to be migrated to",
        elan_service_ports: "ELAN Service Ports",
        elan_service_ports_info:
            "All off the Service Ports that will be connected to each other in this E-LAN virtual private network - minimum is 2",
        bgp_ip_service_ports: "IP Service Ports",
        bgp_ip_service_ports_info:
            "The Service Port(s) used at customer side for IP service using BGP. The ports that remain on this page will be posted towards NSO",
        ip_static_service_port: "IP Service Port",
        ip_static_service_port_info: "The Service Port used at customer side for IP service using static routing",
        sn8_ip_static_service_port: "SURFnet8 SAP",
        sn8_ip_static_service_port_info: "SN8 service port to be migrated to",
        nsi_isalias: "NSI isAlias",
        nsi_isalias_info: "",
        subscription_id1: "Subscription",
        subscription_id1_info: "The first subscription to use",
        subscription_id2: "Subscription",
        subscription_id2_info: "The second subscription to use",
        new_subscription_id: "Subscription ID of the new subscription",
        new_subscription_id_info:
            "Enter the subscription ID of the SN8 (active or provisioning) subscription as a destination for the migration",
        downgrade_redundant_lp_choice: "Redundant LP Subscription",
        downgrade_redundant_lp_choice_info:
            "Choose one of the Lightpaths of the redundant Lightpath to be de-activated",
        ticket_id: "Jira ticket ID",
        ticket_id_info: "The JIRA ticket ID that will be used/mentioned in the confirmation mail",
        transition_product_downgrade: "Choose New Product",
        transition_product_downgrade_info:
            "Choose the new Product for this subscription after the downgrade (scoped by the current product)",
        transition_product_upgrade: "Choose New Product",
        transition_product_upgrade_info:
            "Choose the new Product for this subscription after the upgrade (scoped by the current product)",
        transition_product: "Choose New Product for this Subscription",
        transition_product_info:
            "Choose a new product - scoped on the maximum capacity of the LP's using this port - with a new speed.",
        transition_product_speed: "Choose New Product",
        transition_product_speed_info:
            "Choose a new product - scoped on the maximum capacity of the current ports - with a new speed.",
        workflowsPlaceholder: "Search and select a workflow...",
        workflowsEmptyPlaceholder: "First select a subscription...",
        modify_subscription: "Modify existing subscription",
        terminate_subscription: "Terminate existing subscription",
        workflowSelect: "Modify workflow",
        internetpinnen: "Internetpinnen",
        asn: "Autonomous System Number",
        multicast: "Multicast",
        ip_prefix_subscriptions: "IP prefix subscriptions",
        ip_prefix_subscriptions_info: "Specify one or more IP prefix subscriptions reserved for this customer.",
        location_code: "Location code",
        location_code_info: "Provide a valid location code",
        ims_node_id: "Choose a node from IMS",
        ims_node_id_info: "Choose a node that has state PLANNED or READY FOR SERVICE in IMS",
        confirm_corelink: "When you submit this from the Corelink will be deployed",
        confirm_corelink_info:
            "Please design the physical layer of the Corelink in IMS. When you are done, please submit the form.",
        confirm_corelink_working: "Is the Corelink working?",
        confirm_corelink_working_info: "Please confirm that the corelink is working correctly",
        corelink_service_speed: "Please choose the corelink speed",
        corelink_service_speed_info: "This will restrict the interface choices to the correct values",
        plan_dont_allocate: "Set state to planned",
        plan_dont_allocate_info: "Register this prefix as planned, but do not allocate yet",
        ims_port_id_1: "First node and port",
        ims_port_id_1_info: "Choose a node and port that you want to use to create the first corelink",
        ims_port_id_2: "Second node and port",
        ims_port_id_2_info: "Choose a node and port that you want to use to create the second corelink",
        port_mode: "Port Mode",
        port_mode_info: "The port mode of the new service port",
        auto_negotiation_info:
            "The Auto Negotiation setting for NSO is available only for 1G service ports in tagged/untagged mode",
        auto_negotiation: "Auto Negotiation",
        old_subscription_label: "Old Subscription",
        old_subscription_label_info: "The old subscription in this workflow",
        sap1: {
            label: "Service Attach Point settings for first selected port",
            service_port: "First selected Port",
            service_port_info: "Settings will apply to the following port",
            bgp_session_priority: "BGP Session Priority",
            bgp_session_priority_info: "Border Gateway Protocol local preference.",
            bgp_export_policy: "BGP Export Policy",
            bgp_export_policy_info: "Border Gateway Protocol routing table option.",
            bgp_password: "BGP Password",
            bgp_password_info: "Password used to secure BGP session, leave empty for an auto generated password.",
            bgp_hash_algorithm: "BGP Hash Algorithm",
            bgp_hash_algorithm_info: "BGP hash encryption algorithm, select 'no' to disable this BGP security feature.",
            customer_ipv4_mtu: "IPv4 MTU",
            customer_ipv4_mtu_info:
                "Customer MTU for IPv4 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            customer_ipv6_mtu: "IPv6 MTU",
            customer_ipv6_mtu_info:
                "Customer MTU for IPv6 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            bfd: "BFD",
            bfd_info: "Bidirectional Forwarding Detection",
            ipv4_prefixlen: "IPv4 Prefix length",
            ipv4_prefixlen_info: "Set to /30 only if customer equipment does not support /31.",
            ip_prefix_subscriptions: "IP Prefix subscriptions",
            ip_prefix_subscriptions_info: "Which IP prefix subscriptions should be announced at this port?"
        },
        sap2: {
            label: "Service Attach Point settings for second selected port",
            service_port: "Second selected port",
            service_port_info: "Settings will apply to the following port",
            bgp_session_priority: "BGP Session Priority",
            bgp_session_priority_info: "Border Gateway Protocol local preference.",
            bgp_export_policy: "BGP Export Policy",
            bgp_export_policy_info: "Border Gateway Protocol routing table option.",
            bgp_password: "BGP Password",
            bgp_password_info: "Password used to secure BGP session, leave empty for an auto generated password.",
            bgp_hash_algorithm: "BGP Hash Algorithm",
            bgp_hash_algorithm_info: "BGP hash encryption algorithm, select 'no' to disable this BGP security feature.",
            customer_ipv4_mtu: "IPv4 MTU",
            customer_ipv4_mtu_info:
                "Customer MTU for IPv4 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            customer_ipv6_mtu: "IPv6 MTU",
            customer_ipv6_mtu_info:
                "Customer MTU for IPv6 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            bfd: "BFD",
            bfd_info: "Bidirectional Forwarding Detection",
            ipv4_prefixlen: "IPv4 Prefix length",
            ipv4_prefixlen_info: "Set to /30 only if customer equipment does not support /31.",
            ip_prefix_subscriptions: "IP Prefix subscriptions",
            ip_prefix_subscriptions_info: "Which IP prefix subscriptions should be announced at this port?"
        },
        sap3: {
            label: "Service Attach Point settings for third selected port",
            service_port: "Third selected Port",
            service_port_info: "Settings will apply to the following port",
            bgp_session_priority: "BGP Session Priority",
            bgp_session_priority_info: "Border Gateway Protocol local preference.",
            bgp_export_policy: "BGP Export Policy",
            bgp_export_policy_info: "Border Gateway Protocol routing table option.",
            bgp_password: "BGP Password",
            bgp_password_info: "Password used to secure BGP session, leave empty for an auto generated password.",
            bgp_hash_algorithm: "BGP Hash Algorithm",
            bgp_hash_algorithm_info: "BGP hash encryption algorithm, select 'no' to disable this BGP security feature.",
            customer_ipv4_mtu: "IPv4 MTU",
            customer_ipv4_mtu_info:
                "Customer MTU for IPv4 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            customer_ipv6_mtu: "IPv6 MTU",
            customer_ipv6_mtu_info:
                "Customer MTU for IPv6 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            bfd: "BFD",
            bfd_info: "Bidirectional Forwarding Detection",
            ipv4_prefixlen: "IPv4 Prefix length",
            ipv4_prefixlen_info: "Set to /30 only if customer equipment does not support /31.",
            ip_prefix_subscriptions: "IP Prefix subscriptions",
            ip_prefix_subscriptions_info: "Which IP prefix subscriptions should be announced at this port?"
        },
        sap4: {
            label: "Service Attach Point settings for fourth selected port",
            service_port: "Fourth selected Port",
            service_port_info: "Settings will apply to the following port",
            bgp_session_priority: "BGP Session Priority",
            bgp_session_priority_info: "Border Gateway Protocol local preference.",
            bgp_export_policy: "BGP Export Policy",
            bgp_export_policy_info: "Border Gateway Protocol routing table option.",
            bgp_password: "BGP Password",
            bgp_password_info: "Password used to secure BGP session, leave empty for an auto generated password.",
            bgp_hash_algorithm: "BGP Hash Algorithm",
            bgp_hash_algorithm_info: "BGP hash encryption algorithm, select 'no' to disable this BGP security feature.",
            customer_ipv4_mtu: "IPv4 MTU",
            customer_ipv4_mtu_info:
                "Customer MTU for IPv4 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            customer_ipv6_mtu: "IPv6 MTU",
            customer_ipv6_mtu_info:
                "Customer MTU for IPv6 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            bfd: "BFD",
            bfd_info: "Bidirectional Forwarding Detection",
            ipv4_prefixlen: "IPv4 Prefix length",
            ipv4_prefixlen_info: "Set to /30 only if customer equipment does not support /31.",
            ip_prefix_subscriptions: "IP Prefix subscriptions",
            ip_prefix_subscriptions_info: "Which IP prefix subscriptions should be announced at this port?"
        },
        sap5: {
            label: "Service Attach Point settings for fifth selected port",
            service_port: "Fifth selected Port",
            service_port_info: "Settings will apply to the following port",
            bgp_session_priority: "BGP Session Priority",
            bgp_session_priority_info: "Border Gateway Protocol local preference.",
            bgp_export_policy: "BGP Export Policy",
            bgp_export_policy_info: "Border Gateway Protocol routing table option.",
            bgp_password: "BGP Password",
            bgp_password_info: "Password used to secure BGP session, leave empty for an auto generated password.",
            bgp_hash_algorithm: "BGP Hash Algorithm",
            bgp_hash_algorithm_info: "BGP hash encryption algorithm, select 'no' to disable this BGP security feature.",
            customer_ipv4_mtu: "IPv4 MTU",
            customer_ipv4_mtu_info:
                "Customer MTU for IPv4 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            customer_ipv6_mtu: "IPv6 MTU",
            customer_ipv6_mtu_info:
                "Customer MTU for IPv6 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            bfd: "BFD",
            bfd_info: "Bidirectional Forwarding Detection",
            ipv4_prefixlen: "IPv4 Prefix length",
            ipv4_prefixlen_info: "Set to /30 only if customer equipment does not support /31.",
            ip_prefix_subscriptions: "IP Prefix subscriptions",
            ip_prefix_subscriptions_info: "Which IP prefix subscriptions should be announced at this port?"
        },
        sap6: {
            label: "Service Attach Point settings for sixth selected port",
            service_port: "Sixth selected Port",
            service_port_info: "Settings will apply to the following port",
            bgp_session_priority: "BGP Session Priority",
            bgp_session_priority_info: "Border Gateway Protocol local preference.",
            bgp_export_policy: "BGP Export Policy",
            bgp_export_policy_info: "Border Gateway Protocol routing table option.",
            bgp_password: "BGP Password",
            bgp_password_info: "Password used to secure BGP session, leave empty for an auto generated password.",
            bgp_hash_algorithm: "BGP Hash Algorithm",
            bgp_hash_algorithm_info: "BGP hash encryption algorithm, select 'no' to disable this BGP security feature.",
            customer_ipv4_mtu: "IPv4 MTU",
            customer_ipv4_mtu_info:
                "Customer MTU for IPv4 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            customer_ipv6_mtu: "IPv6 MTU",
            customer_ipv6_mtu_info:
                "Customer MTU for IPv6 traffic (Must be 1500 or 9000 unless explicitly otherwise specified by customer)",
            bfd: "BFD",
            bfd_info: "Bidirectional Forwarding Detection",
            ipv4_prefixlen: "IPv4 Prefix length",
            ipv4_prefixlen_info: "Set to /30 only if customer equipment does not support /31.",
            ip_prefix_subscriptions: "IP Prefix subscriptions",
            ip_prefix_subscriptions_info: "Which IP prefix subscriptions should be announced at this port?"
        },
        selected_sap: "Select a Service Attach Point",
        selected_sap_info: "Choose the SAP you want to migrate",
        bgp_ip_internetpinnen_prefix_subscriptions: "Internetpinnen prefixes",
        bgp_ip_internetpinnen_prefix_subscriptions_info: "IP Prefix(es) reserved for internetpinnen.",
        old_isis_metric: "Current",
        old_isis_metric_info: "Current value for the ISIS metric of this Corelink subscription",
        new_isis_metric: "Desired",
        new_isis_metric_info: "New desired value for the ISIS metric of this Corelink subscription",
        ipv4_prefixlen: "IPv4 Prefix length",
        ipv4_prefixlen_info: "Set to /30 only if customer equipment does not support /31.",
        service_speed: "Bandbreedte",
        service_speed_info:
            "Bandbreedte in MBit/sec. N.B.: Mag niet groter zijn dan de kleinste bandbreedte van de onderliggende poort of poorten",

        confirm_migrate_sap_customer: "Confirm SAP is migrated ok",
        confirm_migrate_sap_customer_info: "Customer has confirmed that the SAP is migrated and working",
        sap_migration_summary: "Summary of SAP migration changes",
        sap_migration_summary_info: "Please check the summary for any inconsistencies in the port that will be removed",
        to_internet: "TO_INTERNET",
        customer_aggregate: "CUSTOMER_AGGREGATE",
        sap_summary_sn7: "Summary of available SN7 SAP's",
        sap_summary_sn7_info: "All available SN7 SAP's, of the subscription you're migrating, with port details",
        speed_policer: "Speed policer",
        remote_port_shutdown: "Remote port shutdown",
        link_member_port: "Link Member",
        link_member_port_info: "Choose a Service Port - only link_member ports for the selected organisation are shown",
        added_service_ports: "Add ports",
        added_service_ports_info: "Select some ports to add them to this subscription",
        removed_service_ports: "Remove ports",
        removed_service_ports_info: "Select some ports to remove them from this subscription"
    },
    process_state: {
        copy: "Copy to clipboard",
        copied: "Copied",
        raw: "Show raw JSON",
        details: "Show details",
        stateChanges: "Show state input",
        traceback: "Show traceback",
        wording: "Process {{product}} of workflow {{workflow}} for {{customer}}",
        summary: {
            status: "Status",
            assignee: "Assignee",
            step: "Current step",
            started: "Started",
            last_modified: "Last updated"
        }
    },
    task_state: {
        copy: "Copy to clipboard",
        copied: "Copied",
        raw: "Show raw JSON",
        details: "Show details",
        stateChanges: "Show state input",
        wording: "Task of workflow {{workflow}}",
        summary: {
            last_status: "Status",
            created_by: "Created by",
            last_step: "Current step",
            started_at: "Started",
            last_modified_at: "Last modified"
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
            productWorkflows: "Product ⟺ Workflows"
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
                missing_configuration: "FixedInput for product is not configured"
            }
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
            workflowsWithRecords: "All implementations of workflows in the code have a corresponding database record"
        }
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
        IPS: "IP Static",
        IPBGP: "IP BGP",
        IP_PREFIX: "IP Prefix",
        IPAS: "IPAS",
        Node: "Node",
        Corelink: "Corelink",
        LP: "LP",
        MSP1G: "MSP1G",
        MSP10G: "MSP10G",
        MSP40G: "MSP40G",
        MSP100G: "MSP100G",
        PLP50M: "PLP50M",
        RMSP1G: "RMSP1G",
        SSP1G: "SSP1G",
        SSP10G: "SSP10G",
        LightPath: "Light-paths",
        ELAN: "E-LAN Light-paths",
        Port: "Port",
        MSP: "MSP",
        SSP: "SSP",
        LPNLNSI: "NSI Light-paths",
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
        SPNL: "N8 Service Port"
    },
    subscriptions: {
        customer_name: "Customer",
        customer_id: "Customer UUID",
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
        name: "Name",
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
            delete: "Subscription {{name}} was deleted"
        },
        fetchingRelatedSubscriptions: "Please wait until we have loaded related subscriptions",
        noRelatedSubscriptions:
            "Standalone subscription: there are no subscriptions connected to the {{description}} subscription.",
        relatedSubscriptionsLP: "The ports used in the {{description}} subscription:",
        relatedSubscriptionsServicePort: "The light-paths using the {{description}} subscription:",
        terminatedWarning: "The info below may be outdated as the subscription they belong to is terminated!"
    },
    subscription: {
        acquiring_insync_info_about_relations: "Acquiring 'insync' info of related subscriptions...",
        notFound: "No Subscription found (e.g. 404)",
        subscription: "Subscription",
        child_subscriptions: "Child Subscriptions related to {{product}}",
        parent_subscriptions: "Parent Subscriptions related to {{product}}",
        resource_types: "Subscription Instance Values",
        resource_types_info: "The resource types of the associated product block(s) of this subscription",
        product_title: "Product",
        process_link: "Processes",
        notFoundRelatedObjects: "Subscription resource references NOT found / deleted",
        process_link_text: "Show related {{target}} process for this subscription",
        no_process_link_text: "This subscription has NOT been created by a workflow or the Process has been deleted.",
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
        process: {
            target: "Target",
            name: "Name",
            id: "Id",
            started_at: "Started at",
            status: "Status",
            modified_at: "Modified at"
        },
        ims_service: {
            id: "IMS service ID ({{index}})",
            identifier: "IMS service ID",
            customer: "Customer",
            extra_info: "Extra info",
            name: "Name",
            product: "Product",
            speed: "Speed",
            status: "Status",
            order_id: "Order ID",
            aliases: "Aliases",
            endpoints: "Endpoints"
        },
        ims_port: {
            connector_type: "Connector type",
            fiber_type: "Fiber type",
            id: "IMS Port ID {{id}}",
            iface_type: "Interface type",
            line_name: "Line name",
            location: "Location",
            node: "Node",
            patchposition: "Patch position",
            port: "Port",
            status: "Status"
        },
        fetchingImsData: "Please wait until we have loaded all IMS information...",
        terminate: "Terminate Subscription",
        terminateConfirmation: "Are you sure you want to terminate {{name}} subscription for {{customer}}?",
        no_modify_parent_subscription:
            "This subscription can not be {{action}} as it is used in other subscriptions: {{unterminated_parents}}",
        no_termination_workflow:
            "This subscription can not be terminated as the product has no termination workflow-key.",
        modifyConfirmation:
            "Are you sure you want to {{change}} of {{name}} subscription for {{customer}}. This will start a new modify process immediately!",
        no_modify_workflow: "This subscription can not be modified as the product has no modify workflow-key.",
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
        node_terminate_warning: "Node terminate warning",
        node_terminate_warning_info:
            "When you terminate the subscription you have to manually set the node to PLANNED again in IMS before you can re-run the node create workflow"
    },
    terminate_subscription: {
        cancel: "Cancel",
        submit: "Terminate",
        subscription_childs: "Child subscriptions - ports used in {{product}}"
    },
    contact_persons: {
        email: "Email",
        name: "Name",
        phone: "Phone number",
        invalid_email: "Invalid email",
        namePlaceholder: "Search and add contact persons..."
    },
    vlan: {
        vlansInUseError: "VLAN range {{vlans}} are already in use for the selected service port",
        vlansInUse: "Already used VLAN ranges for this service port: {{vlans}}",
        missingInIms: "This service port can not be found in IMS. It may be deleted or in an initial state.",
        allPortsAvailable: "This service port has no VLANs in use (yet).",
        placeholder: "Enter a valid VLAN range...",
        placeholder_no_service_port: "First select a Service Port...",
        invalid_vlan: "Invalid VLAN - must be a range of valid [2-4094] VLAN integers, for example '2, 5-6, 1048-1052'",
        untaggedPortInUse: "This service port is already in use and cannot be chosen",
        taggedOnly: "VLAN is only relevant for SN7 MSP or SN8 SP in tagged mode, not for link_member or untagged ports."
    },
    generic_multi_select: {
        placeholder: "Select an item",
        placeholder_no_items: "No items available"
    },
    clipboard: {
        copied: "Copied!",
        copy: "Copy to clipboard"
    },
    downgrade_redundant_lp: {
        choice: "Which lightpath should be removed from this redundant LP?",
        choosen: "The lightpath that should be removed from this redundant LP",
        subscription_childs: "The ports in this redundant LP",
        primary: "Primary LP",
        secondary: "Secondary LP",
        ims_circuit_id: "IMS Circuit ID",
        ims_protection_circuit_id: "IMS Protection Circuit ID",
        description: "Description",
        connector_type: "Connector type",
        customer_name: "Customer name",
        location: "Location",
        node: "Node",
        patch_position: "Patch position",
        msp: "MSP",
        ssp: "SSP",
        redundant_lightpath: "redundant lichtpad"
    },
    metadata: {
        tabs: {
            products: "Products",
            product_blocks: "Product Blocks",
            resource_types: "Resource Types",
            fixed_inputs: "Fixed Inputs",
            workflows: "Workflows"
        },
        deleteConfirmation: "Are you sure you want to delete {{type}} {{name}}?",
        flash: {
            updated: "{{type}} {{name}} successfully updated",
            created: "{{type}} {{name}} successfully created.",
            delete: "{{type}} {{name}} successfully deleted."
        },
        ipBlocks: {
            id: "id",
            prefix: "prefix",
            description: "description",
            state: "state",
            state_repr: "status",
            version: "version"
        },
        products: {
            searchPlaceHolder: "Search for Products",
            new: "New Product",
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
            back: "Back to Product Blocks",
            view: "View",
            edit: "Edit",
            delete: "Delete",
            clone: "Clone",
            select_add_product_block: "Add a Product Block...",
            select_no_more_product_blocks: "No more Product Blocks to add",
            no_found: "No Products",
            duplicate_name: "This name is already taken. Product names need to be unique.",
            select_add_fixed_input: "Add a Fixed Input...",
            select_no_more_fixed_inputs: "No more Fixed Inputs to add"
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
            delete: "Delete",
            resourceTypes: "Resource Types",
            resourceTypes_info:
                "The Resource Types of this Product Block. They define which values are stored on the subscriptions of the Products linked to the Product Block(s)",
            select_add_resource_type: "Add a Resource Type...",
            select_no_more_resource_types: "No more Resource Types to add",
            no_found: "No Product Blocks",
            duplicate_name: "This name is already taken. Product Block names need to be unique"
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
            resource_type_id: "Resource type ID"
        },
        fixedInputs: {
            tags: "Fixed Inputs for Product tag: {{tag}}",
            inputs: "Fixed Inputs and values",
            description: "Description",
            name: "Name",
            fixedInput: "Fixed Input name",
            values: "Values",
            required: "Required"
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
                "Workflows that are not the type SYSTEM - e.g. are not Tasks - and do not have a relation with any Product can never be run. These workflows are colored grey and should be subject for investigation."
        },
        results: "{{type}} found: {{count}}"
    },
    tasks: {
        searchPlaceHolder: "Search for tasks...",
        new: "New Task",
        last_step: "Current step",
        last_status: "Status",
        workflow: "Workflow",
        started_at: "Started",
        failed_reason: "Failed reason",
        last_modified_at: "Last modified",
        created_by: "Created by",
        actions: "",
        none: "",
        submit: "Submit",
        cancel: "Cancel",
        delete: "Delete",
        details: "Details",
        user_input: "User input",
        abort: "Abort",
        retry: "Retry",
        deleteConfirmation: "Are you sure you want to delete {{name}} task?",
        abortConfirmation: "Are you sure you want to abort {{name}} task?",
        retryConfirmation: "Are you sure you want to retry {{name}} task?",
        runallConfirmation: "Are you sure you want to rerun all failed tasks?",
        no_found: "No tasks",
        flash: {
            delete: "Task {{name}} is deleted",
            abort: "Task {{name}} is aborted",
            retry: "Task {{name}} has been retried"
        },
        refresh: "Refresh automatically every 3 seconds?",
        runall: "Rerun all"
    },
    task: {
        workflow: "Workflow",
        workflow_info: "Select a task workflow to run",
        cancel: "Cancel",
        submit: "Submit",
        notFound: "No Task found (e.g. 404)",
        format_error: "Required input / invalid format",
        userInput: "User input for step {{name}}",
        subscription_link_txt: "Show Subscription related by this task",
        tabs: {
            user_input: "User input",
            task: "Task"
        },
        new_task: "New task",
        flash: {
            create: "Created task for workflow {{name}}",
            update: "Resumed task for workflow {{name}}"
        }
    },
    subscription_select: {
        placeholder: "Search and select a subscription",
        select_product: "First select a Product"
    },
    subscription_product_tag_select: {
        placeholder_selected_product: "Select a subscription for the selected product",
        placeholder: "Select a subscription for this product tag"
    },
    cache: {
        name: {
            ims: "IMS locations",
            crm: "CRM organisations, contacts and locations",
            api: "Workflow endpoints (combined caches)",
            all: "All caches"
        },
        remove: "Flush Cache",
        remove_info: "Select a Cache to flush",
        clear: "Flush",
        flushed: "Cache {{name}} was flushed"
    },
    error_dialog: {
        title: "Unexpected error",
        body:
            "This is embarrassing; an unexpected error has occurred. It has been logged and reported. Please try again. Still doesn't work? Please click 'Help'.",
        ok: "Close"
    },
    not_found: {
        title: "404",
        description: "The requested page could not be found"
    },
    server_error: {
        title: "500",
        description:
            "An unexpected error occurred. It has been logged and reported. Please try again. Still doesn't" +
            " work? Get Help."
    },
    not_allowed: {
        title: "403",
        description: "This page is restricted. You don't have access based on your group memberships and / or SAB roles"
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
    free_port_select: {
        no_free_ports_available:
            "No free ports with interface type {{interfaceType}} available at location {{location}}",
        free_ports_loading:
            "Please be patient, the query for free ports with interface type {{interfaceType}} available at location {{location}} can take a while ...",
        no_free_ports_placeholder: "No free ports available",
        select_port: "Select a port"
    },
    service_ports: {
        servicePort: "Service Port",
        vlan: "Port Vlan",
        used_ssp: "The selected service port is already used in a different subscription(s): {{descriptions}}",
        bandwidth: "Bandwidth",
        bandwidth_placeholder: "Enter the bandwidth of this service port...",
        bandwidth_no_service_port_placeholder: "First select a service port...",
        invalid_bandwidth:
            "The bandwidth is invalid. Maximum bandwidth based on the selected service port is {{max}} Mbit/s"
    },
    bandwidth: {
        invalid: "Invalid bandwidth. The maximum based on the selected ports / products is {{max}} Mbit/s"
    },
    ims_changes: {
        circuit_changed:
            "In LP Circuit {{id}} {{description}} the old endpoint references has been replaced by the new endpoint reference",
        old_endpoint: "The old endpoint",
        new_endpoint: "The new endpoint"
    },
    ip_blocks: {
        ip_block: "Please enter subnet/netmask e.g. 192.168.0.0/16"
    },
    node_select: {
        select_node: "Select a node",
        nodes_loading: "Loading nodes, please wait...",
        no_nodes_placeholder: "No nodes available",
        no_nodes_message: "No nodes available with status PLANNED or READY FOR SERVICE on location: {{location}}"
    },
    node_port: {
        select_node_first: "First select a node",
        select_port: "Select a port"
    },
    ipam: {
        description: "Description",
        prefix: "IP Prefix",
        afi: "IP Family",
        asn: "Autonomous System Number",
        state: "State",
        ipaddress: "IP Address",
        fqdn: "FQDN",
        assigned_address_id: "Assigned IP Address ID"
    },
    bfd_settings: {
        enable: "Enable BFD",
        minimum_interval: "Minimum Interval",
        multiplier: "Multiplier"
    },
    workflow: {
        migrate_sn7_ip_bgp_ipss_to_sn8: "Migrate to SN8",
        migrate_sn7_ip_static_ipss_to_sn8: "Migrate to SN8",
        migrate_sn7_ip_static_sap_to_sn8: "Migrate static SAP to SN8",
        migrate_sn7_ip_bgp_sap_to_sn8: "Migrate one SAP to SN8",

        modify_core_link_add_link: "Add a link to an existing Corelink",
        modify_core_link_remove_link: "Remove a Link from an existing core link",
        modify_core_link_isis_metric: "Modify Corelink ISIS metric",
        modify_ip_prefix: "Modify IP Prefix",
        modify_node_in_service: "Set a planned node in service",
        modify_sn7_elan: "Modify ELAN",
        modify_sn7_light_path_downgrade_to_unprotected: "Downgrade to non-redundant LP",
        modify_sn7_light_path_speed: "Modify Service Speed",
        modify_sn7_light_path_msp_only_speed: "Modify Service Speed",
        modify_sn7_light_path_upgrade_to_redundant: "Upgrade to Redundant LP",
        modify_sn7_service_port_netherlight_isalias: "Modify Netherlight isAlias",
        modify_sn7_service_port_msp_redundancy_downgrade: "Downgrade a RMSP to a MSP",
        modify_sn7_service_port_msp_redundancy_upgrade: "Upgrade a MSP to a RMSP",
        modify_sn7_service_port_msp_replace: "Replace MSP with another MSP",
        modify_sn7_service_port_ssp_replace: "Replace SSP with another SSP",
        modify_sn7_service_port_ssp_speed: "Modify SSP Speed",
        modify_sn8_aggregated_service_port: "Modify aggregated service port",
        modify_sn8_ip_bgp: "Modify SN8 SURFinternet BGP",
        modify_sn8_ip_bgp_change_port: "Replace port of SN8 SURFinternet BGP",
        modify_sn8_ip_static: "Modify SN8 SURFinternet Static",
        modify_sn8_light_path: "Modify SN8 LightPath",
        modify_sn8_service_port_port_mode: "Change the mode of the port (Untagged, Tagged, Linkmember)",
        modify_sn8_service_port_nl_port_mode: "Change the mode of the port (Tagged, Linkmember)",
        modify_sn8_sp_auto_negotiation: "Modify the auto_negotiation setting for a SN8 Service Port",

        task_cache_warmer: "Refresh the cache of slow API calls",
        task_clean_up_tasks: "Clean up old tasks",
        task_resume_workflows: "Resume all workflows that are stuck on tasks with the status 'waiting'",
        task_update_surf_net_txt_record: "Update the surf.net zone to check correct functionality",
        task_validate_customer_ip_prefix_records: "Validate all customer ip prefixes against subscriptions",
        task_validate_ism_ports: "Validate ISM ports to have associated subscription in Core DB",

        validate_core_link: "Validate Core Link",
        validate_ip_prefix: "Validate IP Prefix",
        validate_sn7_light_path: "Validate SN7 Light Path",
        validate_node: "Validate Node",
        validate_sn7_service_port: "Validate SN7 Service Port",
        validate_sn7_ip_static: "Validate SN7 IP Static",
        validate_sn7_ip_bgp: "Validate SN7 IP BGP",
        validate_sn8_ip_static: "Validate SN8 IP Static",
        validate_sn8_ip_bgp: "Validate SN8 IP BGP",
        validate_sn8_service_port: "Validate SN8 Service Port"
    }
};

export default I18n.translations.en;
