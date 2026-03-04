import { messageGC } from './actions/contact-gc';

async function main() {
    try {
        const result = await messageGC('a38d55cf-fa5f-41f9-849e-2ff9b2cf80d8', 'some-gc-id', null, 'test', 'test');
        console.log("Result:", result);
    } catch (e) {
        console.error("Caught error:", e);
    }
}
main();
