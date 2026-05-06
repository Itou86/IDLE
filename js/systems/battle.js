/* ===== 竞技系统 ===== */
const BattleSystem = {
    // 进行一场竞技
    fight: function(gameState) {
        const stage = STAGE_CONFIG.getStage(gameState.stage);
        const playerStats = GachaSystem.getTotalPower(gameState);
        const enemyPower = Math.floor(stage.enemyPower * (stage.bossMultiplier || 1));

        // 简单战力对比：玩家战力 vs 敌人战力
        // 防御力减少受到的伤害
        const effectivePlayerPower = playerStats.power + playerStats.defense * 0.5;
        const win = effectivePlayerPower >= enemyPower;

        if (win) {
            // 胜利奖励
            const goldReward = stage.reward.gold;
            const ticketReward = stage.reward.tickets;

            gameState.gold += goldReward;
            gameState.tickets += ticketReward;
            gameState.stats.goldTotal += goldReward;
            gameState.stats.battleWin++;
            gameState.stage++; // 进入下一关
            gameState.stats.loseStreak = 0;

            return {
                win: true,
                stage: stage.stage,
                enemyPower: enemyPower,
                playerPower: Math.floor(effectivePlayerPower),
                reward: { gold: goldReward, tickets: ticketReward },
                isBoss: stage.isBoss || false
            };
        } else {
            gameState.stats.battleLose++;
            gameState.stats.loseStreak++;

            return {
                win: false,
                stage: stage.stage,
                enemyPower: enemyPower,
                playerPower: Math.floor(effectivePlayerPower),
                isBoss: stage.isBoss || false
            };
        }
    },

    // 获取当前关卡信息
    getCurrentStageInfo: function(gameState) {
        const stage = STAGE_CONFIG.getStage(gameState.stage);
        const playerStats = GachaSystem.getTotalPower(gameState);
        return {
            stage: stage.stage,
            enemyPower: Math.floor(stage.enemyPower * (stage.bossMultiplier || 1)),
            playerPower: Math.floor(playerStats.power + playerStats.defense * 0.5),
            reward: stage.reward,
            isBoss: stage.isBoss || false
        };
    }
};
