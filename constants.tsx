
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: '餐饮', subCategories: ['早餐', '午餐', '晚餐', '零食', '买菜'] },
  { id: '2', name: '交通', subCategories: ['地铁', '公交', '打车', '加油', '共享单车'] },
  { id: '3', name: '购物', subCategories: ['日用品', '衣物', '数码', '家居'] },
  { id: '4', name: '娱乐', subCategories: ['电影', '游戏', '运动', '旅游'] },
  { id: '5', name: '住房', subCategories: ['房租', '物业', '水电煤', '宽带'] },
  { id: '6', name: '人情', subCategories: ['红包', '送礼', '请客'] },
  { id: '7', name: '收入', subCategories: ['工资', '奖金', '兼职', '理财收益'] }
];

export const ACCOUNT_COLORS: Record<string, string> = {
  '现金': 'bg-orange-500',
  '银行卡': 'bg-blue-600',
  '支付宝': 'bg-sky-500',
  '微信支付': 'bg-emerald-500',
  '默认': 'bg-slate-500'
};
