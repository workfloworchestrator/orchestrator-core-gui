import {doValidateUserInput} from "../../validations/UserInput";

const doTest = (value, expected=true) => {
    const errors = {};
    doValidateUserInput({type: "vlan", name: "vlan"}, value, errors);
    expect(errors["vlan"]).toBe(expected)
};

test("Validate VLAN range", () => {
    doTest("2, 43-4094", false);
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
