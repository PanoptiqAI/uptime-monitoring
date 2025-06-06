# commitlint-config

Used by both danger (on CI) and commitlint (on local commits) to verify commit and PR names to conform to our conventional commit pattern.

## Testing

To test a name on the configuration:
`echo "fix: fixed something" | pnpm run commitlint`
