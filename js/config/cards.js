/* ===== 卡牌配置 ===== */
const CARD_CONFIG = {
    // 稀有度概率
    rates: {
        N: 0.60,    // 60%
        R: 0.25,    // 25%
        SR: 0.10,   // 10%
        SSR: 0.05   // 5%
    },

    // 稀有度颜色/样式映射（供UI使用）
    rarityStyle: {
        N:   { color: '#888',  name: '普通' },
        R:   { color: '#4fc3f7', name: '稀有' },
        SR:  { color: '#ba68c8', name: '史诗' },
        SSR: { color: '#ffd54f', name: '传说' }
    },

    // ===== 世界配置 =====
    // 无限流世界观：穿越到实际存在的作品世界
    // 每个IP的第一个作品编号为1，后续续作依次递增
    worlds: [
        {
            id: 1,
            name: '生化危机1',
            description: '浣熊市洋馆事件，S.T.A.R.S.小队的首次生化恐怖遭遇',
            cardIds: [
                'n_001', 'n_002', 'n_003', 'n_004', 'n_005', 'n_006', 'n_007', 'n_008',
                'r_001', 'r_002', 'r_003', 'r_004', 'r_005', 'r_006',
                'sr_001', 'sr_002', 'sr_003', 'sr_004', 'sr_005',
                'ssr_001', 'ssr_002', 'ssr_003', 'ssr_004'
            ],
            sets: [
                { setId: '1-survival-gear', ids: ['n_001', 'n_002'], name: '生存基础套装', bonus: { power: 5 } },
                { setId: '1-mansion-explorer', ids: ['r_001', 'r_002'], name: '洋馆探索者', bonus: { power: 15, defense: 10 } },
                { setId: '1-stars-gear', ids: ['sr_001', 'sr_002'], name: 'S.T.A.R.S.装备', bonus: { power: 50, defense: 30 } },
                { setId: '1-ultimate-weapon', ids: ['ssr_001', 'ssr_002'], name: '终极武器套装', bonus: { power: 100, pointsBonus: 30 } },
            ],
            completionBonus: {
                half: { cardStatMultiplier: 1.05 },
                full: { cardStatMultiplier: 1.10 }
            }
        },
        {
            id: 2,
            name: '哈利波特与魔法石',
            description: '霍格沃茨魔法学校的第一年，哈利发现魔法世界的冒险',
            cardIds: [
                'n_009', 'n_010', 'n_011',
                'r_007', 'r_008', 'r_009',
                'sr_006', 'sr_007',
                'ssr_005'
            ],
            sets: [
                { setId: '2-hogwarts-freshman', ids: ['n_009', 'n_010', 'n_011'], name: '霍格沃茨新生', bonus: { power: 8, defense: 3 } },
                { setId: '2-deathly-hallows', ids: ['sr_006', 'sr_007', 'ssr_005'], name: '死亡圣器', bonus: { power: 30, hp: 20 } },
            ],
            completionBonus: {
                half: { cardStatMultiplier: 1.05 },
                full: { cardStatMultiplier: 1.10 }
            }
        },
        {
            id: 3,
            name: '进击的巨人',
            description: '墙内人类与巨人的生死对抗，调查兵团的自由之战',
            cardIds: [
                'n_012', 'n_013', 'n_014',
                'r_010', 'r_011', 'r_012',
                'sr_008', 'sr_009',
                'ssr_006'
            ],
            sets: [
                { setId: '3-survey-corps', ids: ['n_012', 'n_013', 'n_014'], name: '调查兵团', bonus: { defense: 5, hpRegen: 5 } },
                { setId: '3-nine-titans', ids: ['sr_008', 'sr_009', 'ssr_006'], name: '九大巨人', bonus: { power: 40, critRate: 3 } },
            ],
            completionBonus: {
                half: { cardStatMultiplier: 1.05 },
                full: { cardStatMultiplier: 1.10 }
            }
        }
    ],

    // 基础卡牌池（所有可用卡牌，保持兼容）
    pool: [
        // ===== 世界1：生化危机1 =====
        // N 卡 - 基础生存道具
        { id: 'n_001', name: '战斗匕首', rarity: 'N', worldId: 1, basePower: 5, effect: 'power', desc: '攻击力 +5' },
        { id: 'n_002', name: '木板', rarity: 'N', worldId: 1, basePower: 3, effect: 'defense', desc: '防御力 +3' },
        { id: 'n_003', name: '手枪弹匣', rarity: 'N', worldId: 1, basePower: 2, effect: 'points', desc: '系统点产出 +2' },
        { id: 'n_004', name: '破碎的武士刀', rarity: 'N', worldId: 1, basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_005', name: '战术腰带', rarity: 'N', worldId: 1, basePower: 4, effect: 'defense', desc: '防御力 +4' },
        { id: 'n_006', name: '急救绷带', rarity: 'N', worldId: 1, basePower: 3, effect: 'heal', desc: '每关恢复 +3' },
        { id: 'n_007', name: '洋馆钥匙', rarity: 'N', worldId: 1, basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_008', name: '墨带', rarity: 'N', worldId: 1, basePower: 1, effect: 'utility', desc: '羁绊素材' },

        // R 卡 - 高级武器/装备
        { id: 'r_001', name: '霰弹枪', rarity: 'R', worldId: 1, basePower: 12, effect: 'power', desc: '攻击力 +12' },
        { id: 'r_002', name: '防暴盾牌', rarity: 'R', worldId: 1, basePower: 10, effect: 'defense', desc: '防御力 +10' },
        { id: 'r_003', name: '化学护目镜', rarity: 'R', worldId: 1, basePower: 5, effect: 'points', desc: '系统点产出 +5' },
        { id: 'r_004', name: '火焰喷射器', rarity: 'R', worldId: 1, basePower: 15, effect: 'power', desc: '攻击力 +15，对BOSS伤害+20%', effects: [{type:'boss_damage_bonus', value:0.2, trigger:'on_damage_calc'}] },
        { id: 'r_005', name: '闪光弹', rarity: 'R', worldId: 1, basePower: 8, effect: 'speed', desc: '速度+8' },
        { id: 'r_006', name: '急救喷雾', rarity: 'R', worldId: 1, basePower: 8, effect: 'heal', desc: '每关恢复 +8，生命上限+20', effects: [{ type: 'flat_stat_bonus', stat: 'hp', value: 20, trigger: 'stat_calc' }] },

        // SR 卡 - 有联动
        { id: 'sr_001', name: '马格南手枪', rarity: 'SR', worldId: 1, basePower: 30, effect: 'power', desc: '攻击力 +30，与"战术背心"同时装备时+50%', effects: [{ type: 'synergy_bonus', pairCardId: 'sr_002', value: 0.5, trigger: 'stat_calc' }] },
        { id: 'sr_002', name: '战术背心', rarity: 'SR', worldId: 1, basePower: 25, effect: 'defense', desc: '防御力 +25，与"马格南手枪"同时装备时+50%', effects: [{ type: 'synergy_bonus', pairCardId: 'sr_001', value: 0.5, trigger: 'stat_calc' }] },
        { id: 'sr_003', name: '实验室门禁卡', rarity: 'SR', worldId: 1, basePower: 15, effect: 'points', desc: '系统点产出 +15，每10关额外获得抽卡券', effects: [{type:'stage_ticket_bonus', interval:10, value:1, trigger:'on_kill'}] },
        { id: 'sr_004', name: '保护伞徽章', rarity: 'SR', worldId: 1, basePower: 12, effect: 'utility', desc: '离线收益+50%，在线时每分钟额外+1系统点' },
        { id: 'sr_005', name: '猎杀者爪刃', rarity: 'SR', worldId: 1, basePower: 20, effect: 'power', desc: '攻击力 +20，击败敌人时20%概率再抽1次', effects: [{type:'kill_extra_drop', chance:0.2, count:1, trigger:'on_kill'}] },

        // SSR 卡 - 核心驱动
        { id: 'ssr_001', name: '火箭筒', rarity: 'SSR', worldId: 1, basePower: 80, effect: 'power', desc: '攻击力 +80，所有N卡效果翻倍', effects: [{ type: 'n_card_multiplier', value: 2, trigger: 'stat_calc' }] },
        { id: 'ssr_002', name: 'B.O.W.蓝图', rarity: 'SSR', worldId: 1, basePower: 50, effect: 'points', desc: '系统点产出 +50，成就奖励+30%', effects: [{ type: 'achievement_bonus', value: 0.3, trigger: 'achievement_calc' }] },
        { id: 'ssr_003', name: 'T病毒原液', rarity: 'SSR', worldId: 1, basePower: 30, effect: 'utility', desc: '抽卡时10%概率额外抽1张，且稀有度+1' },
        { id: 'ssr_004', name: '卫星监控权限', rarity: 'SSR', worldId: 1, basePower: 60, effect: 'power', desc: '攻击力 +60，可看到隐藏成就的提示' },

        // ===== 世界2：哈利波特与魔法石 =====
        // N 卡 - 魔法基础道具
        { id: 'n_009', name: '巧克力蛙', rarity: 'N', worldId: 2, basePower: 3, effect: 'power', desc: '攻击力 +3' },
        { id: 'n_010', name: '比比多味豆', rarity: 'N', worldId: 2, basePower: 2, effect: 'points', desc: '系统点产出 +2' },
        { id: 'n_011', name: '咒语书', rarity: 'N', worldId: 2, basePower: 4, effect: 'power', desc: '攻击力 +4' },

        // R 卡 - 魔法道具
        { id: 'r_007', name: '飞天扫帚', rarity: 'R', worldId: 2, basePower: 8, effect: 'defense', desc: '防御力 +8' },
        { id: 'r_008', name: '活点地图', rarity: 'R', worldId: 2, basePower: 5, effect: 'points', desc: '系统点产出 +5，掉率+1%', effects: [{ type: 'flat_stat_bonus', stat: 'dropRate', value: 1, trigger: 'stat_calc' }] },
        { id: 'r_009', name: '隐形衣', rarity: 'R', worldId: 2, basePower: 12, effect: 'power', desc: '攻击力 +12，暴击率+2%', effects: [{ type: 'flat_stat_bonus', stat: 'critRate', value: 2, trigger: 'stat_calc' }] },

        // SR 卡 - 强力魔法物品
        { id: 'sr_006', name: '魔法石', rarity: 'SR', worldId: 2, basePower: 35, effect: 'power', desc: '攻击力 +35，对BOSS+15%伤害', effects: [{ type: 'boss_damage_bonus', value: 0.15, trigger: 'on_damage_calc' }] },
        { id: 'sr_007', name: '厄里斯魔镜', rarity: 'SR', worldId: 2, basePower: 15, effect: 'heal', desc: '生命恢复+15，生命上限+25', effects: [{ type: 'flat_stat_bonus', stat: 'hp', value: 25, trigger: 'stat_calc' }] },

        // SSR 卡 - 魔法终极物品
        { id: 'ssr_005', name: '老魔杖', rarity: 'SSR', worldId: 2, basePower: 70, effect: 'power', desc: '攻击力+70，成就战力加成+20%', effects: [{ type: 'achievement_bonus', value: 0.2, trigger: 'achievement_calc' }] },

        // ===== 世界3：进击的巨人 =====
        // N 卡 - 调查兵团基础装备
        { id: 'n_012', name: '立体机动刀片', rarity: 'N', worldId: 3, basePower: 3, effect: 'heal', desc: '生命恢复 +3' },
        { id: 'n_013', name: '调查兵团披风', rarity: 'N', worldId: 3, basePower: 2, effect: 'points', desc: '系统点产出 +2' },
        { id: 'n_014', name: '信号弹', rarity: 'N', worldId: 3, basePower: 4, effect: 'power', desc: '攻击力 +4' },

        // R 卡 - 战斗装备
        { id: 'r_010', name: '硬化药剂', rarity: 'R', worldId: 3, basePower: 10, effect: 'defense', desc: '防御力 +10' },
        { id: 'r_011', name: '雷枪', rarity: 'R', worldId: 3, basePower: 10, effect: 'power', desc: '攻击力+10，速度+3', effects: [{ type: 'flat_stat_bonus', stat: 'speed', value: 3, trigger: 'stat_calc' }] },
        { id: 'r_012', name: '马莱步枪', rarity: 'R', worldId: 3, basePower: 5, effect: 'points', desc: '系统点产出+5，额外每秒+3', effects: [{ type: 'flat_stat_bonus', stat: 'pointsBonus', value: 3, trigger: 'stat_calc' }] },

        // SR 卡 - 巨人之力
        { id: 'sr_008', name: '女巨人之力', rarity: 'SR', worldId: 3, basePower: 32, effect: 'power', desc: '攻击力+32，暴击伤害+20%', effects: [{ type: 'flat_stat_bonus', stat: 'critDamage', value: 20, trigger: 'stat_calc' }] },
        { id: 'sr_009', name: '铠之巨人之力', rarity: 'SR', worldId: 3, basePower: 12, effect: 'points', desc: '系统点产出+12，离线收益+30%', effects: [{ type: 'offline_bonus', value: 0.3, trigger: 'offline_calc' }] },

        // SSR 卡 - 始祖之力
        { id: 'ssr_006', name: '始祖巨人之力', rarity: 'SSR', worldId: 3, basePower: 65, effect: 'power', desc: '攻击力+65，防御+30，生命+50', effects: [
            { type: 'flat_stat_bonus', stat: 'defense', value: 30, trigger: 'stat_calc' },
            { type: 'flat_stat_bonus', stat: 'hp', value: 50, trigger: 'stat_calc' }
        ] },
    ],

    // 卡组收集奖励（羁绊）- 兼容旧代码，实际由各世界的 sets 决定
    // setId 格式: {worldId}-{theme}-{seq}，支持跨世界引用
    sets: [
        // 世界1：生化危机1
        { setId: '1-survival-gear', ids: ['n_001', 'n_002'], name: '生存基础套装', bonus: { power: 5 } },
        { setId: '1-mansion-explorer', ids: ['r_001', 'r_002'], name: '洋馆探索者', bonus: { power: 15, defense: 10 } },
        { setId: '1-stars-gear', ids: ['sr_001', 'sr_002'], name: 'S.T.A.R.S.装备', bonus: { power: 50, defense: 30 } },
        { setId: '1-ultimate-weapon', ids: ['ssr_001', 'ssr_002'], name: '终极武器套装', bonus: { power: 100, pointsBonus: 30 } },
        // 世界2：哈利波特与魔法石
        { setId: '2-hogwarts-freshman', ids: ['n_009', 'n_010', 'n_011'], name: '霍格沃茨新生', bonus: { power: 8, defense: 3 } },
        { setId: '2-deathly-hallows', ids: ['sr_006', 'sr_007', 'ssr_005'], name: '死亡圣器', bonus: { power: 30, hp: 20 } },
        // 世界3：进击的巨人
        { setId: '3-survey-corps', ids: ['n_012', 'n_013', 'n_014'], name: '调查兵团', bonus: { defense: 5, hpRegen: 5 } },
        { setId: '3-nine-titans', ids: ['sr_008', 'sr_009', 'ssr_006'], name: '九大巨人', bonus: { power: 40, critRate: 3 } },
    ],

    // ===== 世界相关方法 =====

    // 获取指定世界的卡牌列表
    getWorldCards: function(worldId) {
        const world = this.worlds.find(w => w.id === worldId);
        if (!world) return [];
        return this.pool.filter(c => world.cardIds.includes(c.id));
    },

    // 获取指定世界的套装列表
    getWorldSets: function(worldId) {
        const world = this.worlds.find(w => w.id === worldId);
        if (!world) return this.sets;
        return world.sets || this.sets;
    },

    // 获取已解锁世界的合并卡池（用于抽卡）
    // 已解锁世界 = worldProgress 中有通关记录的世界，默认至少包含世界1
    getUnlockedWorldIds: function(gameState) {
        const progress = gameState.worldProgress || {};
        const unlocked = new Set([1]); // 世界1默认解锁
        for (const worldId of Object.keys(progress)) {
            const wid = parseInt(worldId, 10);
            if (progress[worldId] > 0) {
                unlocked.add(wid);
            }
        }
        return Array.from(unlocked).sort((a, b) => a - b);
    },

    // 获取已解锁世界的合并卡池（用于抽卡）
    getCurrentPool: function(gameState) {
        const unlockedWorlds = this.getUnlockedWorldIds(gameState);
        const seen = new Set();
        const pool = [];
        for (const worldId of unlockedWorlds) {
            const worldCards = this.getWorldCards(worldId);
            for (const card of worldCards) {
                if (!seen.has(card.id)) {
                    seen.add(card.id);
                    pool.push(card);
                }
            }
        }
        return pool;
    },

    // 获取已解锁世界的合并套装列表
    getCurrentSets: function(gameState) {
        const unlockedWorlds = this.getUnlockedWorldIds(gameState);
        const seen = new Set();
        const sets = [];
        for (const worldId of unlockedWorlds) {
            const worldSets = this.getWorldSets(worldId);
            for (const set of worldSets) {
                const key = set.setId || set.name;
                if (!seen.has(key)) {
                    seen.add(key);
                    sets.push(set);
                }
            }
        }
        return sets;
    },

    // 按稀有度筛选指定世界的卡牌
    getWorldCardsByRarity: function(worldId, rarity) {
        return this.getWorldCards(worldId).filter(c => c.rarity === rarity);
    },

    // 计算指定世界的收集进度（0.0 ~ 1.0）
    getWorldCompletion: function(gameState, worldId) {
        const world = this.worlds.find(w => w.id === worldId);
        if (!world) return 0;
        const totalCards = world.cardIds.length;
        if (totalCards === 0) return 0;
        let owned = 0;
        for (const cardId of world.cardIds) {
            if (gameState.cards[cardId] && gameState.cards[cardId].count > 0) {
                owned++;
            }
        }
        return owned / totalCards;
    },

    // 获取指定世界的收集度属性倍率（用于 StatSystem）
    // 返回该世界卡牌的属性倍率（默认 1.0）
    getWorldCompletionMultiplier: function(gameState, worldId) {
        const world = this.worlds.find(w => w.id === worldId);
        if (!world || !world.completionBonus) return 1.0;
        const completion = this.getWorldCompletion(gameState, worldId);
        const bonus = world.completionBonus;
        if (completion >= 1.0 && bonus.full) {
            return bonus.full.cardStatMultiplier || 1.0;
        }
        if (completion >= 0.5 && bonus.half) {
            return bonus.half.cardStatMultiplier || 1.0;
        }
        return 1.0;
    },

    // 获取所有已解锁世界的收集度汇总信息（供UI展示）
    getWorldCompletionSummary: function(gameState) {
        const summary = [];
        const unlockedWorlds = this.getUnlockedWorldIds(gameState);
        for (const worldId of unlockedWorlds) {
            const world = this.worlds.find(w => w.id === worldId);
            if (!world) continue;
            const completion = this.getWorldCompletion(gameState, worldId);
            const multiplier = this.getWorldCompletionMultiplier(gameState, worldId);
            summary.push({
                worldId: worldId,
                name: world.name,
                completion: completion,
                multiplier: multiplier,
                totalCards: world.cardIds.length,
                ownedCards: world.cardIds.filter(id => gameState.cards[id] && gameState.cards[id].count > 0).length
            });
        }
        return summary;
    },

    // 添加新世界（供后续扩展使用）
    addWorld: function(worldConfig) {
        const id = this.worlds.length > 0 ? Math.max(...this.worlds.map(w => w.id)) + 1 : 1;
        this.worlds.push({
            id: id,
            name: worldConfig.name || `世界${id}`,
            description: worldConfig.description || '',
            cardIds: worldConfig.cardIds || [],
            sets: worldConfig.sets || []
        });
        // 将新世界卡牌加入总池（去重）
        for (const card of worldConfig.cards || []) {
            if (!this.pool.find(c => c.id === card.id)) {
                this.pool.push(card);
            }
        }
        return id;
    }
};
