
/**
 * Custom blocks for testing
 */
//% weight=100 color=#0fbc11 icon=""
namespace customTest {
    /**
     * A test action block
     */
    //% block
    export function testAction(): void {
        player.say("Test action executed!");
    }

    /**
     * A test block with parameters
     * @param text the text to say
     */
    //% block="test say %text"
    export function testSay(text: string): void {
        player.say("Test: " + text);
    }
}
