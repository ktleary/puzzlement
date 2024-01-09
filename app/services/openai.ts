import {
  ChatModel,
  createOpenAIClient,
  Msg,
  type Prompt,
} from '@dexaai/dexter';
import { EnvVars } from './env-vars';
import type { SearchResult } from './serpapi';

/**
 * Use this to make requests to the OpenAI API.
 * Docs: https://github.com/dexaai/dexter
 */

/** Client for making requests to the OpenAI API. */
const openaiClient = createOpenAIClient({ apiKey: EnvVars.openAI() });

/** Use ChatModel to make requests to the chat completion endpoint. */
const chatModel = new ChatModel({
  client: openaiClient,
  debug: true,
  params: {
    model: 'gpt-3.5-turbo-1106',
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

  const messages: Prompt.Msg[] = [
    Msg.user(
      'Summarize the following search engine results for ' +
        query +
        '. Give priority to the top results. The summary will be displayed to the user as one answer to their query and must not be ambiguous.'
    ),
  ];

  searchResults.forEach((result) => messages.push(Msg.user(result.snippet)));

  console.log('messages', messages, 'query', query);

  const { message } = await chatModel.run({
    messages: messages,
  });

  if (!Msg.isAssistant(message)) {
    throw new Error('Expected assistant message');
  }
  return message.content;
}

/*
Class: ChatModel
Extends
AbstractModel<Client, Config, Run, Response, ApiResponse>
Constructors
new ChatModel(args)
new ChatModel(args?): ChatModel
run()
run(params, context?): Promise<Response>

Parameters
Parameter	Type
params	object
params.frequency_penalty?	null | number
params.function_call?	"none" | "auto" | ChatCompletionFunctionCallOption
params.functions?	Function[]
params.handleUpdate?	(chunk) => void
params.logit_bias?	null | Record<string, number>
params.max_tokens?	null | number
params.messages?	ChatMessage[]
params.model?	"gpt-4" | "gpt-4-32k" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | string & object | "gpt-4-0314" | "gpt-4-0613" | "gpt-4-32k-0314" | "gpt-4-32k-0613" | "gpt-3.5-turbo-0301" | "gpt-3.5-turbo-0613" | "gpt-3.5-turbo-16k-0613"
params.presence_penalty?	null | number
params.response_format?	ResponseFormat
params.seed?	null | number
params.stop?	null | string | string[]
params.temperature?	null | number
params.tool_choice?	ChatCompletionToolChoiceOption
params.tools?	ChatCompletionTool[]
params.top_p?	null | number
context?	Ctx
Returns
Promise<Response> // <-- This is the return type of the run method.

===

Interface: Response
Extends
Response.ChatResponse
Properties
Property	Type	Description	Inheritance	Source
cached	boolean	-	Response.cached	src/model/types.ts:36
cost?	number	-	Response.cost	src/model/types.ts:38
latency?	number	-	Response.latency	src/model/types.ts:37
message	ChatMessage	-	-	src/model/types.ts:73

===

import type {
  ChatMessage, // <-- This is the type of the message property of the Response interface.
  ChatParams,
  ChatResponse,
  ChatStreamResponse,
  CompletionParams,
  CompletionResponse,
  EmbeddingParams,
  EmbeddingResponse,
  OpenAIClient,
} from 'openai-fetch';
*/

/*

import 'dotenv/config';
import { z } from 'zod';
import { ChatModel, createAIFunction, Msg, type Prompt } from '@dexaai/dexter';


async function main() {
  const getWeather = createAIFunction(
    {
      name: 'get_weather',
      description: 'Gets the weather for a given location',
      argsSchema: z.object({
        location: z
          .string()
          .describe('The city and state e.g. San Francisco, CA'),
        unit: z
          .enum(['c', 'f'])
          .optional()
          .default('f')
          .describe('The unit of temperature to use'),
      }),
    },
    // Fake weather API implementation which returns a random temperature
    // after a short delay
    async (args: { location: string; unit?: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        location: args.location,
        unit: args.unit,
        temperature: (30 + Math.random() * 70) | 0,
      };
    }
  );

  const chatModel = new ChatModel({
    debug: true,
    params: {
      model: 'gpt-4-1106-preview',
      temperature: 0.5,
      max_tokens: 500,
      tools: [
        {
          type: 'function',
          function: getWeather.spec,
        },
      ],
    },
  });

  const messages: Prompt.Msg[] = [
    Msg.user('What is the weather in San Francisco?'),
  ];

  {
    // Invoke the chat model and have it create the args for the `get_weather` function
    const { message } = await chatModel.run({
      messages,
      tool_choice: {
        type: 'function',
        function: {
          name: 'get_weather',
        },
      },
    });

    if (!Msg.isToolCall(message)) {
      throw new Error('Expected tool call');
    }
    messages.push(message);

    for (const toolCall of message.tool_calls) {
      if (toolCall.function.name !== 'get_weather') {
        throw new Error(`Invalid function name: ${toolCall.function.name}`);
      }

      const result = await getWeather(toolCall.function.arguments);
      const toolResult = Msg.toolResult(result, toolCall.id);
      messages.push(toolResult);
    }
  }

  {
    // Invoke the chat model with the result
    const { message } = await chatModel.run({
      messages,
      tool_choice: 'none',
    });
    if (!Msg.isAssistant(message)) {
      throw new Error('Expected assistant message');
    }

    console.log(message.content);
  }
}

main();
*/
