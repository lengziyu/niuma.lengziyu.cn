import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Workbench from '../components/Workbench';
import { getToolById } from '../data/tools';

export default function ToolPage() {
  const { toolId } = useParams();
  const tool = getToolById(toolId);

  if (!tool) {
    return null;
  }

  return (
    <div className="page tool-detail-page">
      <main className="tool-detail-shell">
        <header className="tool-detail-header">
          <Link className="tool-detail-back" to="/tools">
            <ArrowLeft aria-hidden="true" size={22} />
            <span>返回列表</span>
          </Link>
        </header>

        <section className="tool-detail-stage">
          <h1 className="tool-detail-sr-only">{tool.name}</h1>
          <p className="tool-detail-sr-only">{tool.tagline}</p>
          <Workbench tool={tool} />
        </section>
      </main>
    </div>
  );
}
