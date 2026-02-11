import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import api from '../services/api';

const TemplatePicker = ({ onSelectTemplate, unionType }) => {
  const [templates, setTemplates] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && templates.length === 0) {
      fetchTemplates();
    }
  }, [expanded]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = unionType ? `?unionType=${unionType}` : '';
      const response = await api.get(`/features/templates${params}`);
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template) => {
    onSelectTemplate({
      contractArticle: template.contract_article,
      violationType: template.violation_type,
      briefDescription: template.brief_description_template || '',
      detailedDescription: template.detailed_description_template || '',
    });
    setExpanded(false);
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <span className="text-sm font-medium">Quick-File from Template</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No templates available.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {templates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelect(t)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.contract_article} — {t.violation_type}</p>
                      {t.description && <p className="text-xs text-gray-400 mt-1">{t.description}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplatePicker;
