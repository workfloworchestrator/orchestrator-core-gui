import React from "react";

// Don't just add stuff here. This is reserved for things that don't change during the lifetime of the application
let ApplicationContext = React.createContext({
    organisations: [],
    locationCodes: [],
    products: [],
    redirect: _url => {}
});

export default ApplicationContext;
