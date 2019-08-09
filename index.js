module.exports = app => {
  app.on('pull_request', async context => {
    app.log('Received pull_request webhook!')

    app.log("Owner: " + context.payload.pull_request.head.repo.owner.login + ", Repo: " + context.payload.pull_request.head.repo.name)
    app.log("Base Owner: " + context.payload.pull_request.base.repo.owner.login + ", Base Repo: " + context.payload.pull_request.base.repo.name)

    var owner = context.payload.pull_request.base.repo.owner.login
    var repo = context.payload.pull_request.base.repo.name

    if (context.payload.pull_request.milestone == null) {
      app.log("No milestone set => failing the status check")
      return context.github.repos.createStatus({owner: owner, repo: repo, sha: context.payload.pull_request.head.sha, state: "failure", description: "Please set the Milestone!", context: "scholzj/milestone_check"})
    } else {
      app.log("Milestone is set => passing the status check")
      return context.github.repos.createStatus({owner: owner, repo: repo, sha: context.payload.pull_request.head.sha, state: "success", description: "Milestone is set.", context: "scholzj/milestone_check"})
    }
  })

  app.on('issues', async context => {
    app.log('Received issue webhook!')

    // get issue
    var issue = await context.github.issues.get({owner: context.payload.repository.owner.login, repo: context.payload.repository.name, number: context.payload.issue.number})

    if (issue.data.pull_request != null) {
      app.log('Issue is a PR!')

      // It is a PR, so we need to get the PR
      var pr = await context.github.pullRequests.get({owner: context.payload.repository.owner.login, repo: context.payload.repository.name, number: context.payload.issue.number})

      app.log("Owner: " + pr.data.head.repo.owner.login + ", Repo: " + pr.data.head.repo.name)
      app.log("Base Owner: " + pr.data.base.repo.owner.login + ", Base Repo: " + pr.data.base.repo.name)

      var owner = pr.data.base.repo.owner.login
      var repo = pr.data.base.repo.name

      if (pr.data.milestone == null) {
        app.log("No milestone set => failing the status check")
        return context.github.repos.createStatus({owner: owner, repo: repo, sha: pr.data.head.sha, state: "failure", description: "Please set the Milestone!", context: "scholzj/milestone_check"})
      } else {
        app.log("Milestone is set => passing the status check")
        return context.github.repos.createStatus({owner: owner, repo: repo, sha: pr.data.head.sha, state: "success", description: "Milestone is set.", context: "scholzj/milestone_check"})
      }
    } else {
      app.log('Issue is not a PR!')
      return
    }
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
