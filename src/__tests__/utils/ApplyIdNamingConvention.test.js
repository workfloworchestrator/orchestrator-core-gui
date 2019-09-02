import { applyIdNamingConvention } from "../../utils/Utils";

test("Test with underscore", () => {
    expect(applyIdNamingConvention("subscription_id")).toBe("subscription-id");
});

test("Test with camel cased and underscore", () => {
    expect(applyIdNamingConvention("SubscriptionId")).toBe("subscription-id");
});

test("Test with camel cased and underscores", () => {
    expect(applyIdNamingConvention("inputSubscription_id")).toBe("input-subscription-id");
});

test("Test with underscores", () => {
    expect(applyIdNamingConvention("input_subscription_id")).toBe("input-subscription-id");
});

test("Test prefix with underscores", () => {
    expect(applyIdNamingConvention("subscription_id", "input")).toBe("input-subscription-id");
});

test("Test prefix with camel case", () => {
    expect(applyIdNamingConvention("SubscriptionId", "input")).toBe("input-subscription-id");
});
