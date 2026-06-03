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
                { ids: ['n_001', 'n_002'], name: '忍者基础装备', bonus: { power: 5 } },
                { ids: ['r_001', 'r_002'], name: '草帽团羁绊', bonus: { power: 15, defense: 10 } },
                { ids: ['sr_001', 'sr_002'], name: '权游龙焰套装', bonus: { power: 50, defense: 30 } },
                { ids: ['ssr_001', 'ssr_002'], name: '无限宝石套装', bonus: { power: 100, points: 30 } },
            ]
        }
        // 世界2、世界3... 后续由用户填充
    ],

    // 基础卡牌池（所有可用卡牌，保持兼容）
    pool: [
        // N 卡 - 基础数值卡（来源：火影忍者、海贼王、鬼灭之刃、Fate、进击的巨人）
        { id: 'n_001', name: '苦无', rarity: 'N', basePower: 5, effect: 'power', desc: '攻击力 +5' },
        { id: 'n_002', name: '木制替身', rarity: 'N', basePower: 3, effect: 'defense', desc: '防御力 +3' },
        { id: 'n_003', name: '贝利袋', rarity: 'N', basePower: 2, effect: 'gold', desc: '系统点产出 +2' },
        { id: 'n_004', name: '日轮刀碎片', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_005', name: '立体机动装置皮带', rarity: 'N', basePower: 4, effect: 'defense', desc: '防御力 +4' },
        { id: 'n_006', name: '鬼杀队药箱', rarity: 'N', basePower: 3, effect: 'heal', desc: '每关恢复 +3' },
        { id: 'n_007', name: '令咒残片', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_008', name: '立体机动气体', rarity: 'N', basePower: 1, effect: 'utility', desc: '羁绊素材' },

        // R 卡 - 有特性（来源：斗破苍穹、诡秘之主、漫威、魔戒、魔兽世界）
        { id: 'r_001', name: '玄重尺', rarity: 'R', basePower: 12, effect: 'power', desc: '攻击力 +12' },
        { id: 'r_002', name: '美杜莎之盾', rarity: 'R', basePower: 10, effect: 'defense', desc: '防御力 +10' },
        { id: 'r_003', name: '阿蒙单片眼镜', rarity: 'R', basePower: 5, effect: 'gold', desc: '系统点产出 +5，抽卡券产出 +1' },
        { id: 'r_004', name: '现实宝石', rarity: 'R', basePower: 15, effect: 'power', desc: '攻击力 +15，对BOSS伤害+20%' },
        { id: 'r_005', name: '飞雷神苦无', rarity: 'R', basePower: 8, effect: 'speed', desc: '先攻+1，闪避+5%' },
        { id: 'r_006', name: '圣光道标', rarity: 'R', basePower: 8, effect: 'heal', desc: '每关恢复 +8，生命上限+20' },

        // SR 卡 - 有联动（来源：魔兽世界、黑魂、道诡异仙、北欧神话）
        { id: 'sr_001', name: '霜之哀伤', rarity: 'SR', basePower: 30, effect: 'power', desc: '攻击力 +30，与"统御之冠"同时装备时+50%' },
        { id: 'sr_002', name: '统御之冠', rarity: 'SR', basePower: 25, effect: 'defense', desc: '防御力 +25，与"霜之哀伤"同时装备时+50%' },
        { id: 'sr_003', name: '大千录残页', rarity: 'SR', basePower: 15, effect: 'gold', desc: '系统点产出 +15，每10关额外获得抽卡券' },
        { id: 'sr_004', name: '世界树之种', rarity: 'SR', basePower: 12, effect: 'utility', desc: '离线收益+50%，在线时每分钟额外+1系统点' },
        { id: 'sr_005', name: '黑暗印记', rarity: 'SR', basePower: 20, effect: 'power', desc: '攻击力 +20，击败敌人时20%概率再抽1次' },

        // SSR 卡 - 核心驱动（来源：漫威、Fate、希腊神话、艾尔登法环）
        { id: 'ssr_001', name: '无限手套', rarity: 'SSR', basePower: 80, effect: 'power', desc: '攻击力 +80，所有N卡效果翻倍' },
        { id: 'ssr_002', name: '王之财宝', rarity: 'SSR', basePower: 50, effect: 'gold', desc: '系统点产出 +50，成就奖励+30%' },
        { id: 'ssr_003', name: '卢恩弯弧', rarity: 'SSR', basePower: 30, effect: 'utility', desc: '抽卡时10%概率额外抽1张，且稀有度+1' },
        { id: 'ssr_004', name: '全知全能之眼', rarity: 'SSR', basePower: 60, effect: 'power', desc: '攻击力 +60，可看到隐藏成就的提示' },
    ],

    // 卡组收集奖励（羁绊）- 兼容旧代码，实际由各世界的 sets 决定
    sets: [
        { ids: ['n_001', 'n_002'], name: '忍者基础装备', bonus: { power: 5 } },
        { ids: ['r_001', 'r_002'], name: '草帽团羁绊', bonus: { power: 15, defense: 10 } },
        { ids: ['sr_001', 'sr_002'], name: '权游龙焰套装', bonus: { power: 50, defense: 30 } },
        { ids: ['ssr_001', 'ssr_002'], name: '无限宝石套装', bonus: { power: 100, points: 30 } },
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

    // 获取当前世界的卡池（用于抽卡和战斗掉落）
    getCurrentPool: function(gameState) {
        const worldId = gameState.world || 1;
        return this.getWorldCards(worldId);
    },

    // 获取当前世界的套装
    getCurrentSets: function(gameState) {
        const worldId = gameState.world || 1;
        return this.getWorldSets(worldId);
    },

    // 按稀有度筛选指定世界的卡牌
    getWorldCardsByRarity: function(worldId, rarity) {
        return this.getWorldCards(worldId).filter(c => c.rarity === rarity);
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
