import { getJson } from 'serpapi';
import { EnvVars } from './env-vars';
import { isEmpty } from '~/util/validation.util';

const API_KEY = EnvVars.serpapi();

export const SOURCES = {
  ANSWERBOX: 'answer_box',
  KNOWLEDGEGRAPH: 'knowledge_graph',
  ORGANIC: 'organic_result',
  RELATED: 'related_question',
  VIDEO: 'inline_video',
};

/**
 * Get the Google search results for a query.
 * Docs: https://github.com/serpapi/serpapi-javascript
 */

// type for the search result.
export type SearchResult = {
  position: number;
  title: string;
  link: string;
  description: string;
  source: string;
  thumbnail?: string;
  kind:
    | 'organic_result'
    | 'knowledge_graph'
    | 'inline_video'
    | 'related_question'
    | 'answer_box'
    | 'top_stories'
    | 'related_searches';
};

export async function searchGoogle(query: string): Promise<SearchResult[]> {
  const results = await getJson(
    {
      engine: 'google',
      api_key: API_KEY,
      q: query,
      location: 'New York,New York,United States',
    },
    (json) => json
  );

  const searchResults: SearchResult[] = [];

  const {
    organic_results,
    knowledge_graph,
    inline_videos,
    related_questions,
    answer_box,
    top_stories,
    related_searches,
  } = results || {};

  if (knowledge_graph) {
    const { title, description, source } = knowledge_graph || {};

    const { name, link } = source || {};

    searchResults.push({
      position: 0,
      title,
      link,
      description,
      source: name,
      kind: 'knowledge_graph',
    });
  }

  if (!isEmpty(answer_box)) {
    const { title, answer, link, thumbnail } = answer_box || {};

    searchResults.push({
      position: searchResults.length,
      title,
      link,
      description: answer,
      source: 'Google',
      thumbnail,
      kind: 'answer_box',
    });
  }

  if (organic_results) {
    organic_results.forEach((result: any) => {
      const { title, link, snippet, source } = result || {};

      const { name } = source || {};

      searchResults.push({
        position: searchResults.length,
        title,
        link,
        description: snippet,
        source: name,
        kind: 'organic_result',
      });
    });
  }

  if (!isEmpty(inline_videos)) {
    inline_videos.forEach((result: any) => {
      const { title, link, snippet, source, thumbnail } = result || {};

      const { name } = source || {};

      searchResults.push({
        position: searchResults.length,
        title,
        link,
        description: snippet,
        source: name,
        thumbnail,
        kind: 'inline_video',
      });
    });
  }

  if (!isEmpty(top_stories)) {
    top_stories.forEach((result: any) => {
      const { title, link, source, thumbnail } = result || {};

      const { name } = source || {};

      searchResults.push({
        position: searchResults.length,
        title,
        link,
        description: title,
        source: name,
        thumbnail,
        kind: 'top_stories',
      });
    });
  }

  if (!isEmpty(related_questions)) {
    related_questions.forEach((result: any) => {
      const { title, link, snippet, source } = result || {};

      const { name } = source || {};

      searchResults.push({
        position: searchResults.length,
        title,
        link,
        description: snippet,
        source: name,
        kind: 'related_question',
      });
    });
  }

  if (!isEmpty(related_searches)) {
    related_searches.forEach((result: any) => {
      const { query, link } = result || {};

      searchResults.push({
        position: searchResults.length,
        title: query,
        link,
        description: query,
        source: 'Google',
        kind: 'related_searches',
      });
    });
  }

  console.log('searchResults', searchResults);
  return searchResults;
}
