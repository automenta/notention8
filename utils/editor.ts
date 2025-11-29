export const formatHtmlForDisplay = (html: string) => {
  if (!html) return '';
  const blockTags = [
    'p',
    'h1',
    'h2',
    'h3',
    'hr',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
  ];
  const regex = new RegExp(`(<(?:${blockTags.join('|')})[^>]*>)`, 'g');
  return html.replace(regex, '\n$1').trim();
};
