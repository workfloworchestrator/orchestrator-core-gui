import React from "react";

function RenderNull({ children = "-- Plugin loading problem --" }) {
    return (<div>
        <b>{children}</b>
    </div>)
};

export default RenderNull
