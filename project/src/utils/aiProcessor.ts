export async function generateAISummary(transcription: string): Promise<string> {
  if (!transcription || transcription.trim().length < 50) {
    return 'No sufficient content to generate summary.';
  }

  const sentences = transcription.match(/[^.!?]+[.!?]+/g) || [];
  const wordCount = transcription.split(/\s+/).length;

  const summaryLength = Math.min(Math.ceil(sentences.length / 3), 5);
  const summary = sentences.slice(0, summaryLength).join(' ');

  return `Summary (${wordCount} words):\n\n${summary || transcription.slice(0, 500)}...`;
}

export async function extractKeyPoints(transcription: string): Promise<string[]> {
  if (!transcription || transcription.trim().length < 50) {
    return ['No sufficient content for key points extraction.'];
  }

  const sentences = transcription.match(/[^.!?]+[.!?]+/g) || [];

  const keywords = [
    'important', 'key', 'note', 'remember', 'critical', 'essential',
    'main', 'primary', 'significant', 'first', 'second', 'third',
    'finally', 'conclusion', 'summary', 'therefore', 'thus'
  ];

  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;

    keywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) {
        score += 2;
      }
    });

    if (sentence.includes('?')) score += 1;
    if (sentence.length > 50 && sentence.length < 150) score += 1;

    return { sentence: sentence.trim(), score };
  });

  scoredSentences.sort((a, b) => b.score - a.score);

  const topPoints = scoredSentences.slice(0, Math.min(8, Math.ceil(sentences.length / 4)));

  return topPoints.map(p => p.sentence);
}

export async function generateTags(transcription: string, subject: string): Promise<string[]> {
  const tags: string[] = [];

  if (subject && subject.trim()) {
    tags.push(subject.trim());
  }

  const commonTopics = [
    'mathematics', 'science', 'history', 'programming', 'physics',
    'chemistry', 'biology', 'english', 'literature', 'economics',
    'business', 'psychology', 'philosophy', 'engineering', 'computer',
    'data', 'algorithm', 'theory', 'practical', 'lecture', 'tutorial'
  ];

  const lowerTranscription = transcription.toLowerCase();

  commonTopics.forEach(topic => {
    if (lowerTranscription.includes(topic)) {
      tags.push(topic.charAt(0).toUpperCase() + topic.slice(1));
    }
  });

  const words = transcription.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  const wordFrequency: { [key: string]: number } = {};

  words.forEach(word => {
    if (!['about', 'there', 'their', 'would', 'could', 'should', 'which', 'these', 'those'].includes(word)) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });

  const frequentWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  tags.push(...frequentWords);

  return [...new Set(tags)].slice(0, 6);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
