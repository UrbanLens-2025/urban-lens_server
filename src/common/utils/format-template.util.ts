export function formatTemplate(
  templateStr?: string,
  context?: Record<string, string>,
): string {
  if (!templateStr || !context) return templateStr || '';

  let formattedStr = templateStr;
  for (const key in context) {
    formattedStr = formattedStr.replace(
      new RegExp(`\\{${key}\\}`, 'g'),
      context[key],
    );
  }
  return formattedStr;
}

export function formatObjectTemplate<T>(
  obj: T,
  context?: Record<string, string>,
) {
  if (!context) return obj;

  const formattedObj: Record<string, any> = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      formattedObj[key] = formatTemplate(
        obj[key] as unknown as string,
        context,
      );
    } else {
      formattedObj[key] = obj[key];
    }
  }
  return formattedObj as T;
}
