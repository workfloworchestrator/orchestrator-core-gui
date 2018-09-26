import React from "react";
import PropTypes from "prop-types";
import { BasicCircuit } from "react-network-diagrams";
//import "./LightPathVisualizer.css";


export default class LightPathVisualizer extends React.PureComponent {

    componentDidMount() {
    }

    render() {
        const {subscription, subscriptions} = this.props;
        const labelA = (subscriptions[0] && "description" in subscriptions[0]) ? subscriptions[0].description : "N/A";
        const labelB = (subscriptions[1] && "description" in subscriptions[1]) ? subscriptions[1].description : "N/A";

        const style = {
    node: {
        normal: {
            stroke: "#737373",
            strokeWidth: 4,
            fill: "none"
        },
        highlighted: {
            stroke: "#b1b1b1",
            strokeWidth: 4,
            fill: "#b1b1b1"
        }
    },
    line: {
        normal: {
            stroke: "#ff7f0e",
            strokeWidth: 3,
            fill: "none"
        },
        highlighted: {
            stroke: "#4EC1E0",
            strokeWidth: 4,
            fill: "none"
        }
    },
    label: {
        normal: {
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 10
        }
    }
};
const endpointStyle = {
    node: {
        normal: {fill: "none", stroke: "#DBDBDB", strokeWidth: 4},
    },
    label: {
        normal: {fill: "#9D9D9D", fontSize: 10, fontFamily: "verdana, sans-serif"},
    }
};
        return <div>
            <BasicCircuit
                title={subscription.name}
                circuitLabel={subscription.name}
                lineStyle={style}
                lineShape={style}
                size={style}
                connectionLabelPosition={5}
                yOffset={7}
                endpointStyle={endpointStyle}
                endpointLabelPosition="top"
                endpointLabelA={labelA}
                endpointLabelZ={labelB}
  />
        </div>;
    }
}

LightPathVisualizer.propTypes = {
    name: PropTypes.string.isRequired,
    subscription: PropTypes.object.isRequired,
    subscriptions: PropTypes.array.isRequired
};


