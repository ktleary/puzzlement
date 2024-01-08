import { getJson } from 'serpapi';
import { EnvVars } from './env-vars';

const API_KEY = EnvVars.serpapi();

/**
 * Use this to get the Google search results for a query.
 * Docs: https://github.com/serpapi/serpapi-javascript
 */

/*
{
      position: 1,
      title: "and Bob's your uncle Definition & Meaning",
      link: 'https://www.merriam-webster.com/dictionary/and%20Bob%27s%20your%20uncle',
      redirect_link: 'https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.merriam-webster.com/dictionary/and%2520Bob%2527s%2520your%2520uncle&ved=2ahUKEwj-mIii3s6DAxUkEFkFHehqBF4QFnoECDIQAQ',
      displayed_link: 'https://www.merriam-webster.com › dictionary › and ...',
      favicon: 'https://serpapi.com/searches/659c6933ca968f911d50379c/images/c9eda006c80988eae31d9e33e99bd57302654086032acdf012b2b7af2f63081b.png',
      snippet: "The meaning of AND BOB'S YOUR UNCLE is —used to say that something is easy to do or use. How to use and Bob's your uncle in a sentence.",
      snippet_highlighted_words: [Array],
      source: 'Merriam-Webster'
    },
    */

// @TODO: Add a type for the search result.
export type SearchResult = {
  position: number;
  title: string;
  link: string;
  snippet: string;
  source: string;
};

export async function searchGoogle(query: string): Promise<SearchResult[]> {
  const results = await getJson(
    {
      engine: 'google',
      api_key: API_KEY,
      q: query,
      location: 'New York,New York,United States',
    },
    (json) => {
      // console.log(json['organic_results']);
      // console.log('results received');
      // return json['organic_results'];
      return json;
    }
  );

  const { organic_results } = results;

  return organic_results;
}
