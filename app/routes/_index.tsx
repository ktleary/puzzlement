import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { zx } from 'zodix';
import styles from '~/styles/main.module.css';
import { SearchResult, searchGoogle } from '../services/serpapi';

export const meta: MetaFunction = () => {
  return [{ title: 'Dexa Coding Interview' }];
};

export async function loader(args: LoaderFunctionArgs) {
  const { q } = zx.parseQuery(args.request, {
    q: z.string().optional(),
  });

  if (!q) {
    return json({ q, searchResults: [], summary: '' });
  }
  const searchResults: SearchResult[] = await searchGoogle(q);
  const summary = q?.length ? `TODO: Summary of search results for "${q}"` : '';
  return json({ q, searchResults, summary });
}

export default function Index() {
  const { q, searchResults, summary } = useLoaderData<typeof loader>();

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Puzzlement</h1>
      <h2 className={styles.subtitle}>The solution starts here</h2>
      <div className={styles.queryContainer}>
        <Form method="get">
          <input
            className={styles.queryInput}
            type="search"
            name="q"
            id="search"
            defaultValue={q ?? ''}
            placeholder="Ask anything"
          />
          <button type="submit">Search</button>
        </Form>
      </div>
      {summary ? <p>{`Summary: ${summary}`}</p> : null}
      <ul>
        {searchResults.map((result, i) => (
          <li key={i}>
            <a href={result?.link}>{result?.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
