// src/data/componentData.js
export default {
  bool: [
    {
      name: '核心物品行为与状态',
      description: '控制物品最基本的功能、交互和显示规则',
      items: [
        {name: 'blocks_attacks', description: '物品用于格挡时的核心行为', selected: false, value: false},
        {name: 'can_always_eat', description: '物品在非饥饿状态下的核心食用行为', selected: false, value: false},
        {name: 'enchantment_glint_override', description: '核心视觉效果开关 (光效)', selected: false, value: false},
        {name: 'has_consume_particles', description: '物品使用时的核心视觉反馈 (粒子)', selected: false, value: false},
        {name: 'intangible_projectile', description: '投射物实体的核心拾取规则', selected: false, value: false},
        {name: 'resolved', description: '成书实体的核心状态', selected: false, value: false},
        {name: 'swappable', description: '装备的核心交互规则', selected: false, value: false},
        {name: 'unbreakable', description: '物品耐久度机制的核心开关', selected: false, value: false},
        {name: 'creative_slot_lock', description: '创造模式物品栏管理', selected: false, value: false},
        {name: 'debug_stick_state', description: '调试棒的核心功能状态', selected: false, value: false},
        {name: 'glider', description: '滑翔翼功能开关 (同时也控制滑翔动作)', selected: false, value: false},
        {name: 'has_trail', description: '烟火飞行时的视觉轨迹', selected: false, value: false},
        {name: 'has_twinkle', description: '烟火爆炸时的视觉闪烁效果', selected: false, value: false}
      ]
    },
    {
      name: '实体控制属性',
      description: '影响物品关联的生物实体的行为或表现',
      items: [
        {name: 'no_ai', description: '生物实体的 AI 核心开关', selected: false, value: false},
        {name: 'no_gravity', description: '生物实体的物理核心规则', selected: false, value: false},
        {name: 'silent', description: '生物实体的核心声音开关', selected: false, value: false}
      ]
    }
  ],
  
  single: [
    {
      name: '外观 - 生物变种与颜色',
      items: [
        {name: 'axolotl/variant', description: '美西螈变种', example: 'wild', selected: false, value: ''},
        {name: 'cow/variant', description: '牛变种', example: 'default', selected: false, value: ''},
        {name: 'fox/variant', description: '狐狸变种', example: 'red', selected: false, value: ''},
        {name: 'frog/variant', description: '青蛙变种', example: 'temperate', selected: false, value: ''},
        {name: 'horse/variant', description: '马变种', example: 'black', selected: false, value: ''},
        {name: 'llama/variant', description: '羊驼变种', example: 'creamy', selected: false, value: ''},
        {name: 'mooshroom/variant', description: '哞菇变种', example: 'red', selected: false, value: ''},
        {name: 'parrot/variant', description: '鹦鹉变种', example: 'red_blue', selected: false, value: ''},
        {name: 'pig/variant', description: '猪变种', example: 'default', selected: false, value: ''},
        {name: 'rabbit/variant', description: '兔子变种', example: 'brown', selected: false, value: ''},
        {name: 'salmon/size', description: '鲑鱼尺寸', example: '1', selected: false, value: ''},
        {name: 'villager/variant', description: '村民变种', example: 'desert', selected: false, value: ''},
        {name: 'wolf/variant', description: '狼变种', example: 'gray', selected: false, value: ''},
        {name: 'base_color', description: '盾牌基础颜色', example: '#FF5733', selected: false, value: ''},
        {name: 'cat/collar', description: '猫项圈颜色', example: 'red', selected: false, value: ''},
        {name: 'map_color', description: '地图物品颜色', example: '0xFF0000', selected: false, value: ''},
        {name: 'sheep/color', description: '羊毛颜色', example: 'white', selected: false, value: ''},
        {name: 'shulker/color', description: '潜影盒颜色', example: 'purple', selected: false, value: ''},
        {name: 'tropical_fish/base_color', description: '热带鱼基础颜色', example: 'blue', selected: false, value: ''},
        {name: 'tropical_fish/pattern_color', description: '热带鱼花纹颜色', example: 'yellow', selected: false, value: ''},
        {name: 'wolf/collar', description: '狼项圈颜色', example: 'red', selected: false, value: ''},
        {name: 'tropical_fish/pattern', description: '热带鱼花纹', example: 'stripey', selected: false, value: ''}
      ]
    },
    {
      name: '基础物品属性',
      items: [
        {name: 'map_id', description: '地图物品的核心唯一标识符', example: 'map_12345', selected: false, value: ''},
        {name: 'damage', description: '当前耐久值', example: '32', selected: false, value: ''},
        {name: 'max_damage', description: '最大耐久值上限', example: '256', selected: false, value: ''},
        {name: 'max_stack_size', description: '基础堆叠上限', example: '64', selected: false, value: ''},
        {name: 'rarity', description: '物品品质', example: 'uncommon', selected: false, value: ''},
        {name: 'ominous_bottle_amplifier', description: '不祥之兆药水的效果等级', example: '3', selected: false, value: ''},
        {name: 'custom_name', description: '物品显示名称', example: '超级剑', selected: false, value: ''},
        {name: 'custom_model_data', description: '模型资源包调用的核心标识符', example: '1234', selected: false, value: ''},
        {name: 'repair_cost', description: '铁砧修复的经验惩罚等级', example: '5', selected: false, value: ''}
      ]
    },
    {
      name: '音效与听觉属性',
      items: [
        {name: 'note_block_sound', description: '音符盒音效', example: 'block.note_block.pling', selected: false, value: ''},
        {name: 'wolf/sound_variant', description: '狼的音效变体', example: '2', selected: false, value: ''}
      ]
    }
  ],
  
  complex: [
    {
      name: '动态效果与属性',
      description: '属性修改、消耗效果、状态缩放均影响实时交互效果',
      items: [
        {name: 'attribute_modifiers', description: '对持有者/穿戴者的属性加成/削弱', selected: false, value: {}},
        {name: 'consumable', description: '消耗后触发的效果集合', selected: false, value: {}},
        {name: 'potion_contents', description: '药水的状态效果列表、颜色等', selected: false, value: {}},
        {name: 'suspicious_stew_effects', description: '迷之炖菜的状态效果列表', selected: false, value: []},
        {name: 'potion_duration_scale', description: '状态效果时长的缩放系数', selected: false, value: 1.0}
      ]
    },
    {
      name: '容器与实体数据',
      description: '容器内容与实体数据均涉及嵌套数据结构管理',
      items: [
        {name: 'bundle_contents', description: '收纳袋的物品列表', selected: false, value: []},
        {name: 'container', description: '容器方块物品的内部物品数据', selected: false, value: []},
        {name: 'container_loot', description: '容器关联的战利品表引用', selected: false, value: {}},
        {name: 'bees', description: '蜂箱/蜂巢携带的蜜蜂信息', selected: false, value: []},
        {name: 'block_entity_data', description: '方块物品携带的方块实体数据', selected: false, value: {}},
        {name: 'bucket_entity_data', description: '生物桶内的生物数据', selected: false, value: {}},
        {name: 'entity_data', description: '生物刷怪蛋携带的生物数据', selected: false, value: {}}
      ]
    },
    {
      name: '高级外观与装饰',
      description: '旗帜、纹饰、陶罐均属复杂视觉定制',
      items: [
        {name: 'dyed_color', description: '染色皮革盔甲的精确 RGB 颜色值', selected: false, value: '#FFFFFF'},
        {name: 'item_model', description: '定义复杂的物品模型映射', selected: false, value: {}},
        {name: 'trim', description: '盔甲纹饰的材料和图案', selected: false, value: {}},
        {name: 'banner_patterns', description: '旗帜的具体图层图案列表', selected: false, value: []},
        {name: 'provides_banner_patterns', description: '旗帜图案来源', selected: false, value: {}},
        {name: 'painting/variant', description: '画作实体的尺寸和作者标识符', selected: false, value: ''},
        {name: 'pot_decorations', description: '饰纹陶罐四个面的陶片纹样', selected: false, value: []}
      ]
    },
    {
      name: '游戏机制控制',
      description: '创造模式规则、工具效能、使用机制均定义交互逻辑',
      items: [
        {name: 'can_break', description: '可破坏的方块列表及条件', selected: false, value: []},
        {name: 'can_place_on', description: '可放置于的方块列表及条件', selected: false, value: []},
        {name: 'lock', description: '冒险模式物品的解锁物品谓词', selected: false, value: {}},
        {name: 'tool', description: '可挖掘的方块列表、挖掘速度倍率', selected: false, value: {}},
        {name: 'use_cooldown', description: '物品使用后的冷却组和时间', selected: false, value: {}},
        {name: 'use_remainder', description: '物品使用完毕后返还的物品', selected: false, value: ''},
        {name: 'weapon', description: '近战武器的攻击特性', selected: false, value: {}}
      ]
    },
    {
      name: '信息显示与文本',
      description: '所有组件均控制提示框的显示内容与样式',
      items: [
        {name: 'lore', description: '物品描述文本', selected: false, value: []},
        {name: 'tooltip_style', description: '提示框的边框、背景色样式', selected: false, value: {}},
        {name: 'tooltip_display', description: '强制在提示框中显示的组件列表', selected: false, value: []}
      ]
    },
    {
      name: '合成与维护系统',
      description: '盔甲纹饰、配方修复等合成相关功能',
      items: [
        {name: 'provides_trim_material', description: '盔甲纹饰材料来源', selected: false, value: {}},
        {name: 'recipes', description: '知识之书记录的合成配方列表', selected: false, value: []},
        {name: 'repairable', description: '铁砧修复允许使用的材料列表', selected: false, value: {}}
      ]
    },
    {
      name: '特殊物品数据',
      description: '功能独立但组件较少的特殊物品数据',
      items: [
        {name: 'food', description: '食物的基本营养价值', selected: false, value: {}},
        {name: 'instrument', description: '山羊角的音效事件和使用范围', selected: false, value: {}},
        {name: 'jukebox_playable', description: '唱片携带的音效资源引用', selected: false, value: {}},
        {name: 'lodestone_tracker', description: '指南针关联的磁石位置和维度坐标', selected: false, value: {}},
        {name: 'map_decorations', description: '地图上绘制的图标列表', selected: false, value: []},
        {name: 'profile', description: '头颅物品关联的玩家档案', selected: false, value: {}},
        {name: 'firework_explosion', description: '单个烟火之星的颜色、效果等', selected: false, value: {}},
        {name: 'fireworks', description: '烟花火箭的飞行时间、爆裂效果列表', selected: false, value: []},
        {name: 'death_protection', description: '生物死亡时触发各种效果', selected: false, value: {}},
        {name: 'writable_book_content', description: '书与笔的原始文本内容', selected: false, value: {}},
        {name: 'written_book_content', description: '成书的作者、代数、页面内容', selected: false, value: {}}
      ]
    },
    {
      name: '自定义与扩展',
      description: '任意自定义NBT标签存储空间',
      items: [
        {name: 'custom_data', description: '任意自定义NBT标签存储空间', selected: false, value: {}}
      ]
    }
  ]
};