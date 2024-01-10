import {
  ChatModel,
  createOpenAIClient,
  Msg,
  type Prompt,
} from '@dexaai/dexter';
import { EnvVars } from './env-vars';
import type { SearchResult } from './serpapi';

/** Client for making requests to the OpenAI API. ( https://github.com/dexaai/dexter ) */
const openaiClient = createOpenAIClient({ apiKey: EnvVars.openAI() });

/** Use ChatModel to make requests to the chat completion endpoint. */
const chatModel = new ChatModel({
  client: openaiClient,
  debug: true,
  params: {
    model: 'gpt-3.5-turbo-1106', // we cannot use an instruct model here
  },
});

/** Summarize Google search results using the OpenAI API. */
/*
When the user submits a new search, they should be presented with the search 
results from Google, as well as an AI generated response to their query, based 
on the retrieved Google search results.
*/
export async function summarizeSearchResults(args: {
  query: string;
  searchResults: SearchResult[];
}): Promise<string> {
  const { query, searchResults } = args;

  let prompt = `Provide an objective summary about "${query}" based on the provided information. The summary should be in the third person, focusing on general recommendations or findings without personal opinions. Present the information in a clear and concise manner. When citing sources, refer to them by their index number as provided in the input.

  Example:
  Question: When did ancient peoples usually harvest sugar cane?
  Answer: Ancient peoples harvested sugar cane at different times across the world. It was an ancient crop of Austronesian and Papuan people, introduced to southern China and India around 1200 to 1000 BC (Source 1). It became widespread in the medieval Arab world and in medieval Southern Europe during Arab rule (Source 2). The first sugar harvest in the Americas occurred in 1501 (Source 3). The harvesting times varied regionally and culturally.
  
  Provided Information:\n\n
  `;

  searchResults.forEach((result, index) => {
    prompt += `Result ${index + 1}: ${result.description}\n`;
  });

  const { message } = await chatModel.run({ messages: [Msg.user(prompt)] });

  if (!Msg.isAssistant(message)) {
    throw new Error('Expected assistant message');
  }
  return message.content;
}
