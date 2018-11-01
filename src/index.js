import React from "react";
import ReactDOM from "react-dom";
import App from "./pages/App";
import {Provider} from "unstated";
import UNSTATED from "unstated-debug";

UNSTATED.logStateChanges = true;

ReactDOM.render(<Provider><App /></Provider>, document.getElementById("app"));
