import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToolIcon } from './ToolIllustration';

const TOOL_CARD_COPY = {
  zh: {
    addFavorite: '收藏',
    removeFavorite: '取消收藏',
    keywordsAria: '常用关键词',
    open: '打开'
  },
  en: {
    addFavorite: 'Add favorite',
    removeFavorite: 'Remove favorite',
    keywordsAria: 'Common keywords',
    open: 'Open'
  }
};

export default function ToolCard({ tool, isFavorite, onToggleFavorite, locale = 'zh' }) {
  const navigate = useNavigate();
  const quickTags = tool.keywords?.slice(0, 2) ?? [];
  const copy = TOOL_CARD_COPY[locale] ?? TOOL_CARD_COPY.zh;

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
          aria-label={isFavorite ? `${copy.removeFavorite} ${tool.name}` : `${copy.addFavorite} ${tool.name}`}
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
        <div className="niuma-tool-card__tags" aria-label={copy.keywordsAria}>
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
          <span>{copy.open}</span>
          <ArrowRight aria-hidden="true" size={16} />
        </span>
      </div>
    </article>
  );
}
