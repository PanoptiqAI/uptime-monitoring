import lint from '@commitlint/lint';
import load from '@commitlint/load';
import type { ParserOptions } from '@commitlint/types';
import { danger, fail, markdown, warn } from 'danger';

if (danger.github.pr.additions + danger.github.pr.deletions > 2500) {
  warn(':exclamation: Big PR');
  markdown(
    '> The size of this Pull Request is quite large. Consider breaking it down into smaller, separate PRs for a quicker and more efficient review process. This approach also simplifies debugging, for instance, when using `git bisect`.',
  );
}

if (!danger.github.pr.body || danger.github.pr.body.length < 10) {
  warn(
    `It's important to include a detailed description with your PR to help others understand the purpose of your changes.`,
  );
}

load(require('@panoptiq/commitlint-config'))
  .then((opts) => {
    lint(
      danger.github.pr.title,
      opts.rules,
      opts.parserPreset
        ? { parserOpts: opts.parserPreset.parserOpts as ParserOptions }
        : {},
    )
      .then((report) => {
        if (!report.valid) {
          fail(
            `The PR title does not conform to the conventional commit ruleset, please fix it.`,
          );

          for (const error of report.errors) {
            fail(`${error.name}: ${error.message}`);
          }

          for (const error of report.warnings) {
            warn(`${error.name}: ${error.message}`);
          }
        }
      })
      .catch((err: Error) => {
        fail('Error linting PR title', err.message);
      });
  })
  .catch((err: Error) => {
    fail('Error loading commitlint configuration', err.message);
  });
