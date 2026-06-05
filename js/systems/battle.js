/* ===== 战斗系统（简化回合制 - 方案B） ===== */
const BattleSystem = {
    // 进行一场战斗（回合制）
    // world, subStage: 可选，挑战指定关卡；不传则挑战当前进度关卡
    fight: function(gameState, world, subStage) {
        // 向后兼容：如果只传一个参数，视为旧版线性关卡号
        if (subStage === undefined && typeof world === 'number') {
            const linearStage = world;
            world = Math.floor((linearStage - 1) / STAGE_CONFIG.SUB_STAGES_PER_WORLD) + 1;
            subStage = ((linearStage - 1) % STAGE_CONFIG.SUB_STAGES_PER_WORLD) + 1;
        }
        world = world || gameState.world || 1;
        subStage = subStage || gameState.subStage || 1;

        const stage = STAGE_CONFIG.generate(world, subStage);
        const stats = this._getPlayerStats(gameState);
        const enemyPower = Math.floor(stage.enemyPower * (stage.bossMultiplier || 1));

        // 计算敌人属性（基于敌人战力）
        const enemy = this._calcEnemyStats(enemyPower, stage.isBoss || false);

        // 战斗记录
        const log = [];
        let round = 0;
        let playerHP = stats.hp;
        let enemyHP = enemy.hp;

        // 先攻一次性判定：speed 高者先攻，相同则玩家先攻
        const playerFirst = stats.speed >= enemy.speed;

        // 回合制战斗
        while (round < 100) { // 最多100回合防死循环
            round++;

            // 先攻方攻击
            const firstAttacker = playerFirst ? stats : enemy;
            const firstDefender = playerFirst ? enemy : stats;
            const firstIsPlayer = playerFirst;

            // BOSS 每3回合一次额外攻击
            if (stage.isBoss && round % 3 === 0) {
                const bossExtra = this._calcDamage(enemy, stats, false, gameState, stage);
                playerHP -= bossExtra.damage;
                log.push({
                    round,
                    actor: 'enemy',
                    action: bossExtra.isCrit ? 'crit' : 'attack',
                    damage: bossExtra.damage,
                    isCrit: bossExtra.isCrit,
                    isExtra: true,
                    remainingHP: Math.max(0, playerHP)
                });

                if (playerHP <= 0) {
                    return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
                }
            }

            // 先攻方回合
            const firstResult = this._calcDamage(firstAttacker, firstDefender, firstIsPlayer, gameState, stage);
            if (firstIsPlayer) {
                enemyHP -= firstResult.damage;
                log.push({
                    round,
                    actor: 'player',
                    action: firstResult.isCrit ? 'crit' : 'attack',
                    damage: firstResult.damage,
                    isCrit: firstResult.isCrit,
                    remainingHP: Math.max(0, enemyHP)
                });
                if (enemyHP <= 0) {
                    return this._handleWin(gameState, stage, enemyPower, stats, log, round);
                }
            } else {
                playerHP -= firstResult.damage;
                log.push({
                    round,
                    actor: 'enemy',
                    action: firstResult.isCrit ? 'crit' : 'attack',
                    damage: firstResult.damage,
                    isCrit: firstResult.isCrit,
                    remainingHP: Math.max(0, playerHP)
                });
                if (playerHP <= 0) {
                    return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
                }
            }

            // 后攻方回合
            const secondAttacker = playerFirst ? enemy : stats;
            const secondDefender = playerFirst ? stats : enemy;
            const secondIsPlayer = !playerFirst;

            const secondResult = this._calcDamage(secondAttacker, secondDefender, secondIsPlayer, gameState, stage);
            if (secondIsPlayer) {
                enemyHP -= secondResult.damage;
                log.push({
                    round,
                    actor: 'player',
                    action: secondResult.isCrit ? 'crit' : 'attack',
                    damage: secondResult.damage,
                    isCrit: secondResult.isCrit,
                    remainingHP: Math.max(0, enemyHP)
                });
                if (enemyHP <= 0) {
                    return this._handleWin(gameState, stage, enemyPower, stats, log, round);
                }
            } else {
                playerHP -= secondResult.damage;
                log.push({
                    round,
                    actor: 'enemy',
                    action: secondResult.isCrit ? 'crit' : 'attack',
                    damage: secondResult.damage,
                    isCrit: secondResult.isCrit,
                    remainingHP: Math.max(0, playerHP)
                });
                if (playerHP <= 0) {
                    return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
                }
            }
        }

        // 超过100回合，判定为失败（超时）
        return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
    },

    // 计算敌人属性
    _calcEnemyStats: function(enemyPower, isBoss) {
        // 敌人属性基于战力分配
        const attackRatio = isBoss ? 0.6 : 0.7;
        const defenseRatio = isBoss ? 0.4 : 0.3;

        const power = Math.floor(enemyPower * attackRatio);
        const defense = Math.floor(enemyPower * defenseRatio);

        // 敌人HP = 战力 x 系数（BOSS更高）
        const hpMultiplier = isBoss ? 3.0 : 2.0;
        const hp = Math.floor(enemyPower * hpMultiplier);

        // 敌人速度 = 战力 / 100（基础）
        const speed = Math.max(1, Math.floor(enemyPower / 100));

        return {
            power,
            defense,
            hp,
            speed,
            critRate: 5,      // 固定5%暴击率
            critDamage: 1.5   // 暴击伤害倍率1.5x
        };
    },

    // 计算单次攻击伤害
    _calcDamage: function(attacker, defender, isPlayer, gameState, stage) {
        // 基础伤害 = 攻击者攻击力 - 防御者防御力（至少为1）
        let damage = Math.max(1, attacker.power - defender.defense);

        // 暴击判定
        let isCrit = false;
        const critRate = attacker.critRate || 0;
        if (critRate > 0 && Math.random() * 100 < critRate) {
            isCrit = true;
            const critDamage = attacker.critDamage || 1.5;
            damage = Math.floor(damage * critDamage);
        }

        // EffectRegistry 触发（替代硬编码卡牌效果）
        if (gameState && stage && typeof EffectRegistry !== 'undefined' && EffectRegistry.trigger) {
            const context = { damage, isPlayer, isBoss: stage.isBoss || false };
            EffectRegistry.trigger('on_damage_calc', gameState, context);
            damage = context.damage;
        }

        return { damage: Math.floor(damage), isCrit };
    },

    // 处理胜利
    _handleWin: function(gameState, stage, enemyPower, playerStats, log, rounds) {
        const pointsReward = stage.reward.points;
        const shardReward = stage.reward.shards;

        gameState.points += pointsReward;
        gameState.shards += shardReward;
        gameState.stats.pointsTotal += pointsReward;
        gameState.stats.battleWin++;
        gameState.stats.loseStreak = 0;

        // 更新世界进度
        if (!gameState.worldProgress) {
            gameState.worldProgress = {};
        }
        const currentProgress = gameState.worldProgress[stage.world] || 0;
        if (stage.subStage > currentProgress) {
            gameState.worldProgress[stage.world] = stage.subStage;
        }

        // 推进到下一关（如果是当前进度关）
        if (stage.world === gameState.world && stage.subStage === gameState.subStage) {
            if (stage.subStage < STAGE_CONFIG.SUB_STAGES_PER_WORLD) {
                gameState.subStage = stage.subStage + 1;
            }
            // 第6关通关后停在原地（等玩家选择下一世界）
        }

        // 战斗掉落卡牌
        const droppedCard = this._dropCard(gameState, stage.world);

        // EffectRegistry 触发击杀效果（替代硬编码）
        let extraDraw = null;
        let extraShards = 0;

        if (typeof EffectRegistry !== 'undefined' && EffectRegistry.trigger) {
            const killContext = { totalStage: stage.totalStage };
            EffectRegistry.trigger('on_kill', gameState, killContext);

            // kill_extra_drop: 额外掉落
            if (killContext.killExtraDropChance > 0 && Math.random() < killContext.killExtraDropChance) {
                const dropCount = killContext.killExtraDropCount || 1;
                for (let i = 0; i < dropCount; i++) {
                    extraDraw = this._dropCard(gameState, stage.world);
                }
            }

            // stage_ticket_bonus: 每N关额外碎片
            if (killContext.stageTicketInterval && stage.totalStage % killContext.stageTicketInterval === 0) {
                extraShards = killContext.stageTicketBonus || 0;
                if (extraShards > 0) {
                    gameState.shards += extraShards;
                }
            }
        }

        // 记录绝地反击（hid_008）
        if (playerStats.effectivePower < enemyPower * 0.9) {
            gameState.stats.underdogWin = true;
        }

        return {
            win: true,
            stage: stage.stage,  // 向后兼容：总关卡编号
            world: stage.world,
            subStage: stage.subStage,
            totalStage: stage.totalStage,
            enemyPower,
            playerPower: playerStats.effectivePower,
            playerHP: playerStats.hp,
            enemyHP: 0,
            reward: { points: pointsReward, shards: shardReward + extraShards },
            droppedCard: droppedCard,
            extraDraw: extraDraw,
            extraShards: extraShards,
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
            stage: stage.stage,  // 向后兼容
            world: stage.world,
            subStage: stage.subStage,
            totalStage: stage.totalStage,
            enemyPower,
            playerPower: playerStats.effectivePower,
            playerHP: 0,
            enemyHP: log.length > 0 ? log[log.length - 1].remainingHP : 0,
            droppedCard: null,
            isBoss: stage.isBoss || false,
            log,
            rounds
        };
    },

    // 战斗掉落卡牌
    _dropCard: function(gameState, worldId) {
        // 按稀有度概率掉落
        const rand = Math.random();
        let rarity;
        if (rand < 0.60) rarity = 'N';
        else if (rand < 0.85) rarity = 'R';
        else if (rand < 0.95) rarity = 'SR';
        else rarity = 'SSR';

        const pool = CARD_CONFIG.getWorldCardsByRarity(worldId, rarity);
        if (pool.length === 0) return null;

        const card = Formatter.clone(pool[Math.floor(Math.random() * pool.length)]);
        card.uid = Formatter.uid();
        GameUtils.addCardToInventory(gameState, card);

        return card;
    },

    // 获取当前关卡信息
    getCurrentStageInfo: function(gameState) {
        const world = gameState.world || 1;
        const subStage = gameState.subStage || 1;
        const stage = STAGE_CONFIG.generate(world, subStage);
        const stats = this._getPlayerStats(gameState);
        const enemyPower = Math.floor(stage.enemyPower * (stage.bossMultiplier || 1));
        const enemy = this._calcEnemyStats(enemyPower, stage.isBoss || false);

        return {
            world: stage.world,
            subStage: stage.subStage,
            totalStage: stage.totalStage,
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
            isBoss: stage.isBoss || false,
            isUnlocked: STAGE_CONFIG.isStageUnlocked(gameState, world, subStage),
            canUnlockNextWorld: STAGE_CONFIG.canUnlockNextWorld(gameState)
        };
    },

    // 获取指定关卡信息（用于预览/选择）
    getStageInfo: function(gameState, world, subStage) {
        return STAGE_CONFIG.generate(world, subStage);
    },

    // 恢复玩家HP（战斗后调用）
    healAfterBattle: function(gameState) {
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
            pointsBonus: 0,
            shardBonus: 0,
            dropRate: 0,
            critRate: 5,
            critDamage: 1.5,
            speed: 5,
            expBonus: 0
        };
    }
};
