# ModelMind private practice judge

This is an internal-only service for coding and debugging submissions. It must
not be exposed with a public port, reverse proxy, or browser CORS policy.

The main ModelMind web application calls `POST /v1/submissions` through a
private network using `PRACTICE_JUDGE_URL` and `PRACTICE_JUDGE_TOKEN`. Set the
same long random token in both services. The supplied Compose file keeps the
service off public networks while allowing only its internal application
network, uses a read-only filesystem with a small temporary directory, runs as
a non-root user, drops Linux capabilities, and constrains CPU, memory, and
process count.

The judge contains 26 test-backed exercises imported from the approved
ModelMind practice bank. `mode=run` exposes only public tests; `mode=submit`
runs the full test set and redacts all hidden test names and diagnostics.

Do not mount the Docker socket, host filesystem, user data, or environment
files into this service. Do not use the host-process evaluator from the source
practice repository in production.
