import * as core from '@actions/core'
import * as github from '@actions/github'
import { CommentsQuery } from './generated/graphql'
import { IssueComment, PullRequest } from './generated/graphql-types'
import { queryComments } from './queries/comments'
import { minimizeComment } from './queries/minimize'

type Inputs = {
  authors: string[]
  startsWith: string[]
  endsWith: string[]
  token: string
  pullRequestNumber: number | null
}

export const run = async (inputs: Inputs): Promise<void> => {
  const pullRequestNumber = tryGetPullRequestNumber(inputs.pullRequestNumber)
  const octokit = github.getOctokit(inputs.token)

  core.info(`query comments in pull request ${pullRequestNumber}`)
  const comments = await queryComments(octokit, {
    owner: github.context.repo.owner,
    name: github.context.repo.repo,
    number: pullRequestNumber,
  })

  const filteredComments = filterComments(comments, inputs)
  for (const c of filteredComments) {
    core.info(`minimize comment ${JSON.stringify(c.url)}`)
    await minimizeComment(octokit, { id: c.id })
  }
}

const tryGetPullRequestNumber = (pullRequestNumber: number | null): number => {
  if (github.context.payload.pull_request === null) {
    if (pullRequestNumber === null) {
      throw new Error(`pull-request-number should be specified`)
    }
    return pullRequestNumber
  }
  // always use predefined value on pull request trigger
  return github.context.payload.pull_request.number
}

type Comment = Pick<IssueComment, 'id' | 'url' | 'isMinimized' | 'author' | 'body'>

const filterComments = (q: CommentsQuery, inputs: Inputs): Comment[] => {
  if (q.repository?.pullRequest?.comments.nodes == null) {
    core.info(`unexpected response: repository === ${JSON.stringify(q.repository)}`)
    return []
  }
  const comments = q.repository.pullRequest.comments.nodes.filter((c) => c != null) as Comment[]
  return comments.filter((c) => toMinimize(c, inputs))
}

export const toMinimize = (c: Comment, inputs: Inputs): boolean => {
  if (c.isMinimized) {
    return false
  }
  if (inputs.authors.some((a) => c.author?.login === a)) {
    core.info(`authors filter matched: ${JSON.stringify(c.url)}`)
    return true
  }
  if (inputs.startsWith.some((s) => c.body.trimStart().startsWith(s))) {
    core.info(`starts-with matched: ${JSON.stringify(c.url)}`)
    return true
  }
  if (inputs.endsWith.some((s) => c.body.trimEnd().endsWith(s))) {
    core.info(`ends-with matched: ${JSON.stringify(c.url)}`)
    return true
  }
  return false
}
