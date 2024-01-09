import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useNavigation,
} from '@remix-run/react';
import NProgress from 'nprogress';
import nProgressStyles from 'nprogress/nprogress.css';
import { useEffect, useMemo } from 'react';
import cssReset from '~/styles/reset.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: cssReset },
  { rel: 'stylesheet', href: nProgressStyles },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

export default function App() {
  let transition = useNavigation();

  let fetchers = useFetchers();

  let state = useMemo<'idle' | 'loading'>(
    function getGlobalState() {
      let states = [
        transition.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === 'idle')) return 'idle';
      return 'loading';
    },
    [transition.state, fetchers]
  );

  useEffect(() => {
    if (state === 'loading') NProgress.start();
    if (state === 'idle') NProgress.done();
  }, [state, transition.state]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
