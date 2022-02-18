# Milestone Check

GitHub application which verifies whether a milestone has been set on a PR or not.
The result is used as a status on the PR / last commit in the PR.
If your projects wants all PRs to have a milestone set, this GitHub application will make it easier to track whether they have it or not. 
You can install it here: https://github.com/apps/pr-milestone-check

## Building Milestone Check

Milestone Check is build with [Quarkus](https://quarkus.io) and its [GitHub extension](https://github.com/quarkiverse/quarkus-github-app).

### Running the application in dev mode

You can run your application in dev mode that enables live coding using:
```shell script
mvn compile quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at http://localhost:8080/q/dev/.

### Packaging and running the application

The application can be packaged using:
```shell script
mvn package
```
It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:
```shell script
mvn package -Dquarkus.package.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

### Creating a native executable

You can create a native executable using:
```shell script
mvn package -Pnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:
```shell script
mvn package -Pnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/my-github-app-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult https://quarkus.io/guides/maven-tooling.

## Testing Milestone Check

1) Register a GitHub application
2) Go to [Smee](https://smee.io) and create a channel
3) Create a file called `.env` in the root of this repository with the details of your GitHub application:
   ```properties
   QUARKUS_GITHUB_APP_APP_ID=<YourAppId>
   QUARKUS_GITHUB_APP_APP_NAME=<YourAppName>
   QUARKUS_GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
   QUARKUS_GITHUB_APP_WEBHOOK_SECRET=<YourWebhookSecret>
   QUARKUS_GITHUB_APP_WEBHOOK_PROXY_URL=https://smee.io/<YourChannelID>
   ```
