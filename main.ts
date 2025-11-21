player.onChat("cut tree", function () {
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
        
        // Cut upwards
        // We assume the tree goes up. We'll cut until we hit air or leaves (or just air/leaves/non-log)
        // Actually, usually we just want to cut logs.
        
        // Move agent to the log position (it might be inside the log, so destroy it first)
        agent.destroy(FORWARD) // Agent faces WEST, but teleported TO the log. 
        // Actually agent.teleport puts the agent AT the position.
        // If the agent is IN the block, it might be stuck.
        // Better to teleport NEXT to the log? Or just destroy it.
        // Let's try teleporting to the log and destroying "down" or "forward" or just "agent.destroy(SIX_DIRECTIONS)"?
        // Standard way: teleport to base, destroy, move up, destroy...
        
        // Let's refine: Teleport to the log's position.
        // The agent occupies the block. If it's solid, it might be an issue?
        // MakeCode agent usually displaces blocks or can exist in them?
        // Let's teleport to the log position.
        
        // Actually, let's loop while detecting log above
        let currentPos = nearestLog
        while (true) {
             // Check if current block is log
             let isLog = blocks.testForBlock(LOG_OAK, currentPos) || 
                         blocks.testForBlock(LOG_BIRCH, currentPos) ||
                         blocks.testForBlock(LOG_SPRUCE, currentPos) ||
                         blocks.testForBlock(LOG_JUNGLE, currentPos) ||
                         blocks.testForBlock(LOG_ACACIA, currentPos) ||
                         blocks.testForBlock(LOG_DARK_OAK, currentPos)
            
            if (!isLog) {
                break
            }
            
            agent.teleport(currentPos, WEST)
            agent.destroy(FORWARD) // Destroy the block the agent is in? No, destroy forward?
            // Agent destroy takes a direction.
            // If agent is AT the block, it can't destroy "itself" easily unless it moves.
            // Maybe teleport one block NEXT to it?
            // But trees can be surrounded.
            
            // Alternative: Agent destroy(UP), move(UP).
            // But we need to start from the bottom.
            
            // Let's try: Teleport to the log.
            // agent.destroy(FORWARD) destroys the block in front.
            // If we teleport TO the log, we are inside it.
            // Does agent.destroy(FORWARD) work if we are inside?
            // Usually we teleport adjacent.
            
            // Let's try a simpler approach:
            // Teleport to nearestLog
            // Loop:
            //   agent.destroy(FORWARD) (assuming we are facing the log? No we are IN it)
            //   Wait, if we are IN it, we can't really destroy it easily with direction.
            //   Unless we use `blocks.place(AIR, currentPos)`? But we want the agent to do it (for drops etc? or just visual).
            //   The request says "agent cuts it".
            
            // Let's try: Teleport to nearestLog.
            // Actually, `agent.teleport` moves the agent.
            // Let's use `agent.destroy(UP)` and `agent.move(UP)`?
            // But we need to destroy the *current* block.
            // `agent.destroy(DOWN)`?
            
            // Let's try this:
            // Teleport to nearestLog.
            // agent.destroy(FORWARD) - maybe it destroys the block it is standing in if we interpret it right?
            // No, FORWARD is relative.
            
            // Okay, correct strategy:
            // Teleport to the log.
            // But wait, if I teleport to (x,y,z), I am at (x,y,z).
            // If there is a log at (x,y,z), I am inside the log.
            // I can `agent.destroy(UP)` (block above), `agent.destroy(DOWN)` (block below).
            // What about the block I am in?
            // There isn't a "destroy HERE" command usually.
            
            // Maybe I should teleport to y-1?
            // Or just use `blocks.place(AIR, ...)` for the current block and pretend agent did it?
            // Or `agent.collectAll()`?
            
            // Let's assume we can use `agent.destroy(FORWARD)` if we face the log from outside.
            // But finding a safe spot outside is hard.
            
            // Let's try: Teleport to nearestLog.
            // `blocks.place(AIR, nearestLog)` (Cheat a bit for the first block or use agent to break it if possible)
            // Actually, if we teleport the agent, it might break the block it lands on?
            // Let's assume we teleport to the log.
            // Then loop:
            //   agent.destroy(UP)
            //   agent.move(UP)
            //   check if block at agent pos is log (it was destroyed?)
            
            // Wait, if I `agent.destroy(UP)`, I destroy the block above.
            // Then `agent.move(UP)`, I move into that space.
            // What about the bottom-most block?
            // I can teleport to `nearestLog` (which is the bottom one).
            // But I need to destroy it.
            // Maybe `agent.destroy(DOWN)` after moving up?
            
            // Revised Plan:
            // 1. Teleport to nearestLog.
            // 2. `agent.destroy(FORWARD)` (Just in case)
            // 3. `blocks.place(AIR, nearestLog)` // Force break the bottom one if agent didn't.
            // 4. Loop:
            //      if block above is log:
            //          agent.destroy(UP)
            //          agent.move(UP)
            //      else:
            //          break
            
            // Actually, `agent.destroy(direction)` works.
            // If I am at (x,y,z), `agent.destroy(UP)` breaks (x,y+1,z).
            // So:
            // 1. Teleport to (x, y, z) (The bottom log).
            // 2. `blocks.place(AIR, pos(x,y,z))` // Break the one we are standing in.
            // 3. Loop while block at (x, y+1, z) is log:
            //      agent.destroy(UP)
            //      agent.move(UP)
            
            // Let's refine the "is log" check to a function or array check.
            
            // Also, we need to import `blocks`, `agent`, `player`, `positions`.
            
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
            break // Only cut one tree
        }
    } else {
        player.say("No tree found nearby")
    }
})
