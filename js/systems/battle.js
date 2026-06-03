/* ===== 战斗系统（无限流世界版） ===== */
const BattleSystem = {
    // 公共方法：进行一场战斗（回合制）
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

        // 先攻判定
        let playerFirst = stats.speed >= enemy.speed;

        // 回合制战斗
        while (round < 100) { // 最多100回合防死循环
            round++;

            const attacker = playerFirst ? 'player' : 'enemy';
            const defender = playerFirst ? 'enemy' : 'player';

            // BOSS第3回合大招（如果BOSS存在此机制）
            if (stage.isBoss && round === 3) {
                const bossDamage = this._calcBossSpecial(enemy, stats);
                playerHP -= bossDamage.damage;
                log.push({
                    round,
                    actor: 'enemy',
                    action: 'special',
                    damage: bossDamage.damage,
                    isCrit: false,
                    isMiss: false,
                    isSpecial: true,
                    specialName: 'BOSS大招',
                    remainingHP: Math.max(0, playerHP)
                });

                if (playerHP <= 0) {
                    return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
                }
                // 大招后仍然继续正常回合（BOSS额外行动）
            }

            // 玩家回合
            if (attacker === 'player') {
                const result = this._calcDamage(stats, enemy, true, gameState, stage);
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
                    return this._handleWin(gameState, stage, enemyPower, stats, log, round);
                }
            }
            // 敌人回合
            else {
                const result = this._calcDamage(enemy, stats, false, gameState, stage);
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
                    return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
                }
            }

            // 交换先手（下回合另一方先攻）
            playerFirst = !playerFirst;
        }

        // 超过100回合，判定为失败（超时）
        return this._handleLoss(gameState, stage, enemyPower, stats, log, round);
    },

    // 内部：计算敌人属性
    _calcEnemyStats: function(enemyPower, isBoss) {
        // 敌人属性基于战力分配
        const attackRatio = isBoss ? 0.6 : 0.7;
        const defenseRatio = isBoss ? 0.4 : 0.3;

        const power = Math.floor(enemyPower * attackRatio);
        const defense = Math.floor(enemyPower * defenseRatio);

        // 敌人HP = 战力 × 系数（BOSS更高）
        const hpMultiplier = isBoss ? 3.0 : 2.0;
        const hp = Math.floor(enemyPower * hpMultiplier);

        // 敌人速度 = 战力 / 100（基础）
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

    // 内部：计算单次攻击伤害
    _calcDamage: function(attacker, defender, isPlayer, gameState, stage) {
        // 基础伤害 = 攻击者攻击力 - 防御者防御力（至少为1）
        let damage = Math.max(1, attacker.power - defender.defense * 0.5);

        // 对BOSS增伤（r_004 火焰宝石: +20%对BOSS伤害）
        if (isPlayer && stage && stage.isBoss && gameState) {
            const hasFlameGem = gameState.cards['r_004'] && gameState.cards['r_004'].count > 0;
            if (hasFlameGem) {
                damage = Math.floor(damage * 1.2);
            }
        }

        // 暴击判定
        let isCrit = false;
        const critRate = attacker.critRate || 0;
        if (critRate > 0 && Math.random() * 100 < critRate) {
            isCrit = true;
            const critDamage = attacker.critDamage || 50;
            damage = Math.floor(damage * (1 + critDamage / 100));
        }

        // 闪避判定（玩家被攻击时）
        let isMiss = false;
        if (!isPlayer) {
            // 基础闪避：速度差值
            const speedDodge = Math.max(0, (defender.speed || 0) - (attacker.speed || 0));
            // 卡牌闪避加成（r_005 疾风靴等）
            let cardDodge = 0;
            if (gameState && typeof StatSystem !== 'undefined' && StatSystem.getDodgeRate) {
                cardDodge = StatSystem.getDodgeRate(gameState);
            }
            const totalDodge = speedDodge + cardDodge;
            if (totalDodge > 0 && Math.random() * 100 < Math.min(totalDodge, 50)) {
                isMiss = true;
                damage = 0;
            }
        }

        return { damage: Math.floor(damage), isCrit, isMiss };
    },

    // 内部：BOSS特殊攻击（第3回合大招）
    _calcBossSpecial: function(enemy, playerStats) {
        // BOSS大招 = 普通攻击 × 1.5（无视部分防御）
        const damage = Math.max(1, Math.floor(enemy.power * 1.5 - playerStats.defense * 0.3));
        return { damage };
    },

    // 内部：处理胜利
    _handleWin: function(gameState, stage, enemyPower, playerStats, log, rounds) {
        const goldReward = stage.reward.gold;
        const ticketReward = stage.reward.tickets;

        gameState.gold += goldReward;
        gameState.tickets += ticketReward;
        gameState.stats.goldTotal += goldReward;
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

        // sr_005 灵魂契约: 击败敌人时20%概率再抽1次
        let extraDraw = null;
        const hasSoulContract = gameState.cards['sr_005'] && gameState.cards['sr_005'].count > 0;
        if (hasSoulContract && Math.random() < 0.2) {
            extraDraw = this._dropCard(gameState, stage.world);
        }

        // sr_003 聚宝盆: 每10关额外获得抽卡券
        let extraTickets = 0;
        const hasTreasureBowl = gameState.cards['sr_003'] && gameState.cards['sr_003'].count > 0;
        if (hasTreasureBowl && stage.totalStage % 10 === 0) {
            extraTickets = 1;
            gameState.tickets += extraTickets;
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
            reward: { gold: goldReward, tickets: ticketReward + extraTickets },
            droppedCard: droppedCard,
            extraDraw: extraDraw,
            extraTickets: extraTickets,
            isBoss: stage.isBoss || false,
            log,
            rounds
        };
    },

    // 内部：处理失败
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

    // 内部：战斗掉落卡牌
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
        card.level = 1;

        // 添加到玩家库存
        if (!gameState.cards[card.id]) {
            gameState.cards[card.id] = { count: 0, level: 1, instances: [] };
        }
        gameState.cards[card.id].count++;
        gameState.cards[card.id].instances.push(card.uid);

        // 记录稀有度获得
        if (!gameState.stats.rarityObtained[card.rarity]) {
            gameState.stats.rarityObtained[card.rarity] = true;
        }

        return card;
    },

    // 公共方法：获取当前关卡信息
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

    // 公共方法：获取指定关卡信息（用于预览/选择）
    getStageInfo: function(gameState, world, subStage) {
        return STAGE_CONFIG.generate(world, subStage);
    },

    // 公共方法：恢复玩家HP（战斗后调用）
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
