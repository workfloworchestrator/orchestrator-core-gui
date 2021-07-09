import React from "react";

export default ({ children = "-- Plugin loading problem --" }) => (
    <div>
        <b>{children}</b>
    </div>
);
