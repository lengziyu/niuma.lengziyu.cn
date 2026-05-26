import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Activity
} from 'lucide-react';

const FAKE_PROJECTS = [
  { name: 'Q2 数字化转型推进', progress: 78, status: '进行中', owner: '张总' },
  { name: '客户管理系统升级', progress: 92, status: '收尾中', owner: '李经理' },
  { name: '年度安全合规审计', progress: 45, status: '进行中', owner: '王主管' },
  { name: '供应链优化方案', progress: 63, status: '进行中', owner: '赵总监' },
];

const FAKE_KPI = [
  { label: '本月完成任务', value: '127', unit: '项', trend: '+12%', icon: CheckCircle2 },
  { label: '团队效率指数', value: '94.6', unit: '%', trend: '+3.2%', icon: TrendingUp },
  { label: '活跃项目数', value: '18', unit: '个', trend: '+2', icon: Target },
  { label: '本周工时', value: '42.5', unit: 'h', trend: '-1.5h', icon: Clock },
];

const FAKE_CHART_DATA = [65, 72, 58, 80, 75, 88, 92, 85, 78, 90, 87, 95];

const FAKE_TEAM = [
  { name: '张伟', role: '项目经理', status: '在线', tasks: 12 },
  { name: '李娜', role: '产品设计', status: '在线', tasks: 8 },
  { name: '王磊', role: '前端开发', status: '忙碌', tasks: 15 },
  { name: '陈静', role: '数据分析', status: '在线', tasks: 6 },
  { name: '刘洋', role: '后端开发', status: '离线', tasks: 9 },
];

const FAKE_ACTIVITIES = [
  { time: '11:42', content: '张伟 提交了《Q2季度复盘报告》', type: 'doc' },
  { time: '11:15', content: '系统自动备份完成，数据量 2.4GB', type: 'system' },
  { time: '10:58', content: '李娜 更新了客户管理系统原型 v3.2', type: 'design' },
  { time: '10:30', content: '王磊 合并了 feature/dashboard 分支', type: 'code' },
  { time: '09:45', content: '陈静 导出了本月销售数据报表', type: 'data' },
  { time: '09:20', content: '刘洋 部署了 API v2.8.1 到生产环境', type: 'deploy' },
];

const FAKE_SYSTEM_STATS = [
  { label: 'CPU 使用率', value: 34, color: '#3b82f6' },
  { label: '内存占用', value: 62, color: '#22c55e' },
  { label: '磁盘空间', value: 48, color: '#f59e0b' },
  { label: '网络带宽', value: 21, color: '#8b5cf6' },
];function MiniBarChart({ data }) {
  const max = Math.max(...data);
  return (
    <div className="boss-chart">
      {data.map((v, i) => (
        <div
          key={i}
          className="boss-chart__bar"
          style={{
            height: `${(v / max) * 100}%`,
            animationDelay: `${i * 60}ms`
          }}
        />
      ))}
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="boss-loading-dots">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function BossMode() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="boss-mode">
      <header className="boss-header">
        <div className="boss-header__brand">
          <Activity size={22} />
          <span>企业智能工作台</span>
        </div>
        <div className="boss-header__meta">
          <span className="boss-header__status">
            <span className="boss-header__dot" />
            系统运行正常
          </span>
          <span className="boss-header__time">{new Date().toLocaleDateString('zh-CN')} {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </header>

      {!loaded ? (
        <div className="boss-loading">
          <Activity size={32} className="boss-loading__icon" />
          <p>正在加载工作台数据<LoadingDots /></p>
        </div>
      ) : (
        <div className="boss-content">
          <section className="boss-kpi-grid">
            {FAKE_KPI.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <article className="boss-kpi-card" key={kpi.label}>
                  <div className="boss-kpi-card__icon">
                    <Icon size={20} />
                  </div>
                  <div className="boss-kpi-card__body">
                    <span className="boss-kpi-card__label">{kpi.label}</span>
                    <div className="boss-kpi-card__value">
                      <strong>{kpi.value}</strong>
                      <span className="boss-kpi-card__unit">{kpi.unit}</span>
                    </div>
                    <span className="boss-kpi-card__trend">
                      <ArrowUpRight size={12} />
                      {kpi.trend}
                    </span>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="boss-main-grid">
            <section className="boss-panel boss-panel--chart">
              <div className="boss-panel__header">
                <h3><BarChart3 size={16} /> 月度绩效趋势</h3>
                <span>2026年度</span>
              </div>
              <MiniBarChart data={FAKE_CHART_DATA} />
            </section>

            <section className="boss-panel boss-panel--projects">
              <div className="boss-panel__header">
                <h3><Users size={16} /> 重点项目进度</h3>
                <span>{FAKE_PROJECTS.length} 个进行中</span>
              </div>
              <div className="boss-project-list">
                {FAKE_PROJECTS.map((project) => (
                  <div className="boss-project" key={project.name}>
                    <div className="boss-project__info">
                      <strong>{project.name}</strong>
                      <span>{project.owner} · {project.status}</span>
                    </div>
                    <div className="boss-project__bar">
                      <div
                        className="boss-project__fill"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="boss-project__percent">{project.progress}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="boss-bottom-grid">
            <section className="boss-panel boss-panel--team">
              <div className="boss-panel__header">
                <h3><Users size={16} /> 团队成员</h3>
                <span>{FAKE_TEAM.filter((t) => t.status === '在线').length} 人在线</span>
              </div>
              <div className="boss-team-list">
                {FAKE_TEAM.map((member) => (
                  <div className="boss-team-member" key={member.name}>
                    <div className="boss-team-member__avatar">
                      {member.name[0]}
                    </div>
                    <div className="boss-team-member__info">
                      <strong>{member.name}</strong>
                      <span>{member.role}</span>
                    </div>
                    <span className={`boss-team-member__status boss-team-member__status--${member.status === '在线' ? 'online' : member.status === '忙碌' ? 'busy' : 'offline'}`}>
                      {member.status}
                    </span>
                    <span className="boss-team-member__tasks">{member.tasks} 任务</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="boss-panel boss-panel--activity">
              <div className="boss-panel__header">
                <h3><Activity size={16} /> 最近动态</h3>
                <span>今日</span>
              </div>
              <div className="boss-activity-list">
                {FAKE_ACTIVITIES.map((item, i) => (
                  <div className="boss-activity" key={i}>
                    <span className="boss-activity__time">{item.time}</span>
                    <span className="boss-activity__content">{item.content}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="boss-panel boss-panel--system">
              <div className="boss-panel__header">
                <h3><BarChart3 size={16} /> 系统资源</h3>
                <span>实时</span>
              </div>
              <div className="boss-system-list">
                {FAKE_SYSTEM_STATS.map((stat) => (
                  <div className="boss-system-item" key={stat.label}>
                    <div className="boss-system-item__header">
                      <span>{stat.label}</span>
                      <strong>{stat.value}%</strong>
                    </div>
                    <div className="boss-system-item__bar">
                      <div
                        className="boss-system-item__fill"
                        style={{ width: `${stat.value}%`, background: stat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
