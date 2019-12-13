describe("Timezones", () => {
    it("should always be Europe/Amsterdam", () => {
        expect(new Date().getTimezoneOffset()).toBe(-60);
    });

    it("Formatting should be us-en in test because we run on node with crippeled date support", () => {
        expect(new Date(300000000).toLocaleString("nl-NL")).toBe("1/4/1970, 12:20:00 PM");
    });
});
