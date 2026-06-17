import { Link } from 'react-router-dom';
import { getToolById } from '../data/tools';
import { ToolIcon } from './ToolIllustration';

const iconMap = {
  'image-compress': 'compress',
  'image-resize': 'resize',
  'image-convert': 'convert',
  'image-id-photo-bg': 'imagepdf',
  'pdf-compress': 'doc',
  'pdf-to-word': 'doc',
  'word-to-pdf': 'doc',
  'pdf-merge': 'merge',
  'pdf-split': 'split',
  'pdf-organize': 'split',
  'pdf-unlock': 'doc',
  'excel-merge-split': 'merge',
  'json-excel': 'sheet',
  'qr-generator': 'qr'
};

export default function ToolGroup({ category }) {
  return (
    <section className="tool-group" aria-labelledby={category.id}>
      <div className="tool-group__meta">
        <p className="section-label">工具分组</p>
        <h2 id={category.id}>{category.name}</h2>
        <p>{category.intro}</p>
      </div>

      <div className="tool-group__list">
        {category.tools.map((toolId) => {
          const tool = getToolById(toolId);

          return (
            <Link className="tool-link" key={tool.id} to={`/tools/${tool.id}`}>
              <span className="tool-link__icon">
                <ToolIcon kind={iconMap[tool.id]} />
              </span>
              <span className="tool-link__content">
                <strong>{tool.name}</strong>
                <small>{tool.tagline}</small>
              </span>
              <span className="tool-link__action">打开</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
