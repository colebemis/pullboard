import axios from 'axios'
import getConfig from 'next/config'
import { stringify } from 'querystring'

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

function graphqlRequest({ query, variables = {}, githubToken }) {
  return axios({
    url: 'https://api.github.com/graphql',
    method: 'POST',
    headers: { Authorization: `bearer ${githubToken}` },
    data: { query, variables },
  })
}

export function getGithubAuthUrl(from = '/') {
  const queryString = stringify({
    client_id: publicRuntimeConfig.githubClientId,
    scope: 'read:org',
    redirect_uri: publicRuntimeConfig.redirectUri + '?' + stringify({ from }),
  })

  return `https://github.com/login/oauth/authorize?${queryString}`
}

export async function getGithubToken(githubCode) {
  const { data } = await axios({
    url: 'https://github.com/login/oauth/access_token',
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    data: {
      client_id: publicRuntimeConfig.githubClientId,
      client_secret: serverRuntimeConfig.githubClientSecret,
      code: githubCode,
    },
  })

  if (data.error) {
    throw new Error(data.error)
  }

  return data.access_token
}

export function searchPullRequests(
  { githubQuery, endCursor = null, batchSize = 4 },
  githubToken,
) {
  const query = `
    query($githubQuery: String!, $endCursor: String, $batchSize: Int) {
      search(
        query: $githubQuery,
        first: $batchSize,
        type: ISSUE,
        after: $endCursor
      ) {
        issueCount
        edges {
          cursor
          pullRequest: node {
            ... on PullRequest {
              id
              number
              title
              url
              createdAt
              author {
                login
                url
              }
              repository {
                owner {
                  login
                  url
                }
                name
                url
              }
              commits(last: 1) {
                nodes {
                  commit {
                    status {
                      state
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `
  return graphqlRequest({
    query,
    variables: { githubQuery, endCursor, batchSize },
    githubToken,
  })
}

export function getViewer(githubToken) {
  const query = `
    query {
      viewer {
        avatarUrl
        login
        organizations(first: 20) {
          nodes {
            name
            login
            avatarUrl
          }
        }
      }
    }
  `
  return graphqlRequest({
    query,
    githubToken,
  })
}
