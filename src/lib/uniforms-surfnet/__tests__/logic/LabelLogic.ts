import { isRepeatedField } from "../../src/logic/LabelLogic";

test("Test different names from uniform if they belong to repeated ListFields ", () => {
    expect(isRepeatedField("contact_persons")).toBe(false);
    expect(isRepeatedField("contact_persons.0.email")).toBe(false);
    expect(isRepeatedField("contact_persons.1.email")).toBe(true);
    expect(isRepeatedField("contact_persons.2.email")).toBe(true);
    expect(isRepeatedField("internetpinnen_prefix_subscriptions.0")).toBe(false);
    expect(isRepeatedField("internetpinnen_prefix_subscriptions.1")).toBe(true);
    expect(isRepeatedField("internetpinnen_prefix_subscriptions.2")).toBe(true);
    expect(isRepeatedField("esi_service_ports.0.0.subscription_id")).toBe(false);
    expect(isRepeatedField("esi_service_ports.0.1.subscription_id")).toBe(true);
    expect(isRepeatedField("esi_service_ports.1.0.subscription_id")).toBe(false);
    expect(isRepeatedField("esi_service_ports.1.1.subscription_id")).toBe(true);
});
