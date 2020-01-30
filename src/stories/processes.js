export const ALL_PROCESSES = [
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579009307.056786,
        pid: "f17db7e7-5eb4-4373-9391-f69cd2b591af",
        started: 1579007482.199943,
        status: "aborted",
        step: "User Aborted",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM SSP (port not ready yet) 10 Gbit/s",
                end_date: null,
                insync: false,
                product: {
                    description: "Single Service Port 10G",
                    name: "SSP 10G",
                    product_id: "fbec2336-c0c9-4b9c-9b79-8a119da36da6",
                    tag: "SSP"
                },
                start_date: null,
                status: "initial",
                subscription_id: "eed56701-ade1-4687-91ef-ef5d9789fb39"
            }
        ],
        workflow: "create_sn7_service_port_ssp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579007647.421168,
        pid: "f1df83f5-29de-4878-b4c8-c4e0b2738043",
        started: 1579007592.394752,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM SSP MT001A 10 Gbit/s",
                end_date: 1579009285.171787,
                insync: true,
                product: {
                    description: "Single Service Port 10G",
                    name: "SSP 10G",
                    product_id: "fbec2336-c0c9-4b9c-9b79-8a119da36da6",
                    tag: "SSP"
                },
                start_date: 1579007647.387076,
                status: "terminated",
                subscription_id: "20108bdf-fd98-420f-b5ef-ddef00940581"
            }
        ],
        workflow: "create_sn7_service_port_ssp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579007732.625382,
        pid: "7844bef2-3050-4b63-beba-c38bb3ab6163",
        started: 1579007673.240931,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM SP MT001A 10 Gbit/s",
                end_date: null,
                insync: true,
                product: {
                    description: "Service Port 10G",
                    name: "SN8 Service Port 10G",
                    product_id: "23e21573-ecb3-4c9e-9a52-8f590e757a58",
                    tag: "SP"
                },
                start_date: 1579007732.572823,
                status: "active",
                subscription_id: "0d0ac068-5c45-4760-80ae-44c029fc4be5"
            }
        ],
        workflow: "create_sn8_service_port"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579007783.50553,
        pid: "fbbcee51-c38f-4b14-ae26-b057c8691bc3",
        started: 1579007779.452651,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM prefix 145.127.80.208/29 (pf)",
                end_date: null,
                insync: true,
                product: {
                    description: "IPv4 and IPv6 Prefix product",
                    name: "IP Prefix",
                    product_id: "55c96135-e308-4126-b53f-0a3cf23331f5",
                    tag: "IP_PREFIX"
                },
                start_date: 1579007783.459075,
                status: "active",
                subscription_id: "0b58e76f-8d9f-413c-a0d3-e1c65e7df992"
            }
        ],
        workflow: "create_ip_prefix"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579009090.432509,
        pid: "e763f836-d1fd-44e1-8e4f-d3570ca8fb5f",
        started: 1579008995.433299,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM SSP MT001A 10 Gbit/s",
                end_date: null,
                insync: true,
                product: {
                    description: "Single Service Port 10G",
                    name: "SSP 10G",
                    product_id: "fbec2336-c0c9-4b9c-9b79-8a119da36da6",
                    tag: "SSP"
                },
                start_date: 1579009090.401912,
                status: "active",
                subscription_id: "f915866e-b207-48b4-843d-49cc9c62028b"
            }
        ],
        workflow: "create_sn7_service_port_ssp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579009052.685765,
        pid: "a6054473-5f1c-40d7-aafd-9b830ee8fc8a",
        started: 1579009035.380992,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "c9b5e717-0b11-e511-80d0-005056956c1a",
                description: "Node Planned MT001A mt001a-jnx-paul83-vtb",
                end_date: null,
                insync: true,
                product: {
                    description: "A product that can be used to set a planned node to in service",
                    name: "SN8 Node",
                    product_id: "01f7a619-3d88-4012-b766-d1d9780c1682",
                    tag: "Node"
                },
                start_date: null,
                status: "provisioning",
                subscription_id: "e440eabf-9aed-4efc-9094-59889ca854fe"
            }
        ],
        workflow: "create_node"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579009198.551173,
        pid: "fded6ced-d776-475b-b560-474ec3cfddaf",
        started: 1579009179.665419,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM SSP MT001A 10 Gbit/s",
                end_date: 1579009285.171787,
                insync: true,
                product: {
                    description: "Single Service Port 10G",
                    name: "SSP 10G",
                    product_id: "fbec2336-c0c9-4b9c-9b79-8a119da36da6",
                    tag: "SSP"
                },
                start_date: 1579007647.387076,
                status: "terminated",
                subscription_id: "20108bdf-fd98-420f-b5ef-ddef00940581"
            }
        ],
        workflow: "modify_note"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579009292.063232,
        pid: "05da1070-dc31-4e5e-9822-91dccbbd0bd2",
        started: 1579009254.985941,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM SSP MT001A 10 Gbit/s",
                end_date: 1579009285.171787,
                insync: true,
                product: {
                    description: "Single Service Port 10G",
                    name: "SSP 10G",
                    product_id: "fbec2336-c0c9-4b9c-9b79-8a119da36da6",
                    tag: "SSP"
                },
                start_date: 1579007647.387076,
                status: "terminated",
                subscription_id: "20108bdf-fd98-420f-b5ef-ddef00940581"
            }
        ],
        workflow: "terminate_sn7_service_port_ssp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579012522.810996,
        pid: "72647a24-5db5-473b-a33c-9ddb6a7b83e7",
        started: 1579009351.967781,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM SP MT001A 10 Gbit/s",
                end_date: null,
                insync: true,
                product: {
                    description: "Service Port 10G",
                    name: "SN8 Service Port 10G",
                    product_id: "23e21573-ecb3-4c9e-9a52-8f590e757a58",
                    tag: "SP"
                },
                start_date: 1579012522.779532,
                status: "active",
                subscription_id: "09d0f317-07fa-49d0-af77-7303f314d175"
            }
        ],
        workflow: "create_sn8_service_port"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579012459.008309,
        pid: "e88929a3-9e24-4dbb-88a3-b380b29c2cae",
        started: 1579012401.948193,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: false,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579012458.929857,
                status: "migrating",
                subscription_id: "714d9c1c-096b-4e6f-91fc-24029564f276"
            }
        ],
        workflow: "create_sn7_ip_static"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579012602.516014,
        pid: "c5599fca-a029-4a2f-99a6-90ad9c687cdd",
        started: 1579012598.668674,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: false,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579012458.929857,
                status: "migrating",
                subscription_id: "714d9c1c-096b-4e6f-91fc-24029564f276"
            },
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using static routing",
                    name: "SN8 SURFinternet Static",
                    product_id: "c3cc7b65-7f96-4a33-b34a-1b83ffdbd7e4",
                    tag: "IPS"
                },
                start_date: 1579012866.961453,
                status: "active",
                subscription_id: "b518990a-0696-46f9-9fb1-1e1e1e5134cd"
            }
        ],
        workflow: "migrate_sn7_ip_static_ipss_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579013151.76963,
        pid: "da8f3148-59ba-45bf-90f0-1885059f2800",
        started: 1579012636.29088,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: false,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579012458.929857,
                status: "migrating",
                subscription_id: "714d9c1c-096b-4e6f-91fc-24029564f276"
            },
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using static routing",
                    name: "SN8 SURFinternet Static",
                    product_id: "c3cc7b65-7f96-4a33-b34a-1b83ffdbd7e4",
                    tag: "IPS"
                },
                start_date: 1579012866.961453,
                status: "active",
                subscription_id: "b518990a-0696-46f9-9fb1-1e1e1e5134cd"
            }
        ],
        workflow: "migrate_sn7_ip_static_sap_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579013872.453084,
        pid: "78c5eb80-41ed-4e85-b352-7e3f7b340419",
        started: 1579013814.171183,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM SSP MT001A 10 Gbit/s",
                end_date: null,
                insync: true,
                product: {
                    description: "Single Service Port 10G",
                    name: "SSP 10G",
                    product_id: "fbec2336-c0c9-4b9c-9b79-8a119da36da6",
                    tag: "SSP"
                },
                start_date: 1579013872.423066,
                status: "active",
                subscription_id: "da4bf405-1001-4316-a220-9c9fdf370bd4"
            }
        ],
        workflow: "create_sn7_service_port_ssp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579013981.099677,
        pid: "d9141d3c-2951-4295-8ff8-a49b60bd59f5",
        started: 1579013904.348603,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM SP MT001A 10 Gbit/s",
                end_date: null,
                insync: true,
                product: {
                    description: "Service Port 10G",
                    name: "SN8 Service Port 10G",
                    product_id: "23e21573-ecb3-4c9e-9a52-8f590e757a58",
                    tag: "SP"
                },
                start_date: 1579013981.074664,
                status: "active",
                subscription_id: "33fbff1c-70eb-4212-bfa6-a1bf2f6f8c95"
            }
        ],
        workflow: "create_sn8_service_port"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579013990.932109,
        pid: "2dd561cf-bdfc-4b59-a0f1-14c6dbbf0927",
        started: 1579013931.076955,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: 1579083274.949185,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579013990.903701,
                status: "terminated",
                subscription_id: "521be31c-b44b-48e5-a446-9295072d803f"
            }
        ],
        workflow: "create_sn7_ip_static"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579014014.808142,
        pid: "fad5278b-eeb1-4fd4-b93e-31f16ddbbb15",
        started: 1579014011.044282,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: 1579083274.949185,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579013990.903701,
                status: "terminated",
                subscription_id: "521be31c-b44b-48e5-a446-9295072d803f"
            },
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using static routing",
                    name: "SN8 SURFinternet Static",
                    product_id: "c3cc7b65-7f96-4a33-b34a-1b83ffdbd7e4",
                    tag: "IPS"
                },
                start_date: 1579083886.633576,
                status: "active",
                subscription_id: "738bc961-8d37-486e-a61b-0a1279e05f52"
            }
        ],
        workflow: "migrate_sn7_ip_static_ipss_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579014091.504182,
        pid: "8d154e2e-8eeb-4955-ae26-b3ccc99e461b",
        started: 1579014037.49869,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: 1579083274.949185,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579013990.903701,
                status: "terminated",
                subscription_id: "521be31c-b44b-48e5-a446-9295072d803f"
            },
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using static routing",
                    name: "SN8 SURFinternet Static",
                    product_id: "c3cc7b65-7f96-4a33-b34a-1b83ffdbd7e4",
                    tag: "IPS"
                },
                start_date: 1579083886.633576,
                status: "active",
                subscription_id: "738bc961-8d37-486e-a61b-0a1279e05f52"
            }
        ],
        workflow: "migrate_sn7_ip_static_sap_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579083134.042721,
        pid: "1a391ea7-9b78-437a-a8c5-81f2f3c0df13",
        started: 1579083066.164191,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM SP MT001A 10 Gbit/s",
                end_date: null,
                insync: true,
                product: {
                    description: "Service Port 10G",
                    name: "SN8 Service Port 10G",
                    product_id: "23e21573-ecb3-4c9e-9a52-8f590e757a58",
                    tag: "SP"
                },
                start_date: 1579083133.952536,
                status: "active",
                subscription_id: "c86ed85b-dbe9-483b-a393-d0473fdf752b"
            }
        ],
        workflow: "create_sn8_service_port"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579083275.045239,
        pid: "6388dcea-cda0-47e0-95a8-18cd3279fe57",
        started: 1579083244.005022,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: 1579083274.949185,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579013990.903701,
                status: "terminated",
                subscription_id: "521be31c-b44b-48e5-a446-9295072d803f"
            }
        ],
        workflow: "terminate_sn7_ip_static"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579083361.911479,
        pid: "e5420bdb-3247-4268-9e93-bf5be76c51b3",
        started: 1579083300.064409,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579083361.875895,
                status: "migrating",
                subscription_id: "b0a33a17-d148-4be2-a7ab-9f55693eb5cd"
            }
        ],
        workflow: "create_sn7_ip_static"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579083561.119772,
        pid: "b942b12d-8e1f-4f9a-bb0c-d64a27181d5c",
        started: 1579083556.671801,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579083361.875895,
                status: "migrating",
                subscription_id: "b0a33a17-d148-4be2-a7ab-9f55693eb5cd"
            },
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using static routing",
                    name: "SN8 SURFinternet Static",
                    product_id: "c3cc7b65-7f96-4a33-b34a-1b83ffdbd7e4",
                    tag: "IPS"
                },
                start_date: null,
                status: "provisioning",
                subscription_id: "5d9c06e4-f0b6-4c44-bb7e-91df7f7d76e0"
            }
        ],
        workflow: "migrate_sn7_ip_static_ipss_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579083937.314501,
        pid: "1dd56682-1316-4d6d-b118-f69d8e397e86",
        started: 1579083653.939934,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using static routing",
                    name: "SURFinternet 10G Static",
                    product_id: "27b081df-fd67-4af9-9ec8-1c0a0c1dc8e5",
                    tag: "IPS"
                },
                start_date: 1579083361.875895,
                status: "migrating",
                subscription_id: "b0a33a17-d148-4be2-a7ab-9f55693eb5cd"
            },
            {
                customer_id: "4c50f21b-a7a8-e511-80d6-005056956c1a",
                description: "MSM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using static routing",
                    name: "SN8 SURFinternet Static",
                    product_id: "c3cc7b65-7f96-4a33-b34a-1b83ffdbd7e4",
                    tag: "IPS"
                },
                start_date: 1579083886.633576,
                status: "active",
                subscription_id: "738bc961-8d37-486e-a61b-0a1279e05f52"
            }
        ],
        workflow: "migrate_sn7_ip_static_sap_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579103977.753811,
        pid: "acc581ee-33d2-456b-b1e0-25481001a011",
        started: 1579103891.199664,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM MSP MT001A 10 Gbit/s",
                end_date: null,
                insync: true,
                product: {
                    description: "Multi Service Port 10G",
                    name: "MSP 10G",
                    product_id: "6ca5d002-e401-42ef-96f1-e2f97506b321",
                    tag: "MSP"
                },
                start_date: 1579103977.726939,
                status: "active",
                subscription_id: "ad0bfbb7-9160-40fc-b203-9cf558332b2d"
            }
        ],
        workflow: "create_sn7_service_port_msp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579104059.795419,
        pid: "343dc8ff-6b28-423c-912f-b4ccf4b8a5b7",
        started: 1579104008.450593,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM SP MT001A 10 Gbit/s",
                end_date: null,
                insync: true,
                product: {
                    description: "Service Port 10G",
                    name: "SN8 Service Port 10G",
                    product_id: "23e21573-ecb3-4c9e-9a52-8f590e757a58",
                    tag: "SP"
                },
                start_date: 1579104059.764501,
                status: "active",
                subscription_id: "6112274c-e4e9-4875-9255-84ffb40f3630"
            }
        ],
        workflow: "create_sn8_service_port"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579104193.923599,
        pid: "dada885a-d3c4-4485-b692-b7fa487cda1c",
        started: 1579104105.107434,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using BGP",
                    name: "SURFinternet 10G BGP",
                    product_id: "86d136ad-f9ad-4c94-9ab9-a923eab01ce8",
                    tag: "IPBGP"
                },
                start_date: 1579104193.896802,
                status: "migrating",
                subscription_id: "5560114f-d7e0-467a-ba81-710c50b660a7"
            }
        ],
        workflow: "create_sn7_ip_bgp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579104226.360389,
        pid: "516bc48c-383c-465c-8290-116be16f13bb",
        started: 1579104223.196998,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using BGP",
                    name: "SURFinternet 10G BGP",
                    product_id: "86d136ad-f9ad-4c94-9ab9-a923eab01ce8",
                    tag: "IPBGP"
                },
                start_date: 1579104193.896802,
                status: "migrating",
                subscription_id: "5560114f-d7e0-467a-ba81-710c50b660a7"
            },
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using BGP",
                    name: "SN8 SURFinternet BGP",
                    product_id: "40f70b01-565c-4ccf-8707-6632ab604b5f",
                    tag: "IPBGP"
                },
                start_date: 1579104549.670228,
                status: "active",
                subscription_id: "56d04362-e8b9-4b36-80ac-da04467c310c"
            }
        ],
        workflow: "migrate_sn7_ip_bgp_ipss_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579104435.923059,
        pid: "80778d5a-851e-4da8-9c17-1c2ec95d39ae",
        started: 1579104282.926994,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using BGP",
                    name: "SURFinternet 10G BGP",
                    product_id: "86d136ad-f9ad-4c94-9ab9-a923eab01ce8",
                    tag: "IPBGP"
                },
                start_date: 1579104193.896802,
                status: "migrating",
                subscription_id: "5560114f-d7e0-467a-ba81-710c50b660a7"
            },
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using BGP",
                    name: "SN8 SURFinternet BGP",
                    product_id: "40f70b01-565c-4ccf-8707-6632ab604b5f",
                    tag: "IPBGP"
                },
                start_date: 1579104549.670228,
                status: "active",
                subscription_id: "56d04362-e8b9-4b36-80ac-da04467c310c"
            }
        ],
        workflow: "migrate_sn7_ip_bgp_sap_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579104632.833368,
        pid: "2f5ad777-7f4b-4be7-ba67-70d5705f8b22",
        started: 1579104490.524616,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 10 Gb/s internet connection using BGP",
                    name: "SURFinternet 10G BGP",
                    product_id: "86d136ad-f9ad-4c94-9ab9-a923eab01ce8",
                    tag: "IPBGP"
                },
                start_date: 1579104193.896802,
                status: "migrating",
                subscription_id: "5560114f-d7e0-467a-ba81-710c50b660a7"
            },
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using BGP",
                    name: "SN8 SURFinternet BGP",
                    product_id: "40f70b01-565c-4ccf-8707-6632ab604b5f",
                    tag: "IPBGP"
                },
                start_date: 1579104549.670228,
                status: "active",
                subscription_id: "56d04362-e8b9-4b36-80ac-da04467c310c"
            }
        ],
        workflow: "migrate_sn7_ip_bgp_sap_to_sn8"
    },
    {
        assignee: "KLANTSUPPORT",
        creator: "SYSTEM",
        failure: null,
        modified: 1579104747.305141,
        pid: "933b995f-d9a0-46c4-836c-938f91a5a939",
        started: 1579104745.777193,
        status: "suspended",
        step: "Service Attach Point settings for BGP",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: false,
                product: {
                    description: "SURFinternet 1 Gb/s internet connection using BGP",
                    name: "SURFinternet 1G BGP",
                    product_id: "940d7cfc-25ef-4618-8619-6382d58d67ac",
                    tag: "IPBGP"
                },
                start_date: null,
                status: "initial",
                subscription_id: "f4471598-0e0e-4015-baae-acc2bc1e1455"
            }
        ],
        workflow: "create_sn7_ip_bgp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579104940.021237,
        pid: "1c3cd84c-f4a9-4c5a-97df-9a4ef0e07333",
        started: 1579104842.191054,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A-MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 1 Gb/s internet connection using BGP",
                    name: "SURFinternet 1G BGP",
                    product_id: "940d7cfc-25ef-4618-8619-6382d58d67ac",
                    tag: "IPBGP"
                },
                start_date: 1579104939.99132,
                status: "migrating",
                subscription_id: "4704251b-b830-4383-8a3a-481388ad9777"
            }
        ],
        workflow: "create_sn7_ip_bgp"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579104966.35045,
        pid: "04cf58d8-b5f6-432b-8420-a18177d3ccfa",
        started: 1579104962.896138,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A-MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 1 Gb/s internet connection using BGP",
                    name: "SURFinternet 1G BGP",
                    product_id: "940d7cfc-25ef-4618-8619-6382d58d67ac",
                    tag: "IPBGP"
                },
                start_date: 1579104939.99132,
                status: "migrating",
                subscription_id: "4704251b-b830-4383-8a3a-481388ad9777"
            },
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using BGP",
                    name: "SN8 SURFinternet BGP",
                    product_id: "40f70b01-565c-4ccf-8707-6632ab604b5f",
                    tag: "IPBGP"
                },
                start_date: 1579105063.204167,
                status: "active",
                subscription_id: "d85eb888-3916-433c-82fb-858956042f9b"
            }
        ],
        workflow: "migrate_sn7_ip_bgp_ipss_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579105078.529529,
        pid: "cbb240ab-e916-4749-bd56-52101484e96e",
        started: 1579104998.443465,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A-MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 1 Gb/s internet connection using BGP",
                    name: "SURFinternet 1G BGP",
                    product_id: "940d7cfc-25ef-4618-8619-6382d58d67ac",
                    tag: "IPBGP"
                },
                start_date: 1579104939.99132,
                status: "migrating",
                subscription_id: "4704251b-b830-4383-8a3a-481388ad9777"
            },
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using BGP",
                    name: "SN8 SURFinternet BGP",
                    product_id: "40f70b01-565c-4ccf-8707-6632ab604b5f",
                    tag: "IPBGP"
                },
                start_date: 1579105063.204167,
                status: "active",
                subscription_id: "d85eb888-3916-433c-82fb-858956042f9b"
            }
        ],
        workflow: "migrate_sn7_ip_bgp_sap_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: null,
        modified: 1579105300.709276,
        pid: "c49c3e60-40e5-4348-88c6-cbe1a4a08566",
        started: 1579105183.736567,
        status: "completed",
        step: "Done",
        subscriptions: [
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A-MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SURFinternet 1 Gb/s internet connection using BGP",
                    name: "SURFinternet 1G BGP",
                    product_id: "940d7cfc-25ef-4618-8619-6382d58d67ac",
                    tag: "IPBGP"
                },
                start_date: 1579104939.99132,
                status: "migrating",
                subscription_id: "4704251b-b830-4383-8a3a-481388ad9777"
            },
            {
                customer_id: "bae56b42-0911-e511-80d0-005056956c1a",
                description: "AZM IP MT001A",
                end_date: null,
                insync: true,
                product: {
                    description: "SN8 SURFinternet connection using BGP",
                    name: "SN8 SURFinternet BGP",
                    product_id: "40f70b01-565c-4ccf-8707-6632ab604b5f",
                    tag: "IPBGP"
                },
                start_date: 1579105063.204167,
                status: "active",
                subscription_id: "d85eb888-3916-433c-82fb-858956042f9b"
            }
        ],
        workflow: "migrate_sn7_ip_bgp_sap_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: "No known CRM organisation for location code (unknown)",
        modified: 1579012782.209608,
        pid: "b8b9b907-fb5d-4684-ac4a-2ac604bce059",
        started: 1579012781.481471,
        status: "failed",
        step: "Load relevant subscription information",
        subscriptions: [],
        workflow: "terminate_sn8_service_port"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: "\"Could not find key 'sap1' in state.\"",
        modified: 1579016722.472533,
        pid: "3ecf8801-227c-47b3-99be-cfa6e4141752",
        started: 1579016709.168581,
        status: "failed",
        step: "Load initial state",
        subscriptions: [],
        workflow: "migrate_sn7_ip_static_sap_to_sn8"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: "IMS Service 46995 has no endpoints",
        modified: 1579007822.313525,
        pid: "0faffc3b-b017-4390-aeb9-2222b95551db",
        started: 1579007821.58857,
        status: "waiting",
        step: "Load port information",
        subscriptions: [],
        workflow: "create_sn7_ip_static"
    },
    {
        assignee: "SYSTEM",
        creator: "SYSTEM",
        failure: "IMS Service 46995 has no endpoints",
        modified: 1579009119.671452,
        pid: "984defc9-a899-42e1-9ae8-b26c47b0a1ae",
        started: 1579009118.768334,
        status: "waiting",
        step: "Load port information",
        subscriptions: [],
        workflow: "create_sn7_ip_static"
    }
];
