import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDashboardData } from '@/hooks';
import {
  PageContainer,
  StatCard,
  StatCardGrid,
  ProjectList,
  TutorialModal,
  Banner,
  BannerTitle,
  BannerDescription,
  BannerActions,
  BannerButton,
  type TutorialItem,
} from '@/components/ui';

const TUTORIALS: TutorialItem[] = [
  {
    id: 'quick-start',
    title: '快速启动剧本',
    desc: '如何从剧本大纲开始构建第一幕场景，梳理核心戏剧冲突点。',
    icon: '⚡',
    content: {
      sections: [
        {
          subtitle: '黄金3秒原则',
          body: '短剧的第一镜必须具备强视觉冲击力或悬念。避免冗长的背景铺垫，直接将主角置入危机或巨大反差中。',
        },
        {
          subtitle: '钩子设置',
          body: '每一集结束时必须留有"钩子"。例如：身份暴露的瞬间、致命误会的产生或突如其来的危机。',
        },
      ],
      tips: ['先写大纲再填充细节', '每一个场景都要服务于核心冲突', '删除所有不推动情节的废话'],
    },
  },
  {
    id: 'dialogue',
    title: '对白润色技巧',
    desc: '学习如何针对不同角色性格设定专属的对话逻辑，增加台词的张力。',
    icon: '🎭',
    content: {
      sections: [
        {
          subtitle: '潜台词的力量',
          body: '不要让角色直接说出心里话。通过正话反说、避重就轻或重复关键词来展现人物内心复杂的斗争。',
        },
        {
          subtitle: '节奏感与留白',
          body: '对话的节奏应有起伏。高潮处台词要短促有力，情感细腻处则可以适当增加动作描写替代语言。',
        },
      ],
      tips: ['读出你的台词，确保它听起来像人话', '给每个角色设定2-3个常用词根', '少用形容词，多用动词'],
    },
  },
  {
    id: 'versioning',
    title: '多版本剧本管理',
    desc: '在项目中如何高效管理不同创作阶段的草稿，利用版本功能找回最佳点。',
    icon: '📂',
    content: {
      sections: [
        {
          subtitle: '版本命名规范',
          body: '建议采用"日期_状态_负责人"的命名方式。例如：231025_初稿_喵酱。避免使用"最终版1"、"绝对不改版"等模糊词汇。',
        },
        {
          subtitle: '增量备份逻辑',
          body: '每当进行大的剧情分歧点创作时，请务必创建一个新的副本。这能让你在创意走进死胡同时快速回滚。',
        },
      ],
      tips: ['定期清理过期草稿', '在备注中记录每个版本修改的核心点', '善用云端同步功能'],
    },
  },
  {
    id: 'collaboration',
    title: '团队实时协作',
    desc: '邀请导演与制片人实时评论，大幅缩短剧本审阅与定稿周期。',
    icon: '👥',
    content: {
      sections: [
        {
          subtitle: '精准批注',
          body: '使用编辑器的批注功能。针对具体的行或段落提出意见，而不是笼统地说"这里感觉不对"。',
        },
        {
          subtitle: '角色权限划分',
          body: '明确制片、导演、编剧的修改权限。通常情况下，编剧负责主要逻辑，导演负责镜头感建议。',
        },
      ],
      tips: ['保持反馈的即时性', '尊重创作原意，以逻辑说服对方', '建立团队共同的剧本审美标准'],
    },
  },
];

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { stats, statsLoading, recentProjects, projectsLoading } = useDashboardData(5);

  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialItem | null>(null);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    setSelectedTutorial(null);
  };

  return (
    <PageContainer className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Banner */}
      <Banner variant="primary" size="md">
        <BannerTitle highlight={user?.username}>欢迎回来</BannerTitle>
        <BannerDescription>开始你的专业创作之旅，今天又有什么精彩的创意？</BannerDescription>
        <BannerActions>
          <BannerButton variant="primary" onClick={() => navigate('/script/new')}>
            新建剧本
          </BannerButton>
          <BannerButton variant="secondary" onClick={() => setShowTutorial(true)}>
            创作指南
          </BannerButton>
        </BannerActions>
      </Banner>

      {/* Stats Grid */}
      <StatCardGrid>
        {statsLoading
          ? [...Array(4)].map((_, i) => <StatCard key={i} data={{ label: '', value: 0, change: 0, type: 'up' }} loading />)
          : stats.map((stat, idx) => <StatCard key={idx} data={stat} />)}
      </StatCardGrid>

      {/* Recent Projects Section */}
      <ProjectList
        projects={recentProjects}
        loading={projectsLoading}
        maxItems={5}
        showViewAll
        onViewAll={() => navigate('/project')}
      />

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        tutorials={TUTORIALS}
        selectedTutorial={selectedTutorial}
        onSelectTutorial={setSelectedTutorial}
      />
    </PageContainer>
  );
};

export default Dashboard;
