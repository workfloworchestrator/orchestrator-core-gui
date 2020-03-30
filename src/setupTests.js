import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import I18n from "i18n-js";

import en from "./locale/en";

// we need to use them, otherwise the imports are deleted when organizing them
expect(I18n).toBeDefined();
expect(en).toBeDefined();
I18n.locale = "en";

configure({ adapter: new Adapter() });
