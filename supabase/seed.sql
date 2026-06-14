insert into public.game_state (id, current_turn, current_phase, legitimacy_base, economy_status, budget_status)
values (true, 1, 'turn_start', 33, '一切如常', '平衡')
on conflict (id) do update set legitimacy_base = excluded.legitimacy_base;

insert into public.factions (key, name, short_name, faction_type, influence, color, supporters, sort_order)
values
  ('karank', '卡兰克帝国', '卡兰克', 'country', 0, '#244f9e', '{}', 1),
  ('royer', '罗伊尔帝国', '罗伊尔', 'country', 0, '#262626', '{}', 2),
  ('deno', '德诺帝国', '德诺', 'country', 0, '#7a1c2a', '{}', 3),
  ('lurik', '卢里孔公国', '卢里孔', 'country', 0, '#c9a227', '{}', 4),
  ('social_democrats', '卢里孔众治党', '众治党', 'political', 40, '#b51f2d', '{"进步知识分子","产业工人"}', 10),
  ('blue_falcon', '卢里孔蓝隼党', '蓝隼党', 'political', 15, '#2667a8', '{"资本家","保守知识分子","大卡兰克派"}', 11),
  ('yor_unity', '约尔统一运动', '约统运', 'political', 15, '#3b3b3b', '{"资本家","大约尔派"}', 12),
  ('ducal_loyalists', '公爵忠诚派', '公爵派', 'political', 10, '#7c5b25', '{"保守知识分子","地主贵族"}', 13),
  ('unaligned', '未介入 / 无党派 / 地方派', '无党派', 'political', 20, '#7f858c', '{}', 14)
on conflict (key) do update set
  influence = excluded.influence,
  color = excluded.color,
  supporters = excluded.supporters;

insert into public.positions (key, name, is_government, dm_assign_only, sort_order)
values
  ('duke', '卢里孔公爵', true, true, 1),
  ('prime_minister', '首相', true, false, 2),
  ('deputy_prime_minister', '副首相', true, false, 3),
  ('security_minister', '安全部长', true, false, 4),
  ('justice_minister', '司法部长', true, false, 5),
  ('war_minister', '战争部长', true, false, 6),
  ('foreign_minister', '外交部长', true, false, 7),
  ('finance_minister', '财政部长', true, false, 8),
  ('education_science_minister', '教育与科学部长', true, false, 9),
  ('speaker', '议长', false, false, 20),
  ('party_leader', '党魁', false, false, 21),
  ('candidate', '大选候选人', false, false, 22)
on conflict (key) do update set
  name = excluded.name,
  is_government = excluded.is_government,
  dm_assign_only = excluded.dm_assign_only,
  sort_order = excluded.sort_order;

insert into public.social_groups (name, mood, sort_order)
values
  ('大卡兰克派', -1, 1),
  ('大约尔派', -1, 2),
  ('进步知识分子', 1, 3),
  ('保守知识分子', -1, 4),
  ('产业工人', 1, 5),
  ('资本家', -1, 6),
  ('士兵', 0, 7),
  ('农民', 1, 8),
  ('地主贵族', -1, 9)
on conflict (name) do update set mood = excluded.mood;

insert into public.foreign_powers (key, name, patience)
values
  ('royer', '罗伊尔帝国', 100),
  ('karank', '卡兰克帝国', 100)
on conflict (key) do update set patience = excluded.patience;

insert into public.current_policies (policy_key, option_key)
values
  ('regime', 'dual_monarchy'),
  ('civil_service', 'independent'),
  ('tax', 'single_tax'),
  ('economy', 'intervention'),
  ('assembly', 'registered'),
  ('media', 'limited_censorship'),
  ('religion', 'pluralism'),
  ('army_pay', 'basic'),
  ('welfare', 'basic'),
  ('labor', 'ten_hours'),
  ('women', 'ignored'),
  ('nationality', 'lurik_exception')
on conflict (policy_key) do update set option_key = excluded.option_key;

-- Create Supabase Auth users first, then adjust the emails below.
-- Suggested accounts:
-- dm@peace.local
-- player1@peace.local
-- player2@peace.local
-- player3@peace.local
-- player4@peace.local
-- player5@peace.local

insert into public.profiles (id, display_name, role)
select id, 'DM', 'dm'::public.profile_role from auth.users where email = 'dm@peace.local'
on conflict (id) do update set display_name = excluded.display_name, role = excluded.role;

insert into public.profiles (id, display_name, role)
select id, 'player1', 'player'::public.profile_role from auth.users where email = 'player1@peace.local'
on conflict (id) do update set display_name = excluded.display_name, role = excluded.role;

insert into public.profiles (id, display_name, role)
select id, split_part(email, '@', 1), 'player'::public.profile_role
from auth.users
where email in ('player2@peace.local', 'player3@peace.local', 'player4@peace.local', 'player5@peace.local')
on conflict (id) do update set display_name = excluded.display_name, role = excluded.role;

with hanna_owner as (
  select id as owner_id from public.profiles where role = 'dm' order by created_at limit 1
),
ducal as (
  select id as faction_id from public.factions where key = 'ducal_loyalists'
),
inserted as (
  insert into public.characters_public (
    owner_id,
    name,
    gender,
    age,
    ethnicity,
    faith,
    faction_id,
    public_traits,
    public_background,
    is_preset
  )
  select
    hanna_owner.owner_id,
    '汉娜·派·提克多德',
    '女',
    17,
    '约尔裔',
    '瓦勒派',
    ducal.faction_id,
    '{"约尔贵族","资本家","精通双语","年轻气盛"}',
    '作为前任公爵埃德沃德二世的独生女，在父亲遭到刺杀后，高中还没有毕业的新公爵不得不走出象牙塔，承担起王室领袖的责任。',
    true
  from hanna_owner, ducal
  where not exists (select 1 from public.characters_public where name = '汉娜·派·提克多德')
  returning id
)
insert into public.character_private (
  character_id,
  body,
  willpower,
  wealth,
  charm,
  intellect,
  prestige,
  perception,
  luck,
  skills,
  secret_traits,
  pursuit,
  scandal_count
)
select
  id,
  40,
  60,
  80,
  70,
  70,
  30,
  50,
  45,
  '{"谈判":10,"演讲":70,"写作":40,"法律":60,"会计":10}'::jsonb,
  '{}',
  null,
  0
from inserted
on conflict (character_id) do nothing;

with c as (
  select id from public.characters_public where name = '汉娜·派·提克多德' limit 1
),
rows(name, gender, age, notes) as (
  values
    ('海因里希·莫尼坦', '男', 55, '管家'),
    ('塞勒斯·派·奥列克', '男', 27, '奥列克男爵'),
    ('拉约·夏利尔', '男', 36, '退役军官'),
    ('纳本莫·加德斯', '男', 41, '慈善家')
)
insert into public.retainers (character_id, name, gender, age, notes)
select c.id, rows.name, rows.gender, rows.age, rows.notes from c, rows
where not exists (select 1 from public.retainers r where r.character_id = c.id and r.name = rows.name);

insert into public.position_assignments (entity_type, entity_id, position_id)
select 'character', c.id, p.id
from public.characters_public c, public.positions p
where c.name = '汉娜·派·提克多德' and p.key = 'duke'
on conflict do nothing;
