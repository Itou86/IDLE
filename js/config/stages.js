/* ===== 竞技关卡配置 ===== */
const STAGE_CONFIG = {
    // 关卡生成规则
    generate: function(stage) {
        // 敌人战力 = 基础值 * 增长系数^(关卡-1)
        const basePower = 100;
        const growthRate = 1.15;
        const enemyPower = Math.floor(basePower * Math.pow(growthRate, stage - 1));

        // 奖励 = 基础奖励 * 关卡数
        const baseGold = 10;
        const baseTickets = 0.02; // 每50关约1张券

        return {
            stage: stage,
            enemyPower: enemyPower,
            reward: {
                gold: Math.floor(baseGold * stage * (1 + stage * 0.02)),
                tickets: Math.floor(baseTickets * stage)
            },
            // 每10关一个BOSS，战力额外+50%
            isBoss: stage % 10 === 0,
            bossMultiplier: stage % 10 === 0 ? 1.5 : 1.0
        };
    },

    // 预设关卡（前10关固定，之后用生成规则）
    preset: [
        { stage: 1, enemyPower: 80, reward: { gold: 15, tickets: 0 } },
        { stage: 2, enemyPower: 100, reward: { gold: 20, tickets: 0 } },
        { stage: 3, enemyPower: 130, reward: { gold: 25, tickets: 0 } },
        { stage: 4, enemyPower: 170, reward: { gold: 30, tickets: 0 } },
        { stage: 5, enemyPower: 220, reward: { gold: 40, tickets: 0 } },
        { stage: 6, enemyPower: 280, reward: { gold: 50, tickets: 0 } },
        { stage: 7, enemyPower: 360, reward: { gold: 60, tickets: 0 } },
        { stage: 8, enemyPower: 460, reward: { gold: 75, tickets: 0 } },
        { stage: 9, enemyPower: 590, reward: { gold: 90, tickets: 0 } },
        { stage: 10, enemyPower: 1000, reward: { gold: 150, tickets: 1 }, isBoss: true, bossMultiplier: 1.5 }
    ],

    // 获取关卡信息
    getStage: function(stageNum) {
        if (stageNum <= this.preset.length) {
            return this.preset[stageNum - 1];
        }
        return this.generate(stageNum);
    }
};
