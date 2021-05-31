import { loadPolicy } from "@open-policy-agent/opa-wasm";
import { ENV } from "env";
import { join } from "lodash";

export async function createPolicyCheck(user?: Partial<Oidc.Profile>) {
    if (!user) {
        return () => true;
    }
    const policyResult = await fetch(
        ENV.OAUTH2_OPENID_CONNECT_URL.replace("auth", "opa") + "/public-bundle/" + ENV.OAUTH2_CLIENT_ID
    );
    const policyWasm = await policyResult.arrayBuffer();
    try {
        const policy = await loadPolicy(policyWasm);

        function allowed(resource: string): boolean {
            const input: any = {
                resource: resource,
                client_id: ENV.OAUTH2_CLIENT_ID,
                method: "GET",
                ...user,
            };

            // Fix unexpected scope array
            if (Array.isArray(input.scope)) {
                input.scope = join(input.scope, " ");
            }

            const resultSet = policy.evaluate(input);
            if (resultSet == null || resultSet.length === 0) {
                console.error("evaluation error", resultSet);
                return false;
            }
            return resultSet[0].result;
        }
        return allowed;
    } catch {
        console.error("policy evaluation error");
        return (_: string) => false;
    }
}
