import type { LoaderFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { z } from 'zod';
import { zx } from 'zodix';
import { summarizeSearchResults } from '~/services/openai';
import styles from '~/styles/main.module.css';
import { searchGoogle } from '../services/serpapi';

export async function loader(args: LoaderFunctionArgs) {
  const { q } = zx.parseQuery(args.request, {
    q: z.string().optional(),
  });

  if (!q) {
    return json({ q, searchResults: [], summary: '' });
  }
  //   const searchResults: SearchResult[] =
  const searchResults = await searchGoogle(q);
  const aiSummary = summarizeSearchResults({ query: q, searchResults });

  const summary = q?.length ? aiSummary : '';

  return defer({
    q,
    searchResults,
    summary,
  });
}

// const aiSummary = searchResults.then((searchResults) => {
//  const result =  summarizeSearchResults({ query: q, searchResults })
//  return json({ q, searchResults, summary: result });
// }
// );
//   const resultsAll = searchGoogle(q).then((searchResults) => {
//     const aiSummary = summarizeSearchResults({ query: q, searchResults });
//     const summary = q?.length ? aiSummary : '';
//     return { searchResults, summary };
//     // return json({ q, searchResults, summary });
//   });
//   const aiSummary = summarizeSearchResults({ query: q, searchResults });
//   const summary = q?.length ? aiSummary : '';
//   return json({ q, searchResults, summary });

/*
// So you can write this without awaiting the promise:
  return defer({
    critical: "data",
    slowPromise: aStillRunningPromise,
  });
  */

/*
example:
export default function Index() {
  const data = useLoaderData()
  const params = useParams()
  const stream = useEventSource(
    `/items/${params.hash}/progress`,
    {
      event: "progress",
    },
  )
  return (
    <div>
      <Suspense fallback={<span> {stream}% </span>}>
        <Await
          resolve={data.promise}
          errorElement={<p>Error loading img!</p>}
        >
          {(promise) => <img alt="" src={promise.img} />}
        </Await>
      </Suspense>
    </div>
  )
}
*/

export default function Result() {
  //   const { q, searchResults, summary } = useLoaderData<typeof loader>();
  const data = useLoaderData<typeof loader>(); // searchResults is a promise so we can't destructure it until we await it in

  //   console.log('q', q, 'searchResults', searchResults);
  // 'summary', summary);
  return (
    <div>
      <Suspense fallback={<div>{data.q}</div>}>
        <ul className={styles.listContainer}>
          {data.searchResults.map((result, i) => (
            <li key={`sr-${i}`} className={styles.resultItem}>
              <a className={styles.resultLink} href={result?.link}>
                {result?.title}
              </a>
              <p className={styles.resultSnippet}>{result?.snippet}</p>
            </li>
          ))}
        </ul>
        <Await
          resolve={data.summary}
          errorElement={<div>Something went wrong</div>}
        >
          {(summary) => (
            <div>
              <h1 className={styles.queryTitle}>{data.q}</h1>
              {summary ? <p>{`Summary: ${summary}`}</p> : null}
            </div>
          )}
          {/* <h1 className={styles.queryTitle}>{q}</h1>
          {summary ? <p>{`Summary: ${summary}`}</p> : null}
          <ul className={styles.listContainer}>
            {searchResults.map((result, i) => (
              <li key={`sr-${i}`} className={styles.resultItem}>
                <a className={styles.resultLink} href={result?.link}>
                  {result?.title}
                </a>
                <p className={styles.resultSnippet}>{result?.snippet}</p>
              </li>
            ))}
          </ul> */}
        </Await>
      </Suspense>
    </div>
  );
}
