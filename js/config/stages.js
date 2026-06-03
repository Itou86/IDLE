/* ===== 无限流世界关卡配置 ===== */
const STAGE_CONFIG = {
    // 世界基础配置
    SUB_STAGES_PER_WORLD: 6,    // 每个世界6个子关卡
    BOSS_STAGE: 6,              // 第6关为BOSS关
    UNLOCK_NEXT_WORLD_AT: 5,    // 通关第5关即可进入下一世界

    // 难度参数
    BASE_POWER: 40,             // 基础敌人战力
    GROWTH_RATE: 1.18,          // 增长系数
    BOSS_MULTIPLIER: 1.3,       // BOSS战力倍率
    BOSS_HP_MULTIPLIER: 3.0,    // BOSS HP倍率（普通关为2.0）

    // 奖励参数
    BASE_GOLD: 15,
    BASE_TICKETS: 0.05,

    // ===== 关卡生成 =====

    // 公共方法：生成指定世界和子关卡的敌人属性
    generate: function(world, subStage) {
        world = parseInt(world, 10) || 1;
        subStage = parseInt(subStage, 10) || 1;

        // 总进度偏移 = (世界-1)*3 + 子关卡-1
        // 每个世界贡献3关的等效进度，使世界N+1第1关 ≈ 世界N第4关
        const totalOffset = (world - 1) * 3 + (subStage - 1);
        const enemyPower = Math.floor(this.BASE_POWER * Math.pow(this.GROWTH_RATE, totalOffset));

        const isBoss = subStage === this.BOSS_STAGE;
        const bossMultiplier = isBoss ? this.BOSS_MULTIPLIER : 1.0;
        const actualEnemyPower = Math.floor(enemyPower * bossMultiplier);

        // 奖励计算
        const totalStageNum = (world - 1) * this.SUB_STAGES_PER_WORLD + subStage;
        const goldReward = Math.floor(this.BASE_GOLD * totalStageNum * (1 + totalStageNum * 0.015));
        const ticketReward = Math.max(1, Math.floor(this.BASE_TICKETS * totalStageNum));

        return {
            world: world,
            subStage: subStage,
            stage: totalStageNum,  // 向后兼容：总关卡编号
            totalStage: totalStageNum,
            enemyPower: actualEnemyPower,
            rawPower: enemyPower,
            reward: {
                gold: goldReward,
                tickets: ticketReward
            },
            isBoss: isBoss,
            bossMultiplier: bossMultiplier,
            // BOSS额外信息
            bossInfo: isBoss ? {
                name: `${this.getWorldName(world)}·BOSS`,
                specialMove: '第3回合释放大招',
                hpMultiplier: this.BOSS_HP_MULTIPLIER
            } : null
        };
    },

    // 公共方法：获取世界名称（占位，后续替换为实际作品名）
    getWorldName: function(world) {
        const worldNames = {
            1: '世界1'
        };
        return worldNames[world] || `世界${world}`;
    },

    // 公共方法：获取关卡信息（兼容旧版接口）
    getStage: function(world, subStage) {
        return this.generate(world, subStage);
    },

    // 公共方法：获取当前可挑战的关卡信息
    getCurrentStageInfo: function(gameState) {
        const world = gameState.world || 1;
        const subStage = gameState.subStage || 1;
        return this.generate(world, subStage);
    },

    // 公共方法：检查是否可以进入下一世界
    canUnlockNextWorld: function(gameState) {
        const world = gameState.world || 1;
        const progress = gameState.worldProgress || {};
        const highestSubStage = progress[world] || 0;
        return highestSubStage >= this.UNLOCK_NEXT_WORLD_AT;
    },

    // 公共方法：检查指定关卡是否已解锁
    isStageUnlocked: function(gameState, world, subStage) {
        const currentWorld = gameState.world || 1;
        const currentSubStage = gameState.subStage || 1;
        const progress = gameState.worldProgress || {};

        // 当前世界及之前的世界
        if (world < currentWorld) return true;
        if (world > currentWorld) {
            // 检查是否已通过前一世界第5关
            const prevWorldProgress = progress[currentWorld] || 0;
            return world === currentWorld + 1 && prevWorldProgress >= this.UNLOCK_NEXT_WORLD_AT;
        }
        // 同一世界
        return subStage <= (progress[world] || 0) + 1;
    },

    // 公共方法：计算总关卡数（用于成就等）
    getTotalStage: function(gameState) {
        const world = gameState.world || 1;
        const subStage = gameState.subStage || 1;
        return (world - 1) * this.SUB_STAGES_PER_WORLD + subStage;
    }
};

// 向后兼容：旧测试访问的 preset 属性
STAGE_CONFIG.preset = [];
