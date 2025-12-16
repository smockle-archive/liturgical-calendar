// iCalendar recommends (and some servers enforce) a max of 75 bytes per
// line in the .ics file.
const DEFAULT_MAX_LINE_BYTES = 75;

function takeUtf8Chunk(
  input: string,
  maxBytes: number
): { chunk: string; rest: string } {
  // Split a string into (chunk, rest) where chunk is the biggest prefix that
  // fits within maxBytes *in UTF-8 bytes*.
  if (Buffer.byteLength(input, "utf8") <= maxBytes) {
    return { chunk: input, rest: "" };
  }

  // Iterate by “real characters” (code points) so we don't cut something like
  // an emoji in half. For example: "🎉" is two UTF-16 code units in JS.
  const characters = Array.from(input);
  let chunk = "";
  let characterIndex = 0;
  for (; characterIndex < characters.length; characterIndex++) {
    const candidate = chunk + characters[characterIndex];
    if (Buffer.byteLength(candidate, "utf8") > maxBytes) {
      break;
    }
    chunk = candidate;
  }

  // In iCalendar, backslash escapes special characters.
  // Example: "SUMMARY:Saint Polycarp\, Bishop and Martyr".
  // Avoid folding right after a trailing backslash so we don't split an escape.
  if (chunk.endsWith("\\") && chunk.length > 1) {
    chunk = chunk.slice(0, -1);
    characterIndex = Math.max(0, characterIndex - 1);
  }

  const rest = characters.slice(characterIndex).join("");
  return { chunk, rest };
}

function foldIcsLine(line: string): string[] {
  // If a single .ics line is longer than 75 bytes, it should be wrapped.
  // Wrapped lines continue on the next line starting with a single space.
  // Example:
  //   SUMMARY:Some long title that...
  //    continues here
  // We always use a space (not a tab) for compatibility.
  if (Buffer.byteLength(line, "utf8") <= DEFAULT_MAX_LINE_BYTES) {
    return [line];
  }

  const physicalLines: string[] = [];

  let { chunk, rest } = takeUtf8Chunk(line, DEFAULT_MAX_LINE_BYTES);
  physicalLines.push(chunk);

  // The leading space counts toward the 75-byte limit.
  const continuationContentMaxBytes = DEFAULT_MAX_LINE_BYTES - 1;
  while (rest.length > 0) {
    const next = takeUtf8Chunk(rest, continuationContentMaxBytes);
    physicalLines.push(" " + next.chunk);
    rest = next.rest;
  }

  return physicalLines;
}

export function normalizeIcs(input: string): string {
  // Unfold: remove newline + leading whitespace (space or tab).
  const unfolded = input
    .replace(/\r\n[ \t]/g, "")
    .replace(/\n[ \t]/g, "")
    .replace(/\r[ \t]/g, "");

  // Normalize newlines to LF so we can split reliably.
  const logicalLines = unfolded
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line !== "");

  const physicalLines: string[] = [];
  for (const line of logicalLines) {
    physicalLines.push(...foldIcsLine(line));
  }

  return physicalLines.join("\r\n") + "\r\n";
}
