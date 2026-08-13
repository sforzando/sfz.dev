// Preferred over Clarity's raw <script> snippet so the project ID travels through
// js.Build params under type checking and the version stays tracked in package.json.
import Clarity from "@microsoft/clarity"
import params from "@params"

// The template already gates this script on hugo.IsProduction and a non-empty
// projectId. Re-check here so a misconfigured build stays inert instead of
// requesting a tag for an undefined project.
if (params.projectId) {
  Clarity.init(params.projectId)
}
