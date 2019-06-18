import React from 'react';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import SubscriptionProductTagSelect from "../components/SubscriptionProductTagSelect";
import "../pages/App.scss"
import "./storybook.scss"
import GenericSelect from "../components/GenericSelect";
import TableSummary from "../components/TableSummary";
import UserInputContainer from "./UserInputContainer";
import {
    allNodeSubscriptions,
    contactPersons, corelinkPorts10G,
    LOCATION_CODES,
    ORGANISATIONS,
    PRODUCTS,
    SN7PortSubscriptions, SN8PortSubscriptions, imsNodes, freeCorelinkPorts
} from "./data";
import LocationCodeSelect from "../components/LocationCodeSelect";

import fetchMock from 'fetch-mock';
import {loadVlanMocks} from "./utils";
import GenericNOCConfirm from '../components/GenericNOCConfirm';


const genericSelectChoices = ['SAP 1', 'SAP 2', 'SAP 3'];
const tableSummaryDataDefinition = [
    {labels: ["Label1", "Label 2", "Label 3"]},
    {columns: [["value1", "value2", "value3 with slightly longer text"]]}];

const tableSummaryDataWithHeaders = [
    {headers: ["Old Values", "New Values"]},
    {
        columns: [
            ["value1", "value2", "value3"],
            ["new value1", "new value2", "new value3"]]
    }
];

const tableSummaryDataDefinitionWithHeaders = [
    {labels: ["Label1", "Label 2", "Label 3"]},
    {headers: ["Old Values", "New Values"]},
    {
        columns: [
            ["value1", "value2", "value3"],
            ["new value1", "new value2", "new value3"]]
    }
];

const nodeSteps = [
    {"name": "ims_node_id", "type": "nodes_for_location_code_and_status", "location_code_key": "location_code"}
];

const contactPersonSteps = [
    {"name": "organisation", "type": "organisation"},
    {"name": "contact_persons", "organisation_key": "organisation", "type": "contact_persons"},
];

const corelinkSteps = [
    {"interface_type_key": "corelink_service_speed", "name": "ims_port_id_1", "type": "corelink", "location_code_key": "location_code"},
    {"interface_type_key": "corelink_service_speed", "name": "ims_port_id_2", "type": "corelink", "location_code_key": "location_code"}
    ];

const addCorelinkSteps = [
    {"name":"ims_port_id_1", "type":"corelink_add_link", "node_key": "node_1", "interface_type_key":"corelink_service_speed"},
    {"name":"ims_port_id_1", "type":"corelink_add_link", "node_key": "node_2", "interface_type_key":"corelink_service_speed"}];

const sn7PortSelectInputStepsAllOrganisations = [
    {"name": "organisation", "type": "organisation"},
    {"name": "bandwidth", "ports_key": ["service_ports"], "readonly": false, "type": "bandwidth", "value": null},
    {"maximum": 6, "minimum": 1, "name": "bgp_ip_service_ports", "organisationPortsOnly": false, "organisation_key": "organisation",
     "type": "service_ports", "mspOnly": false}];

const sn7PortSelectInputStepsMSPOnly = [
    {"name": "organisation", "type": "organisation"},
    {"name": "bandwidth", "ports_key": ["service_ports"], "readonly": false, "type": "bandwidth", "value": null},
    {"maximum": 6, "minimum": 1, "name": "bgp_ip_service_ports", "organisationPortsOnly": false, "organisation_key": "organisation",
     "type": "service_ports", "mspOnly": true}];

const sn7PortSelectInputStepsSelectedOrganisation = [
    {"name": "organisation", "type": "organisation"},
    {"name": "bandwidth", "ports_key": ["service_ports"], "readonly": false, "type": "bandwidth", "value": null},
    {"maximum": 6, "minimum": 1, "name": "bgp_ip_service_ports", "organisationPortsOnly": true, "organisation_key": "organisation",
     "type": "service_ports", "mspOnly": false}];

const sn8PortSelectInputStepsAllOrganisations = [
    {"name": "organisation", "type": "organisation"},
    {"name": "bandwidth", "ports_key": ["service_ports"], "readonly": false, "type": "bandwidth", "value": null},
    {"maximum": 6, "minimum": 1, "name": "bgp_ip_service_ports", "organisationPortsOnly": false, "organisation_key": "organisation",
     "type": "service_ports_sn8", "visiblePortMode": "normal"}];

const sn8PortSelectInputStepsTagged = [
    {"name": "organisation", "type": "organisation"},
    {"name": "bandwidth", "ports_key": ["service_ports"], "readonly": false, "type": "bandwidth", "value": null},
    {"maximum": 6, "minimum": 1, "name": "bgp_ip_service_ports", "organisationPortsOnly": false, "organisation_key": "organisation",
     "type": "service_ports_sn8", "visiblePortMode": "tagged"}];

const sn8PortSelectInputStepsUntagged = [
    {"name": "organisation", "type": "organisation"},
    {"name": "bandwidth", "ports_key": ["service_ports"], "readonly": false, "type": "bandwidth", "value": null},
    {"maximum": 6, "minimum": 1, "name": "bgp_ip_service_ports", "organisationPortsOnly": false, "organisation_key": "organisation",
     "type": "service_ports_sn8", "visiblePortMode": "untagged"}];

const sn8PortSelectInputStepsSelectedOrganisation = [
    {"name": "organisation", "type": "organisation"},
    {"name": "bandwidth", "ports_key": ["service_ports"], "readonly": false, "type": "bandwidth", "value": null},
    {"maximum": 6, "minimum": 1, "name": "bgp_ip_service_ports", "organisationPortsOnly": true, "organisation_key": "organisation",
     "type": "service_ports_sn8", "visiblePortMode": "normal"}];


storiesOf('Welcome', module).add('to Storybook', () =>
    <div>
        <h1>Workflows client storybook</h1>
        <p>Welcome to the storybook. We will demonstrate some of the components here.</p>
        <p><b>The storybook will use mocks for the components that need data. So you could see other data then you're used to.</b></p>
        <p>All the UserInputForms examples use a Wrapper component to simulate the form elements as they are used with the workflow engine</p>
    </div>
);

storiesOf("SubscriptionProductTagSelect", module)
    .add("Only tags", () =>
        <SubscriptionProductTagSelect onChange={action("clicked")} tags={["SP", "MSP"]}/>)
    .add("Filtered on Product", () =>
        <SubscriptionProductTagSelect
            onChange={action("clicked")}
            tags={["IPS"]}
            productId="077e6583-a1f8-42bd-87b0-60f7051c8d42"/>)
    .add("Filtered on Product with excluded subs", () =>
        <SubscriptionProductTagSelect
            onChange={action("clicked")}
            tags={["IPS"]}
            productId="077e6583-a1f8-42bd-87b0-60f7051c8d42"
            excludedSubscriptionIds={["08ac5baa-4053-4d01-98e0-505e957d73c7"]}
        />);


storiesOf("GenericSelect", module)
    .add("Default", () =>
        <GenericSelect onChange={action("selected")} choices={genericSelectChoices}/>);

storiesOf("LocationCodeSelect", module)
    .add("Default", () =>
        <LocationCodeSelect locationCodes={LOCATION_CODES} onChange={action("selected")}/>
    )

storiesOf("TableSummary", module)
    .add("Definition", () =>
        <TableSummary data={tableSummaryDataDefinition}/>)
    .add("Summary with headers", () =>
        <TableSummary data={tableSummaryDataWithHeaders}/>)
    .add("Summary with definition and headers", () =>
        <TableSummary data={tableSummaryDataDefinitionWithHeaders}/>);

storiesOf("GenericNOCConfirm", module)
    .add("Legacy", () => (
        <GenericNOCConfirm
            name="noc_remove_static_ip_confirmation"
            onChange={action("changed checkbox: ")}
        />
    ))
    .add("Complex", () => (
        <GenericNOCConfirm
            name="confirm_migrate_sap"
            onChange={action("changed checkbox: ")}
            data={[
                ["confirm_migrate_sap", "label"],
                ["confirm_migrate_sap_info", "info"],
                ["next_step_service_affecting", "warning"],
                ["http://example.com", "url"],
                ["check_delete_sn7_service_config", "checkbox"],
                ["check_ims_defined", "label"],
                ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 1" }],
                ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 2" }],
                ["check_port_patched_sn7_sn8", "checkbox?"]
            ]}
        />
    ))
    .add("Legacy in form", () => (
        <UserInputContainer
            formName="NOC Confirm"
            stepUserInput={[{ name: "noc_remove_static_ip_confirmation", type: "accept" }]}
            organisations={ORGANISATIONS}
            locationCodes={LOCATION_CODES}
            products={PRODUCTS}
        />
    ))
    .add("Complex in form", () => (
        <UserInputContainer
            formName="NOC Confirm"
            stepUserInput={[
                {
                    name: "confirm_migrate_sap",
                    type: "accept",
                    data: [
                        ["confirm_migrate_sap", "label"],
                        ["confirm_migrate_sap_info", "info"],
                        ["next_step_service_affecting", "warning"],
                        ["http://example.com", "url"],
                        ["check_delete_sn7_service_config", "checkbox"],
                        ["check_ims_defined", "label"],
                        ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 1" }],
                        ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 2" }],
                        ["check_port_patched_sn7_sn8", "checkbox?"]
                    ]
                }
            ]}
            organisations={ORGANISATIONS}
            locationCodes={LOCATION_CODES}
            products={PRODUCTS}
        />
    ))
    .add("Remove old noc_network_confirmation", () => (
        <UserInputContainer
            formName="Remove old noc_network_confirmation"
            stepUserInput={[
                {
                    name: "accept",
                    type: "accept",
                    data: [
                        ["noc_network_confirmation", "label"],
                        ["noc_network_confirmation_info", "info"],
                        ["noc_upgrade_redundant_confirmation_intro", "label"],
                        ["http://example.com", "url"],
                        ["noc_upgrade_redundant_confirmation_steps_intro", "label"],
                        ["noc_upgrade_redundant_confirmation_LR2_built_info", "checkbox"],
                        ["noc_upgrade_redundant_confirmation_LPE_renamed_info", "checkbox"],
                    ]
                },
                { name: "noc_network_confirmation", type: "noc_network_confirmation" }
            ]}
            history={{}}
            currentUser=""
            organisations={ORGANISATIONS}
            locationCodes={LOCATION_CODES}
            products={PRODUCTS}
            currentState={{jira_ticket_uri: "http://example.com"}}
        />
    ))
    .add("Remove old noc_subtask_confirmation", () => (
        <UserInputContainer
            formName="Organisation and contacts"
            stepUserInput={[
                {
                    name: "accept",
                    type: "accept",
                    data: [
                        ["noc_subtask_confirmation", "label"],
                        ["noc_subtask_confirmation_info", "info"],
                        ["check_service_built", "checkbox"],
                        ["check_iface_no_errors", "checkbox"],
                        ["check_cfm_up", "checkbox"],
                        ["check_ims_defined", "label"],
                        ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 1" }],
                        ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 2" }],
                        ["check_cfm_up", "checkbox"],
                        ["check_client_confirmed", "checkbox"]
                    ]
                },
                { name: "noc_subtask_confirmation", type: "noc_subtask_confirmation" }
            ]}
            history={{}}
            currentUser=""
            organisations={ORGANISATIONS}
            locationCodes={LOCATION_CODES}
            products={PRODUCTS}
            currentState={{
                is_redundant: true,
                ims_circuit_name_1: "ims circuit 1",
                ims_circuit_name_2: "ims circuit 2"
            }}
        />
    ))
    .add("Remove old noc_subtask_confirmation2", () => (
        <UserInputContainer
            formName="Organisation and contacts"
            stepUserInput={[
                {
                    name: "accept",
                    type: "accept",
                    data: [
                        ["noc_subtask_confirmation", "label"],
                        ["noc_subtask_confirmation_info", "info"],
                        ["check_service_built", "checkbox"],
                        ["check_iface_no_errors", "checkbox"],
                        ["check_cfm_up", "checkbox"],
                        ["check_ims_defined", "label"],
                        ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit" }],
                        ["check_client_confirmed", "checkbox"]
                    ]
                },
                { name: "noc_subtask_confirmation", type: "noc_subtask_confirmation" }
            ]}
            history={{}}
            currentUser=""
            organisations={ORGANISATIONS}
            locationCodes={LOCATION_CODES}
            products={PRODUCTS}
            currentState={{ is_redundant: false, ims_circuit_name: "ims circuit" }}
        />
    ))
    .add("Remove old noc_modification_confirmation", () => (
        <UserInputContainer
            formName="Organisation and contacts"
            stepUserInput={[
                {
                    name: "accept",
                    type: "accept",
                    data: [
                        ["noc_modification_confirmation", "label"],
                        ["noc_modification_confirmation_info", "info"],
                        [
                            "noc_modification_confirmation_template",
                            "checkbox",
                            {
                                human_service_speed: "a",
                                new_human_service_speed: "b",
                                nms_service_id: "1234"
                            }
                        ]
                    ]
                },
                { name: "noc_modification_confirmation", type: "noc_modification_confirmation" }
            ]}
            history={{}}
            currentUser=""
            organisations={ORGANISATIONS}
            locationCodes={LOCATION_CODES}
            products={PRODUCTS}
            currentState={{
                human_service_speed: "a",
                new_human_service_speed: "b",
                nms_service_id: "1234"
            }}
        />
    ));
storiesOf("UserInputForm", module)
    .add("Contactpersons", () => {
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', []);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', []);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', []);
        fetchMock.get('glob:*/api/crm/contacts/*', contactPersons);
        return <UserInputContainer formName="Organisation and contacts" stepUserInput={contactPersonSteps}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
        }
    )
    .add("Corelink", () => {
        const currentState = {"corelink_service_speed":"10000"};
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', []);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', []);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', allNodeSubscriptions);
        fetchMock.get('glob:*/api/ims/free_corelink_ports/*', corelinkPorts10G);
        return <UserInputContainer formName="Corelink form" stepUserInput={corelinkSteps}
                                   currentState={currentState}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("Corelink add link", () => {
        const currentState = {"node_1": "d38d8b25-d9f5-4a25-b1b0-d29057c47420", "node_2": "5d2123e6-197d-4bb6-93c6-446d474d98fd"};
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', []);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', []);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', allNodeSubscriptions);
        fetchMock.get('glob:*/api/ims/free_corelink_ports/*', freeCorelinkPorts)
        return <UserInputContainer formName="Corelink add link form" stepUserInput={addCorelinkSteps}
                                   currentState={currentState}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("Nodes", () => {
        const currentState = {"location_code":"MT001A"};
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', []);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', []);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', allNodeSubscriptions);
        fetchMock.get('/api/ims/nodes/MT001A', imsNodes);
        return <UserInputContainer formName="Node form" stepUserInput={nodeSteps}
                                   currentState={currentState}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("SN7 Portselect all organisations", () => {
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', SN7PortSubscriptions);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', []);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', []);
        fetchMock.get('glob:*/api/subscriptions/parent_subscriptions/*', []);
        loadVlanMocks();
        return <UserInputContainer formName="SN7 portselect form, showing all ports" stepUserInput={sn7PortSelectInputStepsAllOrganisations}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("SN7 Portselect MSP only", () => {
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', SN7PortSubscriptions);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', []);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', []);
        fetchMock.get('glob:*/api/subscriptions/parent_subscriptions/*', []);
        loadVlanMocks();
        return <UserInputContainer formName="SN7 portselect form, showing all ports"
                                   stepUserInput={sn7PortSelectInputStepsMSPOnly}
                                   organisations={ORGANISATIONS}
                                   locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("SN7 Portselect selected organisation", () => {
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', SN7PortSubscriptions);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', []);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', []);
        fetchMock.get('glob:*/api/subscriptions/parent_subscriptions/*', []);
        loadVlanMocks();
        return <UserInputContainer formName="SN7 portselect, showing only ports for selected organisation" stepUserInput={sn7PortSelectInputStepsSelectedOrganisation}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("SN8 Portselect all organisations", () => {
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', []);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', SN8PortSubscriptions);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', []);
        fetchMock.get('glob:*/api/subscriptions/parent_subscriptions/*', []);
        loadVlanMocks();
        return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={sn8PortSelectInputStepsAllOrganisations}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("SN8 Portselect tagged", () => {
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', []);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', SN8PortSubscriptions);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', []);
        fetchMock.get('glob:*/api/subscriptions/parent_subscriptions/*', []);
        loadVlanMocks();
        return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={sn8PortSelectInputStepsTagged}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("SN8 Portselect untagged", () => {
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', []);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', SN8PortSubscriptions);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', []);
        fetchMock.get('glob:*/api/subscriptions/parent_subscriptions/*', []);
        loadVlanMocks();
        return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={sn8PortSelectInputStepsUntagged}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
    .add("SN8 Portselect selected organisation", () => {
        fetchMock.restore();
        fetchMock.get('/api/subscriptions/tag/MSP%2CSSP%2CMSPNL/', []);
        fetchMock.get('glob:*/api/subscriptions/tag/SP%2CSPNL/*', SN8PortSubscriptions);
        fetchMock.get('/api/v2/all-subscriptions-with-tags', []);
        fetchMock.get('glob:*/api/subscriptions/parent_subscriptions/*', []);
        loadVlanMocks();
        return <UserInputContainer formName="SN8 portselect, showing only ports for selected organisation" stepUserInput={sn8PortSelectInputStepsSelectedOrganisation}
                                   organisations={ORGANISATIONS} locationCodes={LOCATION_CODES}
                                   products={PRODUCTS}/>
    })
