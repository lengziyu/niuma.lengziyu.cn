import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ToolIcon } from './ToolIllustration';

export default function ToolCard({ tool, isFavorite, onToggleFavorite }) {
  return (
    <article className={`niuma-tool-card niuma-tool-card--${tool.accent}`}>
      <div className="niuma-tool-card__top">
        <div>
          <p className="niuma-tool-card__category">{tool.category}</p>
          <h3>{tool.title}</h3>
        </div>
        <button
          aria-label={isFavorite ? `取消收藏 ${tool.name}` : `收藏 ${tool.name}`}
          className={isFavorite ? 'is-active' : ''}
          type="button"
          onClick={() => onToggleFavorite(tool.id)}
        >
          <Star aria-hidden="true" size={18} />
        </button>
      </div>

      <p className="niuma-tool-card__description">{tool.description}</p>

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
        <Link className="niuma-tool-card__link" to={`/tools/${tool.id}`}>
          <span>打开</span>
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </article>
  );
}
