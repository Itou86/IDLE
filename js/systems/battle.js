/* ===== 战斗系统 ===== */
const BattleSystem = {
    // 进行一场战斗（回合制）
    fight: function(gameState) {
        const stage = STAGE_CONFIG.getStage(gameState.stage);
        const stats = this._getPlayerStats(gameState);
        const enemyPower = Math.floor(stage.enemyPower * (stage.bossMultiplier || 1));

        // 计算敌人属性（基于敌人战力）
        const enemy = this._calcEnemyStats(enemyPower, stage.isBoss || false);

        // 战斗记录
        const log = [];
        let round = 0;
        let playerHP = stats.hp;
        let enemyHP = enemy.hp;

        // 先攻判定
        let playerFirst = stats.speed >= enemy.speed;

        // 回合制战斗
        while (round < 100) { // 最多100回合防死循环
            round++;

            const attacker = playerFirst ? 'player' : 'enemy';
            const defender = playerFirst ? 'enemy' : 'player';

            // 玩家回合
            if (attacker === 'player') {
                const result = this._calcDamage(stats, enemy, true);
                enemyHP -= result.damage;
                log.push({
                    round,
                    actor: 'player',
                    action: result.isCrit ? 'crit' : 'attack',
                    damage: result.damage,
                    isCrit: result.isCrit,
                    isMiss: false,
                    remainingHP: Math.max(0, enemyHP)
                });

                if (enemyHP <= 0) {
                    // 胜利
                    return this._handleWin(gameState, stage, enemyPower, stats, log, round);
                }
            }
            // 敌人回合
            else {
                const result = this._calcDamage(enemy, stats, false);
                playerHP -= result.damage;
                log.push({
                    round,
                    actor: 'enemy',
                    action: result.isCrit ? 'crit' : 'attack',
                    damage: result.damage,
                    isCrit: result.isCrit,
                    isMiss: result.isMiss,
                    remainingHP: Math.max(0, playerHP)
                });

                if (playerHP <= 0) {
                    // 失败
                    return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
                }
            }

            // 交换先手（下回合另一方先攻）
            playerFirst = !playerFirst;
        }

        // 超过100回合，判定为失败（超时）
        return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
    },

    // 计算敌人属性
    _calcEnemyStats: function(enemyPower, isBoss) {
        // 敌人属性基于战力分配
        // 假设敌人：攻击70%，防御30%，无特殊属性
        const attackRatio = isBoss ? 0.6 : 0.7;
        const defenseRatio = isBoss ? 0.4 : 0.3;

        const power = Math.floor(enemyPower * attackRatio);
        const defense = Math.floor(enemyPower * defenseRatio);

        // 敌人HP = 战力 × 系数（BOSS更高）
        const hpMultiplier = isBoss ? 3.0 : 2.0;
        const hp = Math.floor(enemyPower * hpMultiplier);

        // 敌人速度 = 战力 / 10（基础）
        const speed = Math.max(1, Math.floor(enemyPower / 100));

        // BOSS有低概率暴击
        const critRate = isBoss ? 5 : 0;

        return {
            power,
            defense,
            hp,
            speed,
            critRate,
            critDamage: 50 // 暴击伤害加成50%
        };
    },

    // 计算单次攻击伤害
    _calcDamage: function(attacker, defender, isPlayer) {
        // 基础伤害 = 攻击者攻击力 - 防御者防御力（至少为1）
        let damage = Math.max(1, attacker.power - defender.defense * 0.5);

        // 暴击判定
        let isCrit = false;
        const critRate = attacker.critRate || 0;
        if (critRate > 0 && Math.random() * 100 < critRate) {
            isCrit = true;
            const critDamage = attacker.critDamage || 50;
            damage = Math.floor(damage * (1 + critDamage / 100));
        }

        // 闪避判定（玩家对敌人时，敌人无闪避）
        let isMiss = false;
        if (!isPlayer) {
            // 玩家被攻击时，检查玩家闪避（速度差值）
            const dodgeRate = Math.max(0, (defender.speed || 0) - (attacker.speed || 0));
            if (dodgeRate > 0 && Math.random() * 100 < Math.min(dodgeRate, 20)) {
                isMiss = true;
                damage = 0;
            }
        }

        return { damage: Math.floor(damage), isCrit, isMiss };
    },

    // 处理胜利
    _handleWin: function(gameState, stage, enemyPower, playerStats, log, rounds) {
        const goldReward = stage.reward.gold;
        const ticketReward = stage.reward.tickets;

        gameState.gold += goldReward;
        gameState.tickets += ticketReward;
        gameState.stats.goldTotal += goldReward;
        gameState.stats.battleWin++;
        gameState.stage++;
        gameState.stats.loseStreak = 0;

        // 每关恢复（战后恢复，下一场战斗开始时生效）
        // 这里不直接恢复，由调用方在战斗后处理

        return {
            win: true,
            stage: stage.stage,
            enemyPower,
            playerPower: playerStats.effectivePower,
            playerHP: playerStats.hp, // 满血状态（战后已恢复）
            enemyHP: 0,
            reward: { gold: goldReward, tickets: ticketReward },
            isBoss: stage.isBoss || false,
            log,
            rounds
        };
    },

    // 处理失败
    _handleLoss: function(gameState, stage, enemyPower, playerStats, log, rounds) {
        gameState.stats.battleLose++;
        gameState.stats.loseStreak++;

        return {
            win: false,
            stage: stage.stage,
            enemyPower,
            playerPower: playerStats.effectivePower,
            playerHP: 0,
            enemyHP: log.length > 0 ? log[log.length - 1].remainingHP : 0,
            isBoss: stage.isBoss || false,
            log,
            rounds
        };
    },

    // 获取当前关卡信息
    getCurrentStageInfo: function(gameState) {
        const stage = STAGE_CONFIG.getStage(gameState.stage);
        const stats = this._getPlayerStats(gameState);
        const enemyPower = Math.floor(stage.enemyPower * (stage.bossMultiplier || 1));
        const enemy = this._calcEnemyStats(enemyPower, stage.isBoss || false);

        return {
            stage: stage.stage,
            enemyPower,
            enemyHP: enemy.hp,
            enemyAttack: enemy.power,
            enemyDefense: enemy.defense,
            enemySpeed: enemy.speed,
            playerPower: stats.effectivePower,
            playerHP: stats.hp,
            playerAttack: stats.power,
            playerDefense: stats.defense,
            playerSpeed: stats.speed,
            playerCritRate: stats.critRate,
            reward: stage.reward,
            isBoss: stage.isBoss || false
        };
    },

    // 恢复玩家HP（战斗后调用）
    healAfterBattle: function(gameState) {
        // 简化：每次战斗后恢复到满血
        // 如果要实现残血机制，需要把当前HP存入gameState
        return true;
    },

    // 内部：获取玩家属性（兼容测试环境）
    _getPlayerStats: function(gameState) {
        // 如果 StatSystem 可用，使用新属性系统
        if (typeof StatSystem !== 'undefined' && StatSystem.getCharacterStats) {
            return StatSystem.getCharacterStats(gameState);
        }
        
        // 降级：使用旧版 getTotalPower
        const oldStats = GachaSystem.getTotalPower(gameState);
        return {
            power: oldStats.power || 10,
            defense: oldStats.defense || 0,
            effectivePower: (oldStats.power || 10) + (oldStats.defense || 0) * 0.5,
            hp: 200,
            hpRegen: 50,
            goldBonus: 0,
            ticketBonus: 0,
            dropRate: 0,
            critRate: 0,
            critDamage: 50,
            speed: 5,
            expBonus: 0
        };
    }
};