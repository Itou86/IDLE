/* ===== EffectRegistry ===== */
// 卡牌效果注册表：解耦卡牌效果与系统逻辑
// 每张卡牌的 effects 字段定义触发条件和效果，由本注册表统一调度
const EffectRegistry = {
    // 内部：触发器 -> 处理器数组 的映射
    _handlers: {},

    // 公共方法：注册一个效果处理器
    // trigger: 触发器名称（如 'on_draw', 'on_battle_start', 'on_kill', 'on_idle_tick'）
    // handler: 函数 (gameState, context) => context
    register: function(trigger, handler) {
        if (!this._handlers[trigger]) {
            this._handlers[trigger] = [];
        }
        this._handlers[trigger].push(handler);
    },

    // 公共方法：触发指定触发器的所有处理器
    // trigger: 触发器名称
    // gameState: 当前游戏状态
    // context: 上下文对象，处理器可读取和修改
    // 返回：修改后的 context
    trigger: function(trigger, gameState, context) {
        const handlers = this._handlers[trigger] || [];
        let ctx = context || {};
        for (const handler of handlers) {
            ctx = handler(gameState, ctx) || ctx;
        }
        return ctx;
    },

    // 公共方法：扫描 CARD_CONFIG.pool 中所有卡牌的 effects 字段，自动注册
    init: function() {
        if (typeof CARD_CONFIG === 'undefined' || !CARD_CONFIG.pool) return;
        for (const card of CARD_CONFIG.pool) {
            if (card.effects && Array.isArray(card.effects)) {
                for (const effect of card.effects) {
                    this._registerCardEffect(card.id, effect);
                }
            }
        }
    },

    // 内部：将单张卡牌的单个 effect 包装为 handler 并注册
    _registerCardEffect: function(cardId, effect) {
        const trigger = effect.trigger;
        if (!trigger) return;

        const handler = (gameState, context) => {
            // 检查玩家是否拥有该卡牌
            if (!GameUtils.hasCard(gameState, cardId)) {
                return context;
            }
            return this._executeEffect(effect, gameState, context);
        };

        this.register(trigger, handler);
    },

    // 内部：按 effect.type 分发执行
    _executeEffect: function(effect, gameState, context) {
        const type = effect.type;
        const ctx = context || {};

        switch (type) {
            // 抽卡时额外抽 N 张
            case 'extra_draw':
                // 支持概率触发（如命运骰子：每次抽卡10%概率额外抽1张）
                const drawCount = ctx.count || 1;
                let triggered = 0;
                for (let i = 0; i < drawCount; i++) {
                    if (!effect.chance || Math.random() < effect.chance) {
                        triggered++;
                    }
                }
                if (triggered > 0) {
                    if (!ctx.extraDraws) ctx.extraDraws = [];
                    for (let i = 0; i < triggered; i++) {
                        ctx.extraDraws.push({ rarityUp: !!effect.rarityUp });
                    }
                }
                break;

            // 对 Boss 伤害加成（百分比）
            case 'boss_damage_bonus':
                if (ctx.isBoss && ctx.damage !== undefined) {
                    ctx.damage = Math.floor(ctx.damage * (1 + (effect.value || 0)));
                }
                break;

            // N 卡效果倍率（如创世之刃：N卡效果翻倍）
            case 'n_card_multiplier':
                ctx.nCardMultiplier = (ctx.nCardMultiplier || 1) * (effect.value || 1);
                break;

            // 离线收益加成（百分比）
            case 'offline_bonus':
                ctx.offlineBonus = (ctx.offlineBonus || 0) + (effect.value || 0);
                break;

            // 成就奖励加成（百分比）
            case 'achievement_bonus':
                ctx.achievementBonus = (ctx.achievementBonus || 0) + (effect.value || 0);
                break;

            // 击杀敌人时额外掉落
            case 'kill_extra_drop':
                ctx.killExtraDropChance = (ctx.killExtraDropChance || 0) + (effect.chance || 0);
                ctx.killExtraDropCount = (ctx.killExtraDropCount || 0) + (effect.count || 0);
                break;

            // 每 N 关额外获得抽卡券
            case 'stage_ticket_bonus':
                ctx.stageTicketInterval = effect.interval || 10;
                ctx.stageTicketBonus = (ctx.stageTicketBonus || 0) + (effect.value || 0);
                break;

            // 联动加成（与指定卡牌同时装备时生效）
            case 'synergy_bonus':
                if (effect.withCard && GameUtils.hasCard(gameState, effect.withCard)) {
                    ctx.synergyBonus = (ctx.synergyBonus || 0) + (effect.value || 0);
                }
                break;

            // 固定属性加成（如生命上限+20）
            case 'flat_stat_bonus':
                if (!ctx.flatStatBonus) ctx.flatStatBonus = {};
                const statKey = effect.stat;
                if (statKey) {
                    ctx.flatStatBonus[statKey] = (ctx.flatStatBonus[statKey] || 0) + (effect.value || 0);
                }
                break;

            // 闪避率加成（百分比）
            case 'dodge_rate_bonus':
                ctx.dodgeRateBonus = (ctx.dodgeRateBonus || 0) + (effect.value || 0);
                break;

            default:
                // 未知类型，静默忽略（不抛异常，保证健壮性）
                break;
        }

        return ctx;
    }
};
