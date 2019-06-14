import fetchMock from "fetch-mock";
import {vlanData} from "./data";

export function loadVlanMocks() {
    fetchMock.get('glob:*/api/ims/vlans/0*', vlanData());
    fetchMock.get('glob:*/api/ims/vlans/1*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/2*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/3*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/4*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/5*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/6*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/7*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/8*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/9*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/a*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/b*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/c*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/d*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/e*', vlanData(), {overwriteRoutes: false});
    fetchMock.get('glob:*/api/ims/vlans/f*', vlanData(), {overwriteRoutes: false});
}
