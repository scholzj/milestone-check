package cz.scholz.milestonecheck;

import io.quarkiverse.githubapp.event.Issue;
import io.quarkiverse.githubapp.event.PullRequest;
import org.kohsuke.github.GHCommitState;
import org.kohsuke.github.GHEventPayload;
import org.kohsuke.github.GHPullRequest;
import org.kohsuke.github.GHRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

public class MilestoneCheck {
    private static final Logger LOGGER = LoggerFactory.getLogger(MilestoneCheck.class);

    private static final String STATUS_CONTEXT = "Milestone Check";
    private static final GHCommitState FAILURE_STATE = GHCommitState.PENDING;
    private static final String FAILURE_DESC = "Please set the milestone!";
    private static final GHCommitState SUCCESS_STATE = GHCommitState.SUCCESS;
    private static final String SUCCESS_DESC = "Great, the milestone is set.";

    /**
     * Setting and clearing milestones triggers an Issue type event. We have to check if the issue is a PR or not. If
     * it is a PR, we get the PR from GitHub and check if it has milestone set or not.
     *
     * @param issuePayload  The Issue event from GitHub
     *
     * @throws IOException
     */
    void onIssue(@Issue.Milestoned @Issue.Demilestoned GHEventPayload.Issue issuePayload) throws IOException {
        LOGGER.info("Received Issue.{} event for issue {}", issuePayload.getAction(), issuePayload.getIssue().getHtmlUrl());

        if (issuePayload.getIssue().getPullRequest() != null)   {
            GHPullRequest pr = issuePayload.getRepository().getPullRequest(issuePayload.getIssue().getNumber());
            handlePullRequest(pr);
        } else {
            LOGGER.info("Issue {} is not a PR", issuePayload.getIssue().getHtmlUrl());
        }
    }

    /**
     * Triggered when a new PR is opened, re-opened or when some commits are pushed to it (the "synchronize" event).
     * The PR is passed for evaluation whether it has milestone set or not.
     *
     * @param prPayload     The PR event from GitHub
     *
     * @throws IOException
     */
    void onPullRequest(@PullRequest.Opened @PullRequest.Reopened @PullRequest.Synchronize GHEventPayload.PullRequest prPayload) throws IOException {
        LOGGER.info("Received PullRequest.{} event for PR {}", prPayload.getAction(), prPayload.getPullRequest().getHtmlUrl());
        handlePullRequest(prPayload.getPullRequest());
    }

    /**
     * Evaluates a PR whether it has milestone set or not and updates the status or the last commit accordingly.
     *
     * @param pr    GitHub Pull Request which should be evaluated
     *
     * @throws IOException
     */
    private void handlePullRequest(GHPullRequest pr) throws IOException {
        String sha1 = pr.getHead().getSha();

        if (pr.getMilestone() != null)  {
            LOGGER.info("PR {} has milestone set", pr.getHtmlUrl());
            updateStatus(pr.getBase().getRepository(), sha1, SUCCESS_STATE, SUCCESS_DESC);
        } else {
            LOGGER.info("PR {} has no milestone!", pr.getHtmlUrl());
            updateStatus(pr.getBase().getRepository(), sha1, FAILURE_STATE, FAILURE_DESC);
        }
    }

    /**
     * Creates the status on the commit from a PR based on the passed parameters.
     *
     * @param repo  Repo with the PR
     * @param sha1  SHA1 sum of the commit for which the status should be set
     * @param state State which should be set
     * @param desc  Description explaining the state
     *
     * @throws IOException
     */
    private void updateStatus(GHRepository repo, String sha1, GHCommitState state, String desc) throws IOException {
        LOGGER.debug("Updating status of commit {} in repo {} to {}", sha1, repo.getHtmlUrl(), state);
        repo.createCommitStatus(sha1, state, null, desc, STATUS_CONTEXT);
    }
}
