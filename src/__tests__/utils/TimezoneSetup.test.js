describe("Timezones", () => {
    it("should always be Europe/Amsterdam", () => {
        expect(new Date(300000000).getTimezoneOffset()).toBe(-60);
    });

    // This test is needed to ensure that your system uses the same locale setting as that of the CI.
    // When this test fails, it means that locally a different timestamp is being used.
    // See, for example, the snapshot for the subscription-detail page.
    it("Formatting should be us-en in test because we run on node with crippeled date support", () => {
        expect(new Date(300000000).toLocaleString("nl-NL")).toBe("4-1-1970 12:20:00");
    });
});
