# Alpha.2 recovery and final retention decision

Run [43426740932](https://github.com/rodrigonpaiva/apptit/actions/runs/43426740932) built and validated both images from the unchanged release tag commit `4c84d4663a172b7849ed222aea5e19652d1f23e0`. It retained the API digest from run 43417110222 and pushed the web digest. It failed because the web package was publicly readable rather than private. Both images were present; this was not a successful privacy postcondition.

The owner subsequently explicitly authorized keeping both packages public and preserving both digests, without deleting anything. `public-retention-approval.json` records this bounded decision and supersedes the previous web-private requirement for these existing digests only. Historical reports remain unchanged. The reason the packages became public has not been established.

The API's original paired build/startup proof is in `../alpha2-first-attempt/`; the web's original paired build/startup proof is here. The API build produced by this recovery is not the published API and must never be substituted for its original proof. Both source revisions and platforms match. Synthetic receiving drafts, observation persistence and unchanged stock were verified in the original container validations.

Use the workflow's `verify_existing` input for final read-only verification. It checks the exact release source, individual original proofs, approved digests and anonymous registry visibility twice. It does not rebuild, start, tag, push or delete images. Its report is separate evidence and does not change either failed historical job into a success.
