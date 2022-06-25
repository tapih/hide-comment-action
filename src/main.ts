import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    authors: core.getMultilineInput('authors'),
    startsWith: core.getMultilineInput('starts-with'),
    endsWith: core.getMultilineInput('ends-with'),
    token: core.getInput('token', { required: true }),
    pullRequestNumber: parseInt(core.getInput('pull-request-number')) || null,
  })
}

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)))
