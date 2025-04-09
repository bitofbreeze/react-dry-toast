# monorepo

* `nvm use`
  * You can run `nvm alias default 23` to change your default and avoid having to run this for every new terminal.
* `npm i --legacy-peer-deps`
* `npm run dev --workspace=gitsell`
* `npm install react -w gitsell`

## Workflow

Copybara mirrors some packages to their own repos, for example, react-router-busy.

PRs coming to react-router-busy are mirrored back to the monorepo and are merged there, which then deletes them from react-router-busy and finally pushes those changes back to react-router-busy.

Only commits in the monorepo that affect any files mirrored to react-router-busy are reflected there. Changes are only pushed to react-router-busy once a week to conserve free Action minutes.

Releasing is done in the package's mirrored repo, eg, react-router-busy. This makes GitHub releases and tags show for everyone since the monorepo is private. This is also more cost effective since Action minutes don't count for public repos. This is also fine because semantic-release promotes [not making commits during release to reduce complexity](https://semantic-release.gitbook.io/semantic-release/support/faq#making-commits-during-the-release-process-adds-significant-complexity).

## Database

<!-- https://docs.turso.tech/cli/db/create -->
* turso db create [database-name] --from-db open-the-hunter