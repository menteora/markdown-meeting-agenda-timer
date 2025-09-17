// FIX: Removed circular import of 'Activity' as it is defined within this file.

export enum ActivityStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
}

export type ActivityType = 'activity' | 'h1' | 'h2' | 'h3';

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  plannedDuration: number; // in seconds
  actualDuration: number | null;
  startTime: Date | null;
  endTime: Date | null;
  status: ActivityStatus;
}


// Utility functions for Markdown conversion

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


export const markdownToActivities = (markdown: string): Activity[] => {
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

export const activitiesToMarkdown = (activities: Activity[]): string => {
  let markdownString = '';
  activities.forEach((act, index) => {
    const prevActivity = index > 0 ? activities[index - 1] : null;

    // Add spacing before headings for readability
    if (act.type.startsWith('h') && prevActivity && prevActivity.type === 'activity') {
        markdownString += '\n';
    }

    switch (act.type) {
        case 'h1': 
            markdownString += `# ${act.name}\n\n`; // Add extra space after H1
            break;
        case 'h2': 
            markdownString += `## ${act.name}\n`;
            break;
        case 'h3': 
            markdownString += `### ${act.name}\n`;
            break;
        case 'activity':
        default:
          markdownString += `- ${act.name} [${Math.round(act.plannedDuration / 60)} min]\n`;
    }
  });
  return markdownString.trim();
};