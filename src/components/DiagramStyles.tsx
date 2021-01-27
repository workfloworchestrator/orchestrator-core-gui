const equipmentToEquipmentStyle = {
    node: {
        normal: {
            stroke: "#737373",
            strokeWidth: 4,
            fill: "none",
        },
        highlighted: {
            stroke: "#b1b1b1",
            strokeWidth: 4,
            fill: "#b1b1b1",
        },
    },
    line: {
        normal: {
            stroke: "#ff7f0e",
            strokeWidth: 3,
            fill: "none",
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 4,
            fill: "none",
        },
    },
    label: {
        normal: {
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 10,
        },
    },
};

const opticalStyle = {
    node: {
        normal: {
            stroke: "#737373",
            strokeWidth: 4,
            fill: "none",
        },
        highlighted: {
            stroke: "#b1b1b1",
            strokeWidth: 4,
            fill: "#b1b1b1",
        },
    },
    line: {
        normal: {
            stroke: "#1f77b4",
            strokeWidth: 3,
            fill: "none",
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 4,
            fill: "none",
        },
    },
    label: {
        normal: {
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 10,
        },
    },
};

const leasedStyle = {
    node: {
        normal: {
            stroke: "#737373",
            strokeWidth: 4,
            fill: "none",
        },
        highlighted: {
            stroke: "#b1b1b1",
            strokeWidth: 4,
            fill: "#b1b1b1",
        },
    },
    line: {
        normal: {
            stroke: "#2ca02c",
            strokeWidth: 3,
            fill: "none",
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 4,
            fill: "none",
        },
    },
    label: {
        normal: {
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 10,
        },
    },
};

const darkFiberStyle = {
    node: {
        normal: {
            stroke: "#737373",
            strokeWidth: 4,
            fill: "none",
        },
        highlighted: {
            stroke: "#b1b1b1",
            strokeWidth: 4,
            fill: "#b1b1b1",
        },
    },
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 2,
            fill: "none",
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 3,
            fill: "none",
        },
    },
    label: {
        normal: {
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 10,
        },
    },
};

const crossConnectStyle = {
    node: {
        normal: {
            stroke: "#737373",
            strokeWidth: 4,
            fill: "none",
        },
        highlighted: {
            stroke: "#b1b1b1",
            strokeWidth: 4,
            fill: "#b1b1b1",
        },
    },
    line: {
        normal: {
            stroke: "#535353",
            strokeWidth: 1,
            fill: "none",
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 2,
            fill: "none",
        },
    },
    label: {
        normal: {
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 10,
        },
    },
};

const couplerStyle = {
    node: {
        normal: {
            stroke: "#737373",
            strokeWidth: 4,
            fill: "none",
        },
        highlighted: {
            stroke: "#b1b1b1",
            strokeWidth: 4,
            fill: "#b1b1b1",
        },
    },
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: "#D5D5D5",
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 2,
            fill: "#D5D5D5",
        },
    },
    label: {
        normal: {
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 10,
        },
    },
};

const endpointStyle = {
    node: {
        normal: { fill: "none", stroke: "#DBDBDB", strokeWidth: 4, shape: "square" },
    },
    label: {
        normal: { fill: "#9D9D9D", fontSize: 10, fontFamily: "verdana, sans-serif" },
    },
};

const panelCouplerStyle = {
    node: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: "#F8F8F8",
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 2,
            fill: "#F8F8F8",
        },
    },
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: "#E8E8E8",
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 2,
            fill: "#E8E8E8",
        },
    },
    label: {
        normal: {
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 10,
        },
    },
};

const panelStyle = {
    stroke: "#E4E4E4",
    strokeWidth: 1,
    fill: "#FFFFFF",
};

const rackStyle1 = {
    stroke: "#737373",
    strokeWidth: 1,
    fill: "#D5D5D5",
};

const rackStyle2 = {
    stroke: "#000000",
    strokeWidth: 2,
    fill: "#E8E8E8",
};

const equipStyles = {
    equipServers: "#2ca02c",
    equipRouters: "#1f77b4",
    equipOptical: "#2c4e95",
    equipPdus: "#9900ff",
    equipSwitches: "#ff7f0e",
    equipPanels: "#4d4d4d",
    equipBlank: "#D5D5D5", // Blanks are the same color as racks
};

const routerStyle = {
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: equipStyles.equipRouters,
        },
        selected: {
            stroke: "#333",
            strokeWidth: 2,
            fill: equipStyles.equipRouters,
        },
        muted: {
            stroke: "#696969",
            strokeWidth: 1,
            opacity: 0.6,
            fill: equipStyles.equipRouters,
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 1,
            fill: equipStyles.equipRouters,
        },
    },
    label: {
        normal: { fill: "#FFFFFF", fontFamily: "verdana, sans-serif", fontSize: 10 },
        selected: { fill: "#FFFFFF", stroke: "none", fontSize: 12 },
        muted: {
            fill: "#696969",
            stroke: "none",
            fontSize: 9,
            opacity: 0.6,
        },
    },
};

const switchStyle = {
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: equipStyles.equipSwitches,
        },
        selected: {
            stroke: "#333",
            strokeWidth: 2,
            fill: equipStyles.equipSwitches,
        },
        muted: {
            stroke: "#696969",
            strokeWidth: 1,
            opacity: 0.6,
            fill: equipStyles.equipSwitches,
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 1,
            fill: equipStyles.equipSwitches,
        },
    },
    label: {
        normal: { fill: "#FFFFFF", fontFamily: "verdana, sans-serif", fontSize: 10 },
        selected: { fill: "#FFFFFF", stroke: "none", fontSize: 12 },
        muted: {
            fill: "#696969",
            stroke: "none",
            fontSize: 9,
            opacity: 0.6,
        },
    },
};

const serverStyle = {
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: equipStyles.equipServers,
        },
        selected: {
            stroke: "#333",
            strokeWidth: 2,
            fill: equipStyles.equipServers,
        },
        muted: {
            stroke: "#696969",
            strokeWidth: 1,
            opacity: 0.6,
            fill: equipStyles.equipServers,
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 1,
            fill: equipStyles.equipServers,
        },
    },
    label: {
        normal: { fill: "#FFFFFF", fontFamily: "verdana, sans-serif", fontSize: 10 },
        selected: { fill: "#FFFFFF", stroke: "none", fontSize: 12 },
        muted: {
            fill: "#696969",
            stroke: "none",
            fontSize: 9,
            opacity: 0.6,
        },
    },
};

const pduStyle = {
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: equipStyles.equipPdus,
        },
        selected: {
            stroke: "#333",
            strokeWidth: 2,
            fill: equipStyles.equipPdus,
        },
        muted: {
            stroke: "#696969",
            strokeWidth: 1,
            opacity: 0.6,
            fill: equipStyles.equipPdus,
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 1,
            fill: equipStyles.equipPdus,
        },
    },
    label: {
        normal: { fill: "#FFFFFF", fontFamily: "verdana, sans-serif", fontSize: 10 },
        selected: { fill: "#FFFFFF", stroke: "none", fontSize: 12 },
        muted: {
            fill: "#696969",
            stroke: "none",
            fontSize: 9,
            opacity: 0.6,
        },
    },
};

const transportStyle = {
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: equipStyles.equipOptical,
        },
        selected: {
            stroke: "#333",
            strokeWidth: 2,
            fill: equipStyles.equipOptical,
        },
        muted: {
            stroke: "#696969",
            strokeWidth: 1,
            opacity: 0.6,
            fill: equipStyles.equipOptical,
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 1,
            fill: equipStyles.equipOptical,
        },
    },
    label: {
        normal: { fill: "#FFFFFF", fontFamily: "verdana, sans-serif", fontSize: 10 },
        selected: { fill: "#FFFFFF", stroke: "none", fontSize: 12 },
        muted: {
            fill: "#696969",
            stroke: "none",
            fontSize: 9,
            opacity: 0.6,
        },
    },
};

const patchPanelStyle = {
    line: {
        normal: {
            stroke: "#737373",
            strokeWidth: 1,
            fill: equipStyles.equipPanels,
        },
        selected: {
            stroke: "#333",
            strokeWidth: 2,
            fill: equipStyles.equipPanels,
        },
        muted: {
            stroke: "#696969",
            strokeWidth: 1,
            opacity: 0.6,
            fill: equipStyles.equipPanels,
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 1,
            fill: equipStyles.equipPanels,
        },
    },
    label: {
        normal: { fill: "#FFFFFF", fontFamily: "verdana, sans-serif", fontSize: 10 },
        selected: { fill: "#FFFFFF", stroke: "none", fontSize: 12 },
        muted: {
            fill: "#696969",
            stroke: "none",
            fontSize: 9,
            opacity: 0.6,
        },
    },
};

const stylesMap = {
    equipmentToEquipment: equipmentToEquipmentStyle,
    optical: opticalStyle,
    leased: leasedStyle,
    darkFiber: darkFiberStyle,
    crossConnect: crossConnectStyle,
    coupler: couplerStyle,
    endpoint: endpointStyle,
    panelCoupler: panelCouplerStyle,
    panel: panelStyle,
    rack1: rackStyle1,
    rack2: rackStyle2,
    router: routerStyle,
    switch: switchStyle,
    server: serverStyle,
    pdu: pduStyle,
    transpor: transportStyle,
    patchPanel: patchPanelStyle,
};

const lineShapeMap = {
    equipmentToEquipment: "linear",
    optical: "linear",
    leased: "linear",
    darkFiber: "linear",
    crossConnect: "linear",
    coupler: "square",
};

export { stylesMap, lineShapeMap };
