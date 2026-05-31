import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Workbench from '../components/Workbench';
import { getToolById } from '../data/tools';
import { localizeTool } from '../data/toolLocale';

const TOOL_PAGE_COPY = {
  zh: {
    backToList: '返回列表'
  },
  en: {
    backToList: 'Back to list'
  }
};

export default function ToolPage({ locale = 'zh' }) {
  const { toolId } = useParams();
  const tool = getToolById(toolId);
  const displayTool = localizeTool(tool, locale);
  const copy = TOOL_PAGE_COPY[locale] ?? TOOL_PAGE_COPY.zh;

  if (!tool) {
    return null;
  }

  return (
    <div className="page tool-detail-page">
      <main className="tool-detail-shell">
        <header className="tool-detail-header">
          <Link className="tool-detail-back" to="/tools">
            <ArrowLeft aria-hidden="true" size={22} />
            <span>{copy.backToList}</span>
          </Link>
        </header>

        <section className="tool-detail-stage">
          <h1 className="tool-detail-sr-only">{displayTool.name}</h1>
          <p className="tool-detail-sr-only">{displayTool.tagline}</p>
          <Workbench locale={locale} tool={tool} />
        </section>
      </main>
    </div>
  );
}
