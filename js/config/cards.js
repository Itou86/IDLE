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
    // 无限流世界观：每个世界有独属卡牌组
    // 世界1为当前23张卡的占位，后续替换为实际作品主题
    worlds: [
        {
            id: 1,
            name: '世界1',
            description: '待填充：替换为实际作品主题',
            // 该世界可掉落/可抽取的卡牌ID列表
            cardIds: [
                'n_001', 'n_002', 'n_003', 'n_004', 'n_005', 'n_006', 'n_007', 'n_008',
                'r_001', 'r_002', 'r_003', 'r_004', 'r_005', 'r_006',
                'sr_001', 'sr_002', 'sr_003', 'sr_004', 'sr_005',
                'ssr_001', 'ssr_002', 'ssr_003', 'ssr_004'
            ],
            sets: [
                { ids: ['n_001', 'n_002'], name: '新手套装', bonus: { power: 5 } },
                { ids: ['r_001', 'r_002'], name: '骑士套装', bonus: { power: 15, defense: 10 } },
                { ids: ['sr_001', 'sr_002'], name: '屠龙套装', bonus: { power: 50, defense: 30 } },
                { ids: ['ssr_001', 'ssr_002'], name: '神王套装', bonus: { power: 100, gold: 30 } },
            ]
        }
        // 世界2、世界3... 后续由用户填充
    ],

    // 基础卡牌池（所有可用卡牌，保持兼容）
    pool: [
        // N 卡 - 基础数值卡
        { id: 'n_001', name: '生锈的剑', rarity: 'N', basePower: 5, effect: 'power', desc: '攻击力 +5' },
        { id: 'n_002', name: '破木盾', rarity: 'N', basePower: 3, effect: 'defense', desc: '防御力 +3' },
        { id: 'n_003', name: '铜币袋', rarity: 'N', basePower: 2, effect: 'gold', desc: '金币产出 +2' },
        { id: 'n_004', name: '学徒法杖', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_005', name: '旧皮甲', rarity: 'N', basePower: 4, effect: 'defense', desc: '防御力 +4' },
        { id: 'n_006', name: '草药包', rarity: 'N', basePower: 3, effect: 'heal', desc: '每关恢复 +3' },
        { id: 'n_007', name: '铁箭头', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_008', name: '麻绳', rarity: 'N', basePower: 1, effect: 'utility', desc: '羁绊素材' },

        // R 卡 - 有特性
        { id: 'r_001', name: '精钢剑', rarity: 'R', basePower: 12, effect: 'power', desc: '攻击力 +12' },
        { id: 'r_002', name: '骑士盾', rarity: 'R', basePower: 10, effect: 'defense', desc: '防御力 +10' },
        { id: 'r_003', name: '幸运金币', rarity: 'R', basePower: 5, effect: 'gold', desc: '金币产出 +5，抽卡券产出 +1' },
        { id: 'r_004', name: '火焰宝石', rarity: 'R', basePower: 15, effect: 'power', desc: '攻击力 +15，对BOSS伤害+20%', effects: [{ type: 'boss_damage_bonus', value: 0.2, trigger: 'on_damage_calc' }] },
        { id: 'r_005', name: '疾风靴', rarity: 'R', basePower: 8, effect: 'speed', desc: '先攻+1，闪避+5%' },
        { id: 'r_006', name: '生命护符', rarity: 'R', basePower: 8, effect: 'heal', desc: '每关恢复 +8，生命上限+20' },

        // SR 卡 - 有联动
        { id: 'sr_001', name: '龙血剑', rarity: 'SR', basePower: 30, effect: 'power', desc: '攻击力 +30，与"龙鳞甲"同时装备时+50%' },
        { id: 'sr_002', name: '龙鳞甲', rarity: 'SR', basePower: 25, effect: 'defense', desc: '防御力 +25，与"龙血剑"同时装备时+50%' },
        { id: 'sr_003', name: '聚宝盆', rarity: 'SR', basePower: 15, effect: 'gold', desc: '金币产出 +15，每10关额外获得抽卡券' },
        { id: 'sr_004', name: '时空沙漏', rarity: 'SR', basePower: 12, effect: 'utility', desc: '离线收益+50%，在线时每分钟额外+1金币' },
        { id: 'sr_005', name: '灵魂契约', rarity: 'SR', basePower: 20, effect: 'power', desc: '攻击力 +20，击败敌人时20%概率再抽1次' },

        // SSR 卡 - 核心驱动
        { id: 'ssr_001', name: '创世之刃', rarity: 'SSR', basePower: 80, effect: 'power', desc: '攻击力 +80，所有N卡效果翻倍' },
        { id: 'ssr_002', name: '永恒王冠', rarity: 'SSR', basePower: 50, effect: 'gold', desc: '金币产出 +50，成就奖励+30%' },
        { id: 'ssr_003', name: '命运骰子', rarity: 'SSR', basePower: 30, effect: 'utility', desc: '抽卡时10%概率额外抽1张，且稀有度+1', effects: [{ type: 'extra_draw', chance: 0.1, trigger: 'on_gacha_end', rarityUp: true }] },
        { id: 'ssr_004', name: '虚空之眼', rarity: 'SSR', basePower: 60, effect: 'power', desc: '攻击力 +60，可看到隐藏成就的提示' },
    ],

    // 卡组收集奖励（羁绊）- 兼容旧代码，实际由各世界的 sets 决定
    sets: [
        { ids: ['n_001', 'n_002'], name: '新手套装', bonus: { power: 5 } },
        { ids: ['r_001', 'r_002'], name: '骑士套装', bonus: { power: 15, defense: 10 } },
        { ids: ['sr_001', 'sr_002'], name: '屠龙套装', bonus: { power: 50, defense: 30 } },
        { ids: ['ssr_001', 'ssr_002'], name: '神王套装', bonus: { power: 100, gold: 30 } },
    ],

    // ===== 世界相关方法 =====

    // 公共方法：获取指定世界的卡牌列表
    getWorldCards: function(worldId) {
        const world = this.worlds.find(w => w.id === worldId);
        if (!world) return [];
        return this.pool.filter(c => world.cardIds.includes(c.id));
    },

    // 公共方法：获取指定世界的套装列表
    getWorldSets: function(worldId) {
        const world = this.worlds.find(w => w.id === worldId);
        if (!world) return this.sets;
        return world.sets || this.sets;
    },

    // 公共方法：获取当前世界的卡池（用于抽卡和战斗掉落）
    getCurrentPool: function(gameState) {
        const worldId = gameState.world || 1;
        return this.getWorldCards(worldId);
    },

    // 公共方法：获取当前世界的套装
    getCurrentSets: function(gameState) {
        const worldId = gameState.world || 1;
        return this.getWorldSets(worldId);
    },

    // 公共方法：按稀有度筛选指定世界的卡牌
    getWorldCardsByRarity: function(worldId, rarity) {
        return this.getWorldCards(worldId).filter(c => c.rarity === rarity);
    },

    // 公共方法：添加新世界（供后续扩展使用）
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
