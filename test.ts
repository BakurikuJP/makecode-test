
/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="\uf0c3"
namespace test {
    /**
     * A test block that prints a message to the chat
     */
    //% block
    export function runTest() {
        player.say("Test block executed!");
    }

    /**
     * A test block with a parameter
     * @param message the message to say
     */
    //% block="say %message"
    export function sayMessage(message: string) {
        player.say("Test says: " + message);
    }
}
