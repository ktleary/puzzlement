import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import styles from '~/styles/main.module.css';

export const meta: MetaFunction = () => {
  return [{ title: 'Puzzlement: The solution starts here' }];
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const query = `${formData.get('query')}`;

  return redirect(`/results?query=${encodeURIComponent(query)}`);
};

export default function Index() {
  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Puzzlement</h1>
      <h2 className={styles.subtitle}>The solution starts here</h2>
      <div className={styles.queryContainer}>
        <Form method="get" action="/result" className={styles.queryForm}>
          <input
            className={styles.queryInput}
            type="search"
            name="q"
            id="search"
            defaultValue={''}
            placeholder="Ask anything"
          />
          <button type="submit" className={styles.queryButton}>
            Search
          </button>
        </Form>
      </div>
    </div>
  );
}
