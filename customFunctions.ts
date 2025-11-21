namespace custom {
    /**
     * Cut the nearest tree
     */
    //% block
    export function cutNearestTree() {
        let nearestLog: Position = null
        let minDistance = 1000
        let playerPos = player.position()

        // Search for nearest log within radius 10
        for (let x = -10; x <= 10; x++) {
            for (let z = -10; z <= 10; z++) {
                for (let y = -2; y <= 5; y++) { // Check a bit up and down
                    let checkPos = playerPos.add(pos(x, y, z))
                    let blockId = blocks.testForBlock(LOG_OAK, checkPos) ? LOG_OAK :
                        blocks.testForBlock(LOG_BIRCH, checkPos) ? LOG_BIRCH :
                            blocks.testForBlock(LOG_SPRUCE, checkPos) ? LOG_SPRUCE :
                                blocks.testForBlock(LOG_JUNGLE, checkPos) ? LOG_JUNGLE :
                                    blocks.testForBlock(LOG_ACACIA, checkPos) ? LOG_ACACIA :
                                        blocks.testForBlock(LOG_DARK_OAK, checkPos) ? LOG_DARK_OAK : 0

                    if (blockId != 0) {
                        // Found a log, check distance
                        // Simple Manhattan distance or Euclidean squared for comparison
                        let dist = Math.abs(x) + Math.abs(y) + Math.abs(z)
                        if (dist < minDistance) {
                            minDistance = dist
                            nearestLog = checkPos
                        }
                    }
                }
            }
        }

        if (nearestLog) {
            player.say("Cutting tree at " + nearestLog)
            agent.teleport(nearestLog, WEST)

            let currentPos = nearestLog

            blocks.place(AIR, currentPos) // Break the first one

            // Check above
            let above = currentPos.add(pos(0, 1, 0))
            while (
                blocks.testForBlock(LOG_OAK, above) ||
                blocks.testForBlock(LOG_BIRCH, above) ||
                blocks.testForBlock(LOG_SPRUCE, above) ||
                blocks.testForBlock(LOG_JUNGLE, above) ||
                blocks.testForBlock(LOG_ACACIA, above) ||
                blocks.testForBlock(LOG_DARK_OAK, above)
            ) {
                agent.destroy(UP)
                agent.move(UP)
                currentPos = agent.position() // Update pos
                above = currentPos.add(pos(0, 1, 0))
            }

            player.say("Done cutting!")
        } else {
            player.say("No tree found nearby")
        }
    }
}
