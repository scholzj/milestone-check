const status_context = "Milestone Check"
const failure_state = "failure"
const failure_description = "Please set the milestone!"
const success_state = "success"
const success_description = "Great, the milestone is set."

function createStatus(context, owner, repo, sha, state, desc) {
  return context.github.repos.createStatus({owner: owner, repo: repo, sha: sha, state: state, description: desc, context: status_context})
}

module.exports = app => {
  app.on('pull_request', async context => {
    app.log.info('Received pull_request webhook')

    if (app.log.debug())  {
      app.log.debug({ hook: context.payload.pull_request}, "Received webhook payload")
    }

    var owner = context.payload.pull_request.base.repo.owner.login
    var repo = context.payload.pull_request.base.repo.name
    var sha = context.payload.pull_request.head.sha

    if (context.payload.pull_request.milestone == null) {
      app.log.info("No milestone set => failing the status check")
      return createStatus(context, owner, repo, sha, failure_state, failure_description)
    } else {
      app.log.info("Milestone is set => passing the status check")
      return createStatus(context, owner, repo, sha, success_state, success_description)
    }
  })

  app.on('issues', async context => {
    app.log.info('Received issue webhook')

    if (app.log.debug())  {
      app.log.debug({ hook: context.payload.pull_request}, "Received webhook payload")
    }

    // Get issue
    var issue = await context.github.issues.get({owner: context.payload.repository.owner.login, repo: context.payload.repository.name, number: context.payload.issue.number})

    if (issue.data.pull_request != null) {
      app.log.info('Issue is a PR')

      // It is a PR, so we need to get the PR
      var pr = await context.github.pullRequests.get({owner: context.payload.repository.owner.login, repo: context.payload.repository.name, number: context.payload.issue.number})

      var owner = pr.data.base.repo.owner.login
      var repo = pr.data.base.repo.name
      var sha = pr.data.head.sha

      if (pr.data.milestone == null) {
        app.log.info("No milestone set => failing the status check")
        return createStatus(context, owner, repo, sha, failure_state, failure_description)
      } else {
        app.log.info("Milestone is set => passing the status check")
        return createStatus(context, owner, repo, sha, success_state, success_description)
      }
    } else {
      app.log.info('Issue is not a PR!')
      return
    }
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
