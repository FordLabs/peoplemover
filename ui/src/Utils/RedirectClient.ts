// @todo yeet
class RedirectClient {
    static redirect(redirectUrl: string): void {
        window.location.href = `${window.location.origin}${redirectUrl}`;
    }
}

export default RedirectClient;
