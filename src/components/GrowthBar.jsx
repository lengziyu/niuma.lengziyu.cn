import { Sparkles } from 'lucide-react';

export default function GrowthBar({ rewards, onSlackingClick }) {
  return (
    <section className="niuma-growth">
      <div className="niuma-growth__main">
        <div className="niuma-growth__identity">
          <img alt="成长中的小牛头像" src="/images/avatar-cow.png" />
          <div>
            <h2>我的小牛成长</h2>
            <p>
              <strong>Lv.2</strong>
              <span>牛马小能手</span>
            </p>
          </div>
        </div>

        <div className="niuma-growth__meter">
          <div className="niuma-growth__bar">
            <span style={{ width: '60%' }} />
          </div>
          <div className="niuma-growth__stats">
            <strong>60/100</strong>
            <span>再使用 40 能量即可升级哦！</span>
          </div>
        </div>
      </div>

      <div className="niuma-growth__rewards">
        {rewards.map((reward) => (
          <article className="niuma-growth__reward" key={reward.title}>
            <img alt="" src={reward.image} />
            <div>
              <strong>能量满解锁</strong>
              <span>{reward.title}</span>
            </div>
          </article>
        ))}
      </div>

      <button className="niuma-growth__float-btn" type="button" onClick={onSlackingClick}>
        <Sparkles aria-hidden="true" size={18} />
        <span>摸鱼一下</span>
      </button>
    </section>
  );
}
