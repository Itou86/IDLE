/* ===== 属性系统配置 ===== */
const STAT_CONFIG = {
    // 属性定义：所有角色和卡牌都使用这套标准属性
    definitions: {
        power: { name: '攻击力', desc: '影响战斗伤害', icon: '⚔️', format: 'flat' },
        defense: { name: '防御力', desc: '减少受到的伤害', icon: '🛡️', format: 'flat' },
        hp: { name: '生命值', desc: '战斗中的血量', icon: '❤️', format: 'flat' },
        hpRegen: { name: '生命恢复', desc: '每关战斗后恢复的生命', icon: '💚', format: 'flat' },
        pointsBonus: { name: '系统点加成', desc: '每秒额外获得的系统点', icon: '💰', format: 'flat' },
        shardBonus: { name: '碎片加成', desc: '每10关额外获得世界碎片', icon: '🎫', format: 'flat' },
        dropRate: { name: '掉率提升', desc: '抽卡稀有度概率提升(%)', icon: '🍀', format: 'percent' },
        critRate: { name: '暴击率', desc: '攻击时暴击概率(%)', icon: '💥', format: 'percent' },
        critDamage: { name: '暴击伤害', desc: '暴击时的伤害倍率(%)', icon: '🔥', format: 'percent' },
        speed: { name: '速度', desc: '影响先手权和闪避', icon: '⚡', format: 'flat' },
        expBonus: { name: '经验加成', desc: '卡牌获得经验加成(%)', icon: '📈', format: 'percent' },
    },

    // 角色基础属性（无卡牌时的起点）
    baseStats: {
        power: 10,
        defense: 0,
        hp: 200,          // 增加基础HP
        hpRegen: 50,      // 每关恢复50
        pointsBonus: 0,
        shardBonus: 0,
        dropRate: 0,
        critRate: 0,
        critDamage: 50,  // 基础暴击伤害 150%
        speed: 5,        // 基础速度
        expBonus: 0,
    },

    // 属性计算顺序（重要：百分比加成在固定值之后）
    calcOrder: [
        'power', 'defense', 'hp', 'hpRegen', 'pointsBonus', 'shardBonus',
        'dropRate', 'critRate', 'critDamage', 'speed', 'expBonus'
    ],

    // 战力公式系数（用于显示综合战力）
    powerWeights: {
        power: 1.0,
        defense: 0.5,
        hp: 0.1,
        speed: 0.2,
        critRate: 0.5,
    }
};

// 全局暴露（兼容浏览器和Node.js测试环境）
if (typeof window !== 'undefined') {
    window.STAT_CONFIG = STAT_CONFIG;
}
