// .pnpmfile.cjs
function readPackage(pkg) {
  // Ignore scripts for rollup to avoid issues with optional native deps
  // See: https://github.com/npm/cli/issues/4828
  if (pkg.name === 'rollup') {
    console.log(
      'Ignoring scripts for Rollup package to prevent optional native dependency issues.',
    );
    pkg.scripts = undefined;
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
