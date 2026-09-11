const DEFAULT_SUCCESS_STATUSES = ["OK"];

export function mutationResponseBody(response) {
    if (!response || typeof response !== "object") return null;
    if (typeof response.status === "string") return response;
    if (response.data && typeof response.data === "object") return response.data;
    return null;
}

export function isExplicitMutationSuccess(response, accepted = DEFAULT_SUCCESS_STATUSES) {
    const body = mutationResponseBody(response);
    return Boolean(body && accepted.includes(body.status));
}

export function requireMutationSuccess(response, accepted = DEFAULT_SUCCESS_STATUSES) {
    if (!isExplicitMutationSuccess(response, accepted)) {
        const error = new Error("The server did not confirm the requested operation.");
        error.response = response;
        throw error;
    }
    return response;
}
