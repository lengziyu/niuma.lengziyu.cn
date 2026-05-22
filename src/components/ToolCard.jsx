import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToolIcon } from './ToolIllustration';

export default function ToolCard({ tool, isFavorite, onToggleFavorite }) {
  const navigate = useNavigate();
  const quickTags = tool.keywords?.slice(0, 2) ?? [];

  function handleCardClick(e) {
    // Don't navigate if clicking the favorite button
    if (e.target.closest('.niuma-tool-card__fav')) return;
    navigate(`/tools/${tool.id}`);
  }

  return (
    <article
      className={`niuma-tool-card niuma-tool-card--${tool.accent}`}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e); }}
    >
      <div className="niuma-tool-card__top">
        <div className="niuma-tool-card__heading">
          <p className="niuma-tool-card__category">{tool.category}</p>
          <h3>{tool.name}</h3>
        </div>
        <button
          aria-label={isFavorite ? `取消收藏 ${tool.name}` : `收藏 ${tool.name}`}
          aria-pressed={isFavorite}
          className={`niuma-tool-card__fav ${isFavorite ? 'is-active' : ''}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(tool.id);
          }}
        >
          <Star aria-hidden="true" size={18} />
        </button>
      </div>

      <p className="niuma-tool-card__description">{tool.description}</p>

      {quickTags.length ? (
        <div className="niuma-tool-card__tags" aria-label="常用关键词">
          {quickTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="niuma-tool-card__bottom">
        <div
          className={
            tool.iconImage
              ? 'niuma-tool-card__icon niuma-tool-card__icon--image'
              : 'niuma-tool-card__icon niuma-tool-card__icon--fallback'
          }
        >
          {tool.iconImage ? (
            <img alt="" src={tool.iconImage} />
          ) : (
            <ToolIcon kind={tool.iconKind} />
          )}
        </div>
        <span className="niuma-tool-card__link">
          <span>打开</span>
          <ArrowRight aria-hidden="true" size={16} />
        </span>
      </div>
    </article>
  );
}
