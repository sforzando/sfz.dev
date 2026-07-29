// Microsoft Clarity — heatmaps and session replay.
// The npm package is a thin loader: init() injects https://www.clarity.ms/tag/<id>
// asynchronously and guards against duplicate injection itself.
import Clarity from "@microsoft/clarity"
import params from "@params"

// The template already gates this script on hugo.IsProduction and a non-empty
// projectId. Re-check here so a misconfigured build stays inert instead of
// requesting a tag for an undefined project.
if (params.projectId) {
  Clarity.init(params.projectId)
}
