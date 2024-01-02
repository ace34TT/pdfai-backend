export function extractQuestions(inputString: string) {
  var regex = /[?]\s*\n/g; // Matches a question mark followed by any number of spaces and a newline
  var splitString = inputString.split(regex); // Splits the string at each match
  var questions = splitString.slice(0, -1); // Removes the last element, which is usually an empty string
  return questions;
}
