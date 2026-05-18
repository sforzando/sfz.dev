import { execSync } from "node:child_process"

export default async function teardown() {
  execSync("lsof -ti:1314 -sTCP:LISTEN | xargs kill || true", {
    shell: "/bin/sh",
  })
}
