import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

export default class BandwidthSelect extends React.PureComponent {

    render() {
        const {onChange, value, disabled} = this.props;
        return (
            <Select className="select-interface-type"
                    onChange={onChange}
                    options={[
                        {value: "250 Mbit/s", label: "250 Mbit/s"},
                        {value: "500 Mbit/s", label: "500 Mbit/s"},
                        {value: "750 Mbit/s", label: "750 Mbit/s"},
                        {value: "1 Gbit/s", label: "1 Gbit/s"},
                        {value: "10 Gbit/s", label: "10 Gbit/s"},
                    ]}
                    value={value}
                    searchable={true}
                    disabled={disabled} />
        );
    }

}


BandwidthSelect.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    disabled: PropTypes.bool
};
