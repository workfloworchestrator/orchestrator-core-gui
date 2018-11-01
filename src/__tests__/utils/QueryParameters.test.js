import {replaceQueryParameter, getParameterByName, getQueryParameters} from "../../utils/QueryParameters";

test("Replace query parameters", () => {
    const replaced = replaceQueryParameter("?test=bogus", "test", "value");
    expect(replaced).toBe("?test=value");
});

test("Replace query parameters preserve existing", () => {
    const replaced = replaceQueryParameter("?test=bogus&name=x", "test", "value");
    expect(replaced).toBe("?name=x&test=value");
});

test("Replace query parameters", () => {
    const replaced = replaceQueryParameter("", "test", "value");
    expect(replaced).toBe("?test=value");
});

test("Parameter by name", () => {
   expect("value", getParameterByName("name", "?name=value"))
});

test("Parameter by name not exists", () => {
    expect("value", getParameterByName("", undefined))
});

test("Return query parameters as objects", () => {
    const params = getQueryParameters("?vis=zeebaars&huisdier=hond&huisdier=kat");
    expect("zeebaars", params.vis);
    expect(2, params.huisdier.length);
})
