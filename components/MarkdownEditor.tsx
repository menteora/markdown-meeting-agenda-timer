import React, { useState, useEffect, useRef } from 'react';
import { Activity, ActivityStatus, ActivityType } from '../types';
import { ListPlusIcon, ClockIcon, Heading1Icon, Heading2Icon, Heading3Icon } from './icons';


interface MarkdownEditorProps {
  activities: Activity[];
  onSave: (activities: Activity[]) => void;
  onCancel: () => void;
}

const activitiesToMarkdown = (activities: Activity[]): string => {
  return activities
    .map(act => {
      switch (act.type) {
        case 'h1': return `# ${act.name}`;
        case 'h2': return `## ${act.name}`;
        case 'h3': return `### ${act.name}`;
        case 'activity':
        default:
          return `- ${act.name} [${Math.round(act.plannedDuration / 60)} min]`;
      }
    })
    .join('\n');
};

const createHeading = (type: 'h1' | 'h2' | 'h3', name: string): Activity => ({
    id: `md-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    type,
    plannedDuration: 0,
    actualDuration: null,
    startTime: null,
    endTime: null,
    status: ActivityStatus.Pending,
});


const markdownToActivities = (markdown: string): Activity[] => {
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  
  return lines.map(line => {
    line = line.trim();

    if (line.startsWith('### ')) {
        return createHeading('h3', line.substring(4));
    }
    if (line.startsWith('## ')) {
        return createHeading('h2', line.substring(3));
    }
    if (line.startsWith('# ')) {
        return createHeading('h1', line.substring(2));
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
        line = line.substring(2).trim();
    }

    const durationRegex = /\[(\d+)\s*min\]$/;
    const match = line.match(durationRegex);
    
    let name = line;
    let durationMin = 5; // Default duration if not specified

    if (match) {
        const potentialName = line.replace(durationRegex, '').trim();
        if (potentialName) {
            name = potentialName;
            durationMin = parseInt(match[1], 10);
        }
    }

    return {
        id: `md-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: 'activity',
        plannedDuration: durationMin * 60,
        actualDuration: null,
        startTime: null,
        endTime: null,
        status: ActivityStatus.Pending,
    };
  });
};

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ activities, onSave, onCancel }) => {
  const [markdownText, setMarkdownText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMarkdownText(activitiesToMarkdown(activities));
  }, [activities]);

  const handleSave = () => {
    const newActivities = markdownToActivities(markdownText);
    onSave(newActivities);
  };
  
  const insertTextAtCursor = (options: {
    text: string;
    isBlock?: boolean;
    selectionStartOffset?: number;
    selectionEndOffset?: number;
  }) => {
    const { text, isBlock = false, selectionStartOffset, selectionEndOffset } = options;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    let textBefore = currentText.substring(0, start);
    let textAfter = currentText.substring(end);

    if (isBlock) {
        if (textBefore.length > 0 && !textBefore.endsWith('\n')) {
            textBefore += '\n';
        }
        if(textAfter.length > 0 && !textAfter.startsWith('\n')){
            textAfter = '\n' + textAfter;
        }
    }
    
    const newText = textBefore + text + textAfter;
    setMarkdownText(newText);

    setTimeout(() => {
        textarea.focus();
        const initialCursorPos = textBefore.length;
        if (selectionStartOffset !== undefined && selectionEndOffset !== undefined) {
            textarea.selectionStart = initialCursorPos + selectionStartOffset;
            textarea.selectionEnd = initialCursorPos + selectionEndOffset;
        } else {
            const newCursorPos = initialCursorPos + text.length;
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;
        }
    }, 0);
  };
  
  const handleAddActivityLine = () => {
    const textToInsert = '- Nuova attività';
    insertTextAtCursor({
      text: textToInsert,
      isBlock: true,
      selectionStartOffset: 2,
      selectionEndOffset: textToInsert.length,
    });
  };

  const handleAddDuration = () => {
    const textToInsert = '[10 min]';
    insertTextAtCursor({
      text: textToInsert,
      selectionStartOffset: 1,
      selectionEndOffset: 3,
    });
  };
  
  const handleAddHeading = (level: 1 | 2 | 3) => {
    const prefix = '#'.repeat(level);
    const textToInsert = `${prefix} Titolo`;
    insertTextAtCursor({
      text: textToInsert,
      isBlock: true,
      selectionStartOffset: prefix.length + 1,
      selectionEndOffset: textToInsert.length,
    });
  }


  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold text-slate-300 mb-3">Modifica Agenda (Testo)</h3>
      <p className="text-sm text-slate-400 mb-4">
        Modifica l'agenda qui sotto. Ogni riga è un'attività. Usa il formato <code>- Nome attività [Durata min]</code> o <code># Titolo</code>.
      </p>

      <div className="flex gap-2 mb-2 flex-wrap">
        <button
            onClick={handleAddActivityLine}
            className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-colors"
        >
            <ListPlusIcon className="w-4 h-4 mr-2" />
            <span>Attività</span>
        </button>
        <button
            onClick={handleAddDuration}
            className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-colors"
        >
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>Durata</span>
        </button>
        <button
            onClick={() => handleAddHeading(1)}
            className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-colors"
        >
            <Heading1Icon className="w-4 h-4 mr-2" />
            <span>H1</span>
        </button>
        <button
            onClick={() => handleAddHeading(2)}
            className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-colors"
        >
            <Heading2Icon className="w-4 h-4 mr-2" />
            <span>H2</span>
        </button>
        <button
            onClick={() => handleAddHeading(3)}
            className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-colors"
        >
            <Heading3Icon className="w-4 h-4 mr-2" />
            <span>H3</span>
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={markdownText}
        onChange={(e) => setMarkdownText(e.target.value)}
        className="flex-grow w-full bg-slate-900 border border-slate-600 rounded-md p-4 placeholder-slate-500 text-slate-200 font-mono text-sm resize-none"
        placeholder="- Introduzione [5 min]&#10;# Progetto A&#10;- Discussione Progetto A [15 min]&#10;- Conclusioni"
        rows={15}
        aria-label="Editor di testo per l'agenda"
      />
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Annulla
        </button>
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Salva Modifiche
        </button>
      </div>
    </div>
  );
};
