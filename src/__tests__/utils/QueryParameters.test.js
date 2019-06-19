import { replaceQueryParameter, getParameterByName, getQueryParameters } from "../../utils/QueryParameters";

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
    expect(getParameterByName("name", "?name=value")).toBe("value");
});

test("Parameter by name not exists", () => {
    expect(getParameterByName("", undefined)).toBe("");
});

test("Return query parameters as objects", () => {
    const params = getQueryParameters("?vis=zeebaars&huisdier=hond&huisdier=kat");
    expect(params.vis).toBe("zeebaars");
    expect(params.huisdier.length).toBe(2);
});
