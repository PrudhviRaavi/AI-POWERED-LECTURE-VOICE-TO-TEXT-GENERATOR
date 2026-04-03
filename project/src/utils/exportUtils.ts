import type { Lecture, Note } from '../lib/supabase';

export function exportAsText(lecture: Lecture, note: Note): void {
  const content = `
${lecture.title}
Subject: ${lecture.subject}
Date: ${new Date(lecture.created_at).toLocaleDateString()}
Duration: ${formatDuration(lecture.duration)}

===========================================

TRANSCRIPTION:
${note.transcription}

===========================================

AI SUMMARY:
${note.ai_summary}

===========================================

KEY POINTS:
${note.key_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}

===========================================

NOTES:
${note.content}

===========================================

Tags: ${note.tags.join(', ')}
  `.trim();

  downloadFile(content, `${lecture.title}.txt`, 'text/plain');
}

export function exportAsMarkdown(lecture: Lecture, note: Note): void {
  const content = `
# ${lecture.title}

**Subject:** ${lecture.subject}
**Date:** ${new Date(lecture.created_at).toLocaleDateString()}
**Duration:** ${formatDuration(lecture.duration)}

---

## Transcription

${note.transcription}

---

## AI Summary

${note.ai_summary}

---

## Key Points

${note.key_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}

---

## Notes

${note.content}

---

**Tags:** ${note.tags.map(tag => `\`${tag}\``).join(', ')}
  `.trim();

  downloadFile(content, `${lecture.title}.md`, 'text/markdown');
}

export function exportAsPDF(lecture: Lecture, note: Note): void {
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; border-bottom: 2px solid #93c5fd; padding-bottom: 5px; }
    .metadata { background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .metadata p { margin: 5px 0; }
    .section { margin: 20px 0; }
    .key-points { list-style-position: inside; }
    .tags { margin-top: 20px; }
    .tag { background: #dbeafe; padding: 5px 10px; border-radius: 3px; display: inline-block; margin: 5px 5px 5px 0; }
  </style>
</head>
<body>
  <h1>${lecture.title}</h1>

  <div class="metadata">
    <p><strong>Subject:</strong> ${lecture.subject}</p>
    <p><strong>Date:</strong> ${new Date(lecture.created_at).toLocaleDateString()}</p>
    <p><strong>Duration:</strong> ${formatDuration(lecture.duration)}</p>
  </div>

  <div class="section">
    <h2>Transcription</h2>
    <p>${note.transcription.replace(/\n/g, '<br>')}</p>
  </div>

  <div class="section">
    <h2>AI Summary</h2>
    <p>${note.ai_summary.replace(/\n/g, '<br>')}</p>
  </div>

  <div class="section">
    <h2>Key Points</h2>
    <ol class="key-points">
      ${note.key_points.map(point => `<li>${point}</li>`).join('')}
    </ol>
  </div>

  <div class="section">
    <h2>Notes</h2>
    <p>${note.content.replace(/\n/g, '<br>')}</p>
  </div>

  <div class="tags">
    <strong>Tags:</strong>
    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
  </div>
</body>
</html>
  `.trim();

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
