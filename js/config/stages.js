/* ===== 竞技关卡配置 ===== */
const STAGE_CONFIG = {
    // 关卡生成规则
    generate: function(stage) {
        // 敌人战力 = 基础值 * 增长系数^(关卡-1) * 难度曲线调整
        const basePower = 80;
        const growthRate = 1.12; // 降低增长率(原1.15)
        const enemyPower = Math.floor(basePower * Math.pow(growthRate, stage - 1));

        // 奖励 = 基础奖励 * 关卡数 * 增长系数
        const baseGold = 15;
        const baseTickets = 0.05; // 提高券掉落(原0.02)

        return {
            stage: stage,
            enemyPower: enemyPower,
            reward: {
                gold: Math.floor(baseGold * stage * (1 + stage * 0.015)),
                tickets: Math.max(1, Math.floor(baseTickets * stage)) // 至少1张券
            },
            // 每10关一个BOSS，战力额外+30%(原50%)
            isBoss: stage % 10 === 0,
            bossMultiplier: stage % 10 === 0 ? 1.3 : 1.0
        };
    },

    // 预设关卡（前10关固定，之后用生成规则）
    preset: [
        { stage: 1, enemyPower: 50, reward: { gold: 20, tickets: 1 } },
        { stage: 2, enemyPower: 70, reward: { gold: 25, tickets: 1 } },
        { stage: 3, enemyPower: 95, reward: { gold: 30, tickets: 1 } },
        { stage: 4, enemyPower: 125, reward: { gold: 35, tickets: 1 } },
        { stage: 5, enemyPower: 165, reward: { gold: 45, tickets: 1 } },
        { stage: 6, enemyPower: 210, reward: { gold: 55, tickets: 1 } },
        { stage: 7, enemyPower: 270, reward: { gold: 65, tickets: 2 } },
        { stage: 8, enemyPower: 340, reward: { gold: 80, tickets: 2 } },
        { stage: 9, enemyPower: 430, reward: { gold: 95, tickets: 2 } },
        { stage: 10, enemyPower: 600, reward: { gold: 150, tickets: 3 }, isBoss: true, bossMultiplier: 1.3 }
    ],

    // 获取关卡信息
    getStage: function(stageNum) {
        if (stageNum <= this.preset.length) {
            return this.preset[stageNum - 1];
        }
        return this.generate(stageNum);
    }
};
