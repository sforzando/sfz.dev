import { execSync } from "node:child_process"

export default async function teardown() {
  execSync("task stop")
}
