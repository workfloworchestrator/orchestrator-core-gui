import {doValidateUserInput} from "../../validations/UserInput";

const doTest = (value, expected=true) => {
    const errors = {};
    doValidateUserInput({type: "vlan_range", name: "t"}, value, errors);
    expect(errors["t"]).toBe(expected)
};

test("Validate VLAN range", () => {
    doTest("2, 43-4094", false);
});
test("Validate VLAN range", () => {
    doTest(" 2  , 3  ,  4,  6 - 1994 ", false);
});

test("Validate invalid format vlan range", () => {
    doTest("a");
});

test("Validate start > end vlan range", () => {
    doTest("99-1");
});

test("Validate out of range too low vlan range", () => {
    doTest("1, 43-4094");
});

test("Validate out of range too high vlan range", () => {
    doTest("2, 43-4095");
});
