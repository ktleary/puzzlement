/*
function: getHostname
get hostname from url

for example: 
- https://www.google.com/search?q=hello -> google; 
- wikipedia.org/wiki/Hello -> wikipedia
*/

const commonTLDs = [
  '.com',
  '.org',
  '.net',
  '.int',
  '.edu',
  '.gov',
  '.mil',
  '.arpa',
  '.co.uk',
  '.org.uk',
  '.ac.uk',
  '.gov.uk',
  '.co.jp',
  '.gov.au',
];

const domainReducer = (hostname: string) => (acc: string, domain: string) =>
  hostname.endsWith(domain) ? hostname.replace(domain, '') : acc;

export function getHostname(url: string) {
  try {
    const { hostname } = new URL(url);
    return commonTLDs
      .reduce(domainReducer(hostname), hostname)
      .replace('www.', '');
  } catch (error) {
    return url
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .split(/[/?#]/)[0];
  }
}
