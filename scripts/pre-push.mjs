let input = '';
for await (const chunk of process.stdin) input += chunk;
for (const line of input.trim().split('\n')) {
  const [, , remoteRef] = line.trim().split(/\s+/);
  if (['refs/heads/main', 'refs/heads/dev'].includes(remoteRef)) {
    console.error('Direct push/deletion of main or dev is blocked locally. Push a feature branch and open a pull request into dev; promote dev to main after successful CI.');
    process.exitCode = 1;
    break;
  }
}
