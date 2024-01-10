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

/*
 answer_box: {
    type: 'organic_result',
    title: 'Martin Luther King Jr. Day/Date (2024)',
    link: 'https://www.google.com/search?sca_esv=60d48f26e3e45296&sca_upv=1&q=+date+(2024)&stick=H4sIAAAAAAAAAONgFuLUz9U3MDQ3Tk5SQjC1-Jzzc3Pz84IzU1LLEyuLFzGKZydb6ZdnpOZlFuunlqXmlRRbpSSWpBYvYuVRADEUNIwMjEw0AR8BfWdRAAAA&sa=X&ved=2ahUKEwib77fd1NGDAxWGs4QIHSKOA3QQMSgAegQIKhAB',
    answer: 'Mon, Jan 15, 2024',
    thumbnail: 'https://serpapi.com/searches/659df1d8925641038647d69b/images/2d9a39f219f625d022cdfd3753d47ac607489ef04e6896ca.jpeg',
    people_also_search_for: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object]
    ]
  },
  ...
  */


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

/*
 related_searches: [
    {
      block_position: 1,
      query: 'When is mlk day in 2024 usa',
      link: 'https://www.google.com/search?sca_esv=60d48f26e3e45296&sca_upv=1&q=When+is+mlk+day+in+2024+usa&sa=X&ved=2ahUKEwib77fd1NGDAxWGs4QIHSKOA3QQ1QJ6BAhTEAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&location=New+York%2CNew+York%2CUnited+States&q=When+is+mlk+day+in+2024+usa'
    },
    {
      block_position: 1,
      query: 'When is mlk day in 2024 holiday',
      link: 'https://www.google.com/search?sca_esv=60d48f26e3e45296&sca_upv=1&q=When+is+mlk+day+in+2024+holiday&sa=X&ved=2ahUKEwib77fd1NGDAxWGs4QIHSKOA3QQ1QJ6BAhREAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&google_domain=google.com&location=New+York%2CNew+York%2CUnited+States&q=When+is+mlk+day+in+2024+holiday'
    },
    */

/*
   top_stories: [
    {
      title: 'When is MLK Jr. Day 2024? What to know about the federal holiday',
      link: 'https://www.oklahoman.com/story/news/2024/01/09/mlk-day-2024-date-history-of-federal-holiday/72150429007/',
      source: 'The Oklahoman',
      date: '13 hours ago',
      thumbnail: 'https://serpapi.com/searches/659df1d8925641038647d69b/images/c0f7f834838956c691c73638f93ded334b32757ecf2d6107.jpeg'
    },
    {
      title: 'When is MLK Day 2024? What to know, including why we celebrate',
      link: 'https://www.courier-journal.com/story/life/holiday/2024/01/08/when-is-mlk-day-2024-what-to-know-including-why-we-celebrate/72147974007/',
      source: 'The Courier-Journal',
      date: '1 day ago',
      thumbnail: 'https://serpapi.com/searches/659df1d8925641038647d69b/images/c0f7f834838956c634636935c618c21127cfd2b1c0e0f358.jpeg'
    },
    */

// if there are top stories, use those fourth

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

/*
  inline_videos: [
    {
      position: 1,
      title: 'Save the Date for the 2024 MLK Jr. Parade and Celebration!',
      link: 'https://www.youtube.com/watch?v=5kNwNh-9KbU',
      thumbnail: 'https://i.ytimg.com/vi/5kNwNh-9KbU/mqdefault.jpg?sqp=-oaymwEFCJQBEFM&rs=AMzJL3n-bSutaE9c7QtL36d-xqkhqcwszw',
      channel: 'LBTV Long Beach, CA',
      duration: '0:41',
      platform: 'YouTube',
      date: '6 days ago'
    },
  ...
  */

/*
knowledge_graph: {
    title: 'Martin Luther King Jr. Day',
    type: 'National day, US Federal holiday',
    tabs: [ [Object], [Object], [Object] ],
    description: "Martin Luther King Jr. Day is a federal holiday in the United States marking the birthday of Martin Luther King Jr. It is observed on the third Monday of January each year. Born in 1929, King's actual birthday is January 15. The holiday is similar to holidays set under the Uniform Monday Holiday Act.",
    source: {
      name: 'Wikipedia',
      link: 'https://en.wikipedia.org/wiki/Martin_Luther_King_Jr._Day'
    },
    date: 'Monday, January 15, 2024',
    date_links: [ [Object], [Object] ],
    significance: 'To mark the birthday of Martin Luther King Jr., the chief spokesperson for nonviolent activism in the Civil Rights Movement, which protested racial discrimination in federal and state law.',
    significance_links: [ [Object] ],
    event_length: '1 Day',
    event_length_links: [ [Object], [Object] ],
    observed_for: '37 years',
    observed_for_links: [ [Object] ],
    also_called: 'MLK Day, King Day, Reverend Dr. Martin Luther King Jr. Day',
    also_called_links: [ [Object] ],
    frequency: 'Annual',
    frequency_links: [ [Object] ],
    type_links: [ [Object], [Object], [Object] ]
  },
  */

/*
 organic_results: [
    {
      position: 1,
      title: 'Martin Luther King Day 2024',
      link: 'https://www.awarenessdays.com/awareness-days-calendar/martin-luther-king-day-2024/',
      redirect_link: 'https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.awarenessdays.com/awareness-days-calendar/martin-luther-king-day-2024/&ved=2ahUKEwib77fd1NGDAxWGs4QIHSKOA3QQFnoECDIQAQ',
      displayed_link: 'https://www.awarenessdays.com › awareness-days-calendar',
      favicon: 'https://serpapi.com/searches/659df1d8925641038647d69b/images/78286a186f514c7e66fcffa855c2bb26743e2a47b58605624e539bc7b6feace0.png',
      snippet: "It is observed on the third Monday of January each year, close to Dr. King's birthday on January 15th. The holiday serves as a time for reflection, community ...",
      snippet_highlighted_words: [Array],
      source: 'Awareness Days'
    },
    ...
    */

/*

    related_questions: [
    {
      question: "What day is Martin Luther King's birthday in 2024?",
      snippet: "Day 2024? This year, Martin Luther King Jr. Day will be recognized on Monday, Jan. 15. While the holiday is always celebrated on the third Monday of January, this year it will fall on King's birthday.",
      title: 'Jan. 15',
      date: '13 hours ago',
      link: "https://www.oklahoman.com/story/news/2024/01/09/mlk-day-2024-date-history-of-federal-holiday/72150429007/#:~:text=is%20MLK%20Jr.-,Day%202024%3F,will%20fall%20on%20King's%20birthday.",
      displayed_link: 'https://www.oklahoman.com › news › 2024/01/09',
      source_logo: 'https://serpapi.com/searches/659df1d8925641038647d69b/images/2b6ab357107314479a14b7a205960b4187329d131b880fd5b1d3b96f3af18fca.png',
      next_page_token: 'eyJvbnMiOiIxMDA0MSIsImZjIjoiRW9zQkNreEJUblZYYUdOdU9UZGZOelpPUkRGMVpHNVpla3hFWDFkdk1FbGtZamxEU1VKeFdYaG5WSFp0TmtsR1lqZzNhVlp0VVhocFdVMUlha2hTTFdGR1RYaG1OVlJaY0Zoek5URjBWbGt4RWhjeVgwZGtXbVIxVmtOSlltNXJkbEZRYjNCNVQyOUJZeG9pUVZCWWFHMDFZa0V5T1VsaGQweHdPV05YTkhaM2NYbHVTakZIYWxGWFZVOWxRUSIsImZjdiI6IjMiLCJlaSI6IjJfR2RaZHVWQ0libmt2UVBvcHlPb0FjIiwicWMiOiJDaGQzYUdWdUlHbHpJRzFzYXlCa1lYa2dhVzRnTWpBeU5CQUFmV1REN2o0IiwicXVlc3Rpb24iOiJXaGF0IGRheSBpcyBNYXJ0aW4gTHV0aGVyIEtpbmcncyBiaXJ0aGRheSBpbiAyMDI0PyIsImxrIjoiYzVNeUxNOUlMRkZJU2F4VXlDeFd5RTBzS3NuTVU4Z3BMY2xJTFZMSXpzeExWeTlXU01vc0tza0FLOGhUTURJd01nRUEiLCJicyI6ImMtTXk1eklLejBnc1VVaEpyRlRJTEZid1RTd3F5Y3hUOENrdHlVZ3RVdkRPekV0WEwxWkl5aXdxeVFBcnlGTXdNakF5c1pmNGtjWUYwd2pVQkZRTHdybXBDbW41UlZpTVVIQUI2b1ZvUEMzSXBjdWxBYmN4SlQ4VmFLZVBOMWhGV21KT2prSi1ua0pxWW5LR1FtVnFZcEc5eE5FQUxtVXVPWV84Y29XU2ZJWGsxSnpVcEtMRWtsUzREb2laTTlrRkdBRSIsImlkIjoiZmNfMSJ9',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google_related_questions&google_domain=google.com&next_page_token=eyJvbnMiOiIxMDA0MSIsImZjIjoiRW9zQkNreEJUblZYYUdOdU9UZGZOelpPUkRGMVpHNVpla3hFWDFkdk1FbGtZamxEU1VKeFdYaG5WSFp0TmtsR1lqZzNhVlp0VVhocFdVMUlha2hTTFdGR1RYaG1OVlJaY0Zoek5URjBWbGt4RWhjeVgwZGtXbVIxVmtOSlltNXJkbEZRYjNCNVQyOUJZeG9pUVZCWWFHMDFZa0V5T1VsaGQweHdPV05YTkhaM2NYbHVTakZIYWxGWFZVOWxRUSIsImZjdiI6IjMiLCJlaSI6IjJfR2RaZHVWQ0libmt2UVBvcHlPb0FjIiwicWMiOiJDaGQzYUdWdUlHbHpJRzFzYXlCa1lYa2dhVzRnTWpBeU5CQUFmV1REN2o0IiwicXVlc3Rpb24iOiJXaGF0IGRheSBpcyBNYXJ0aW4gTHV0aGVyIEtpbmcncyBiaXJ0aGRheSBpbiAyMDI0PyIsImxrIjoiYzVNeUxNOUlMRkZJU2F4VXlDeFd5RTBzS3NuTVU4Z3BMY2xJTFZMSXpzeExWeTlXU01vc0tza0FLOGhUTURJd01nRUEiLCJicyI6ImMtTXk1eklLejBnc1VVaEpyRlRJTEZid1RTd3F5Y3hUOENrdHlVZ3RVdkRPekV0WEwxWkl5aXdxeVFBcnlGTXdNakF5c1pmNGtjWUYwd2pVQkZRTHdybXBDbW41UlZpTVVIQUI2b1ZvUEMzSXBjdWxBYmN4SlQ4VmFLZVBOMWhGV21KT2prSi1ua0pxWW5LR1FtVnFZcEc5eE5FQUxtVXVPWV84Y29XU2ZJWGsxSnpVcEtMRWtsUzREb2laTTlrRkdBRSIsImlkIjoiZmNfMSJ9'
    },
*/

// if there are related questions, use those fourth

/*
 answer_box: {
    type: 'organic_result',
    title: 'Martin Luther King Jr. Day/Date (2024)',
    link: 'https://www.google.com/search?sca_esv=60d48f26e3e45296&sca_upv=1&q=+date+(2024)&stick=H4sIAAAAAAAAAONgFuLUz9U3MDQ3Tk5SQjC1-Jzzc3Pz84IzU1LLEyuLFzGKZydb6ZdnpOZlFuunlqXmlRRbpSSWpBYvYuVRADEUNIwMjEw0AR8BfWdRAAAA&sa=X&ved=2ahUKEwib77fd1NGDAxWGs4QIHSKOA3QQMSgAegQIKhAB',
    answer: 'Mon, Jan 15, 2024',
    thumbnail: 'https://serpapi.com/searches/659df1d8925641038647d69b/images/2d9a39f219f625d022cdfd3753d47ac607489ef04e6896ca.jpeg',
    people_also_search_for: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object]
    ]
  },
  ...
  */
