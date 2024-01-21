import type { LoaderFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, Form, useActionData, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { z } from 'zod';
import { zx } from 'zodix';
import BackButton from '~/components/backbutton';
import { summarizeSearchResults } from '~/services/openai';
import styles from '~/styles/main.module.css';
import { truncate } from '~/util/text.util';
import { getHostname } from '~/util/url.util';
import { searchGoogle } from '../services/serpapi';

export async function loader(args: LoaderFunctionArgs) {
  const { q } = zx.parseQuery(args.request, {
    q: z.string().optional(),
  });

  if (!q) {
    return json({ q, searchResults: [], summary: '' });
  }

  const searchResults = await searchGoogle(q);
  // console.log('searchResults', searchResults);
  const aiSummary = summarizeSearchResults({
    query: q,
    searchResults: searchResults?.filter((sr) =>
      ['knowledge_graph', 'organic_result', 'answer_box'].includes(sr?.kind)
    ),
  });

  return defer({
    q,
    searchResults,
    summary: aiSummary, // promise
  });
}

const getRelatedImages = (searchResults: any[]) => {
  return searchResults?.reduce<string[]>((acc, sr) => {
    if (
      sr?.thumbnail &&
      (sr?.kind === 'answer_box' || sr?.kind === 'top_stories')
    ) {
      acc.push(sr.thumbnail);
    }
    return acc;
  }, []);
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const query = `${formData.get('followup')}`;

  const searchResults = await searchGoogle(query);
  // console.log('searchResults', searchResults);
  const aiSummary = await summarizeSearchResults({
    query: query,
    searchResults: searchResults?.filter((sr) =>
      ['knowledge_graph', 'organic_result', 'answer_box'].includes(sr?.kind)
    ),
  });

  console.log(
    'action',
    'formData',
    formData,
    'query',
    query,
    'searchResults',
    searchResults,
    'aiSummary',
    aiSummary
  );

  // return redirect(`/results?query=${encodeURIComponent(query)}`);

  // return defer({
  //   q: query,
  //   searchResults,
  //   summary: aiSummary, // promise
  // });
  return json({
    q: query,
    searchResults,
    summary: aiSummary,
  });
};

export default function Result() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isFollowup = actionData && Object.keys(actionData).length > 0;
  const { q, searchResults, summary } = isFollowup ? actionData : data;
  const topResults = searchResults?.slice(0, 5) || [];
  const relatedImages = getRelatedImages(searchResults);

  return (
    <div className={styles.answerScreen}>
      <div className={styles.resultsContainer}>
        <BackButton />
        <h1 className={styles.queryTitle}>{q}</h1>
        <h2 className={styles.sourcesTitle}>Sources</h2>
        <div className={styles.listContainer}>
          {topResults.map((result, i) => (
            <div key={`sr-${i}`} className={styles.resultItem}>
              <a
                className={styles.resultLink}
                href={result?.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {truncate(result?.title || '')}
              </a>
              <div className={styles.resultDomain}>
                {getHostname(result?.link || '')}
              </div>
            </div>
          ))}
        </div>
        <Suspense
          fallback={
            <div className={styles.summaryText}>
              <p>Generating summary...</p>
            </div>
          }
        >
          <Await resolve={summary}>
            {(summary) => (
              <>
                <h2 className={styles.answerTitle}>Answer</h2>
                <div className={styles.summaryText}>
                  {summary ? <p>{` ${summary}`}</p> : null}
                </div>
                <div className={styles.followupQuery}>
                  <Form
                    method="post"
                    action="/result"
                    className={styles.queryForm}
                  >
                    <input
                      className={styles.queryInput}
                      type="search"
                      name="followup"
                      id="followup"
                      defaultValue={''}
                      placeholder="Ask a follow-up question"
                    />
                    <button type="submit" className={styles.queryButton}>
                      Submit follow-up
                    </button>
                  </Form>
                </div>
              </>
            )}
          </Await>
        </Suspense>
      </div>
      {relatedImages.length ? (
        <div className={styles.sidebarContainer}>
          <div className={styles.sidebarContent}>
            {relatedImages.map((img, i) => (
              <img
                key={`img-${i}`}
                className={styles.relatedImage}
                src={img}
                alt=""
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
